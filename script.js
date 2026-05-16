/* ═══════════════════════════════════════════
   GPI Jemaat Bersinar — script.js
   Renungan Harian via Google Sheets
   ═══════════════════════════════════════════ */

"use strict";

// ── KONSTANTA DATA ───────────────────────────────────────────────────────────

const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

// Fallback jadwal (tampil jika gagal load dari Sheets)
const JADWAL_FALLBACK = [
  { hari: "Minggu",  nama: "Ibadah Raya",        jam: "10.30 WIB", lokasi: "Gereja" },
  { hari: "Selasa",  nama: "Ibadah Rumah Tangga", jam: "19.00 WIB", lokasi: "Rumah Jemaat" },
  { hari: "Jumat",   nama: "Persekutuan Doa",     jam: "19.00 WIB", lokasi: "Gereja" },
];

// Fallback poster jika gagal load dari Sheets
const POSTER_FALLBACK = "https://placehold.co/600x900/1d3a6b/ffffff?text=Poster+Tidak+Tersedia";

// ── GOOGLE SHEETS CONFIG ─────────────────────────────────────────────────────
// Sheet "Renungan" → renungan harian
// Sheet "Jadwal"   → jadwal ibadah (gid akan diisi setelah sheet dibuat)

const SHEET_CSV_URL        = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQFIUh2QfaXXotiABXis5PBDhbQ60SKk0EU2UP8gKuct1Xu42Jg9rMVdG86adkixDjy3OZM3ONvtbFJ/pub?gid=0&single=true&output=csv";
const SHEET_JADWAL_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQFIUh2QfaXXotiABXis5PBDhbQ60SKk0EU2UP8gKuct1Xu42Jg9rMVdG86adkixDjy3OZM3ONvtbFJ/pub?gid=1543437216&single=true&output=csv";
const SHEET_POSTER_CSV_URL  = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQFIUh2QfaXXotiABXis5PBDhbQ60SKk0EU2UP8gKuct1Xu42Jg9rMVdG86adkixDjy3OZM3ONvtbFJ/pub?gid=1813489839&single=true&output=csv";
const SHEET_GALERI_CSV_URL  = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQFIUh2QfaXXotiABXis5PBDhbQ60SKk0EU2UP8gKuct1Xu42Jg9rMVdG86adkixDjy3OZM3ONvtbFJ/pub?gid=492840688&single=true&output=csv";

// Fallback renungan (tampil jika gagal load dari Sheets)
const RENUNGAN_FALLBACK = {
  judulId: "Kekuatan dalam Kelemahan",
  ayatId:  "2 Korintus 12:9",
  isiId:   "Cukuplah kasih karunia-Ku bagimu; sebab justru dalam kelemahanlah kuasa-Ku menjadi sempurna.",
  judulEn: "Strength in Weakness",
  ayatEn:  "2 Corinthians 12:9",
  isiEn:   "My grace is sufficient for you, for my power is made perfect in weakness.",
};


const SHEET_ARTIKEL_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQFIUh2QfaXXotiABXis5PBDhbQ60SKk0EU2UP8gKuct1Xu42Jg9rMVdG86adkixDjy3OZM3ONvtbFJ/pub?gid=533709958&single=true&output=csv";

// Sheet "Video" → 2 video per minggu (bisa diubah kapan saja di Google Sheets)
// Kolom: Judul1 | DriveID1 | Keterangan1 | Judul2 | DriveID2 | Keterangan2
// Cara dapat DriveID: buka file di Google Drive → klik kanan → "Bagikan" → salin link
// Link Drive: https://drive.google.com/file/d/DRIVE_ID_ADA_DISINI/view
// Pastikan video di Drive sudah diset "Siapa saja yang memiliki tautan dapat melihat"
const SHEET_VIDEO_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQFIUh2QfaXXotiABXis5PBDhbQ60SKk0EU2UP8gKuct1Xu42Jg9rMVdG86adkixDjy3OZM3ONvtbFJ/pub?gid=540208821&single=true&output=csv";

