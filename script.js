const chartCanvas = document.getElementById('priceChart');
const cryptoInput = document.getElementById('cryptoInput');
const priceDisplay = document.getElementById('priceDisplay');
const autocompleteList = document.getElementById('autocomplete-list');

let chartInstance;

const coins = [
  'bitcoin', 'ethereum', 'dogecoin', 'litecoin', 'solana', 'cardano', 'polkadot', 'tron', 'avalanche', 'shiba'
];


cryptoInput.addEventListener('input', () => {
  const value = cryptoInput.value.toLowerCase();
  autocompleteList.innerHTML = '';

  if (!value) return;

  const filtered = coins.filter(coin => coin.startsWith(value));
  filtered.forEach(coin => {
    const li = document.createElement('li');
    li.textContent = coin;
    li.onclick = () => {
      cryptoInput.value = coin;
      autocompleteList.innerHTML = '';
    };
    autocompleteList.appendChild(li);
  });
});

async function loadChart() {
  const symbol = cryptoInput.value.trim().toLowerCase();
  if (!symbol) {
    alert('Bitte gib eine Kryptowährung ein (z. B. bitcoin)');
    return;
  }

  try {
 
    const chartRes = await fetch(`https://api.coingecko.com/api/v3/coins/${symbol}/market_chart?vs_currency=usd&days=7`);
    if (!chartRes.ok) throw new Error("API-Fehler beim Chart");
    const chartData = await chartRes.json();

    const prices = chartData.prices.map(p => ({
      time: new Date(p[0]).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }),
      value: p[1]
    }));

    const labels = prices.map(p => p.time);
    const values = prices.map(p => p.value);

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(chartCanvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: `${symbol.toUpperCase()} Kursverlauf (USD)`,
          data: values,
          borderColor: '#00ffff',
          backgroundColor: 'rgba(0,255,255,0.05)',
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointRadius: 2
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            ticks: { color: '#00ffff' },
            grid: { color: 'rgba(0,255,255,0.1)' }
          },
          y: {
            ticks: { color: '#00ffff' },
            grid: { color: 'rgba(0,255,255,0.1)' }
          }
        },
        plugins: {
          legend: {
            labels: { color: '#00ffff' }
          }
        }
      }
    });

   
    const coinRes = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`);
    const coinData = await coinRes.json();

    if (coinData[symbol]) {
      priceDisplay.textContent = ` Aktueller Preis: $${coinData[symbol].usd.toFixed(2)}`;
    } else {
      priceDisplay.textContent = ' Preis nicht verfügbar';
    }

  } catch (err) {
    console.error(err);
    alert("Fehler beim Laden. Stelle sicher, dass die Kryptowährung korrekt geschrieben ist.");
  }
}
