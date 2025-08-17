// Sample crypto data
const cryptoData = [
    { name: 'Bitcoin', symbol: 'BTC', balance: 1.234, price: 45000 },
    { name: 'Ethereum', symbol: 'ETH', balance: 5.678, price: 3200 },
    { name: 'Cardano', symbol: 'ADA', balance: 1000, price: 1.23 },
    { name: 'Solana', symbol: 'SOL', balance: 50, price: 150 }
];

const container = document.getElementById('crypto-cards');

cryptoData.forEach(coin => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <h4>${coin.name} (${coin.symbol})</h4>
        <p>Balance: ${coin.balance}</p>
        <p>Price: $${coin.price.toLocaleString()}</p>
        <button class="btn">Send</button>
        <button class="btn">Receive</button>
    `;
    container.appendChild(card);
});
