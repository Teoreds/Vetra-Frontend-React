#!/usr/bin/env node
/**
 * Seed script — Vetra ERP
 * Creates realistic mock data: payment methods, payment terms, carrier,
 * customers with locations, articles, and orders at various lifecycle stages.
 *
 * Usage: node seed.mjs
 */

const BASE = "http://localhost:8000";

// ── Auth ──────────────────────────────────────────────────────────────────
async function login() {
  const body = new URLSearchParams({ username: "admin", password: "admin123" });
  const r = await fetch(`${BASE}/auth/login`, { method: "POST", body, headers: { "Content-Type": "application/x-www-form-urlencoded" } });
  const d = await r.json();
  if (!d.access_token) throw new Error("Login failed: " + JSON.stringify(d));
  return d.access_token;
}

async function api(token, method, path, body) {
  const r = await fetch(`${BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await r.text();
  if (!r.ok) {
    console.error(`  ✗ ${method} ${path} → ${r.status}: ${text.slice(0, 300)}`);
    return null;
  }
  return text ? JSON.parse(text) : null;
}

function dateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log("🔐 Logging in...");
  const token = await login();
  console.log("✓ Authenticated\n");

  // ── Helper: get or create ─────────────────────────────────────────────────
  async function getOrCreate(listPath, createPath, matchFn, payload, label) {
    const list = await api(token, "GET", listPath, null);
    const existing = (list?.items ?? list ?? []).find(matchFn);
    if (existing) { console.log(`  ~ ${label} — already exists, reusing`); return existing; }
    const created = await api(token, "POST", createPath, payload);
    if (created) console.log(`  ✓ ${label} (${created.guid?.slice(0,8)})`);
    return created;
  }

  // ── Step 1: Payment methods ───────────────────────────────────────────────
  console.log("═══ Creating payment methods ═══");
  const pmBonifico = await getOrCreate("/payment-methods?limit=100", "/payment-methods",
    x => x.description === "Bonifico Bancario", { description: "Bonifico Bancario" }, "Bonifico Bancario");
  const pmContanti = await getOrCreate("/payment-methods?limit=100", "/payment-methods",
    x => x.description === "Contanti", { description: "Contanti" }, "Contanti");
  const pmRB = await getOrCreate("/payment-methods?limit=100", "/payment-methods",
    x => x.description === "Ricevuta Bancaria", { description: "Ricevuta Bancaria" }, "Ricevuta Bancaria");

  // ── Step 2: Payment terms ─────────────────────────────────────────────────
  console.log("\n═══ Creating payment terms ═══");
  const pt306090FM = await getOrCreate("/payment-terms?limit=100", "/payment-terms",
    x => x.code === "30-60-90FM",
    { code: "30-60-90FM", description: "30/60/90 Fine Mese", instalments: [
      { days: 30, end_of_month: true, percentage: "33.33" },
      { days: 60, end_of_month: true, percentage: "33.33" },
      { days: 90, end_of_month: true, percentage: "33.34" },
    ]}, "30/60/90 Fine Mese");
  const pt3060DF = await getOrCreate("/payment-terms?limit=100", "/payment-terms",
    x => x.code === "30-60DF",
    { code: "30-60DF", description: "30/60 Data Fattura", instalments: [
      { days: 30, end_of_month: false, percentage: "50" },
      { days: 60, end_of_month: false, percentage: "50" },
    ]}, "30/60 Data Fattura");
  const pt30FM10 = await getOrCreate("/payment-terms?limit=100", "/payment-terms",
    x => x.code === "30FM+10",
    { code: "30FM+10", description: "30 Fine Mese + 10 Giorni", instalments: [
      { days: 30, end_of_month: true, extra_days: 10, percentage: "100" },
    ]}, "30 Fine Mese + 10gg");

  if (!pmBonifico || !pmContanti || !pmRB || !pt306090FM || !pt3060DF || !pt30FM10) {
    throw new Error("Failed to get/create payment methods or terms — aborting.");
  }

  // ── Step 3: Carrier ───────────────────────────────────────────────────────
  console.log("\n═══ Creating carrier ═══");
  const carrier = await getOrCreate(
    "/parties?type_code=CARRIER&limit=100", "/parties",
    x => x.description === "Corriere Espresso Italia",
    { description: "Corriere Espresso Italia", type_code: "CARRIER", vat_number: "IT09876543210" },
    "Corriere Espresso Italia"
  );
  if (!carrier) throw new Error("Failed to get/create carrier — aborting.");

  // ── Step 4: Create customers ──────────────────────────────────────────────
  const CUSTOMERS = [
    {
      description: "Moda Italiana S.r.l.",
      vat_number: "IT04523110987",
      fiscal_area_code: "NAZIONALE",
      sdi_code: "M5UXCR1",
      category_code: "CALZ",
      default_payment_method_guid: pmBonifico.guid,
      default_payment_term_guid: pt306090FM.guid,
      shipping: { address_line: "Via Tortona 31", city: "Milano", province: "MI", post_code: "20144" },
      billing:  { address_line: "Via Tortona 31", city: "Milano", province: "MI", post_code: "20144" },
    },
    {
      description: "Atelier Ferretti & Co.",
      vat_number: "IT07891230156",
      fiscal_area_code: "NAZIONALE",
      sdi_code: "X3FGT27",
      category_code: "CALZ",
      default_payment_method_guid: pmRB.guid,
      default_payment_term_guid: pt3060DF.guid,
      shipping: { address_line: "Corso Magenta 14", city: "Milano", province: "MI", post_code: "20123" },
      billing:  { address_line: "Via Montenapoleone 8", city: "Milano", province: "MI", post_code: "20121" },
    },
    {
      description: "Casa Creazioni Venezia",
      vat_number: "IT03344120271",
      fiscal_area_code: "NAZIONALE",
      sdi_code: "0000000",
      category_code: "CALZ",
      default_payment_method_guid: pmContanti.guid,
      default_payment_term_guid: pt30FM10.guid,
      shipping: { address_line: "Fondamenta delle Zattere 2", city: "Venezia", province: "VE", post_code: "30123" },
      billing:  { address_line: "Fondamenta delle Zattere 2", city: "Venezia", province: "VE", post_code: "30123" },
    },
    {
      description: "Ricami & Bijoux Napoli S.r.l.",
      vat_number: "IT06712340638",
      fiscal_area_code: "NAZIONALE",
      sdi_code: "B9WVT44",
      category_code: "CALZ",
      default_payment_method_guid: pmRB.guid,
      default_payment_term_guid: pt306090FM.guid,
      shipping: { address_line: "Via Toledo 256", city: "Napoli", province: "NA", post_code: "80134" },
      billing:  { address_line: "Via Toledo 256", city: "Napoli", province: "NA", post_code: "80134" },
    },
    {
      description: "Pelletteria Toscana Export",
      vat_number: "IT02981560485",
      fiscal_area_code: "INTRA_CEE",
      sdi_code: "0000000",
      category_code: "CALZ",
      default_payment_method_guid: pmBonifico.guid,
      default_payment_term_guid: pt3060DF.guid,
      shipping: { address_line: "Via Stibbert 45", city: "Firenze", province: "FI", post_code: "50134" },
      billing:  { address_line: "Via Stibbert 45", city: "Firenze", province: "FI", post_code: "50134" },
    },
    {
      description: "Lyon Textiles International",
      vat_number: "FR89432156789",
      fiscal_area_code: "INTRA_CEE",
      sdi_code: "0000000",
      category_code: "CALZ",
      default_payment_method_guid: pmBonifico.guid,
      default_payment_term_guid: pt306090FM.guid,
      shipping: { address_line: "12 Rue de la République", city: "Lyon", province: "ARA", post_code: "69001" },
      billing:  { address_line: "12 Rue de la République", city: "Lyon", province: "ARA", post_code: "69001" },
    },
  ];

  async function createPartyWithLocations(customerDef) {
    console.log(`  Creating party: ${customerDef.description}`);
    const { shipping, billing, ...partyFields } = customerDef;
    const party = await api(token, "POST", "/parties", {
      ...partyFields,
      courier_guid: carrier.guid,
      shipping_mode: "ASSEGNATO",
      type_code: "CUSTOMER",
    });
    if (!party) return null;
    console.log(`  ✓ Party ${party.guid.slice(0, 8)} — ${party.description}`);

    const shipLoc = await api(token, "POST", "/locations", shipping);
    if (shipLoc) {
      await api(token, "POST", `/parties/${party.guid}/locations`, {
        location_guid: shipLoc.guid,
        type_code: "SHIPPING",
        is_primary: true,
      });
      console.log(`    ✓ Shipping: ${shipping.address_line}, ${shipping.city}`);
    }

    let billLocGuid;
    if (billing.address_line === shipping.address_line && billing.city === shipping.city) {
      billLocGuid = shipLoc?.guid;
    } else {
      const billLoc = await api(token, "POST", "/locations", billing);
      billLocGuid = billLoc?.guid;
    }
    if (billLocGuid) {
      await api(token, "POST", `/parties/${party.guid}/locations`, {
        location_guid: billLocGuid,
        type_code: "BILLING",
        is_primary: true,
      });
      console.log(`    ✓ Billing: ${billing.address_line}, ${billing.city}`);
    }

    return { ...party, shipping_location_guid: shipLoc?.guid, billing_location_guid: billLocGuid };
  }

  console.log("\n═══ Creating customers ═══");
  const customers = [];
  for (const def of CUSTOMERS) {
    const c = await createPartyWithLocations(def);
    if (c) customers.push(c);
  }
  console.log(`\n✓ ${customers.length} customers created`);

  // ── Step 5: Create articles ───────────────────────────────────────────────
  const ARTICLES = [
    { code: "STR-SS-4MM-001",     description: "Strass Swarovski Crystal 4mm",    unit_of_measure_code: "PIECE", type_code: "STRASS",        list_price: 0.85 },
    { code: "STR-SS-6MM-001",     description: "Strass Swarovski Crystal 6mm",    unit_of_measure_code: "PIECE", type_code: "STRASS",        list_price: 1.20 },
    { code: "STR-ROSE-4MM",       description: "Strass Rose Gold 4mm",            unit_of_measure_code: "PIECE", type_code: "STRASS",        list_price: 0.95 },
    { code: "STR-AB-6MM",         description: "Strass Aurora Boreale 6mm",       unit_of_measure_code: "PIECE", type_code: "STRASS",        list_price: 1.45 },
    { code: "BTN-ORO-18MM",       description: "Bottone Metallico Dorato 18mm",   unit_of_measure_code: "PIECE", type_code: "BOTTONI",       list_price: 0.35 },
    { code: "BTN-ARG-14MM",       description: "Bottone Metallico Argento 14mm",  unit_of_measure_code: "PIECE", type_code: "BOTTONI",       list_price: 0.28 },
    { code: "BTN-MADREPERLA-20MM",description: "Bottone Madreperla 20mm",         unit_of_measure_code: "PIECE", type_code: "BOTTONI",       list_price: 0.72 },
    { code: "BTN-CORNO-12MM",     description: "Bottone in Corno 12mm",           unit_of_measure_code: "PIECE", type_code: "BOTTONI",       list_price: 0.55 },
    { code: "PRL-BI-8MM",         description: "Perla Bianca Tonda 8mm",          unit_of_measure_code: "PIECE", type_code: "PERLE",         list_price: 1.80 },
    { code: "PRL-BAROC-10MM",     description: "Perla Barocca 10mm",              unit_of_measure_code: "PIECE", type_code: "PERLE",         list_price: 3.20 },
    { code: "ACC-CHIUSURA-MAGN",  description: "Chiusura Magnetica Dorata 10mm",  unit_of_measure_code: "PIECE", type_code: "ACC.",          list_price: 0.42 },
    { code: "ACC-GANCIO-AG",      description: "Gancio Aragosta Argento 12mm",    unit_of_measure_code: "PIECE", type_code: "ACC.",          list_price: 0.18 },
    { code: "CAT-ORO-2MM",        description: "Catena Rolò Oro 2mm (metro)",     unit_of_measure_code: "METER", type_code: "CATENE",        list_price: 4.50 },
    { code: "CAT-ARG-3MM",        description: "Catena Figaro Argento 3mm (metro)",unit_of_measure_code: "METER",type_code: "CATENE",        list_price: 5.20 },
    { code: "GOC-CRYSTAL-12",     description: "Goccia Crystal AB 12x8mm",        unit_of_measure_code: "PIECE", type_code: "GOCCE-PALLINE", list_price: 0.65 },
  ];

  console.log("\n═══ Creating articles ═══");

  // Fetch existing articles to avoid duplicate key errors
  const existingResp = await api(token, "GET", "/articles?limit=200", null);
  const existingByCode = {};
  for (const a of existingResp?.items ?? []) {
    existingByCode[a.code] = a;
  }

  const articles = [];
  for (const art of ARTICLES) {
    if (existingByCode[art.code]) {
      articles.push(existingByCode[art.code]);
      console.log(`  ~ ${art.code} — already exists, reusing`);
      continue;
    }
    const created = await api(token, "POST", "/articles", { ...art, is_active: true });
    if (created) {
      articles.push(created);
      console.log(`  ✓ ${created.code} — ${created.description}`);
    }
  }
  console.log(`\n✓ ${articles.length} articles ready`);

  if (customers.length === 0 || articles.length === 0) {
    console.error("❌ Not enough customers or articles — aborting orders.");
    process.exit(1);
  }

  // ── Step 6: Create orders ─────────────────────────────────────────────────
  console.log("\n═══ Creating orders ═══");

  function randomRows(count = 3) {
    const shuffled = [...articles].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(a => ({
      article_guid: a.guid,
      quantity: Math.floor(Math.random() * 200) + 20,
      unit_price: parseFloat((parseFloat(a.list_price ?? "1") * (0.85 + Math.random() * 0.3)).toFixed(2)),
      discount_percent: pick([0, 0, 0, 5, 10, 15]),
      vat_code: "22",
      availability_status_code: "AVAILABLE",
      unit_of_measure_code: a.unit_of_measure_code,
    }));
  }

  async function createOrder(customer, dateOffset_, rowCount, doConfirm = false) {
    const order = await api(token, "POST", "/orders", {
      party_guid: customer.guid,
      order_date: dateOffset(dateOffset_),
      payment_method_guid: customer.default_payment_method_guid,
      payment_term_guid: customer.default_payment_term_guid,
      shipping_location_guid: customer.shipping_location_guid ?? null,
      billing_location_guid: customer.billing_location_guid ?? null,
    });
    if (!order) return null;

    for (const row of randomRows(rowCount)) {
      await api(token, "POST", `/orders/${order.guid}/rows`, row);
    }

    if (doConfirm) {
      await api(token, "POST", `/orders/${order.guid}/confirm`, {});
    }

    return order;
  }

  const orderSpecs = [
    { custIdx: 0, date: -90, rows: 5, confirm: true  },
    { custIdx: 0, date: -60, rows: 4, confirm: true  },
    { custIdx: 0, date: -30, rows: 3, confirm: true  },
    { custIdx: 0, date: -10, rows: 4, confirm: true  },
    { custIdx: 0, date:   0, rows: 3, confirm: false },
    { custIdx: 0, date:   5, rows: 2, confirm: false },
    { custIdx: 1, date: -75, rows: 4, confirm: true  },
    { custIdx: 1, date: -45, rows: 3, confirm: true  },
    { custIdx: 1, date: -15, rows: 5, confirm: false },
    { custIdx: 1, date:   2, rows: 2, confirm: false },
    { custIdx: 2, date: -50, rows: 3, confirm: true  },
    { custIdx: 2, date: -20, rows: 4, confirm: true  },
    { custIdx: 2, date:   0, rows: 2, confirm: false },
    { custIdx: 3, date: -35, rows: 4, confirm: true  },
    { custIdx: 3, date:  -5, rows: 3, confirm: false },
    { custIdx: 4, date: -60, rows: 5, confirm: true  },
    { custIdx: 4, date: -25, rows: 3, confirm: false },
    { custIdx: 5, date: -80, rows: 4, confirm: true  },
    { custIdx: 5, date: -10, rows: 3, confirm: false },
  ];

  let orderCount = 0;
  for (const spec of orderSpecs) {
    const customer = customers[spec.custIdx];
    if (!customer) continue;
    const order = await createOrder(customer, spec.date, spec.rows, spec.confirm);
    if (order) {
      orderCount++;
      const status = spec.confirm ? "CONFIRMED" : "DRAFT";
      console.log(`  ✓ [${status}] ${order.code} — ${customer.description} (${spec.rows} righe, ${dateOffset(spec.date)})`);
    }
  }

  console.log(`\n✓ ${orderCount} orders created\n`);
  console.log("🎉 Seed completed!");
  console.log(`   Payment methods: 3`);
  console.log(`   Payment terms:   3`);
  console.log(`   Carrier:         1`);
  console.log(`   Customers:       ${customers.length}`);
  console.log(`   Articles:        ${articles.length}`);
  console.log(`   Orders:          ${orderCount}`);
}

main().catch(e => { console.error("Fatal:", e.message); process.exit(1); });
