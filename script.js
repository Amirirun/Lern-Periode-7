const chartCanvas = document.getElementById('priceChart');
const cryptoInput = document.getElementById('cryptoInput');
const priceDisplay = document.getElementById('priceDisplay');
const autocompleteList = document.getElementById('autocomplete-list');

let chartInstance;

const coins = [
  'bitcoin', 'ethereum', 'dogecoin', 'litecoin', 'solana',
  'cardano', 'polkadot', 'tron', 'avalanche', 'shiba'
];

cryptoInput.addEventListener('input', () => {
  const value = cryptoInput.value.toLowerCase();
  autocompleteList.innerHTML = '';
  if (!value) return;

  const filtered = coins.filter(coin => coin.includes(value));

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

cryptoInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    loadChart();
    autocompleteList.innerHTML = '';
  }
});

async function loadChart() {
  const symbol = cryptoInput.value.trim().toLowerCase();
  if (!symbol) {
    showError("Bitte gib eine Kryptowährung ein.");
    return;
  }

  try {
    const chartRes = await fetch(
      `https://api.coingecko.com/api/v3/coins/${symbol}/market_chart?vs_currency=usd&days=7`
    );
    if (!chartRes.ok) throw new Error();
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
      options: { responsive: true }
    });

    const coinRes = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd&include_24hr_change=true`
    );
    const coinData = await coinRes.json();
    console.log(coinData);

    if (coinData[symbol]) {
      priceDisplay.textContent =
        `Aktueller Preis: $${coinData[symbol].usd.toFixed(2)} (${coinData[symbol].usd_24h_change.toFixed(2)}% 24h)`;
    } else {
      priceDisplay.textContent = 'Preis nicht verfügbar';
    }

    loadPriceTable();

  } catch (err) {
    showError("Kryptowährung nicht gefunden oder API-Fehler.");
  }
}

function showError(msg) {
  priceDisplay.textContent = msg;
  priceDisplay.style.color = "#ff4444";
  setTimeout(() => (priceDisplay.style.color = "#00ff99"), 2000);
}

async function loadPriceTable() {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10"
  );

  const data = await res.json();

  let html = `
    <table class="price-table">
      <tr>
        <th>Name</th>
        <th>Preis</th>
        <th>24h %</th>
      </tr>
  `;

  data.forEach(c => {
    html += `
      <tr>
        <td>${c.name}</td>
        <td>$${c.current_price.toFixed(2)}</td>
        <td>${c.price_change_percentage_24h.toFixed(2)}%</td>
      </tr>
    `;
  });

  html += "</table>";

  document.body.insertAdjacentHTML("beforeend", html);
}
