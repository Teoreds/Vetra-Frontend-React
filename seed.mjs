#!/usr/bin/env node
/**
 * Seed script — Vetra ERP
 * Creates realistic mock data: parties (customers/suppliers/carriers),
 * locations, articles, and orders at various lifecycle stages.
 *
 * Usage: node seed.mjs
 */

const BASE = "http://localhost:8000";

// ── Lookup IDs (already in DB) ─────────────────────────────────────────────
const CARRIER_GUID     = "ac156edc-00aa-4d84-9236-c1160f70d083"; // TeoReds
const PM_BONIFICO      = "7b25fda3-88ff-4818-8a66-8bbeb56aad2b";
const PM_CONTANTI      = "02504647-09ed-477b-8c67-23c5aa43e5ba";
const PM_RB            = "a2bcbaf3-2590-42c2-a167-54211277aaa8";
const PT_306090FM      = "9bc9245c-5267-46bf-8687-4ba8d268c8f5";
const PT_3060DF        = "237a529e-ce0e-4c02-888a-f643f398c2df";
const PT_30FM10        = "2eb17bca-1316-47e3-8f07-4e38a1326362";

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
    console.error(`  ✗ ${method} ${path} → ${r.status}: ${text.slice(0, 200)}`);
    return null;
  }
  return text ? JSON.parse(text) : null;
}

// ── Helpers ───────────────────────────────────────────────────────────────
function dateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── Data definitions ──────────────────────────────────────────────────────

const CUSTOMERS = [
  {
    description: "Moda Italiana S.r.l.",
    vat_number: "IT04523110987",
    fiscal_area_code: "NAZIONALE",
    sdi_code: "M5UXCR1",
    category_code: "CALZ",
    default_payment_method_guid: PM_BONIFICO,
    default_payment_term_guid: PT_306090FM,
    shipping: { address_line: "Via Tortona 31", city: "Milano", province: "MI", post_code: "20144" },
    billing:  { address_line: "Via Tortona 31", city: "Milano", province: "MI", post_code: "20144" },
  },
  {
    description: "Atelier Ferretti & Co.",
    vat_number: "IT07891230156",
    fiscal_area_code: "NAZIONALE",
    sdi_code: "X3FGT27",
    category_code: "CALZ",
    default_payment_method_guid: PM_RB,
    default_payment_term_guid: PT_3060DF,
    shipping: { address_line: "Corso Magenta 14", city: "Milano", province: "MI", post_code: "20123" },
    billing:  { address_line: "Via Montenapoleone 8", city: "Milano", province: "MI", post_code: "20121" },
  },
  {
    description: "Casa Creazioni Venezia",
    vat_number: "IT03344120271",
    fiscal_area_code: "NAZIONALE",
    sdi_code: "0000000",
    category_code: "CALZ",
    default_payment_method_guid: PM_CONTANTI,
    default_payment_term_guid: PT_30FM10,
    shipping: { address_line: "Fondamenta delle Zattere 2", city: "Venezia", province: "VE", post_code: "30123" },
    billing:  { address_line: "Fondamenta delle Zattere 2", city: "Venezia", province: "VE", post_code: "30123" },
  },
  {
    description: "Ricami & Bijoux Napoli S.r.l.",
    vat_number: "IT06712340638",
    fiscal_area_code: "NAZIONALE",
    sdi_code: "B9WVT44",
    category_code: "CALZ",
    default_payment_method_guid: PM_RB,
    default_payment_term_guid: PT_306090FM,
    shipping: { address_line: "Via Toledo 256", city: "Napoli", province: "NA", post_code: "80134" },
    billing:  { address_line: "Via Toledo 256", city: "Napoli", province: "NA", post_code: "80134" },
  },
  {
    description: "Pelletteria Toscana Export",
    vat_number: "IT02981560485",
    fiscal_area_code: "INTRA_CEE",
    sdi_code: "0000000",
    category_code: "CALZ",
    default_payment_method_guid: PM_BONIFICO,
    default_payment_term_guid: PT_3060DF,
    shipping: { address_line: "Via Stibbert 45", city: "Firenze", province: "FI", post_code: "50134" },
    billing:  { address_line: "Via Stibbert 45", city: "Firenze", province: "FI", post_code: "50134" },
  },
  {
    description: "Lyon Textiles International",
    vat_number: "FR89432156789",
    fiscal_area_code: "INTRA_CEE",
    sdi_code: "0000000",
    category_code: "CALZ",
    default_payment_method_guid: PM_BONIFICO,
    default_payment_term_guid: PT_306090FM,
    shipping: { address_line: "12 Rue de la République", city: "Lyon", province: "ARA", post_code: "69001" },
    billing:  { address_line: "12 Rue de la République", city: "Lyon", province: "ARA", post_code: "69001" },
  },
];

