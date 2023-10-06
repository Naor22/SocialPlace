import io from 'socket.io-client';

let socket;

export const initializeSocket = (userId) => {
  if (!socket) {
    socket = io('https://api.social-place.com', {
      query: {
        userId: userId,
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export const sendMessage = (messageType, data, callback) => {
  if (!socket) return;

  socket.emit(messageType, data);

  if (callback) {
    socket.once(`${messageType}-response`, callback);
  }
}

export const registerMessageHandler = (messageType, handler) => {
  if (!socket) return;

  socket.on(messageType, handler);
}

export const unregisterMessageHandler = (messageType) => {
  if (!socket) return;
  socket.off(messageType);
}
