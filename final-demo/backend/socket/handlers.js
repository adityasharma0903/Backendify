export const handleSocketEvents = (io, socket) => {
  socket.on('send-message', (data) => {
    io.emit('receive-message', data);
  });

  socket.on('typing', (data) => {
    socket.broadcast.emit('user-typing', data);
  });
};