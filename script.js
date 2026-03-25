/**
 * DATA PORTAL
 */
const posterList = ["images/poster7.jpg", "images/poster1.jpg", "images/poster2.jpg", "images/poster3.jpg", "images/poster4.jpg", "images/poster5.jpg", "images/poster6.jpg"];

// Data Jadwal - Pastikan properti keterangan ada atau kosongkan jika tidak dipakai
const daftarJadwal = [
    { nama: "Anak Sekolah Minggu", jam: "08:30", kategori: "Utama", keterangan: "" },
    { nama: "Ibadah Umum", jam: "10:30", kategori: "Utama", keterangan: "" },
    { nama: "Ibadah Rumah Tangga", jam: "19:00", kategori: "Sektoral", keterangan: "Sektor A - Z" }
];

const daftarRenungan = [
    { hari: "Minggu / Sunday", nats: "Mazmur 118:24", isi: "Inilah hari yang dijadikan TUHAN, marilah kita bersorak-sorak!", eng: "This is the day the LORD has made; let us rejoice!" },
    { hari: "Senin / Monday", nats: "Mazmur 23:1", isi: "TUHAN adalah gembalaku, takkan kekurangan aku.", eng: "The LORD is my shepherd, I shall not be in want." },
    { hari: "Selasa / Tuesday", nats: "Filipi 4:6", isi: "Janganlah hendaknya kamu kuatir tentang apapun juga.", eng: "Do not be anxious about anything." },
    { hari: "Rabu / Wednesday", nats: "Amsal 3:5", isi: "Percayalah kepada TUHAN dengan segenap hatimu.", eng: "Trust in the LORD with all your heart." },
    { hari: "Kamis / Thursday", nats: "Yosua 1:9", isi: "Janganlah kecut dan tawar hati, sebab TUHAN menyertaimu.", eng: "Do not be discouraged, for the LORD is with you." },
    { hari: "Jumat / Friday", nats: "Matius 11:28", isi: "Datanglah kepada-Ku, semua yang letih lesu dan berbeban berat.", eng: "Come to me, all you who are weary and burdened." },
    { hari: "Sabtu / Saturday", nats: "1 Korintus 16:14", isi: "Lakukanlah segala pekerjaanmu dalam kasih!", eng: "Do everything in love." }
];

/**
 * RENDER JADWAL (Rapat & Profesional)
 */
function initJadwal() {
    const container = document.getElementById('jadwal-container');
    if (!container) return;

    container.innerHTML = daftarJadwal.map(j => `
        <div class="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
            <div class="flex flex-col text-left">
                <span class="text-[9px] font-bold text-blue-400 uppercase leading-none tracking-wider">${j.kategori}</span>
                <h4 class="text-white font-bold text-sm leading-tight mt-1">${j.nama}</h4>
                ${j.keterangan ? `<p class="text-slate-400 text-[11px] leading-tight mt-0.5">${j.keterangan}</p>` : ''}
            </div>
            <div class="text-right shrink-0 ml-4">
                <span class="text-white font-black text-sm leading-none">${j.jam}</span>
                <span class="block text-[8px] text-slate-500 font-bold mt-0.5">WIB</span>
            </div>
        </div>
    `).join('');
}

/**
 * RENDER RENUNGAN
 */
function initRenungan() {
    const elRenungan = document.getElementById('renungan-container');
    if (!elRenungan) return;
    const dayIndex = new Date().getDay();
    const r = daftarRenungan[dayIndex] || daftarRenungan[0];

    elRenungan.innerHTML = `
        <div class="max-w-xl mx-auto">
            <span class="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase mb-4 border border-blue-500/20">${r.hari}</span>
            <h4 class="text-xl md:text-2xl font-extrabold mb-3 leading-tight text-white">${r.nats}</h4>
            <p class="text-base md:text-lg font-medium text-slate-200 mb-4 italic leading-relaxed">"${r.isi}"</p>
            <div class="w-8 h-0.5 bg-slate-700 mx-auto mb-4"></div>
            <p class="text-sm text-slate-400 italic opacity-80 leading-snug">"${r.eng}"</p>
        </div>
    `;
}

/**
 * POSTER AUTO-SWITCH
 */
function initPoster() {
    const posterImg = document.getElementById('poster-img');
    if (!posterImg) return;
    const hour = new Date().getHours();
    posterImg.src = posterList[hour % posterList.length];
}

/**
 * RUN ALL
 */
document.addEventListener('DOMContentLoaded', () => {
    initJadwal();
    initRenungan();
    initPoster();
});
