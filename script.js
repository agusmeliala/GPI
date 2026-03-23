// 1. DATA
const posterList = ["images/poster7.jpg", "images/poster1.jpg", "images/poster2.jpg", "images/poster3.jpg", "images/poster4.jpg", "images/poster5.jpg", "images/poster6.jpg"];
const daftarJadwal = [
    { nama: "Anak Sekolah Minggu", jam: "08:30 WIB", kategori: "Utama" },
    { nama: "Ibadah Umum", jam: "10:30 WIB", kategori: "Utama" },
    { nama: "Ibadah Rumah tangga", jam: "19:00 WIB", kategori: "Bergilir" }
];
const daftarRenungan = [
    { hari: "Minggu / Sunday", nats: "Mazmur 118:24", isiInd: "Inilah hari yang dijadikan TUHAN, marilah kita bersorak-sorak dan bersukacita karenanya!", isiEng: "This is the day the LORD has made; let us rejoice and be glad in it." },
    { hari: "Senin / Monday", nats: "Mazmur 23:1", isiInd: "TUHAN adalah gembalaku, takkan kekurangan aku.", isiEng: "The LORD is my shepherd, I shall not be in want." },
    { hari: "Selasa / Tuesday", nats: "Filipi 4:6", isiInd: "Janganlah hendaknya kamu kuatir tentang apapun juga.", isiEng: "Do not be anxious about anything." },
    { hari: "Rabu / Wednesday", nats: "Amsal 3:5", isiInd: "Percayalah kepada TUHAN dengan segenap hatimu.", isiEng: "Trust in the LORD with all your heart." },
    { hari: "Kamis / Thursday", nats: "Yesaya 41:10", isiInd: "Janganlah takut, sebab Aku menyertai engkau.", isiEng: "So do not fear, for I am with you." },
    { hari: "Jumat / Friday", nats: "Yohanes 14:6", isiInd: "Akulah jalan dan kebenaran dan hidup.", isiEng: "I am the way and the truth and the life." },
    { hari: "Sabtu / Saturday", nats: "1 Korintus 16:14", isiInd: "Lakukanlah segala pekerjaanmu dalam kasih!", isiEng: "Do everything in love." }
];

// 2. FUNGSI UPDATE
function updateOtomatis() {
    const sekarang = new Date();
    const hariIni = sekarang.getDay();

    // Jam di Header
    const elWaktu = document.getElementById('datetime');
    if (elWaktu) {
        const opsi = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        elWaktu.innerText = sekarang.toLocaleDateString('id-ID', opsi) + " WIB";
    }

    // Poster
    const elPoster = document.getElementById('poster-harian');
    if (elPoster) elPoster.src = posterList[hariIni];

    // Jadwal
    const elJadwal = document.getElementById('jadwal');
    if (elJadwal) {
        elJadwal.innerHTML = daftarJadwal.map(item => `
            <li class="flex justify-between items-center p-5 hover:bg-blue-50 transition border-b border-gray-50">
                <div class="flex flex-col text-left">
                    <span class="text-[10px] font-bold text-blue-500 uppercase tracking-widest">${item.kategori}</span>
                    <span class="text-lg font-semibold text-gray-700">${item.nama}</span>
                </div>
                <div class="bg-gray-100 text-gray-700 font-bold px-4 py-2 rounded-lg border text-sm">${item.jam}</div>
            </li>
        `).join('');
    }

    // Renungan
    const elRenungan = document.getElementById('konten-renungan');
    if (elRenungan) {
        const r = daftarRenungan[hariIni];
        elRenungan.innerHTML = `
            <div class="mb-2"><span class="text-blue-600 font-bold uppercase tracking-wider text-xs">${r.hari}</span></div>
            <h4 class="text-2xl font-extrabold text-gray-800 mb-4">${r.nats}</h4>
            <p class="text-lg text-gray-700 leading-relaxed mb-4">"${r.isiInd}"</p>
            <div class="w-12 h-px bg-gray-200 mx-auto mb-4"></div>
            <p class="text-md text-gray-500 leading-relaxed italic">"${r.isiEng}"</p>
        `;
    }
}

// JALANKAN SAAT HALAMAN SELESAI DIMUAT
document.addEventListener('DOMContentLoaded', () => {
    // Jalankan pertama kali saat halaman dibuka
    updateOtomatis();
    
    // Ubah interval menjadi 1000ms (1 detik) agar jam selalu akurat setiap detik
    // Ini memastikan menit berpindah tepat waktu dan tidak telat
    setInterval(updateOtomatis, 1000); 
});
