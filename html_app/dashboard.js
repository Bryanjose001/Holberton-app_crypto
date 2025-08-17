// Sample crypto data with dummy trend data
const cryptoData = [
    { name: 'Bitcoin', symbol: 'BTC', balance: 1.234, price: 45000, trend: [44000, 44500, 44800, 45000] },
    { name: 'Ethereum', symbol: 'ETH', balance: 5.678, price: 3200, trend: [3100, 3150, 3180, 3200] },
    { name: 'Cardano', symbol: 'ADA', balance: 1000, price: 1.23, trend: [1.15, 1.18, 1.22, 1.23] },
    { name: 'Solana', symbol: 'SOL', balance: 50, price: 150, trend: [140, 145, 148, 150] }
];

const container = document.getElementById('crypto-cards');

cryptoData.forEach((coin, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <h4>${coin.name} (${coin.symbol})</h4>
        <p>Balance: ${coin.balance}</p>
        <p>Price: $${coin.price.toLocaleString()}</p>
        <canvas id="chart-${index}" height="50"></canvas>
        <button class="btn">Send</button>
        <button class="btn">Receive</button>
    `;
    container.appendChild(card);

    // Create Chart.js line chart
    const ctx = document.getElementById(`chart-${index}`).getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: coin.trend.map((_, i) => i+1),
            datasets: [{
                data: coin.trend,
                borderColor: '#ffb100',
                backgroundColor: 'rgba(255, 177, 0, 0.2)',
                tension: 0.3,
                fill: true,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: { display: false }
            },
            elements: { line: { borderWidth: 2 } }
        }
    });
});
