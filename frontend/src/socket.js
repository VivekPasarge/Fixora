
import { io } from "socket.io-client";

const socket = io("https://fixora-2.onrender.com", {
  transports: ["websocket", "polling"],
  autoConnect: false,

  auth: (callback) => {
    const token = localStorage.getItem("token");
    callback({ token });
  },

  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error.message);
});

export default socket;
