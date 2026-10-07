// POST /api/order — kaystqbl l'commande, kaysiftha l Telegram w/wla Google Sheet.
// Env vars (kat7ttom f Vercel > Project > Settings > Environment Variables):
//   CALLMEBOT_APIKEY (+ WHATSAPP_PHONE)     -> message f WhatsApp dyalk
//   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID   -> notification f Telegram
//   SHEET_WEBHOOK_URL                       -> ytsjjl f Google Sheet
// Kfaya wa7d mnhom, walakin a7sn jouj.

const PRICES = { 1: 350, 2: 650 };
const COLORS = {
  gris: "رمادي",
  clair: "رمادي فاتح",
  noir: "كحل",
};

const clean = (v, max) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

function validate(body) {
  const o = {
    name: clean(body.name, 80),
    phone: clean(body.phone, 20).replace(/[\s.-]/g, "").replace(/^\+?212/, "0"),
    city: clean(body.city, 60),
    address: clean(body.address, 200),
    qty: Number(body.qty) === 2 ? 2 : 1,
    color: String(body.color || ""),
    color2: body.color2 ? String(body.color2) : null,
    height: Math.round(Number(body.height)),
  };
  if (o.name.length < 3) return { error: "name" };
  if (!/^0[567]\d{8}$/.test(o.phone)) return { error: "phone" };
  if (!o.city) return { error: "city" };
  if (o.address.length < 4) return { error: "address" };
  if (!COLORS[o.color]) return { error: "color" };
  if (o.qty === 2 && !COLORS[o.color2]) return { error: "color2" };
  if (o.qty === 1) o.color2 = null;
  if (!(o.height >= 120 && o.height <= 210)) return { error: "height" };
  // l'Sheet l9dim 3ndo colonne "size": kan3mroha b tol bach ma tb9ach khawya
  o.size = `${o.height} سم`;
  return { order: o };
}

function orderId() {
  const t = Date.now().toString(36).slice(-5).toUpperCase();
  const r = Math.floor(Math.random() * 36 ** 2).toString(36).padStart(2, "0").toUpperCase();
  return `OW-${t}${r}`;
}

async function sendWhatsApp(text) {
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!apikey) return null;
  const phone = process.env.WHATSAPP_PHONE || "+212762793876";
  const url = "https://api.callmebot.com/whatsapp.php?" +
    new URLSearchParams({ phone, text, apikey }).toString();
  const r = await fetch(url);
  const body = await r.text().catch(() => "");
  // CallMeBot kayrj3 200 7tta f l'erreur, dakchi 3lach kanchoufo l'jwab
  return r.ok && /queued|sent/i.test(body);
}

async function sendTelegram(text) {
  // kan7iydo blayss w "bot" ila tzado bl ghalat m3a l'copy/paste
  const token = (process.env.TELEGRAM_BOT_TOKEN || "").trim().replace(/^bot/i, "");
  const chat = (process.env.TELEGRAM_CHAT_ID || "").trim();
  if (!token || !chat) return null;
  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chat, text }),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    console.error("TELEGRAM_ERROR", r.status, err.description || "", "chat_id length:", chat.length);
  }
  return r.ok;
}

async function sendSheet(row) {
  const url = process.env.SHEET_WEBHOOK_URL;
  if (!url) return null;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(row),
    redirect: "follow",
  });
  return r.ok;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  // honeypot: robots kay3mro had l'champ, nas ma kayshoufouhch
  if (body.website) return res.status(200).json({ ok: true, id: "OW-0", total: 0 });

  const { order, error } = validate(body);
  if (error) return res.status(400).json({ ok: false, error });

  const id = orderId();
  const total = PRICES[order.qty];
  const colors = order.color2 ? `${COLORS[order.color]} + ${COLORS[order.color2]}` : COLORS[order.color];
  const date = new Date().toLocaleString("fr-MA", { timeZone: "Africa/Casablanca" });

  const text =
`🛍 OWND طلبية جديدة ${id}
الإسم: ${order.name}
الهاتف: ${order.phone}
المدينة: ${order.city}
العنوان: ${order.address}
الكمية: ${order.qty}
اللون: ${colors}
الطول: ${order.height} سم
المجموع: ${total} درهم (COD)
${date}`;

  const row = { id, date, ...order, colors, total };

  // dima kaytsjjl f Vercel Logs bach ma ttdi7 7tta commande
  console.log("ORDER", JSON.stringify(row));

  const results = await Promise.allSettled([sendWhatsApp(text), sendTelegram(text), sendSheet(row)]);
  const values = results.map(r => (r.status === "fulfilled" ? r.value : false));
  const configured = values.filter(v => v !== null);
  const delivered = values.some(v => v === true);

  if (!configured.length) {
    console.error("ORDER_NOT_FORWARDED: no CALLMEBOT_APIKEY, TELEGRAM_* or SHEET_WEBHOOK_URL env vars set");
    return res.status(500).json({ ok: false, error: "not_configured" });
  }
  if (!delivered) {
    console.error("ORDER_NOT_FORWARDED", JSON.stringify(results));
    return res.status(502).json({ ok: false, error: "forward_failed" });
  }
  return res.status(200).json({ ok: true, id, total });
};
