
let ioInstance = null;

const setIO = (io) => {
  ioInstance = io;
};

const getIO = () => {
  if (!ioInstance) {
    console.warn("Socket.IO is not initialized yet.");
  }

  return ioInstance;
};

module.exports = {
  setIO,
  getIO,
};
