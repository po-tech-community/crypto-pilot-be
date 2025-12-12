import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { WebSocket } from 'ws';

let prices = {
  BTC: '0',
  ETH: '0',
  XRP: '0',
  SOL: '0'
};

export function setupPriceSocket(server: HTTPServer) {
  const io = new SocketIOServer(server, {
    cors: { origin: "http://localhost:5173" }
  });

  console.log('WebSocket server started');

  const binanceWS = new WebSocket(
    'wss://stream.binance.us:9443/ws/btcusd@ticker/ethusd@ticker/xrpusd@ticker/solusd@ticker'
  );

  binanceWS.on('open', () => {
    console.log('Connected to Binance US');
  });

  binanceWS.on('message', (data: Buffer) => {
    const ticker = JSON.parse(data.toString());
    
    if (ticker.s === 'BTCUSD') {
      prices.BTC = parseFloat(ticker.c).toFixed(2);
    } else if (ticker.s === 'ETHUSD') {
      prices.ETH = parseFloat(ticker.c).toFixed(2);
    } else if (ticker.s === 'XRPUSD') {
      prices.XRP = parseFloat(ticker.c).toFixed(4);
    } else if (ticker.s === 'SOLUSD') {
      prices.SOL = parseFloat(ticker.c).toFixed(2);
    }

    io.emit('priceUpdate', prices);
    console.log(prices);
  });

  binanceWS.on('error', (error) => {
    console.error('Error:', error.message);
  });

  binanceWS.on('close', () => {
    console.log('Reconnecting...');
    setTimeout(() => setupPriceSocket(server), 5000);
  });

  io.on('connection', (socket) => {
    console.log('Client connected');
    socket.emit('priceUpdate', prices);
  });

  return io;
}