// ----- Crypto Data -----
const cryptoData = [
  { name: 'Bitcoin',  symbol: 'bitcoin',  balance: 1.234,  trend: [], wallet: '1BTCabc123...' },
  { name: 'Ethereum', symbol: 'ethereum', balance: 5.678,  trend: [], wallet: '0xETHabc456...' },
  { name: 'Cardano',  symbol: 'cardano',  balance: 1000,   trend: [], wallet: 'addr1ADAxyz...' },
  { name: 'Solana',   symbol: 'solana',   balance: 50,     trend: [], wallet: 'SOLabc789...' }
];

const container = document.getElementById('crypto-cards');
const charts = [];
let selectedCoinIndex = null;

// ----- Fetch live prices -----
async function fetchPrices() {
  const symbols = cryptoData.map(coin => coin.symbol).join(',');
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${symbols}&vs_currencies=usd&include_24hr_change=true`;
  const response = await fetch(url);
  return await response.json();
}

// ----- Fetch full coin stats -----
async function fetchCoinDetails(symbol) {
  const url = `https://api.coingecko.com/api/v3/coins/${symbol}`;
  const response = await fetch(url);
  return await response.json();
}

// ----- Build dashboard cards -----
async function initDashboard() {
  const livePrices = await fetchPrices();

  for (let index = 0; index < cryptoData.length; index++) {
    const coin = cryptoData[index];
    coin.price = livePrices[coin.symbol].usd;
    coin.change24h = livePrices[coin.symbol].usd_24h_change;

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h4>${coin.name}</h4>
      <p id="balance-${index}">Balance: ${coin.balance}</p>
      <p id="price-${index}">Price: $${coin.price.toLocaleString()} 
        <span style="color:${coin.change24h >=0 ? 'green':'red'}">
          ${coin.change24h >=0 ? '▲':'▼'} ${coin.change24h.toFixed(2)}%
        </span>
      </p>
      <canvas id="chart-${index}" height="50"></canvas>
      <div id="stats-${index}" class="coin-stats"><p>Loading stats...</p></div>
      <button class="btn" onclick="openSendModal(${index})">Send</button>
      <button class="btn" onclick="openReceiveModal(${index})">Receive</button>
    `;
    container.appendChild(card);

    // Create chart
    const ctx = document.getElementById(`chart-${index}`).getContext('2d');
    const chart = new Chart(ctx, {
      type: 'line',
      data: { labels: coin.trend.map((_,i)=>i+1), datasets: [{ data: [...coin.trend], borderColor: coin.change24h >=0 ? '#00FF7F':'#FF4500', backgroundColor: coin.change24h >=0 ? 'rgba(0,255,127,0.2)':'rgba(255,69,0,0.2)', tension:0.3, fill:true, pointRadius:0 }] },
      options: { plugins:{legend:{display:false}}, scales:{x:{display:false},y:{display:false}} }
    });
    charts.push(chart);

    // Fetch and display coin stats
    fetchCoinDetails(coin.symbol).then(data=>{
      const statsEl = document.getElementById(`stats-${index}`);
      statsEl.innerHTML = `
        <p>Market Cap: $${Number(data.market_data.market_cap.usd).toLocaleString()}</p>
        <p>24h Volume: $${Number(data.market_data.total_volume.usd).toLocaleString()}</p>
        <p>Circulating Supply: ${Number(data.market_data.circulating_supply).toLocaleString()} ${coin.symbol.toUpperCase()}</p>
        <p>All-Time High: $${Number(data.market_data.ath.usd).toLocaleString()}</p>
      `;
    });
  }

  updatePrices();
  setInterval(updatePrices, 5000);
}

// ----- Update prices and portfolio -----
async function updatePrices() {
  const livePrices = await fetchPrices();
  let portfolioValue = 0;

  cryptoData.forEach((coin,index)=>{
    coin.price = livePrices[coin.symbol].usd;
    coin.change24h = livePrices[coin.symbol].usd_24h_change;

    coin.trend.push(coin.price);
    if (coin.trend.length>10) coin.trend.shift();

    const changeColor = coin.change24h>=0?'green':'red';
    const arrow = coin.change24h>=0?'▲':'▼';

    document.getElementById(`price-${index}`).innerHTML =
      `Price: $${Number(coin.price).toLocaleString()} <span style="color:${changeColor}">${arrow} ${coin.change24h.toFixed(2)}%</span>`;

    charts[index].data.labels = coin.trend.map((_,i)=>i+1);
    charts[index].data.datasets[0].data = [...coin.trend];
    charts[index].update();

    portfolioValue += coin.price * coin.balance;
  });

  document.getElementById('portfolio-value').textContent =
    '$'+portfolioValue.toLocaleString(undefined,{maximumFractionDigits:2});
}

// ----- Modal functions -----
function openSendModal(index){
  selectedCoinIndex=index;
  const coin = cryptoData[index];
  const sendModal = document.getElementById('sendModal');
  sendModal.style.display='flex';
  sendModal.querySelector('h3').textContent=`Send ${coin.name}`;
  document.getElementById('sendMessage').textContent='';
  document.getElementById('sendAmount').value='';
  document.getElementById('sendAddress').value='';
}

document.getElementById('sendConfirmBtn').addEventListener('click',()=>{
  if(selectedCoinIndex===null) return;
  const coin=cryptoData[selectedCoinIndex];
  const amount=parseFloat(document.getElementById('sendAmount').value);
  const address=document.getElementById('sendAddress').value;
  const sendMessage=document.getElementById('sendMessage');

  if(!address){ sendMessage.textContent="Please enter a wallet address."; return;}
  if(!amount || amount<=0){ sendMessage.textContent="Enter a valid amount."; return;}
  if(amount>coin.balance){ sendMessage.textContent="Insufficient balance!"; return;}

  coin.balance-=amount;
  coin.balance=parseFloat(coin.balance.toFixed(6));
  document.getElementById(`balance-${selectedCoinIndex}`).textContent=`Balance: ${coin.balance}`;
  sendMessage.textContent=`✅ Sent ${amount} ${coin.name} to ${address}!`;

  setTimeout(()=>{
    closeModal('sendModal');
    selectedCoinIndex=null;
  },2000);
});

function openReceiveModal(index){
  const coin=cryptoData[index];
  const receiveModal=document.getElementById('receiveModal');
  receiveModal.style.display='flex';
  receiveModal.querySelector('h3').textContent=`Receive ${coin.name}`;
  receiveModal.querySelector('.wallet-address').textContent=coin.wallet;

  const qrContainer=document.getElementById('qrCode');
  qrContainer.innerHTML='';
  QRCode.toCanvas(coin.wallet,{width:180,color:{dark:'#ffb100',light:'#1a1a1a'}},(err,canvas)=>{
    if(err) console.error(err);
    qrContainer.appendChild(canvas);
  });
}

function closeModal(id){ document.getElementById(id).style.display='none'; }
function openModal(id){ document.getElementById(id).style.display='flex'; }

// ----- Initialize -----
initDashboard();
