document.addEventListener("DOMContentLoaded", () => {
  updateDateTime();
  setInterval(updateDateTime, 1000);

  loadContent();
  setupGalleryLoop();
  setupLightboxEvents();
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
  try {
    const response = await fetch("data/content.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Gagal memuat JSON: ${response.status}`);
    }

    const data = await response.json();

    renderPoster(data.posterHarian);
    renderJadwal(data.jadwalIbadah || []);
  } catch (error) {
    console.error("Error loadContent():", error);
    renderPoster("https://placehold.co/800x1200?text=Poster+Harian");
    renderJadwal([]);
  }
}

function renderPoster(src) {
  const poster = document.getElementById("poster-harian");
  if (!poster) return;

  poster.src = src || "https://placehold.co/800x1200?text=Poster+Harian";
  poster.onerror = function () {
    this.src = "https://placehold.co/800x1200?text=Poster+Harian";
  };
}

function renderJadwal(items) {
  const container = document.getElementById("jadwal-container");
  if (!container) return;

  if (!items.length) {
    container.innerHTML = `
      <div class="p-6 text-sm text-slate-500">
        Jadwal ibadah belum tersedia.
      </div>
    `;
    return;
  }

  container.innerHTML = items.map((item) => `
    <div class="p-5 sm:p-6 flex items-start justify-between gap-4">
      <div class="min-w-0">
        <h3 class="text-lg font-extrabold text-slate-800 leading-tight">
          ${escapeHtml(item.nama || "-")}
        </h3>
        <p class="text-sm text-slate-500 mt-1">
          ${escapeHtml(item.hari || "-")}
          ${item.tanggal ? " • " + escapeHtml(item.tanggal) : ""}
        </p>
        <p class="text-sm text-slate-500">
          ${escapeHtml(item.lokasi || "")}
        </p>
      </div>
      <div class="shrink-0 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap">
        ${escapeHtml(item.jam || "-")}
      </div>
    </div>
  `).join("");
}

function openLightbox(src) {
  const lightbox = document.getElementById("lightbox");
  const image = document.getElementById("lightbox-img");

  if (!lightbox || !image) return;

  image.src = src;
  lightbox.classList.add("active");
  document.body.classList.add("lightbox-open");
}

function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  const image = document.getElementById("lightbox-img");

  if (!lightbox || !image) return;

  lightbox.classList.remove("active");
  image.src = "";
  document.body.classList.remove("lightbox-open");
}

function setupLightboxEvents() {
  const lightbox = document.getElementById("lightbox");
  const image = document.getElementById("lightbox-img");

  if (lightbox) {
    lightbox.addEventListener("click", closeLightbox);
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

function setupGalleryLoop() {
  const track = document.getElementById("gallery-track");
  if (!track) return;
  if (track.dataset.cloned === "true") return;

  track.innerHTML += track.innerHTML;
  track.dataset.cloned = "true";
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
