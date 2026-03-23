// DATA POSTER BERDASARKAN HARI
const posterList = [
  "images/poster7.jpg", // Minggu (Index 0)
  "images/poster1.jpg", // Senin (Index 1)
  "images/poster2.jpg", // Selasa (Index 2)
  "images/poster3.jpg", // Rabu
  "images/poster4.jpg", // Kamis
  "images/poster5.jpg", // Jumat
  "images/poster6.jpg"  // Sabtu
];

// DATA JADWAL (Contoh)
const daftarJadwal = [
  { nama: "Ibadah Minggu Raya", jam: "09:00 WIB", kategori: "Utama" },
  { nama: "Ibadah Pemuda", jam: "18:00 WIB", kategori: "Kategorial" }
];

function updateHalaman() {
  const sekarang = new Date();
  
  // 1. Update Waktu di Header
  const elWaktu = document.getElementById('datetime');
  if (elWaktu) {
    const opsi = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    elWaktu.innerText = sekarang.toLocaleDateString('id-ID', opsi) + " WIB";
  }

  // 2. Update Poster Otomatis
  const elPoster = document.getElementById('poster-harian');
  if (elPoster) {
    const hariIni = sekarang.getDay(); // 0 = Minggu, 1 = Senin, dst.
    elPoster.src = posterList[hariIni];
  }

  // 3. Render Jadwal
  const elJadwal = document.getElementById('jadwal');
  if (elJadwal) {
    elJadwal.innerHTML = daftarJadwal.map(j => `
      <li class="flex justify-between items-center p-4 hover:bg-blue-50 transition border-b">
        <div class="flex flex-col">
          <span class="text-xs font-bold text-blue-500 uppercase">${j.kategori}</span>
          <span class="text-lg font-semibold text-gray-700">${j.nama}</span>
        </div>
        <span class="bg-gray-100 px-3 py-1 rounded font-bold text-gray-700">${j.jam}</span>
      </li>
    `).join('');
  }
}

// Jalankan saat web dibuka
document.addEventListener('DOMContentLoaded', updateHalaman);
