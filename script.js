const API_KEY = '289c13182357680f0e6e508a70dc260d11a29e16f1824c3f959e64b79622a6d0';
const chartCanvas = document.getElementById('priceChart');
let chartInstance;

async function loadChart() {
  const symbol = document.getElementById('cryptoInput').value.trim().toLowerCase();
  if (!symbol) {
    alert('Bitte gib eine Währung ein ein (z.B. bitcoin)');
    return;
  }
}
  