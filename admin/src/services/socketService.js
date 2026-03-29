import io from 'socket.io-client';

let socket = null;
let isInitializing = false;

export const initSocket = () => {
  // Prevent multiple initialization attempts
  if (socket || isInitializing) {
    console.log('🔄 Socket already initialized or initializing...');
    return socket;
  }

  isInitializing = true;
  const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  console.log('🔧 Initializing Socket.io connection to', socketUrl);
  
  socket = io(socketUrl, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
    isInitializing = false;
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error);
  });

  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    console.warn('⚠️  Socket not initialized, attempting to initialize...');
    return initSocket();
  }
  return socket;
};

export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    isInitializing = false;
  }
};
