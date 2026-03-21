const hariSekarang = new Date().getDay();

document.querySelectorAll(".hari").forEach(function(el) {
  if (el.getAttribute("data-hari") == hariSekarang) {
    el.style.display = "block";
  } else {
    el.style.display = "none";
  }
});
// =====================
// JADWAL
// =====================
fetch("data/jadwal.json")
  .then(res => res.json())
  .then(data => {
    const ul = document.getElementById("jadwal");
    if (!ul) return;

    ul.innerHTML = "";

    data.forEach(j => {
      const li = document.createElement("li");
      li.innerText = j;
      ul.appendChild(li);
    });
  })
  .catch(err => console.log("ERROR JADWAL:", err));
