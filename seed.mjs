#!/usr/bin/env node
/**
 * Seed script - Vetra ERP / Royal Marine
 *
 * Public sources used to model the dataset:
 * - https://www.royalmarine.it/services/
 * - https://www.royalmarine.it/rivenditori/
 *
 * Usage: node seed.mjs
 */

import { deflateSync } from "node:zlib";

const BASE = process.env.VETRA_API_BASE ?? "http://127.0.0.1:8000";
const USERNAME = process.env.VETRA_ADMIN_USER ?? "admin";
const PASSWORD = process.env.VETRA_ADMIN_PASSWORD ?? "xpNdrb37T!";

const VAT_CODE = "IT22";

async function login() {
  const body = new URLSearchParams({ username: USERNAME, password: PASSWORD });
  const r = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    body,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  const d = await r.json().catch(() => ({}));
  if (!d.access_token) throw new Error(`Login failed: ${JSON.stringify(d)}`);
  return d.access_token;
}

async function api(token, method, path, body) {
  const r = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const text = await r.text();
  if (!r.ok) {
    console.error(`  x ${method} ${path} -> ${r.status}: ${text.slice(0, 500)}`);
    return null;
  }
  return text ? JSON.parse(text) : null;
}

async function uploadPng(token, path, name, pngBytes) {
  const form = new FormData();
  form.append("file", new Blob([pngBytes], { type: "image/png" }), `${slug(name)}.png`);
  const r = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const text = await r.text();
  if (!r.ok) {
    console.error(`  x POST ${path} image -> ${r.status}: ${text.slice(0, 300)}`);
    return null;
  }
  return text ? JSON.parse(text) : null;
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function dateIso(year, month, day) {
  return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);
}

function money(n) {
  return Number(n).toFixed(2);
}

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) {
    c ^= b;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  const crc = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])));
  return Buffer.concat([len, typeBytes, data, crc]);
}

