const hariSekarang = new Date().getDay();

document.querySelectorAll(".hari").forEach(function(el) {
  if (el.getAttribute("data-hari") == hariSekarang) {
    el.style.display = "block";
  } else {
    el.style.display = "none";
  }
});
