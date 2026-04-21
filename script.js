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

// Parser CSV sederhana (handle tanda kutip & koma dalam teks)
function parseCSV(text) {
  const rows = [];
  const lines = text.split(/\r?\n/).filter(l => l.trim());

  // Tidak ada header — baca langsung dari baris pertama
  for (let i = 0; i < lines.length; i++) {
    const row = [];
    let current = "";
    let inQuotes = false;

    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    row.push(current);
    if (row.length > 1) rows.push(row);
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
      return `
      <article class="jadwal-card${isToday ? " jadwal-today" : ""}">
        ${isToday ? '<span class="today-badge">Hari Ini</span>' : ""}
        <h3>${item.nama}</h3>
        <div class="jadwal-meta">
          <div class="jadwal-row">
            <span class="jadwal-label">Hari</span>
            <span>${item.hari}</span>
          </div>
          <div class="jadwal-row">
            <span class="jadwal-label">Waktu</span>
            <span>${item.jam}</span>
          </div>
          <div class="jadwal-row">
            <span class="jadwal-label">Lokasi</span>
            <span>${item.lokasi}</span>
          </div>
        </div>
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
  if (el) el.textContent = value;
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

// ── NAV HIGHLIGHT (scroll spy) ────────────────────────────────────────────────

function setupNavHighlight() {
  const sections = ["jadwal", "poster", "renungan", "galeri"];
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
