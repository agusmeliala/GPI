// Daftar renungan (0 = Minggu, 1 = Senin, dst.)
const renunganMingguan = [
  { ayat: "Mazmur 23:1", keterangan: "Tuhan adalah gembalaku, takkan kekurangan aku." },
  { ayat: "Matius 5:9", keterangan: "Berbahagialah orang yang membawa damai, karena mereka akan disebut anak-anak Allah." },
  { ayat: "Filipi 4:13", keterangan: "Segala perkara dapat kutanggung di dalam Dia yang memberi kekuatan kepadaku." },
  { ayat: "Yeremia 29:11", keterangan: "Sebab Aku ini mengetahui rancangan-rancangan apa yang ada pada-Ku mengenai kamu." },
  { ayat: "Amsal 3:5", keterangan: "Percayalah kepada TUHAN dengan segenap hatimu, dan janganlah bersandar kepada pengertianmu sendiri." },
  { ayat: "Yesaya 41:10", keterangan: "Janganlah takut, sebab Aku menyertai engkau; janganlah bimbang, sebab Aku ini Allahmu." },
  { ayat: "Roma 8:28", keterangan: "Allah turut bekerja dalam segala sesuatu untuk mendatangkan kebaikan bagi mereka yang mengasihi Dia." }
];

// Tampilkan renungan sesuai hari ini
function tampilkanRenungan() {
  const hari = new Date().getDay(); // 0 = Minggu, 1 = Senin, ...
  const renungan = renunganMingguan[hari];
  document.getElementById("renungan-ayat").innerText = renungan.ayat;
  document.getElementById("renungan-keterangan").innerText = renungan.keterangan;
}

// Panggil fungsi saat halaman dimuat
window.onload = tampilkanRenungan;