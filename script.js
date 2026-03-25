/**
 * DATA JADWAL & RENUNGAN
 */
const posterList = ["images/poster7.jpg", "images/poster1.jpg", "images/poster2.jpg", "images/poster3.jpg", "images/poster4.jpg", "images/poster5.jpg", "images/poster6.jpg"];

const daftarJadwal = [
    { nama: "Anak Sekolah Minggu", jam: "08:30", kategori: "Utama", keterangan: "" },
    { nama: "Ibadah Umum", jam: "10:30", kategori: "Utama", keterangan: "" },
    { nama: "Ibadah Rumah Tangga", jam: "19:00", kategori: "Sektoral", keterangan: "Sektor A - Z" }
];

// Fungsi Render Jadwal (Rapat & No Undefined)
function initJadwal() {
    const container = document.getElementById('jadwal-container');
    if (!container) return;

    container.innerHTML = daftarJadwal.map(j => `
        <div class="flex justify-between items-center py-2 border-b border-white/10 last:border-0">
            <div class="flex flex-col">
                <span class="text-[9px] font-bold text-blue-400 uppercase tracking-tighter leading-none">${j.kategori}</span>
                <h4 class="text-white font-bold text-sm leading-tight mt-0.5">${j.nama}</h4>
                ${j.keterangan ? `<p class="text-slate-400 text-[11px] leading-none mt-0.5">${j.keterangan}</p>` : ''}
            </div>
            <div class="text-right flex flex-col items-end">
                <span class="text-white font-black text-sm leading-none">${j.jam}</span>
                <span class="text-[8px] text-slate-500 font-bold mt-1">WIB</span>
            </div>
        </div>
    `).join('');
}

// Inisialisasi saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
    initJadwal();
    // Panggil fungsi lainnya (initRenungan, initGallery, dll) di sini
});
