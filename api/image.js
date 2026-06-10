// Vercel Function: /api/image.js
// URL akses: /api/image?type=poster   (atau type=artikel)
//
// Tujuan: WhatsApp TIDAK BISA mengambil gambar langsung dari Google Drive / lh3.
// Maka file ini bertugas sebagai "perantara": ia mengambil gambar dari Drive
// di belakang layar, lalu menyajikannya kembali dari domain gpibersinar.vercel.app
// — domain yang sudah dipercaya WhatsApp. Dengan begitu robot WhatsApp cukup
// mengambil gambar dari alamat website kita sendiri, bukan dari Google.

const SHEET_POSTER_CSV  = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQFIUh2QfaXXotiABXis5PBDhbQ60SKk0EU2UP8gKuct1Xu42Jg9rMVdG86adkixDjy3OZM3ONvtbFJ/pub?gid=1813489839&single=true&output=csv";
const SHEET_ARTIKEL_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQFIUh2QfaXXotiABXis5PBDhbQ60SKk0EU2UP8gKuct1Xu42Jg9rMVdG86adkixDjy3OZM3ONvtbFJ/pub?gid=533709958&single=true&output=csv";

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

// Mengambil ID file dari berbagai bentuk link Google Drive.
function getDriveFileId(url) {
  if (!url) return null;
  const m = url.match(/drive\.google\.com\/(?:file\/d\/([\w-]+)|(?:open|uc|thumbnail)\?(?:[^#]*&)?id=([\w-]+))/);
  return m ? (m[1] || m[2]) : null;
}

export default async function handler(req, res) {
  const type      = (req.query && req.query.type) || "poster";
  const todayName = DAY_NAMES[new Date().getDay()];

  try {
    // 1) Ambil link gambar dari Google Sheets sesuai jenis konten & hari ini.
    const csvUrl = (type === "artikel") ? SHEET_ARTIKEL_CSV : SHEET_POSTER_CSV;
    const csvRes = await fetch(csvUrl);
    const csv    = await csvRes.text();
    const rows   = parseCSV(csv);

    let driveUrl = "";
    if (type === "artikel") {
      const dataRows = rows.filter(r => r[0]?.trim() !== "Hari");
      const row = dataRows.find(r => r[0]?.trim() === todayName);
      driveUrl = row?.[4]?.trim() || "";   // kolom gambar artikel
    } else {
      const row = rows.find(r => r[0]?.trim() === todayName);
      driveUrl = row?.[1]?.trim() || "";   // kolom gambar poster
    }

    const fileId = getDriveFileId(driveUrl);

    // 2) Kalau tidak ada gambar di Drive, alihkan ke kop surat (yang sudah pasti tampil).
    if (!fileId) {
      const host  = req.headers["x-forwarded-host"] || req.headers.host;
      const proto = req.headers["x-forwarded-proto"] || "https";
      res.setHeader("Location", `${proto}://${host}/images/kop-surat.png`);
      return res.status(302).end();
    }

    // 3) Ambil gambar aslinya dari Google (di belakang layar, server boleh).
    const imgUrl = `https://lh3.googleusercontent.com/d/${fileId}=w1000`;
    const imgRes = await fetch(imgUrl);

    if (!imgRes.ok) {
      const host  = req.headers["x-forwarded-host"] || req.headers.host;
      const proto = req.headers["x-forwarded-proto"] || "https";
      res.setHeader("Location", `${proto}://${host}/images/kop-surat.png`);
      return res.status(302).end();
    }

    const contentType = imgRes.headers.get("content-type") || "image/jpeg";
    const buffer = Buffer.from(await imgRes.arrayBuffer());

    // 4) Sajikan gambar dari domain kita sendiri, lengkap dengan tipe & cache.
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
    return res.status(200).send(buffer);

  } catch (err) {
    // Bila ada gangguan, alihkan ke kop surat agar tetap ada gambar.
    const host  = req.headers["x-forwarded-host"] || req.headers.host;
    const proto = req.headers["x-forwarded-proto"] || "https";
    res.setHeader("Location", `${proto}://${host}/images/kop-surat.png`);
    return res.status(302).end();
  }
}