const ARTICLES = [
  // Strass
  { code: "STR-SS-4MM-001", description: "Strass Swarovski Crystal 4mm", unit_of_measure_code: "PIECE", type_code: "STRASS", list_price: 0.85 },
  { code: "STR-SS-6MM-001", description: "Strass Swarovski Crystal 6mm", unit_of_measure_code: "PIECE", type_code: "STRASS", list_price: 1.20 },
  { code: "STR-ROSE-4MM",   description: "Strass Rose Gold 4mm", unit_of_measure_code: "PIECE", type_code: "STRASS", list_price: 0.95 },
  { code: "STR-AB-6MM",     description: "Strass Aurora Boreale 6mm", unit_of_measure_code: "PIECE", type_code: "STRASS", list_price: 1.45 },
  // Bottoni
  { code: "BTN-ORO-18MM",  description: "Bottone Metallico Dorato 18mm", unit_of_measure_code: "PIECE", type_code: "BOTTONI", list_price: 0.35 },
  { code: "BTN-ARG-14MM",  description: "Bottone Metallico Argento 14mm", unit_of_measure_code: "PIECE", type_code: "BOTTONI", list_price: 0.28 },
  { code: "BTN-MADREPERLA-20MM", description: "Bottone Madreperla 20mm", unit_of_measure_code: "PIECE", type_code: "BOTTONI", list_price: 0.72 },
  { code: "BTN-CORNO-12MM", description: "Bottone in Corno 12mm", unit_of_measure_code: "PIECE", type_code: "BOTTONI", list_price: 0.55 },
  // Perle
  { code: "PRL-BI-8MM",   description: "Perla Bianca Tonda 8mm", unit_of_measure_code: "PIECE", type_code: "PERLE", list_price: 1.80 },
  { code: "PRL-BAROC-10MM", description: "Perla Barocca 10mm", unit_of_measure_code: "PIECE", type_code: "PERLE", list_price: 3.20 },
  // Accessori
  { code: "ACC-CHIUSURA-MAGN", description: "Chiusura Magnetica Dorata 10mm", unit_of_measure_code: "PIECE", type_code: "ACC.", list_price: 0.42 },
  { code: "ACC-GANCIO-AG",    description: "Gancio Aragosta Argento 12mm",   unit_of_measure_code: "PIECE", type_code: "ACC.", list_price: 0.18 },
  // Catene
  { code: "CAT-ORO-2MM",  description: "Catena Rolò Oro 2mm (metro)", unit_of_measure_code: "METER", type_code: "CATENE", list_price: 4.50 },
  { code: "CAT-ARG-3MM",  description: "Catena Figaro Argento 3mm (metro)", unit_of_measure_code: "METER", type_code: "CATENE", list_price: 5.20 },
  // Gocce
  { code: "GOC-CRYSTAL-12",  description: "Goccia Crystal AB 12x8mm", unit_of_measure_code: "PIECE", type_code: "GOCCE-PALLINE", list_price: 0.65 },
];

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log("🔐 Logging in...");
  const token = await login();
  console.log("✓ Authenticated\n");

  // ── Create locations for parties ──────────────────────────────────────
  async function createPartyWithLocations(customerDef) {
    console.log(`  Creating party: ${customerDef.description}`);
    const { shipping, billing, ...partyFields } = customerDef;
    const party = await api(token, "POST", "/parties", {
      ...partyFields,
      courier_guid: CARRIER_GUID,
      shipping_mode: "ASSEGNATO",
      type_code: "CUSTOMER",
    });
    if (!party) return null;
    console.log(`  ✓ Party ${party.guid.slice(0, 8)} — ${party.description}`);

    // Create shipping location
    const shipLoc = await api(token, "POST", "/locations", shipping);
    if (shipLoc) {
      await api(token, "POST", `/parties/${party.guid}/locations`, {
        location_guid: shipLoc.guid,
        type_code: "SHIPPING",
        is_primary: true,
      });
      console.log(`    ✓ Shipping: ${shipping.address_line}, ${shipping.city}`);
    }

    // Create billing location (may differ from shipping)
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

  // ── Step 1: Create all customers ──────────────────────────────────────
  console.log("═══ Creating customers ═══");
  const customers = [];
  for (const def of CUSTOMERS) {
    const c = await createPartyWithLocations(def);
    if (c) customers.push(c);
  }
  console.log(`\n✓ ${customers.length} customers created\n`);

  // ── Step 2: Create articles ───────────────────────────────────────────
  console.log("═══ Creating articles ═══");
  const articles = [];
  for (const art of ARTICLES) {
    const created = await api(token, "POST", "/articles", { ...art, is_active: true });
    if (created) {
      articles.push(created);
      console.log(`  ✓ ${created.code} — ${created.description}`);
    }
  }
  console.log(`\n✓ ${articles.length} articles created\n`);

  if (customers.length === 0 || articles.length === 0) {
    console.error("❌ Not enough customers or articles — aborting orders.");
    process.exit(1);
  }

  // ── Step 3: Create orders ─────────────────────────────────────────────
  console.log("═══ Creating orders ═══");

  const pmOptions = [PM_BONIFICO, PM_RB, PM_CONTANTI];
  const ptOptions = [PT_306090FM, PT_3060DF, PT_30FM10];

  // Returns random subset of articles as order rows
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
      payment_method_guid: customer.default_payment_method_guid ?? pick(pmOptions),
      payment_term_guid: customer.default_payment_term_guid ?? pick(ptOptions),
      shipping_location_guid: customer.shipping_location_guid ?? null,
      billing_location_guid: customer.billing_location_guid ?? null,
    });
    if (!order) return null;

    // Add rows
    for (const row of randomRows(rowCount)) {
      await api(token, "POST", `/orders/${order.guid}/rows`, row);
    }

    // Confirm if requested
    if (doConfirm) {
      await api(token, "POST", `/orders/${order.guid}/confirm`, {});
    }

    return order;
  }

  // Pattern: each customer gets a mix of statuses across time
  const orderSpecs = [
    // Moda Italiana — big client, many orders
    { custIdx: 0, date: -90, rows: 5, confirm: true  },
    { custIdx: 0, date: -60, rows: 4, confirm: true  },
    { custIdx: 0, date: -30, rows: 3, confirm: true  },
    { custIdx: 0, date: -10, rows: 4, confirm: true  },
    { custIdx: 0, date:   0, rows: 3, confirm: false },
    { custIdx: 0, date:   5, rows: 2, confirm: false },
    // Atelier Ferretti
    { custIdx: 1, date: -75, rows: 4, confirm: true  },
    { custIdx: 1, date: -45, rows: 3, confirm: true  },
    { custIdx: 1, date: -15, rows: 5, confirm: false },
    { custIdx: 1, date:   2, rows: 2, confirm: false },
    // Casa Creazioni Venezia
    { custIdx: 2, date: -50, rows: 3, confirm: true  },
    { custIdx: 2, date: -20, rows: 4, confirm: true  },
    { custIdx: 2, date:   0, rows: 2, confirm: false },
    // Ricami & Bijoux Napoli
    { custIdx: 3, date: -35, rows: 4, confirm: true  },
    { custIdx: 3, date:  -5, rows: 3, confirm: false },
    // Pelletteria Toscana
    { custIdx: 4, date: -60, rows: 5, confirm: true  },
    { custIdx: 4, date: -25, rows: 3, confirm: false },
    // Lyon Textiles (international)
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
  console.log(`   Customers: ${customers.length}`);
  console.log(`   Articles:  ${articles.length}`);
  console.log(`   Orders:    ${orderCount}`);
}

main().catch(e => { console.error("Fatal:", e.message); process.exit(1); });
