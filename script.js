// 1. DATA POSTER (Minggu s/d Sabtu)
const posterList = [
  "images/poster7.jpg", // Minggu
  "images/poster1.jpg", // Senin
  "images/poster2.jpg", // Selasa
  "images/poster3.jpg", // Rabu
  "images/poster4.jpg", // Kamis
  "images/poster5.jpg", // Jumat
  "images/poster6.jpg"  // Sabtu
];

// 2. DATA RENUNGAN BILINGUAL
const daftarRenungan = [
  { hari: "Minggu / Sunday", nats: "Mazmur 118:24", isiInd: "Inilah hari yang dijadikan TUHAN, marilah kita bersorak-sorak dan bersukacita karenanya!", isiEng: "This is the day the LORD has made; let us rejoice and be glad in it." },
  { hari: "Senin / Monday", nats: "Mazmur 23:1", isiInd: "TUHAN adalah gembalaku, takkan kekurangan aku.", isiEng: "The LORD is my shepherd, I shall not be in want." },
  { hari: "Selasa / Tuesday", nats: "Filipi 4:6", isiInd: "Janganlah hendaknya kamu kuatir tentang apapun juga.", isiEng: "Do not be anxious about anything." },
  { hari: "Rabu / Wednesday", nats: "Amsal 3:5", isiInd: "Percayalah kepada TUHAN dengan segenap hatimu.", isiEng: "Trust in the LORD with all your heart." },
  { hari: "Kamis / Thursday", nats: "Yesaya 41:10", isiInd: "Janganlah takut, sebab Aku menyertai engkau.", isiEng: "So do not fear, for I am with you." },
  { hari: "Jumat / Friday", nats: "Yohanes 14:6", isiInd: "Akulah jalan dan kebenaran dan hidup.", isiEng: "I am the way and the truth and the life." },
  { hari: "Sabtu / Saturday", nats: "1 Korintus 16:14", isiInd: "Lakukanlah segala pekerjaanmu dalam kasih!", isiEng: "Do everything in love." }
];

// 3. FUNGSI UTAMA UNTUK UPDATE SEMUA KONTEN
function updateOtomatis() {
  const sekarang = new Date();
  const hariIni = sekarang.getDay(); // Mendapatkan angka hari (0-6)

  // A. UPDATE JAM DI HEADER
  const elWaktu = document.getElementById('datetime');
  if (elWaktu) {
    const opsi = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    elWaktu.innerText = sekarang.toLocaleDateString('id-ID', opsi) + " WIB";
  }

  // B. UPDATE POSTER HARIAN
  const elPoster = document.getElementById('poster-harian');
  if (elPoster) {
    elPoster.src = posterList[hariIni];
  }

  // C. UPDATE RENUNGAN BILINGUAL
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

// 4. JALANKAN SAAT HALAMAN SELESAI DIMUAT
document.addEventListener('DOMContentLoaded', () => {
  updateOtomatis();
  // Refresh jam & konten setiap 1 menit agar selalu tepat
  setInterval(updateOtomatis, 60000);
});
