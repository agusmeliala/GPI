const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const DATA_JADWAL = [
  { hari: "Minggu", nama: "Ibadah Raya", jam: "10.30 WIB", lokasi: "Gereja" },
  { hari: "Selasa", nama: "Ibadah Rumah Tangga", jam: "19.00 WIB", lokasi: "Rumah Jemaat" },
  { hari: "Jumat", nama: "Persekutuan", jam: "19.00 WIB", lokasi: "Gereja" }
];

const DATA_POSTER = {
  "Senin": "images/poster1.jpg", "Selasa": "images/poster2.jpg", "Rabu": "images/poster3.jpg",
  "Kamis": "images/poster4.jpg", "Jumat": "images/poster5.jpg", "Sabtu": "images/poster6.jpg", "Minggu": "images/poster7.jpg",
};

const DATA_RENUNGAN = {
  judulId: "Kekuatan dalam Kelemahan",
  ayatId: "2 Korintus 12:9",
  isiId: "Cukuplah kasih karunia-Ku bagimu; sebab justru dalam kelemahandulah kuasa-Ku menjadi sempurna.",
  judulEn: "Strength in Weakness",
  ayatEn: "2 Corinthians 12:9",
  isiEn: "My grace is sufficient for you, for my power is made perfect in weakness."
};

const DATA_GALLERY = Array.from({ length: 30 }, (_, i) => `images/foto${i + 1}.jpg`);

document.addEventListener("DOMContentLoaded", () => {
  updateDateTime();
  setInterval(updateDateTime, 1000);

  const yearEl = document.getElementById("current-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const todayName = DAY_NAMES[new Date().getDay()];
  renderJadwal(DATA_JADWAL);
  renderPoster(DATA_POSTER, todayName);
  renderRenungan(DATA_RENUNGAN, todayName);
  renderGallery(DATA_GALLERY);
  setupLightboxEvents();
});

function updateDateTime() {
  const el = document.getElementById("datetime");
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleString("id-ID", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  });
}

function renderJadwal(items) {
  const container = document.getElementById("jadwal-list");
  if (container) {
    container.innerHTML = items.map(item => `
      <article class="jadwal-card">
        <h3>${item.nama}</h3>
        <div class="jadwal-meta">
          <div><strong>Hari:</strong> ${item.hari}</div>
          <div><strong>Waktu:</strong> ${item.jam}</div>
          <div><strong>Lokasi:</strong> ${item.lokasi}</div>
        </div>
      </article>
    `).join("");
  }
}

function renderPoster(posterByDay, todayName) {
  const posterImage = document.getElementById("poster-image");
  const posterDay = document.getElementById("poster-day");
  if (posterImage && posterDay) {
    const posterSrc = posterByDay[todayName] || posterByDay["Minggu"];
    posterDay.textContent = `Poster hari ${todayName}`;
    posterImage.src = posterSrc;
    posterImage.onerror = () => { posterImage.src = "https://placehold.co/800x1200?text=Poster+Not+Found"; };
  }
}

function renderRenungan(item, todayName) {
  const renunganDay = document.getElementById("renungan-day");
  if (renunganDay) renunganDay.textContent = `Renungan hari ${todayName}`;
  document.getElementById("judul-id").textContent = item.judulId;
  document.getElementById("ayat-id").textContent = item.ayatId;
  document.getElementById("isi-id").textContent = item.isiId;
  document.getElementById("judul-en").textContent = item.judulEn;
  document.getElementById("ayat-en").textContent = item.ayatEn;
  document.getElementById("isi-en").textContent = item.isiEn;
}

function renderGallery(items) {
  const container = document.getElementById("gallery-track");
  if (container) {
    const doubleItems = [...items, ...items];
    container.innerHTML = doubleItems.map((src, index) => `
      <button class="gallery-item" type="button" onclick="openLightbox('${src}')">
        <img src="${src}" alt="Foto ${index + 1}" loading="lazy" 
             onerror="this.src='https://placehold.co/600x400?text=Foto+${index + 1}'" />
      </button>
    `).join("");
  }
}

function openLightbox(src) {
  const lightbox = document.getElementById("lightbox");
  const image = document.getElementById("lightbox-img");
  if (lightbox && image) {
    image.src = src;
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function openLightboxFromElement(elementId) {
  const el = document.getElementById(elementId);
  if (el && el.src) openLightbox(el.src);
}

function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  if (lightbox) {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
  }
}

function setupLightboxEvents() {
  const lightbox = document.getElementById("lightbox");
  if (lightbox) {
    lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });
}
