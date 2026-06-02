import { io } from 'socket.io-client';

let socket = null;

export const initializeSocket = (token) => {
  if (socket && socket.connected) {
    return socket;
  }

  const SOCKET_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');

  socket = io(SOCKET_URL, {
    auth: {
      token
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });

  socket.on('connect_error', () => {
    // connection failed silently in production
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized. Call initializeSocket first.');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const emitEvent = (event, data) => {
  if (socket && socket.connected) {
    socket.emit(event, data);
  }
};

export const onEvent = (event, callback) => {
  if (socket) {
    socket.on(event, callback);
  }
};

export const offEvent = (event, callback) => {
  if (socket) {
    socket.off(event, callback);
  }
};
