import { getSocketIO } from './priceSocket';

export function setupOrderSocket() {
  console.log('📋 Setting up order WebSocket handlers...');
  
  const io = getSocketIO();  // 
  
  // Optional: Add order-specific connection handlers
  io.on('connection', (socket) => {
    console.log('📋 Client ready for order updates:', socket.id);
    
    socket.on('disconnect', () => {
      console.log('📋 Client disconnected from orders:', socket.id);
    });
  });
  
  console.log('✅ Order WebSocket handlers ready');
}

export function broadcastOrderUpdate(event: string, data: any): void {
  try {
    const io = getSocketIO();
    io.emit(event, data);
    console.log(`📋 Broadcasted ${event}:`, data);
  } catch (error) {
    console.warn('⚠️  Could not broadcast order update:', error);
  }
}