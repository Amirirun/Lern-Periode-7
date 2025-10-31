const API_KEY = '289c13182357680f0e6e508a70dc260d11a29e16f1824c3f959e64b79622a6d0';
const chartCanvas = document.getElementById('priceChart');
let chartInstance;

async function loadChart() {
  const symbol = document.getElementById('cryptoInput').value.trim().toLowerCase();
  if (!symbol) {
    alert('Bitte gib eine Währung ein (z.B. bitcoin)');
    return;
  }

  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${symbol}/market_chart?vs_currency=usd&days=7`);
    
    if (!response.ok) {
      throw new Error("Kryptowährung nicht gefunden oder API-Fehler");
    }

    const data = await response.json();

    
    const prices = data.prices.map(p => ({
      time: new Date(p[0]).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }),
      value: p[1]
    }));

    console.log("Erkannte Kryptowährung:", symbol);
    console.log("Preisdaten:", prices);

    
    const labels = prices.map(p => p.time);
    const values = prices.map(p => p.value);

    
    if (chartInstance) {
      chartInstance.destroy();
    }

    
    chartInstance = new Chart(chartCanvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: `${symbol.toUpperCase()} Kursverlauf (USD)`,
          data: values,
          borderColor: '#00ffff',
          borderWidth: 2,
          fill: false,
          tension: 0.2,
          pointRadius: 0
      