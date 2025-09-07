function updateDateTime() {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  document.getElementById('datetime').textContent = now.toLocaleDateString('id-ID', options);
}
setInterval(updateDateTime, 1000);
updateDateTime();
