/**
 * DATA PORTAL
 */
const posterList = ["images/poster7.jpg", "images/poster1.jpg", "images/poster2.jpg", "images/poster3.jpg", "images/poster4.jpg", "images/poster5.jpg", "images/poster6.jpg"];

const daftarJadwal = [
    { nama: "Anak Sekolah Minggu", jam: "08:30", kategori: "Utama" },
    { nama: "Ibadah Umum", jam: "10:30", kategori: "Utama" },
    { nama: "Ibadah Rumah Tangga", jam: "19:00", kategori: "Sektoral" }
];

const daftarRenungan = [
    { hari: "Minggu / Sunday", nats: "Mazmur 118:24", isi: "Inilah hari yang dijadikan TUHAN, marilah kita bersorak-sorak!", eng: "This is the day the LORD has made; let us rejoice!" },
    { hari: "Senin / Monday", nats: "Mazmur 23:1", isi: "TUHAN adalah gembalaku, takkan kekurangan aku.", eng: "The LORD is my shepherd, I shall not be in want." },
    { hari: "Selasa / Tuesday", nats: "Filipi 4:6", isi: "Janganlah hendaknya kamu kuatir tentang apapun juga.", eng: "Do not be anxious about anything." },
    { hari: "Rabu / Wednesday", nats: "Amsal 3:5", isi: "Percayalah kepada TUHAN dengan segenap hatimu.", eng: "Trust in the LORD with all your heart." },
    { hari: "Kamis / Thursday", nats: "Yesaya 41:10", isi: "Janganlah takut, sebab Aku menyertai engkau.", eng: "So do not fear, for I am with you." },
    { hari: "Jumat / Friday", nats: "Yohanes 14:6", isi: "Akulah jalan dan kebenaran dan hidup.", eng: "I am the way and the truth and the life." },
    { hari: "Sabtu / Saturday", nats: "1 Korintus 16:14", isi: "Lakukanlah segala pekerjaanmu dalam kasih!", eng: "Do everything in love." }
];

/**
 * CORE LOGIC
 */
function updatePortal() {
    const now = new Date();
    const dayIndex = now.getDay();

    // Time Render
    const elTime = document.getElementById('datetime');
    if (elTime) {
        const options = { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        elTime.innerText = now.toLocaleDateString('id-ID', options).replace(/\./g, ':');
    }

    // Poster Render
    const elPoster = document.getElementById('poster-harian');
    if (elPoster) elPoster.src = posterList[dayIndex];

    // Jadwal Render (Hanya sekali)
    const elJadwal = document.getElementById('jadwal-container');
    if (elJadwal && elJadwal.children.length === 0) {
        elJadwal.innerHTML = daftarJadwal.map(item => `
            <div class="flex justify-between items-center p-6 hover:bg-slate-50 transition">
                <div>
                    <p class="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">${item.kategori}</p>
                    <h3 class="text-lg font-bold text-slate-800">${item.nama}</h3>
                    <p class="text-xs text-slate-400 italic">${item.desc}</p>
                </div>
                <div class="bg-white border-2 border-slate-100 px-4 py-2 rounded-2xl shadow-sm text-sm font-black italic">
                    ${item.jam} <span class="text-[10px] text-slate-400 ml-1">WIB</span>
                </div>
            </div>
        `).join('');
    }

    // Renungan Render
    const elRenungan = document.getElementById('renungan-container');
    if (elRenungan) {
        const r = daftarRenungan[dayIndex];
        elRenungan.innerHTML = `
            <span class="inline-block px-4 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase mb-6">${r.hari}</span>
            <h4 class="text-2xl md:text-3xl font-extrabold mb-6 leading-tight">${r.nats}</h4>
            <p class="text-lg md:text-xl font-medium text-slate-200 mb-8 italic">"${r.isi}"</p>
            <div class="w-12 h-0.5 bg-slate-600 mx-auto mb-8"></div>
            <p class="text-sm text-slate-400 italic">"${r.eng}"</p>
        `;
    }
}

/**
 * GALERI INFINITE & LIGHTBOX
 */
function initGallery() {
    const track = document.getElementById('gallery-track');
    if (!track) return;

    // Kloning elemen untuk loop tanpa putus
    const items = track.querySelectorAll('.gallery-item');
    items.forEach(item => {
        const clone = item.cloneNode(true);
        track.appendChild(clone);
    });
}

function openLightbox(src) {
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    lbImg.src = src;
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * INITIALIZE
 */
document.addEventListener('DOMContentLoaded', () => {
    updatePortal();
    initGallery();
    setInterval(updatePortal, 1000);
});