function avatarPng(label, hex) {
  const width = 96;
  const height = 96;
  const rgb = hex.match(/[a-f0-9]{2}/gi).map((x) => parseInt(x, 16));
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const row = y * (width * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < width; x++) {
      const idx = row + 1 + x * 4;
      const shade = 1 - (x + y) / (width + height) * 0.26;
      raw[idx] = Math.round(rgb[0] * shade);
      raw[idx + 1] = Math.round(rgb[1] * shade);
      raw[idx + 2] = Math.round(rgb[2] * shade);
      raw[idx + 3] = 255;
    }
  }

  // Minimal PNG avatar. The label determines color only; UI renders it as an image thumbnail.
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const signature = Buffer.from("89504e470d0a1a0a", "hex");
  return Buffer.concat([
    signature,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(raw)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function initials(description) {
  return description
    .replace(/s\.?r\.?l\.?|s\.?p\.?a\.?|s\.?a\.?s\.?/gi, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0])
    .join("")
    .toUpperCase();
}

async function getOrCreateLookup(token, prefix, code, description) {
  const list = await api(token, "GET", `/${prefix}`);
  const existing = (list ?? []).find((x) => x.code === code);
  if (existing) return existing;
  return api(token, "POST", `/${prefix}`, { code, description });
}

async function getOrCreate(token, listPath, createPath, matchFn, payload, label) {
  const list = await api(token, "GET", listPath);
  const existing = (list?.items ?? list ?? []).find(matchFn);
  if (existing) {
    console.log(`  ~ ${label}`);
    return existing;
  }
  const created = await api(token, "POST", createPath, payload);
  if (created) console.log(`  + ${label}`);
  return created;
}

async function addContact(token, partyGuid, type_code, content, label, is_primary = false) {
  const contacts = await api(token, "GET", `/parties/${partyGuid}/contacts`);
  if ((contacts ?? []).some((c) => c.type_code === type_code && c.content === content)) return;
  await api(token, "POST", `/parties/${partyGuid}/contacts`, { type_code, content, label, is_primary });
}

async function createLocation(token, loc) {
  return api(token, "POST", "/locations", loc);
}

async function linkLocation(token, partyGuid, locationGuid, type_code, is_primary = true) {
  const links = await api(token, "GET", `/parties/${partyGuid}/locations`);
  if ((links ?? []).some((l) => l.location_guid === locationGuid && l.type_code === type_code)) return;
  await api(token, "POST", `/parties/${partyGuid}/locations`, { location_guid: locationGuid, type_code, is_primary });
}

async function createParty(token, def, payment, terms, carrierGuid) {
  let wasExisting = false;
  const party = await getOrCreate(
    token,
    `/parties?search=${encodeURIComponent(def.description)}&limit=100`,
    "/parties",
    (x) => {
      const match = x.description === def.description;
      if (match) wasExisting = true;
      return match;
    },
    {
      description: def.description,
      vat_number: def.vat_number,
      type_code: def.type_code,
      fiscal_area_code: def.fiscal_area_code ?? "NAZIONALE",
      sdi_code: def.sdi_code ?? "0000000",
      category_code: def.category_code,
      shipping_mode: def.shipping_mode ?? "FRANCO",
      courier_guid: def.type_code === "CUSTOMER" ? carrierGuid : null,
      default_payment_method_guid: def.payment === "advance" ? payment.advance.guid : payment.bank.guid,
      default_payment_term_guid: def.term === "deposit" ? terms.deposit.guid : terms.df30.guid,
      bank_name: def.bank_name,
      bank_iban: def.bank_iban,
      bank_bic: def.bank_bic,
    },
    def.description,
  );
  if (!party) return null;

  if (!party.image_path) {
    await uploadPng(token, `/parties/${party.guid}/image`, def.description, avatarPng(initials(def.description), def.color));
  }

  for (const c of def.contacts ?? []) {
    await addContact(token, party.guid, c.type_code, c.content, c.label, c.is_primary);
  }

  const existingLinks = wasExisting ? await api(token, "GET", `/parties/${party.guid}/locations`) : [];
  let shippingGuid = existingLinks?.find((l) => l.type_code === "SHIPPING" && l.is_primary)?.location_guid ?? null;
  let billingGuid = existingLinks?.find((l) => l.type_code === "BILLING" && l.is_primary)?.location_guid ?? null;
  if (def.shipping) {
    if (!shippingGuid) {
      const loc = await createLocation(token, def.shipping);
      shippingGuid = loc?.guid ?? null;
      if (shippingGuid) await linkLocation(token, party.guid, shippingGuid, "SHIPPING", true);
    }
  }
  if (def.billing) {
    if (billingGuid) {
      // Reuse the primary billing location already attached to this party.
    } else if (JSON.stringify(def.billing) === JSON.stringify(def.shipping)) {
      billingGuid = shippingGuid;
    } else {
      const loc = await createLocation(token, def.billing);
      billingGuid = loc?.guid ?? null;
    }
    if (billingGuid) await linkLocation(token, party.guid, billingGuid, "BILLING", true);
  }

  return { ...party, shipping_location_guid: shippingGuid, billing_location_guid: billingGuid, def };
}

async function ensureArticle(token, art) {
  const existingResp = await api(token, "GET", `/articles?search=${encodeURIComponent(art.code)}&limit=100`);
  const existing = (existingResp?.items ?? []).find((x) => x.code === art.code);
  const article = existing ?? await api(token, "POST", "/articles", {
    code: art.code,
    description: art.description,
    unit_of_measure_code: art.unit_of_measure_code,
    type_code: art.type_code,
    list_price: money(art.list_price),
    is_active: true,
  });
  if (!article) return null;
  if (!existing) console.log(`  + ${art.code} - ${art.description}`);
  else console.log(`  ~ ${art.code}`);

  if (!article.image_path) {
    await uploadPng(token, `/articles/${article.guid}/image`, art.code, avatarPng(art.code, art.color));
  }
  const existingAliases = await api(token, "GET", `/articles/${article.guid}/aliases`);
  for (const alias of art.aliases ?? []) {
    if ((existingAliases ?? []).some((x) => x.alias === alias)) continue;
    await api(token, "POST", `/articles/${article.guid}/aliases`, { alias });
  }
  return { ...article, seed: art };
}

async function linkSupplier(token, article, supplier, supplier_code, purchase_price, is_preferred = false) {
  const existing = await api(token, "GET", `/articles/${article.guid}/suppliers`);
  if ((existing ?? []).some((x) => x.party_guid === supplier.guid)) return;
  await api(token, "POST", `/articles/${article.guid}/suppliers`, {
    party_guid: supplier.guid,
    supplier_code,
    purchase_price: money(purchase_price),
    is_preferred,
  });
}

async function createOrder(token, spec, parties, articles, warehouse) {
  const customer = parties[spec.customer];
  const existingOrders = await api(
    token,
    "GET",
    `/orders?party_guid=${customer.guid}&date_from=${spec.date}&date_to=${spec.date}&limit=100`,
  );
  const existingOrder = (existingOrders?.items ?? []).find((x) => x.party_guid === customer.guid && x.order_date === spec.date);
  if (existingOrder) {
    console.log(`  ~ ${existingOrder.code} ${existingOrder.status_code} - ${customer.description}`);
    return existingOrder;
  }

  const order = await api(token, "POST", "/orders", {
    party_guid: customer.guid,
    order_date: spec.date,
    payment_method_guid: customer.default_payment_method_guid,
    payment_term_guid: customer.default_payment_term_guid,
    billing_location_guid: customer.billing_location_guid,
    shipping_location_guid: customer.shipping_location_guid,
    warehouse_worker_guid: warehouse.worker?.guid ?? null,
  });
  if (!order) return null;

  const createdRows = [];
  for (const r of spec.rows) {
    const art = articles[r.code];
    const row = await api(token, "POST", `/orders/${order.guid}/rows`, {
      article_guid: art.guid,
      quantity: String(r.qty),
      unit_price: money(r.price ?? art.seed.list_price),
      discount_percent: String(r.discount ?? 0),
      vat_code: VAT_CODE,
      availability_status_code: r.availability ?? "AVAILABLE",
      unit_of_measure_code: art.unit_of_measure_code,
    });
    if (row) createdRows.push(row);
  }

  if (spec.status !== "DRAFT") await api(token, "POST", `/orders/${order.guid}/confirm`, {});
  if (["PARTIAL", "FULFILLED", "COMPLETED"].includes(spec.status)) {
    await api(token, "PATCH", `/orders/${order.guid}`, { status_code: spec.status === "PARTIAL" ? "PARTIAL" : "FULFILLED", note: spec.note });
  }
  if (spec.status === "COMPLETED") {
    await api(token, "PATCH", `/orders/${order.guid}`, { status_code: "COMPLETED", note: "DDT emesso, spedizione completata e ordine chiuso." });
  }
  if (spec.status === "CANCELLED") {
    await api(token, "DELETE", `/orders/${order.guid}`);
  }

  if (spec.pickNote && warehouse.registry) {
    const pick = await api(token, "POST", `/orders/${order.guid}/pick-notes?warehouse_guid=${warehouse.registry.guid}`, {});
    if (pick) {
      for (const row of createdRows) {
        await api(token, "POST", `/pick-notes/${pick.guid}/rows`, {
          article_guid: row.article_guid,
          quantity: row.quantity,
          order_row_guid: row.guid,
        });
      }
      if (spec.pickNote.status === "CHECKED" || spec.pickNote.status === "CLOSED") {
        await api(token, "PATCH", `/pick-notes/${pick.guid}`, {
          status_code: "CHECKED",
          weight: String(spec.pickNote.weight),
          packages: spec.pickNote.packages,
          picker_guid: warehouse.worker?.guid ?? null,
          checker_guid: warehouse.checker?.guid ?? null,
          note: spec.pickNote.note,
        });
      }
      if (spec.pickNote.status === "CLOSED") {
        await api(token, "PATCH", `/pick-notes/${pick.guid}`, {
          status_code: "CLOSED",
          weight: String(spec.pickNote.weight),
          packages: spec.pickNote.packages,
          checker_guid: warehouse.checker?.guid ?? null,
        });
      }
      if (spec.pickNote.ddt) {
        await api(token, "POST", "/delivery-notes", {
          pick_note_guid: pick.guid,
          customer_party_guid: customer.guid,
          shipping_location_guid: customer.shipping_location_guid,
          carrier_party_guid: parties["BRT"].guid,
          delivery_date: spec.pickNote.ddt.date,
          transport_by: "VETTORE",
          transport_cause: "Vendita",
          external_appearance: "Bancali filmati e colli reggiati",
          total_packages: spec.pickNote.packages,
          weight: String(spec.pickNote.weight),
          transport_start_datetime: `${spec.pickNote.ddt.date}T09:30:00Z`,
          notes: spec.pickNote.ddt.notes,
        });
      }
    }
  }

  console.log(`  + ${order.code} ${spec.status} - ${customer.description}`);
  return order;
}

async function main() {
  console.log("Login...");
  const token = await login();

  console.log("\nLookup nautici...");
  await Promise.all([
    getOrCreateLookup(token, "article-types", "PONTILI_BARCA", "Pontili per barche"),
    getOrCreateLookup(token, "article-types", "PONTILI_JETSKI", "Pontili per Jet Ski"),
    getOrCreateLookup(token, "article-types", "MODULARE_PRO", "Pontili modulari multifunzionali"),
    getOrCreateLookup(token, "article-types", "ACCESSORI_RM", "Accessori Royal Marine"),
    getOrCreateLookup(token, "article-types", "ANCORAGGIO", "Ancoraggio e ormeggio"),
    getOrCreateLookup(token, "party-categories", "RIVENDITORE", "Rivenditore nautico"),
    getOrCreateLookup(token, "party-categories", "PORTO", "Porto turistico / marina"),
    getOrCreateLookup(token, "party-categories", "BALNEARE", "Stabilimento balneare"),
    getOrCreateLookup(token, "party-categories", "CANTIERE", "Cantiere nautico"),
    getOrCreateLookup(token, "party-categories", "FORN_NAUT", "Fornitore nautico"),
  ]);

  console.log("\nPagamenti...");
  const payment = {
    bank: await getOrCreate(token, "/payment-methods?limit=100", "/payment-methods", (x) => x.description === "Bonifico Bancario", { description: "Bonifico Bancario" }, "Bonifico Bancario"),
    advance: await getOrCreate(token, "/payment-methods?limit=100", "/payment-methods", (x) => x.description === "Bonifico Anticipato", { description: "Bonifico Anticipato" }, "Bonifico Anticipato"),
  };
  const terms = {
    df30: await getOrCreate(token, "/payment-terms?limit=100", "/payment-terms", (x) => x.code === "30DF", { code: "30DF", description: "30 giorni data fattura", instalments: [{ days: 30, end_of_month: false, percentage: "100" }] }, "30 giorni data fattura"),
    deposit: await getOrCreate(token, "/payment-terms?limit=100", "/payment-terms", (x) => x.code === "50ACC-50CONS", { code: "50ACC-50CONS", description: "50% acconto, 50% alla consegna", instalments: [{ days: 0, end_of_month: false, percentage: "50" }, { days: 30, end_of_month: false, percentage: "50" }] }, "50% acconto, 50% consegna"),
  };

  console.log("\nAnagrafiche...");
  const carrier = await createParty(token, {
    description: "BRT S.p.A.",
    vat_number: "IT04507990150",
    type_code: "CARRIER",
    category_code: "FORN_NAUT",
    color: "b7352d",
    shipping: { address_line: "Via Enrico Mattei 42", city: "Bologna", province: "BO", post_code: "40138" },
    billing: { address_line: "Via Enrico Mattei 42", city: "Bologna", province: "BO", post_code: "40138" },
    contacts: [{ type_code: "PHONE", content: "+39 199 199 345", label: "Customer service", is_primary: true }],
  }, payment, terms, null);

  const partyDefs = [
    {
      key: "ROYALMARINE",
      description: "Royal Marine",
      vat_number: "IT01076200409",
      type_code: "SUPPLIER",
      category_code: "FORN_NAUT",
      color: "0f4f6f",
      shipping: { address_line: "Via Coriano, 58", city: "Rimini", province: "RN", post_code: "47924", latitude: "44.034000", longitude: "12.590000" },
      billing: { address_line: "Via Coriano, 58", city: "Rimini", province: "RN", post_code: "47924", latitude: "44.034000", longitude: "12.590000" },
      contacts: [
        { type_code: "PHONE", content: "+39 328 226 1798", label: "Roberto Rossi", is_primary: true },
        { type_code: "EMAIL", content: "roberto.rossi@royalmarine.it", label: "Commerciale", is_primary: true },
      ],
    },
    {
      key: "NAVIC",
      description: "NAVIC Marine Solutions",
      vat_number: "IT02045680382",
      type_code: "CUSTOMER",
      category_code: "RIVENDITORE",
      color: "165a8f",
      term: "deposit",
      shipping: { address_line: "Via Navigazione, 62", city: "Ferrara", province: "FE", post_code: "44124" },
      billing: { address_line: "Via Navigazione, 62", city: "Ferrara", province: "FE", post_code: "44124" },
      contacts: [
        { type_code: "PHONE", content: "+39 333 856 1050", label: "Marco", is_primary: true },
        { type_code: "EMAIL", content: "marco.lambertini@navicmarine.it", label: "Marco Lambertini", is_primary: true },
      ],
    },
    {
      key: "COLLINA",
      description: "COLLINA PPC srl",
      vat_number: "IT02141910685",
      type_code: "CUSTOMER",
      category_code: "RIVENDITORE",
      color: "2d6f4f",
      shipping: { address_line: "Via Nazionale, 71", city: "Villanova di Cepagatti", province: "PE", post_code: "65012" },
      billing: { address_line: "Via Nazionale, 71", city: "Villanova di Cepagatti", province: "PE", post_code: "65012" },
      contacts: [
        { type_code: "PHONE", content: "+39 346 809 5095", label: "PierPaolo", is_primary: true },
        { type_code: "PHONE", content: "+39 085 9771376", label: "Centralino" },
      ],
    },
    {
      key: "TOMAR",
      description: "TOMAR Centro Nautico",
      vat_number: "IT03691060755",
      type_code: "CUSTOMER",
      category_code: "RIVENDITORE",
      color: "4c6f91",
      term: "deposit",
      shipping: { address_line: "Via A. Toscanini, 1", city: "Leverano", province: "LE", post_code: "73045" },
      billing: { address_line: "Via A. Toscanini, 1", city: "Leverano", province: "LE", post_code: "73045" },
      contacts: [
        { type_code: "PHONE", content: "+39 392 131 5770", label: "Ilenia", is_primary: true },
        { type_code: "PHONE", content: "+39 0832 6044005", label: "Ufficio" },
        { type_code: "EMAIL", content: "info@tomarnautica.it", label: "Info", is_primary: true },
      ],
    },
    {
      key: "MARINA_RIMINI",
      description: "Marina di Rimini S.p.A.",
      vat_number: "IT02647200403",
      type_code: "CUSTOMER",
      category_code: "PORTO",
      color: "0a6f82",
      shipping: { address_line: "Largo Boscovich, 1", city: "Rimini", province: "RN", post_code: "47921" },
      billing: { address_line: "Largo Boscovich, 1", city: "Rimini", province: "RN", post_code: "47921" },
      contacts: [{ type_code: "EMAIL", content: "info@marinarimini.com", label: "Direzione porto", is_primary: true }],
    },
    {
      key: "CERVIA",
      description: "Circolo Nautico Cervia Amici della Vela ASD",
      vat_number: "IT92013460393",
      type_code: "CUSTOMER",
      category_code: "PORTO",
      color: "234f7f",
      shipping: { address_line: "Via Leoncavallo, 9", city: "Cervia", province: "RA", post_code: "48015" },
      billing: { address_line: "Via Leoncavallo, 9", city: "Cervia", province: "RA", post_code: "48015" },
      contacts: [{ type_code: "EMAIL", content: "segreteria@circolonauticocervia.it", label: "Segreteria", is_primary: true }],
    },
    {
      key: "BAGNO_26",
      description: "Bagno 26 Rimini",
      vat_number: "IT02390110404",
      type_code: "CUSTOMER",
      category_code: "BALNEARE",
      color: "d39b2a",
      shipping: { address_line: "Lungomare Claudio Tintori, 30/A", city: "Rimini", province: "RN", post_code: "47921" },
      billing: { address_line: "Lungomare Claudio Tintori, 30/A", city: "Rimini", province: "RN", post_code: "47921" },
      contacts: [{ type_code: "EMAIL", content: "info@bagno26rimini.it", label: "Info", is_primary: true }],
    },
    {
      key: "HDPE",
      description: "Forniture Polietilene Adriatico S.r.l.",
      vat_number: "IT04122590407",
      type_code: "SUPPLIER",
      category_code: "FORN_NAUT",
      color: "31555f",
      shipping: { address_line: "Via Emilia, 320", city: "Cesena", province: "FC", post_code: "47521" },
      billing: { address_line: "Via Emilia, 320", city: "Cesena", province: "FC", post_code: "47521" },
      contacts: [{ type_code: "EMAIL", content: "ordini@polietilene-adriatico.example", label: "Ordini", is_primary: true }],
    },
    {
      key: "INOX",
      description: "Inox Marine Components S.r.l.",
      vat_number: "IT03871290409",
      type_code: "SUPPLIER",
      category_code: "FORN_NAUT",
      color: "6f7780",
      shipping: { address_line: "Via del Lavoro, 18", city: "Riccione", province: "RN", post_code: "47838" },
      billing: { address_line: "Via del Lavoro, 18", city: "Riccione", province: "RN", post_code: "47838" },
      contacts: [{ type_code: "EMAIL", content: "sales@inox-marine.example", label: "Sales", is_primary: true }],
    },
  ];

  const parties = { BRT: carrier };
  for (const def of partyDefs) {
    parties[def.key] = await createParty(token, def, payment, terms, carrier?.guid ?? null);
  }

  console.log("\nMagazzino e operatori...");
  const warehouse = {
    registry: await getOrCreate(token, "/warehouses", "/warehouses", (x) => x.description === "Magazzino Royal Marine Rimini", { description: "Magazzino Royal Marine Rimini", location_guid: parties.ROYALMARINE.shipping_location_guid }, "Magazzino Royal Marine Rimini"),
    worker: await getOrCreate(token, "/warehouse-workers?limit=100", "/warehouse-workers", (x) => x.name === "Marco" && x.surname === "Ferretti", { name: "Marco", surname: "Ferretti" }, "Marco Ferretti"),
    checker: await getOrCreate(token, "/warehouse-workers?limit=100", "/warehouse-workers", (x) => x.name === "Sara" && x.surname === "Neri", { name: "Sara", surname: "Neri" }, "Sara Neri"),
  };

  console.log("\nArticoli da catalogo Royal Marine...");
  const articleDefs = [
    { code: "RM-PB-6T-RULLI", description: "Pontile per barche fino a 6 tonnellate con sistema a rulli", unit_of_measure_code: "PIECE", type_code: "PONTILI_BARCA", list_price: 4850, color: "0f5f83", aliases: ["Pontili per barche", "Sistema a rulli per motoscafi e gommoni"] },
    { code: "RM-PB-6T-RUOTE", description: "Pontile per barche fino a 6 tonnellate con ruote in gomma", unit_of_measure_code: "PIECE", type_code: "PONTILI_BARCA", list_price: 4620, color: "196f8f", aliases: ["Sistema ruote in gomma", "Protezione carena"] },
    { code: "RM-JS-RULLI", description: "Pontile per Jet Ski con rulli di scorrimento", unit_of_measure_code: "PIECE", type_code: "PONTILI_JETSKI", list_price: 2380, color: "e09d2f", aliases: ["Pontili per Jet Ski", "Moto d'acqua a rulli"] },
    { code: "RM-JS-SCIVOLO", description: "Pontile per Jet Ski a scivolamento", unit_of_measure_code: "PIECE", type_code: "PONTILI_JETSKI", list_price: 1950, color: "d18824", aliases: ["Versione a scivolamento", "Piccoli natanti"] },
    { code: "RM-MOD-370", description: "Piattaforma modulare multifunzionale portata 370 kg/m2", unit_of_measure_code: "PIECE", type_code: "MODULARE_PRO", list_price: 2650, color: "27724f", aliases: ["Pontili modulari multifunzionali", "Passerelle zattere cantieri eventi"] },
    { code: "RM-PASS-12M", description: "Passerella modulare galleggiante 12 metri", unit_of_measure_code: "PIECE", type_code: "MODULARE_PRO", list_price: 3200, color: "356348", aliases: ["Passerella", "Piattaforma per eventi sull'acqua"] },
    { code: "RM-CUBO-HDPE-BLU", description: "Cubo modulare in polietilene alta densita blu", unit_of_measure_code: "PIECE", type_code: "ACCESSORI_RM", list_price: 38.5, color: "145ea8", aliases: ["Modulo HDPE", "Cubo PET ad alta densita"] },
    { code: "RM-CUBO-HDPE-GRI", description: "Cubo modulare in polietilene alta densita grigio", unit_of_measure_code: "PIECE", type_code: "ACCESSORI_RM", list_price: 38.5, color: "6f7f86", aliases: ["Modulo HDPE grigio"] },
    { code: "RM-CUBO-SCIVOLO", description: "Modulo scivolo per ingresso Jet Ski", unit_of_measure_code: "PIECE", type_code: "ACCESSORI_RM", list_price: 58, color: "c88532", aliases: ["Cubo scivolo", "Ingresso moto d'acqua"] },
    { code: "RM-RULLO-TEF-75", description: "Rullo in teflon diametro 75 per alaggio", unit_of_measure_code: "PIECE", type_code: "ACCESSORI_RM", list_price: 62, color: "f0d27a", aliases: ["Rullo teflon", "Scivolamento carena"] },
    { code: "RM-RUOTA-GOMMA", description: "Ruota in gomma per pontile barca", unit_of_measure_code: "PIECE", type_code: "ACCESSORI_RM", list_price: 48, color: "30353a", aliases: ["Ruote in gomma"] },
    { code: "RM-PROF-CENT-6M", description: "Profilo centrale 6 metri per invito carena", unit_of_measure_code: "METER", type_code: "ACCESSORI_RM", list_price: 145, color: "174e68", aliases: ["Profilo centrale", "Invito carena"] },
    { code: "RM-PROF-LAT-3M", description: "Profilo laterale 3 metri per guida natante", unit_of_measure_code: "METER", type_code: "ACCESSORI_RM", list_price: 78, color: "245c74", aliases: ["Profilo laterale"] },
    { code: "RM-ANELLO-INOX", description: "Anello di ormeggio inox AISI 316", unit_of_measure_code: "PIECE", type_code: "ANCORAGGIO", list_price: 14.5, color: "9aa3a8", aliases: ["Dettaglio ancoraggio", "Ormeggio inox"] },
    { code: "RM-CATENA-10", description: "Catena di ormeggio zincata 10 mm", unit_of_measure_code: "METER", type_code: "ANCORAGGIO", list_price: 11.8, color: "7d858b", aliases: ["Catena ormeggio"] },
    { code: "RM-GOLFARE-M12", description: "Golfare inox M12 per fissaggio moduli", unit_of_measure_code: "PIECE", type_code: "ANCORAGGIO", list_price: 8.9, color: "a8adb1", aliases: ["Golfare M12", "Fissaggio moduli"] },
    { code: "RM-BULL-INSTALL", description: "Kit bulloneria inox M10 per installazione", unit_of_measure_code: "PIECE", type_code: "ANCORAGGIO", list_price: 89, color: "8f979d", aliases: ["Bulloneria inox"] },
  ];

  const articles = {};
  for (const def of articleDefs) {
    const article = await ensureArticle(token, def);
    if (article) articles[def.code] = article;
  }

  console.log("\nFornitori articoli...");
  for (const code of ["RM-CUBO-HDPE-BLU", "RM-CUBO-HDPE-GRI", "RM-CUBO-SCIVOLO", "RM-MOD-370"]) {
    await linkSupplier(token, articles[code], parties.HDPE, `HDPE-${code}`, articles[code].seed.list_price * 0.58, true);
  }
  for (const code of ["RM-ANELLO-INOX", "RM-GOLFARE-M12", "RM-BULL-INSTALL", "RM-CATENA-10"]) {
    await linkSupplier(token, articles[code], parties.INOX, `INOX-${code}`, articles[code].seed.list_price * 0.52, true);
  }
  for (const code of Object.keys(articles)) {
    await linkSupplier(token, articles[code], parties.ROYALMARINE, `RM-${code}`, articles[code].seed.list_price * 0.72, false);
  }

  console.log("\nOrdini, note di prelievo e DDT...");
  const orderSpecs = [
    {
      customer: "NAVIC",
      date: dateIso(2026, 1, 8),
      status: "COMPLETED",
      rows: [
        { code: "RM-PB-6T-RULLI", qty: 2, discount: 4 },
        { code: "RM-CUBO-HDPE-BLU", qty: 40 },
        { code: "RM-PROF-CENT-6M", qty: 24 },
        { code: "RM-BULL-INSTALL", qty: 2 },
      ],
      pickNote: { status: "CLOSED", weight: 410, packages: 7, note: "Prelievo completo per rivenditore Nord Est.", ddt: { date: dateIso(2026, 1, 13), notes: "Consegna bancali presso Via Navigazione, Ferrara." } },
    },
    {
      customer: "TOMAR",
      date: dateIso(2026, 1, 22),
      status: "COMPLETED",
      rows: [
        { code: "RM-JS-RULLI", qty: 2 },
        { code: "RM-CUBO-SCIVOLO", qty: 8 },
        { code: "RM-RULLO-TEF-75", qty: 10 },
        { code: "RM-ANELLO-INOX", qty: 12 },
      ],
      pickNote: { status: "CLOSED", weight: 205, packages: 4, note: "Kit Jet Ski imballati separatamente.", ddt: { date: dateIso(2026, 1, 27), notes: "Merce fragile: non sovrapporre rulli e moduli scivolo." } },
    },
    {
      customer: "COLLINA",
      date: dateIso(2026, 2, 6),
      status: "FULFILLED",
      rows: [
        { code: "RM-MOD-370", qty: 3, discount: 3 },
        { code: "RM-PASS-12M", qty: 1 },
        { code: "RM-CATENA-10", qty: 36 },
        { code: "RM-GOLFARE-M12", qty: 18 },
      ],
      pickNote: { status: "CHECKED", weight: 355, packages: 6, note: "Controllo completato, in attesa prenotazione vettore." },
    },
    {
      customer: "MARINA_RIMINI",
      date: dateIso(2026, 2, 20),
      status: "PARTIAL",
      note: "Disponibili moduli e ancoraggi; profili laterali in arrivo da produzione.",
      rows: [
        { code: "RM-PB-6T-RUOTE", qty: 1 },
        { code: "RM-CUBO-HDPE-GRI", qty: 60 },
        { code: "RM-PROF-LAT-3M", qty: 18, availability: "TO_ORDER" },
        { code: "RM-RUOTA-GOMMA", qty: 14 },
      ],
    },
    {
      customer: "CERVIA",
      date: dateIso(2026, 3, 4),
      status: "CONFIRMED",
      rows: [
        { code: "RM-MOD-370", qty: 2 },
        { code: "RM-PASS-12M", qty: 2 },
        { code: "RM-ANELLO-INOX", qty: 20 },
      ],
    },
    {
      customer: "BAGNO_26",
      date: dateIso(2026, 3, 18),
      status: "DRAFT",
      rows: [
        { code: "RM-JS-SCIVOLO", qty: 1 },
        { code: "RM-CUBO-SCIVOLO", qty: 4 },
        { code: "RM-GOLFARE-M12", qty: 8 },
      ],
    },
    {
      customer: "NAVIC",
      date: dateIso(2026, 4, 7),
      status: "FULFILLED",
      rows: [
        { code: "RM-PB-6T-RULLI", qty: 1 },
        { code: "RM-RULLO-TEF-75", qty: 6 },
        { code: "RM-PROF-CENT-6M", qty: 12 },
        { code: "RM-CATENA-10", qty: 20 },
      ],
      pickNote: { status: "CHECKED", weight: 245, packages: 4, note: "Ordine pronto per ritiro cliente." },
    },
    {
      customer: "TOMAR",
      date: dateIso(2026, 4, 19),
      status: "CANCELLED",
      rows: [
        { code: "RM-JS-SCIVOLO", qty: 3 },
        { code: "RM-CUBO-SCIVOLO", qty: 12 },
      ],
    },
  ];

  let orders = 0;
  for (const spec of orderSpecs) {
    const order = await createOrder(token, spec, parties, articles, warehouse);
    if (order) orders++;
  }

  console.log("\nSeed completato.");
  console.log(`Anagrafiche: ${Object.keys(parties).length}`);
  console.log(`Articoli: ${Object.keys(articles).length}`);
  console.log(`Ordini gestiti: ${orders}`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
