const posterList = ["images/poster7.jpg", "images/poster1.jpg"];
const daftarJadwal = [
    { nama: "Anak Sekolah Minggu", jam: "08:30", kategori: "Utama", keterangan: "" },
    { nama: "Ibadah Umum", jam: "10:30", kategori: "Utama", keterangan: "" },
    { nama: "Ibadah Rumah Tangga", jam: "19:00", kategori: "Sektoral", keterangan: "Sektor A - Z" }
];
const daftarRenungan = [
    { hari: "Rabu / Wednesday", nats: "Amsal 3:5", isi: "Percayalah kepada TUHAN dengan segenap hatimu.", eng: "Trust in the LORD with all your heart." }
];

function initJadwal() {
    const container = document.getElementById('jadwal-container');
    if (!container) return;
    container.innerHTML = daftarJadwal.map(j => `
        <div class="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
            <div class="flex flex-col text-left">
                <span class="text-[9px] font-bold text-blue-400 uppercase leading-none">${j.kategori || ''}</span>
                <h4 class="text-white font-bold text-sm mt-1">${j.nama}</h4>
                ${j.keterangan ? `<p class="text-slate-400 text-[11px] mt-0.5">${j.keterangan}</p>` : ''}
            </div>
            <div class="text-right shrink-0 ml-4">
                <span class="text-white font-black text-sm leading-none">${j.jam}</span>
                <span class="block text-[8px] text-slate-500 font-bold mt-0.5 uppercase">WIB</span>
            </div>
        </div>
    `).join('');
}

function initRenungan() {
    const el = document.getElementById('renungan-container');
    if (!el) return;
    const r = daftarRenungan[0];
    el.innerHTML = `
        <span class="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase mb-4">${r.hari}</span>
        <h4 class="text-2xl font-extrabold mb-3 text-white">${r.nats}</h4>
        <p class="text-lg text-slate-200 mb-4 italic">"${r.isi}"</p>
        <p class="text-sm text-slate-400 italic">"${r.eng}"</p>`;
}

function openLightbox(src) {
    document.getElementById('lightbox-img').src = src;
    document.getElementById('lightbox').classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
    initJadwal();
    initRenungan();
});
