/* ═══════════════════════════════════════════
   GPI Jemaat Bersinar — script.js
   Renungan Harian via Google Sheets
   ═══════════════════════════════════════════ */

"use strict";

// ── KONSTANTA DATA ───────────────────────────────────────────────────────────

const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const DATA_JADWAL = [
  { hari: "Minggu",  nama: "Ibadah Raya",          jam: "10.30 WIB", lokasi: "Gereja" },
  { hari: "Selasa",  nama: "Ibadah Rumah Tangga",   jam: "19.00 WIB", lokasi: "Rumah Jemaat" },
  { hari: "Jumat",   nama: "Persekutuan Doa",       jam: "19.00 WIB", lokasi: "Gereja" },
];

const DATA_POSTER = {
  "Senin":   "images/poster1.jpg",
  "Selasa":  "images/poster2.jpg",
  "Rabu":    "images/poster3.jpg",
  "Kamis":   "images/poster4.jpg",
  "Jumat":   "images/poster5.jpg",
  "Sabtu":   "images/poster6.jpg",
  "Minggu":  "images/poster7.jpg",
};

// ── GOOGLE SHEETS CONFIG ─────────────────────────────────────────────────────
// URL CSV langsung dari Google Sheets (sudah dipublish)

const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQFIUh2QfaXXotiABXis5PBDhbQ60SKk0EU2UP8gKuct1Xu42Jg9rMVdG86adkixDjy3OZM3ONvtbFJ/pub?gid=0&single=true&output=csv";

// Fallback renungan (tampil jika gagal load dari Sheets)
const RENUNGAN_FALLBACK = {
  judulId: "Kekuatan dalam Kelemahan",
  ayatId:  "2 Korintus 12:9",
  isiId:   "Cukuplah kasih karunia-Ku bagimu; sebab justru dalam kelemahanlah kuasa-Ku menjadi sempurna.",
  judulEn: "Strength in Weakness",
  ayatEn:  "2 Corinthians 12:9",
  isiEn:   "My grace is sufficient for you, for my power is made perfect in weakness.",
};

// 30 foto dari repo
const DATA_GALLERY = Array.from({ length: 30 }, (_, i) => `images/foto${i + 1}.jpg`);

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
  renderJadwal(DATA_JADWAL, todayName);
  renderPoster(DATA_POSTER, todayName);
  renderGallery(DATA_GALLERY);

  // Render renungan dari Google Sheets
  loadRenunganFromSheets(todayName);

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

// ── POSTER ───────────────────────────────────────────────────────────────────

function renderPoster(posterByDay, todayName) {
  const img   = document.getElementById("poster-image");
  const label = document.getElementById("poster-day");
  if (!img || !label) return;

  label.textContent = `Poster hari ${todayName}`;
  img.src = posterByDay[todayName] ?? posterByDay["Minggu"];
  img.onerror = () => {
    img.src = "https://placehold.co/600x900/1d3a6b/ffffff?text=Poster+Tidak+Tersedia";
  };
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

// ── GALERI ───────────────────────────────────────────────────────────────────

function renderGallery(items) {
  const track = document.getElementById("gallery-track");
  if (!track) return;

  const doubled = [...items, ...items];
  track.innerHTML = doubled
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
