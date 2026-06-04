// Vercel Function: /api/share.js
// URL akses: /api/share?type=poster|renungan|artikel
const SHEET_POSTER_CSV   = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQFIUh2QfaXXotiABXis5PBDhbQ60SKk0EU2UP8gKuct1Xu42Jg9rMVdG86adkixDjy3OZM3ONvtbFJ/pub?gid=1813489839&single=true&output=csv";
const SHEET_RENUNGAN_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQFIUh2QfaXXotiABXis5PBDhbQ60SKk0EU2UP8gKuct1Xu42Jg9rMVdG86adkixDjy3OZM3ONvtbFJ/pub?gid=0&single=true&output=csv";
const SHEET_ARTIKEL_CSV  = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQFIUh2QfaXXotiABXis5PBDhbQ60SKk0EU2UP8gKuct1Xu42Jg9rMVdG86adkixDjy3OZM3ONvtbFJ/pub?gid=533709958&single=true&output=csv";

const DAY_NAMES = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];

function parseCSV(text) {
  const rows = [];
  let i = 0;
  while (i < text.length) {
    const row = [];
    while (i < text.length) {
      let field = "";
      if (text[i] === '"') {
        i++;
        while (i < text.length) {
          if (text[i] === '"') {
            if (i+1 < text.length && text[i+1] === '"') { field += '"'; i += 2; }
            else { i++; break; }
          } else { field += text[i]; i++; }
        }
      } else {
        while (i < text.length && text[i] !== ',' && text[i] !== '\n' && text[i] !== '\r') {
          field += text[i]; i++;
        }
      }
      row.push(field.trim());
      if (i < text.length && text[i] === ',') { i++; }
      else { if (i < text.length && text[i] === '\r') i++; if (i < text.length && text[i] === '\n') i++; break; }
    }
    if (row.length > 1 && row.some(f => f !== "")) rows.push(row);
  }
  return rows;
}

async function fetchCSV(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Gagal fetch CSV");
  return await res.text();
}

function generateHTML(title, description, imageUrl, shareUrl, redirectUrl) {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — GPI Jemaat Bersinar</title>
  <meta property="og:title"        content="${title}" />
  <meta property="og:description"  content="${description}" />
  <meta property="og:image"        content="${imageUrl}" />
  <meta property="og:image:width"  content="600" />
  <meta property="og:image:height" content="600" />
  <meta property="og:url"          content="${shareUrl}" />
  <meta property="og:type"         content="website" />
  <meta property="og:site_name"    content="GPI Jemaat Bersinar" />
  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:title"       content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image"       content="${imageUrl}" />
  <meta http-equiv="refresh" content="0;url=${redirectUrl}" />
  <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#1d3a6b;color:white;}p{text-align:center;}a{color:#c9933a;}</style>
</head>
<body><p>Memuat...<br><a href="${redirectUrl}">Klik di sini jika tidak otomatis</a></p></body>
</html>`;
}

export default async function handler(req, res) {
  const type        = (req.query && req.query.type) || "poster";
  const todayName   = DAY_NAMES[new Date().getDay()];

  // Alamat website diambil otomatis dari domain yang sedang diakses,
  // jadi tetap jalan walau nanti ganti domain.
  const host        = req.headers["x-forwarded-host"] || req.headers.host || "gpi-blond.vercel.app";
  const proto       = req.headers["x-forwarded-proto"] || "https";
  const BASE_URL    = `${proto}://${host}`;
  const KOP_URL     = `${BASE_URL}/images/kop-surat.png`;
  const shareUrl    = `${BASE_URL}/api/share?type=${type}`;
  const redirectUrl = `${BASE_URL}/share.html?type=${type}`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");

  try {
    // ── POSTER ──────────────────────────────────────────────────────────────
    if (type === "poster") {
      const csv  = await fetchCSV(SHEET_POSTER_CSV);
      const rows = parseCSV(csv);
      const row  = rows.find(r => r[0]?.trim() === todayName);
      const imgUrl = row?.[1]?.trim() || KOP_URL;
      const html = generateHTML(
        `📋 Poster Harian GPI Bersinar — ${todayName}`,
        `Poster ibadah GPI Jemaat Bersinar Pekan Labuhan, ${todayName}. Klik untuk lihat selengkapnya.`,
        imgUrl, shareUrl, redirectUrl
      );
      return res.status(200).send(html);
    }

    // ── RENUNGAN ────────────────────────────────────────────────────────────
    if (type === "renungan") {
      const csv   = await fetchCSV(SHEET_RENUNGAN_CSV);
      const rows  = parseCSV(csv);
      const row   = rows.find(r => r[0]?.trim() === todayName);
      const judul = row?.[1]?.trim() || "Renungan Harian";
      const ayat  = row?.[2]?.trim() || "";
      const isi   = row?.[3]?.trim() || "";

      const isiPolos = isi.replace(/###|\*\*/g, "").replace(/\*/g, "").trim();
      const ogTitle = ayat ? `📖 ${ayat}` : judul;
      const ogDesc  = isiPolos || judul;

      const html = generateHTML(ogTitle, ogDesc, KOP_URL, shareUrl, redirectUrl);
      return res.status(200).send(html);
    }

    // ── ARTIKEL ─────────────────────────────────────────────────────────────
    if (type === "artikel") {
      const csv      = await fetchCSV(SHEET_ARTIKEL_CSV);
      const rows     = parseCSV(csv);
      const dataRows = rows.filter(r => r[0]?.trim() !== "Hari");
      const row      = dataRows.find(r => r[0]?.trim() === todayName);
      const judul    = row?.[1]?.trim() || "Artikel Minggu Ini";
      const subJudul = row?.[2]?.trim() || "";
      const isiSub1  = row?.[3]?.trim() || "";
      const gambar   = row?.[4]?.trim() || row?.[7]?.trim() || KOP_URL;
      const isiPolos = isiSub1.replace(/###|\*\*/g, "").replace(/\*/g, "").substring(0, 150).trim();
      const html = generateHTML(
        `📰 ${judul}`,
        isiPolos || subJudul || `Artikel GPI Jemaat Bersinar Pekan Labuhan, ${todayName}`,
        gambar, shareUrl, redirectUrl
      );
      return res.status(200).send(html);
    }

    // Jika type tidak dikenal, tampilkan default
    const html = generateHTML(
      "GPI Jemaat Bersinar",
      "Website resmi GPI Jemaat Bersinar – Medan Labuhan",
      KOP_URL, shareUrl, redirectUrl
    );
    return res.status(200).send(html);

  } catch (err) {
    const html = generateHTML(
      "GPI Jemaat Bersinar",
      "Website resmi GPI Jemaat Bersinar – Medan Labuhan",
      KOP_URL, shareUrl, redirectUrl
    );
    return res.status(200).send(html);
  }
}
