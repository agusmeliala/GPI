const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

document.addEventListener("DOMContentLoaded", async () => {
  updateDateTime();
  setInterval(updateDateTime, 1000);

  const yearEl = document.getElementById("current-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  setupLightboxEvents();

  try {
    const data = await loadContent();
    renderPage(data);
  } catch (error) {
    console.error("Gagal memuat content.json:", error);
    showLoadError();
  }
});

function updateDateTime() {
  const el = document.getElementById("datetime");
  if (!el) return;

  const now = new Date();
  const formatted = now.toLocaleString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  el.textContent = formatted;
}

async function loadContent() {
  const response = await fetch("data/content.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

function renderPage(data) {
  const todayName = DAY_NAMES[new Date().getDay()];

  renderJadwal(data.jadwalIbadah || []);
  renderPoster(data.posterByDay || {}, todayName);
  renderRenungan(data.renunganByDay || {}, todayName);
  renderGallery(data.gallery || []);
}

function renderJadwal(items) {
  const container = document.getElementById("jadwal-list");
  if (!container) return;

  if (!items.length) {
    container.innerHTML = `<p class="loading-text">Jadwal belum tersedia.</p>`;
    return;
  }

  container.innerHTML = items.map(item => `
    <article class="jadwal-card">
      <h3>${escapeHtml(item.nama || "-")}</h3>
      <div class="jadwal-meta">
        <div><strong>Hari:</strong> ${escapeHtml(item.hari || "-")}</div>
        <div><strong>Waktu:</strong> ${escapeHtml(item.jam || "-")}</div>
        <div><strong>Lokasi:</strong> ${escapeHtml(item.lokasi || "-")}</div>
      </div>
    </article>
  `).join("");
}

function renderPoster(posterByDay, todayName) {
  const posterImage = document.getElementById("poster-image");
  const posterDay = document.getElementById("poster-day");
  if (!posterImage || !posterDay) return;

  const posterSrc = posterByDay[todayName] || posterByDay["Minggu"] || "";

  posterDay.textContent = `Poster untuk hari ${todayName}`;
  posterImage.src = posterSrc;
  posterImage.alt = `Poster Harian ${todayName}`;
  posterImage.onerror = function () {
    this.src = "https://placehold.co/800x1200?text=Poster+Tidak+Ditemukan";
  };
}

function renderRenungan(renunganByDay, todayName) {
  const item = renunganByDay[todayName] || renunganByDay["Minggu"];
  if (!item) return;

  const renunganDay = document.getElementById("renungan-day");
  const judulId = document.getElementById("judul-id");
  const ayatId = document.getElementById("ayat-id");
  const isiId = document.getElementById("isi-id");
  const judulEn = document.getElementById("judul-en");
  const ayatEn = document.getElementById("ayat-en");
  const isiEn = document.getElementById("isi-en");

  if (renunganDay) renunganDay.textContent = `Renungan untuk hari ${todayName}`;
  if (judulId) judulId.textContent = item.judulId || "";
  if (ayatId) ayatId.textContent = item.ayatId || "";
  if (isiId) isiId.textContent = item.isiId || "";
  if (judulEn) judulEn.textContent = item.judulEn || "";
  if (ayatEn) ayatEn.textContent = item.ayatEn || "";
  if (isiEn) isiEn.textContent = item.isiEn || "";
}

function renderGallery(items) {
  const container = document.getElementById("gallery-grid");
  if (!container) return;

  if (!items.length) {
    container.innerHTML = `<p class="loading-text">Galeri belum tersedia.</p>`;
    return;
  }

  container.innerHTML = items.map((src, index) => `
    <button class="gallery-item" type="button" onclick="openLightbox('${escapeJsString(src)}')">
      <img
        src="${escapeHtml(src)}"
        alt="Foto ${index + 1}"
        loading="lazy"
        onerror="this.src='https://placehold.co/600x400?text=Foto+${index + 1}'"
      />
    </button>
  `).join("");
}

function openLightbox(src) {
  const lightbox = document.getElementById("lightbox");
  const image = document.getElementById("lightbox-img");

  if (!lightbox || !image) return;

  image.src = src;
  lightbox.classList.add("active");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
}

function openLightboxFromElement(elementId) {
  const el = document.getElementById(elementId);
  if (!el || !el.src) return;
  openLightbox(el.src);
}

function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  const image = document.getElementById("lightbox-img");

  if (!lightbox || !image) return;

  lightbox.classList.remove("active");
  lightbox.setAttribute("aria-hidden", "true");
  image.src = "";
  document.body.classList.remove("lightbox-open");
}

function setupLightboxEvents() {
  const lightbox = document.getElementById("lightbox");
  const image = document.getElementById("lightbox-img");

  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }

  if (image) {
    image.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeLightbox();
    }
  });
}

function showLoadError() {
  const jadwal = document.getElementById("jadwal-list");
  const posterDay = document.getElementById("poster-day");
  const posterImage = document.getElementById("poster-image");
  const renunganDay = document.getElementById("renungan-day");
  const gallery = document.getElementById("gallery-grid");

  if (jadwal) {
    jadwal.innerHTML = `<p class="loading-text">Gagal memuat jadwal.</p>`;
  }

  if (posterDay) {
    posterDay.textContent = "Gagal memuat poster";
  }

  if (posterImage) {
    posterImage.src = "https://placehold.co/800x1200?text=Poster+Tidak+Dapat+Dimuat";
  }

  if (renunganDay) {
    renunganDay.textContent = "Gagal memuat renungan";
  }

  setText("judul-id", "Data renungan tidak tersedia");
  setText("ayat-id", "");
  setText("isi-id", "Periksa file data/content.json Anda.");
  setText("judul-en", "Devotional data is unavailable");
  setText("ayat-en", "");
  setText("isi-en", "Please check your data/content.json file.");

  if (gallery) {
    gallery.innerHTML = `<p class="loading-text">Gagal memuat galeri.</p>`;
  }
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeJsString(text) {
  return String(text)
    .replaceAll("\\", "\\\\")
    .replaceAll("'", "\\'");
}

window.openLightbox = openLightbox;
window.openLightboxFromElement = openLightboxFromElement;
window.closeLightbox = closeLightbox;
