// Netlify Function: /functions/share.js
const SHEET_POSTER_CSV   = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQFIUh2QfaXXotiABXis5PBDhbQ60SKk0EU2UP8gKuct1Xu42Jg9rMVdG86adkixDjy3OZM3ONvtbFJ/pub?gid=1813489839&single=true&output=csv";
const SHEET_RENUNGAN_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQFIUh2QfaXXotiABXis5PBDhbQ60SKk0EU2UP8gKuct1Xu42Jg9rMVdG86adkixDjy3OZM3ONvtbFJ/pub?gid=0&single=true&output=csv";
const SHEET_ARTIKEL_CSV  = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQFIUh2QfaXXotiABXis5PBDhbQ60SKk0EU2UP8gKuct1Xu42Jg9rMVdG86adkixDjy3OZM3ONvtbFJ/pub?gid=533709958&single=true&output=csv";

const BASE_URL  = "https://gpibersinar.netlify.app";
const KOP_URL   = `${BASE_URL}/images/kop-surat.png`;
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

exports.handler = async function(event) {
  const type        = event.queryStringParameters?.type || "poster";
  const todayName   = DAY_NAMES[new Date().getDay()];
  const shareUrl    = `${BASE_URL}/.netlify/functions/share?type=${type}`;
  const redirectUrl = `${BASE_URL}/share.html?type=${type}`;

  try {
    // ── POSTER ────────────────────────────────────────────────────────────────
    if (type === "poster") {
      const csv  = await fetchCSV(SHEET_POSTER_CSV);
      const rows = parseCSV(csv);
      const row  = rows.find(r => r[0]?.trim() === todayName);
      const imgUrl = row?.[1]?.trim() || KOP_URL;
      const html = generateHTML(
        `Poster Harian — ${todayName}`,
        `Poster harian GPI Jemaat Bersinar, ${todayName}`,
        imgUrl, shareUrl, redirectUrl
      );
      return { statusCode: 200, headers: { "Content-Type": "text/html" }, body: html };
    }

    // ── RENUNGAN ──────────────────────────────────────────────────────────────
    if (type === "renungan") {
      const csv   = await fetchCSV(SHEET_RENUNGAN_CSV);
      const rows  = parseCSV(csv);
      const row   = rows.find(r => r[0]?.trim() === todayName);
      const judul = row?.[1]?.trim() || "Renungan Harian";
      const ayat  = row?.[2]?.trim() || "";
      const isi   = row?.[3]?.trim() || "";

      // ✅ OG Title = referensi ayat (mis: "Yohanes 8:32")
      // ✅ OG Description = teks ISI ayat lengkap (WA tampilkan di baris deskripsi)
      const isiPolos = isi.replace(/###|\*\*/g, "").replace(/\*/g, "").trim();
      const ogTitle = ayat ? `📖 ${ayat}` : judul;
      const ogDesc  = isiPolos || judul;

      const html = generateHTML(ogTitle, ogDesc, KOP_URL, shareUrl, redirectUrl);
      return { statusCode: 200, headers: { "Content-Type": "text/html" }, body: html };
    }

    // ── ARTIKEL ───────────────────────────────────────────────────────────────
    if (type === "artikel") {
      const csv      = await fetchCSV(SHEET_ARTIKEL_CSV);
      const rows     = parseCSV(csv);
      const dataRows = rows.filter(r => r[0]?.trim() !== "Hari");
      const row      = dataRows.find(r => r[0]?.trim() === todayName);
      const judul    = row?.[1]?.trim() || "Artikel Minggu Ini";
      const subJudul = row?.[2]?.trim() || "";
      const gambar   = row?.[4]?.trim() || row?.[7]?.trim() || KOP_URL;
      const html = generateHTML(
        `Artikel — ${judul}`,
        subJudul || `Artikel GPI Jemaat Bersinar, ${todayName}`,
        gambar, shareUrl, redirectUrl
      );
      return { statusCode: 200, headers: { "Content-Type": "text/html" }, body: html };
    }

  } catch(err) {
    const html = generateHTML(
      "GPI Jemaat Bersinar",
      "Website resmi GPI Jemaat Bersinar – Medan Labuhan",
      KOP_URL, shareUrl, redirectUrl
    );
    return { statusCode: 200, headers: { "Content-Type": "text/html" }, body: html };
  }
};
