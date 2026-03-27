// 1. Data Jadwal (Kamu bisa tambah atau ubah di sini)
const daftarJadwal = [
  { nama: "Ibadah Subuh", jam: "06:00 WIB", kategori: "Rutin" },
  { nama: "Ibadah Minggu Raya 1", jam: "09:00 WIB", kategori: "Utama" },
  { nama: "Ibadah Minggu Raya 2", jam: "17:00 WIB", kategori: "Utama" },
  { nama: "Ibadah Pemuda (Sabtu)", jam: "19:00 WIB", kategori: "Kategorial" }
];

// 2. Fungsi untuk menampilkan waktu di Header
function tampilkanWaktu() {
  const jamElement = document.getElementById('datetime');
  if (!jamElement) return;

  const sekarang = new Date();
  const opsi = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  jamElement.innerText = sekarang.toLocaleDateString('id-ID', opsi) + " WIB";
}

// 3. Fungsi untuk merender list Jadwal ke HTML
function renderJadwal() {
  const container = document.getElementById('jadwal');
  if (!container) return;

  // Bersihkan loading text
  container.innerHTML = "";

  daftarJadwal.forEach((item) => {
    const li = document.createElement('li');
    li.className = "flex justify-between items-center p-5 hover:bg-blue-50/30 transition-all duration-200 group";
    
    li.innerHTML = `
      <div class="flex flex-col">
        <span class="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">${item.kategori}</span>
        <span class="text-lg font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">${item.nama}</span>
      </div>
      <div class="text-right">
        <span class="inline-block bg-gray-100 text-gray-700 font-mono font-bold px-4 py-2 rounded-lg border border-gray-200 shadow-sm group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
          ${item.jam}
        </span>
      </div>
    `;
    
    container.appendChild(li);
  });
}

// 4. Jalankan semua fungsi saat halaman siap
document.addEventListener('DOMContentLoaded', () => {
  tampilkanWaktu();
  renderJadwal();
  
  // Update jam setiap menit
  setInterval(tampilkanWaktu, 60000);
});
