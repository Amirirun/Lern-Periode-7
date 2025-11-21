const chartCanvas = document.getElementById('priceChart');
const cryptoInput = document.getElementById('cryptoInput');
const priceDisplay = document.getElementById('priceDisplay');
const autocompleteList = document.getElementById('autocomplete-list');
const tableSection = document.getElementById('table-section');

let chartInstance;
let selectedRange = 7;

const coins = [
  'bitcoin', 'ethereum', 'dogecoin', 'litecoin', 'solana',
  'cardano', 'polkadot', 'tron', 'avalanche', 'shiba'
];

function setRange(days) {
  selectedRange = days;
  loadChart();
}

function similarity(a, b) {
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  const longerLength = longer.length;
  if (longerLength === 0) return 1;
  let same = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (longer[i] === shorter[i]) same++;
  }
  return same / longerLength;
}

cryptoInput.addEventListener('input', () => {
  const value = cryptoInput.value.toLowerCase();
  autocompleteList.innerHTML = '';
  if (!value) return;

  let filtered = coins.filter(c => c.includes(value));

  if (filtered.length === 0) {
    filtered = coins
      .map(c => ({ name: c, score: similarity(value, c) }))
      .filter(s => s.score > 0.4)
      .sort((a, b) => b.score - a.score)
      .map(s => s.name);
  }

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
      `https://api.coingecko.com/api/v3/coins/${symbol}/market_chart?vs_currency=usd&days=${selectedRange}`
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
  const existingTable = document.querySelector(".price-table");
  if (existingTable) existingTable.remove();

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

  tableSection.insertAdjacentHTML("beforeend", html);
}
