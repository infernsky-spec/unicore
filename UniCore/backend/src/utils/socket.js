// socket.js
const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join course room for real-time attendance
    socket.on('join_course', (courseId) => {
      socket.join(`course_${courseId}`);
    });

    // Join user room for personal notifications
    socket.on('join_user', (userId) => {
      socket.join(`user_${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = { initializeSocket };