// ── INIT ─────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  // Tahun footer
  const yearEl = document.getElementById("current-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Jam live
  updateDateTime();
  setInterval(updateDateTime, 1000);

  // Render konten statis
  const todayName = DAY_NAMES[new Date().getDay()];


  // Render dari Google Sheets
  loadJadwalFromSheets(todayName);
  loadPosterFromSheets(todayName);
  loadRenunganFromSheets(todayName);
  loadGaleriFromSheets();
  loadArtikelFromSheets(todayName);
  loadVideoFromSheets();

  // Lightbox & nav
  setupLightbox();
  setupNavHighlight();
});

// ── DATETIME ─────────────────────────────────────────────────────────────────

function updateDateTime() {
  const el = document.getElementById("datetime");
  if (!el) return;
  el.textContent = new Date().toLocaleString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ── POSTER LOADER ─────────────────────────────────────────────────────────────

async function loadPosterFromSheets(todayName) {
  const img   = document.getElementById("poster-image");
  const label = document.getElementById("poster-day");
  if (!img || !label) return;

  label.textContent = `Poster hari ${todayName}`;

  try {
    const response = await fetch(SHEET_POSTER_CSV_URL);
    if (!response.ok) throw new Error("Gagal mengambil data poster");

    const csvText = await response.text();
    const rows    = parseCSV(csvText);

    // Kolom: A=Hari, B=Link
    const todayRow = rows.find(row => row[0]?.trim() === todayName);

    if (!todayRow || !todayRow[1]?.trim()) throw new Error("Poster hari ini tidak ditemukan");

    img.src = todayRow[1].trim();
    img.onerror = () => { img.src = POSTER_FALLBACK; };

  } catch (err) {
    console.warn("Gagal load poster dari Sheets:", err.message);
    img.src = POSTER_FALLBACK;
  }
}

// ── JADWAL LOADER ─────────────────────────────────────────────────────────────

async function loadJadwalFromSheets(todayName) {
  try {
    const response = await fetch(SHEET_JADWAL_CSV_URL);
    if (!response.ok) throw new Error("Gagal mengambil jadwal");

    const csvText = await response.text();
    const rows    = parseCSV(csvText);

    // Kolom: Nama Ibadah | Hari | Jam | Lokasi
    const items = rows
      .filter(row => row[0]?.trim())
      .map(row => ({
        nama:   row[0]?.trim() || "",
        hari:   row[1]?.trim() || "",
        jam:    row[2]?.trim() || "",
        lokasi: row[3]?.trim() || "",
      }));

    if (items.length === 0) throw new Error("Data jadwal kosong");
    renderJadwal(items, todayName);

  } catch (err) {
    console.warn("Gagal load jadwal dari Sheets, pakai fallback:", err.message);
    renderJadwal(JADWAL_FALLBACK, todayName);
  }
}

// ── GOOGLE SHEETS LOADER ─────────────────────────────────────────────────────

async function loadRenunganFromSheets(todayName) {
  // Tampilkan loading state
  showRenunganLoading();

  try {
    const response = await fetch(SHEET_CSV_URL);
    if (!response.ok) throw new Error("Gagal mengambil data");

    const csvText = await response.text();
    const rows    = parseCSV(csvText);

    // Cari baris sesuai hari ini
    // Kolom: Hari | Judul ID | Ayat ID | Isi ID | Judul EN | Ayat EN | Isi EN
    const todayRow = rows.find(row => row[0]?.trim() === todayName);

    if (!todayRow) {
      console.warn("Renungan untuk hari", todayName, "tidak ditemukan di Sheets.");
      renderRenungan(RENUNGAN_FALLBACK, todayName);
      return;
    }

    const data = {
      judulId: todayRow[1]?.trim() || RENUNGAN_FALLBACK.judulId,
      ayatId:  todayRow[2]?.trim() || RENUNGAN_FALLBACK.ayatId,
      isiId:   todayRow[3]?.trim() || RENUNGAN_FALLBACK.isiId,
      judulEn: todayRow[4]?.trim() || RENUNGAN_FALLBACK.judulEn,
      ayatEn:  todayRow[5]?.trim() || RENUNGAN_FALLBACK.ayatEn,
      isiEn:   todayRow[6]?.trim() || RENUNGAN_FALLBACK.isiEn,
    };

    renderRenungan(data, todayName);

  } catch (err) {
    console.error("Error loading renungan:", err);
    // Tampilkan fallback jika error
    renderRenungan(RENUNGAN_FALLBACK, todayName);
    showRenunganError();
  }
}

// Parser CSV robust — handle quoted fields, escaped quotes (""), newline dalam field
function parseCSV(text) {
  const rows = [];
  let i = 0;

  while (i < text.length) {
    const row = [];

    while (i < text.length) {
      let field = "";

      if (text[i] === '"') {
        i++; // skip opening quote
        while (i < text.length) {
          if (text[i] === '"') {
            if (i + 1 < text.length && text[i + 1] === '"') {
              field += '"';
              i += 2;
            } else {
              i++;
              break;
            }
          } else {
            field += text[i];
            i++;
          }
        }
      } else {
        while (i < text.length && text[i] !== ',' && text[i] !== '\n' && text[i] !== '\r') {
          field += text[i];
          i++;
        }
      }

      row.push(field.trim());

      if (i < text.length && text[i] === ',') {
        i++;
      } else {
        if (i < text.length && text[i] === '\r') i++;
        if (i < text.length && text[i] === '\n') i++;
        break;
      }
    }

    if (row.length > 1 && row.some(f => f !== "")) {
      rows.push(row);
    }
  }

  return rows;
}

function showRenunganLoading() {
  setText("judul-id", "Memuat renungan...");
  setText("ayat-id",  "");
  setText("isi-id",   "");
  setText("judul-en", "Loading devotional...");
  setText("ayat-en",  "");
  setText("isi-en",   "");
}

function showRenunganError() {
  // Tambahkan catatan kecil bahwa ini adalah renungan cadangan
  const cards = document.querySelectorAll(".renungan-card");
  cards.forEach(card => {
    const note = document.createElement("p");
    note.style.cssText = "font-size:10px;color:#b91c1c;margin-top:8px;";
    note.textContent = "⚠ Menampilkan renungan cadangan (periksa koneksi)";
    card.appendChild(note);
  });
}

// ── JADWAL ───────────────────────────────────────────────────────────────────

function renderJadwal(items, todayName) {
  const container = document.getElementById("jadwal-list");
  if (!container) return;

  container.innerHTML = items
    .map((item) => {
      const isToday = item.hari === todayName;
      // Ambil 3 huruf singkatan hari
      const hariSingkat = item.hari ? item.hari.substring(0, 3).toUpperCase() : "";
      return `
      <article class="jadwal-card${isToday ? " jadwal-today" : ""}">
        <div class="jadwal-hari-badge">
          <div>${hariSingkat}</div>
          ${isToday ? '<div style="font-size:7px;margin-top:2px;opacity:.8">Hari Ini</div>' : ""}
        </div>
        <div class="jadwal-body">
          <h3>${item.nama}${isToday ? '<span class="today-badge">Hari Ini</span>' : ""}</h3>
          <div class="jadwal-meta">
            <div class="jadwal-row">
              <span class="jadwal-label">⏰</span>
              <span>${item.jam}</span>
            </div>
            <div class="jadwal-row">
              <span class="jadwal-label">📍</span>
              <span>${item.lokasi}</span>
            </div>
          </div>
        </div>
        <div class="jadwal-right">${item.jam.split(" ")[0]}</div>
      </article>`;
    })
    .join("");
}

// ── RENUNGAN ─────────────────────────────────────────────────────────────────

function renderRenungan(data, todayName) {
  setText("renungan-day", `Renungan hari ${todayName}`);
  setText("judul-id", data.judulId);
  setText("ayat-id",  data.ayatId);
  setText("isi-id",   data.isiId);
  setText("judul-en", data.judulEn);
  setText("ayat-en",  data.ayatEn);
  setText("isi-en",   data.isiEn);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = formatTeks(value);
}

// ── GALERI LOADER ─────────────────────────────────────────────────────────────

async function loadGaleriFromSheets() {
  try {
    const response = await fetch(SHEET_GALERI_CSV_URL);
    if (!response.ok) throw new Error("Gagal mengambil data galeri");

    const csvText = await response.text();
    const lines   = csvText.split(/\r?\n/).filter(l => l.trim());

    // Lewati baris header (baris pertama: "Link")
    const links = lines.slice(1)
      .map(l => l.replace(/^"|"$/g, "").trim())
      .filter(l => l.startsWith("http"));

    if (links.length === 0) throw new Error("Data galeri kosong");
    renderGallery(links);

  } catch (err) {
    console.warn("Gagal load galeri dari Sheets:", err.message);
    // Fallback ke foto dari repo
    const fallback = Array.from({ length: 30 }, (_, i) => `images/foto${i + 1}.jpg`);
    renderGallery(fallback);
  }
}

// ── GALERI ───────────────────────────────────────────────────────────────────

function renderGallery(items) {
  const track = document.getElementById("gallery-track");
  if (!track) return;

  // Gandakan foto minimal 4x agar loop seamless di semua ukuran layar
  const copies = Math.max(4, Math.ceil(60 / items.length));
  const repeated = Array.from({ length: copies }, () => items).flat();

  track.innerHTML = repeated
    .map(
      (src, i) => `
      <button class="gallery-item" type="button"
              onclick="openLightbox('${src}')"
              aria-label="Lihat foto ${(i % items.length) + 1}">
        <img src="${src}"
             alt="Foto kegiatan ${(i % items.length) + 1}"
             loading="lazy"
             onerror="this.src='https://placehold.co/300x300/e7e3db/78716c?text=Foto'" />
      </button>`
    )
    .join("");

  // Hitung ulang animasi: geser sejumlah 1 set foto (1/copies dari total)
  const pct = (1 / copies * 100).toFixed(4);
  // Update keyframe animasi secara dinamis
  let styleEl = document.getElementById("gallery-keyframe");
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "gallery-keyframe";
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = `
    @keyframes scrollGallery {
      0%   { transform: translate3d(0, 0, 0); }
      100% { transform: translate3d(-${pct}%, 0, 0); }
    }
  `;

  // Reset animasi agar langsung berlaku
  track.style.animation = "none";
  track.offsetHeight; // reflow
  track.style.animation = "";
}

// ── FORMAT TEKS (bold, italic, newline) ───────────────────────────────────────

function formatTeks(teks) {
  if (!teks) return "";
  return teks
    .replace(/###([\s\S]+?)###/g, "<strong>$1</strong>")    // ###bold###
    .replace(/\*\*([\s\S]+?)\*\*/g, "<strong>$1</strong>")  // **bold** (fallback)
    .replace(/\*([\s\S]+?)\*/g, "<em>$1</em>")               // *italic*
    .replace(/\n/g, "<br>");                                  // newline → <br>
}

// ── ARTIKEL LOADER ────────────────────────────────────────────────────────────

async function loadArtikelFromSheets(todayName) {
  const container = document.getElementById("artikel-list");
  const label     = document.getElementById("artikel-day");
  if (!container || !label) return;

  label.textContent = `Artikel hari ${todayName}`;

  try {
    const response = await fetch(SHEET_ARTIKEL_CSV_URL);
    if (!response.ok) throw new Error("Gagal mengambil data artikel");

    const csvText = await response.text();
    const rows    = parseCSV(csvText);

    // Lewati baris header jika ada (baris pertama kolom[0] = "Hari")
    const dataRows = rows.filter(row => row[0]?.trim() !== "Hari");

    // Kolom: Hari | Judul Utama | Sub1 Judul | Sub1 Isi | Sub1 Gambar | Sub2 Judul | Sub2 Isi | Sub2 Gambar
    const todayRow = dataRows.find(row => row[0]?.trim() === todayName);

    console.log("[Artikel] Total rows:", dataRows.length, "| Hari dicari:", todayName);
    if (todayRow) console.log("[Artikel] Kolom tersedia:", todayRow.length, todayRow.map((v,i) => i+":"+v.substring(0,30)));

    if (!todayRow) throw new Error("Artikel hari ini tidak ditemukan");

    const artikel = {
      judulUtama: todayRow[1]?.trim() || "",
      sub1Judul:  todayRow[2]?.trim() || "",
      sub1Isi:    todayRow[3]?.trim() || "",
      sub1Gambar: todayRow[4]?.trim() || "",
      sub2Judul:  todayRow[5]?.trim() || "",
      sub2Isi:    todayRow[6]?.trim() || "",
      sub2Gambar: todayRow[7]?.trim() || "",
    };

    console.log("[Artikel] Data:", JSON.stringify({
      judulUtama: artikel.judulUtama.substring(0,40),
      sub1Judul: artikel.sub1Judul.substring(0,40),
      sub2Judul: artikel.sub2Judul.substring(0,40),
    }));

    renderArtikel(container, artikel);

  } catch (err) {
    console.warn("Gagal load artikel:", err.message);
    container.innerHTML = `<p style="color:var(--muted);font-size:13px;text-align:center;padding:20px 0;">Artikel hari ini belum tersedia.</p>`;
  }
}

function renderArtikel(container, a) {
  const makeGambar = (src) => src
    ? `<button class="artikel-img-btn" type="button" onclick="openLightbox('${src}')" aria-label="Lihat gambar penuh">
         <img src="${src}" alt="Ilustrasi artikel" loading="lazy" onerror="this.parentElement.style.display='none'" />
         <div class="artikel-img-overlay"><span>🔍 Lihat Penuh</span></div>
       </button>`
    : "";

  // Judul utama dari kolom B (bisa diisi bebas di Sheets, mis: "Kemah Suci")
  const judulSection = a.judulUtama
    ? `<h3 class="artikel-judul-utama">${a.judulUtama}</h3>`
    : "";

  const makeKartu = (nomor, judul, isi, gambar) => {
    if (!judul && !isi) return "";
    return `
    <article class="artikel-card-vertikal">
      <div class="artikel-nomor">Artikel ${nomor}</div>
      ${gambar ? makeGambar(gambar) : ""}
      <div class="artikel-body">
        ${judul ? `<h4 class="artikel-sub-judul">${judul}</h4>` : ""}
        ${isi   ? `<p  class="artikel-isi">${formatTeks(isi)}</p>` : ""}
      </div>
    </article>`;
  };

  container.innerHTML = judulSection +
    makeKartu(1, a.sub1Judul, a.sub1Isi, a.sub1Gambar) +
    makeKartu(2, a.sub2Judul, a.sub2Isi, a.sub2Gambar);
}

// ── LIGHTBOX ─────────────────────────────────────────────────────────────────

function openLightbox(src) {
  const lb  = document.getElementById("lightbox");
  const img = document.getElementById("lightbox-img");
  if (!lb || !img) return;
  img.src = src;
  lb.classList.add("active");
  document.body.style.overflow = "hidden";
}

function openLightboxFromElement(elementId) {
  const el = document.getElementById(elementId);
  if (el?.src) openLightbox(el.src);
}

function closeLightbox() {
  const lb = document.getElementById("lightbox");
  if (!lb) return;
  lb.classList.remove("active");
  document.body.style.overflow = "";
}

function setupLightbox() {
  document.getElementById("lightbox")?.addEventListener("click", (e) => {
    if (e.target.id === "lightbox") closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
}

// ── VIDEO LOADER ─────────────────────────────────────────────────────────────

/**
 * Konversi berbagai format link Google Drive ke embed URL
 * Format yang didukung:
 *   - https://drive.google.com/file/d/ID/view
 *   - https://drive.google.com/open?id=ID
 *   - ID langsung (tanpa URL)
 */
function driveToEmbedUrl(input) {
  if (!input) return null;
  input = input.trim();

  // Sudah berupa embed URL
  if (input.includes("/file/d/") && input.includes("/preview")) return input;

  // Ekstrak ID dari berbagai format
  let id = null;

  // Format: /file/d/ID/view atau /file/d/ID/edit
  const m1 = input.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m1) id = m1[1];

  // Format: ?id=ID atau &id=ID
  if (!id) {
    const m2 = input.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (m2) id = m2[1];
  }

  // ID murni (hanya alfanumerik + - _)
  if (!id && /^[a-zA-Z0-9_-]{20,}$/.test(input)) id = input;

  return id ? `https://drive.google.com/file/d/${id}/preview?rm=minimal` : null;
}

async function loadVideoFromSheets() {
  const container = document.getElementById("video-list");
  if (!container) return;

  const isFallback = SHEET_VIDEO_CSV_URL.includes("VIDEO_GID_DISINI");
  if (isFallback) {
    renderVideoFallback(container);
    return;
  }

  try {
    const response = await fetch(SHEET_VIDEO_CSV_URL);
    if (!response.ok) throw new Error("Gagal mengambil data video");

    const csvText = await response.text();
    const rows    = parseCSV(csvText);

    // Lewati baris header (baris pertama: Judul | Link | Keterangan)
    const dataRows = rows.filter(row =>
      row[0]?.trim() &&
      row[0]?.trim().toLowerCase() !== "judul"
    );

    if (dataRows.length === 0) throw new Error("Data video kosong");

    // Ambil maksimal 2 video (baris 2 dan 3 di Sheets)
    const videos = dataRows.slice(0, 2).map(row => ({
      judul:     row[0]?.trim() || "",
      driveLink: row[1]?.trim() || "",
      ket:       row[2]?.trim() || "",
    })).filter(v => v.driveLink);

    if (videos.length === 0) throw new Error("Tidak ada link video valid");
    renderVideo(container, videos);

  } catch (err) {
    console.warn("Gagal load video dari Sheets:", err.message);
    renderVideoFallback(container);
  }
}

function renderVideo(container, videos) {
  container.innerHTML = videos.map((v, i) => {
    const embedUrl  = driveToEmbedUrl(v.driveLink);
    // Link tonton langsung di Google Drive (bukan embed) untuk tombol di bawah
    const driveOpen = v.driveLink || "#";

    const iframeHtml = embedUrl
      ? `<div class="video-embed-wrap">
           <iframe src="${embedUrl}"
                   allow="autoplay"
                   allowfullscreen
                   loading="lazy"
                   title="${v.judul || 'Video ' + (i+1)}">
           </iframe>
         </div>`
      : `<div class="video-embed-wrap" style="display:flex;align-items:center;justify-content:center;background:#1c1917;">
           <p style="color:#a8a29e;font-size:12px;padding:20px;">Link video tidak valid.</p>
         </div>`;

    return `
    <article class="video-card">
      <div class="video-nomor">Video ${i + 1}</div>
      ${v.judul ? `<h3 class="video-judul">${v.judul}</h3>` : ""}
      ${iframeHtml}
      <div class="video-footer">
        ${v.ket ? `<p class="video-keterangan">${formatTeks(v.ket)}</p>` : "<span></span>"}
        <a href="${driveOpen}" target="_blank" rel="noopener" class="video-drive-btn"
           aria-label="Tonton di Google Drive">
          &#x26F6; Tonton di Drive
        </a>
      </div>
    </article>`;
  }).join("");
}

function renderVideoFallback(container) {
  container.innerHTML = `
    <div style="background:var(--navy-lt);border:1px dashed #c7d2e8;border-radius:10px;padding:24px 20px;text-align:center;">
      <p style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:10px;">🎬 Cara Menambahkan Video</p>
      <ol style="font-size:12px;color:#44403c;text-align:left;max-width:480px;margin:0 auto;line-height:1.9;">
        <li>Upload video ke <strong>Google Drive</strong></li>
        <li>Klik kanan video → <strong>Bagikan</strong> → "Siapa saja yang memiliki tautan"</li>
        <li>Salin link, lalu tambahkan ke sheet <strong>Video</strong> di Google Sheets Anda</li>
        <li>Format kolom: <code>Judul1 | Link1 | Keterangan1 | Judul2 | Link2 | Keterangan2</code></li>
        <li>Ganti <strong>VIDEO_GID_DISINI</strong> di script.js dengan GID sheet Video</li>
      </ol>
    </div>`;
}

// ── NAV HIGHLIGHT (scroll spy) ────────────────────────────────────────────────

function setupNavHighlight() {
  const sections = ["jadwal", "poster", "renungan", "galeri", "artikel", "video"];
  const links    = document.querySelectorAll(".nav-link");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((l) => l.classList.remove("active"));
          const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
          if (active) active.classList.add("active");
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );

  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}
