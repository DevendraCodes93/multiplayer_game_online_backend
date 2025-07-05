import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

let waitingUsers = [];
const gameStates = {};

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  // socket.on("join-random", () => {
  //   if (
  //     waitingUsers.length > 0 &&
  //     !waitingUsers.find((user) => user.id === socket.id)
  //   ) {
  //     const partnerUser = waitingUsers.shift(); // { id: '...' }

  //     const partnerSocket = io.sockets.sockets.get(partnerUser.id);
  //     if (partnerSocket) {
  //       const roomID = `${partnerUser.id}#${socket.id}`;

  //       socket.join(roomID);
  //       partnerSocket.join(roomID);

  //       setTimeout(() => {
  //         io.to(roomID).emit("room-joined", roomID);
  //         io.to(roomID).emit("ready");
  //       }, 50);
  //     }
  //   } else {
  //     waitingUsers.push({ id: socket.id });
  //   }
  // });

  // socket.on("signal", ({ roomID, data }) => {
  //   socket.to(roomID).emit("signal", data);
  // });

  // socket.on("retry-call", ({ roomID, data }) => {
  //   console.log("retry-call triggered");
  //   socket.to(roomID).emit("retry-call", data);
  // });

  // socket.on("leave-room", (roomID) => {
  //   console.log("Leaving room:", roomID);

  //   socket.to(roomID).emit("user-disconnected");

  //   // Clean up
  //   waitingUsers = waitingUsers.filter((user) => user.id !== socket.id);

  //   socket.leave(roomID); // just leave the room, don’t force disconnect!
  // });

  socket.on("create-room", ({ name, socketId, roomId }) => {
    console.log("Creating room for:", name, "Socket ID:", socketId);
    if (!name.trim()) {
      console.error("Player name is required");
      return;
    }

    waitingUsers.push({ id: socketId, name, roomId });

    console.log("Waiting users:", waitingUsers);
    io.to(socket.id).emit("room-created", {
      message: "Room created successfully",
      waitingUsers,
    });
  });
  socket.on("join-room", ({ name, roomId, socketId }) => {
    console.log(" Joining room:", roomId, "as", name, "Socket ID:", socketId);

    if (!name?.trim() || !roomId?.trim()) {
      console.error(" Player name and room ID are required");
      return;
    }

    // Check if user already exists
    const existingUser = waitingUsers.find((user) => user.id === socketId);
    if (existingUser) {
      console.log("User already in waiting list:", existingUser);
      return;
    }

    // Find existing user in the room
    const roomUser = waitingUsers.find((user) => user.roomId === roomId);

    // Add current user to waitingUsers
    // waitingUsers.push({ id: socketId, name, roomId });

    if (roomUser) {
      waitingUsers = waitingUsers.filter((user) => user.id !== roomUser?.id);
      const partnerSocket = io.sockets.sockets.get(roomUser.id);

      if (partnerSocket) {
        const roomID = roomId;

        socket.join(roomID);
        partnerSocket.join(roomID);

        console.log(" Both users joined room:", roomID);

        // Emit room joined message to both sockets
        const joinedPayload = {
          roomId: roomID,
          players: [
            { id: roomUser.id, name: roomUser.name, XPlayer: true },
            { id: socketId, name: name, XPlayer: false },
          ],
        };

        io.to(roomID).emit("room-joined", joinedPayload);
        io.to(roomID).emit("ready");
      } else {
        console.error(" Partner socket not found:", roomUser.id);
      }
    } else {
      console.log("Waiting for second user to join room:", roomId);
    }
  });
  socket.on("make-move", ({ index, gameId, gameState }) => {
    console.log("Make move:", index, "Game ID:", gameId);

    // Initialize if room state doesn't exist
    if (!gameStates[gameId]) {
      gameStates[gameId] = { xTurn: true };
    }

    // Toggle turn
    gameStates[gameId].xTurn = !gameStates[gameId].xTurn;
    io.to(gameId).emit("move-made", {
      index,
      gameState,
      xTurn: gameStates[gameId].xTurn,
    });
  });

  socket.on("restart-game", (roomId) => {
    console.log("Restarting game in room:", roomId);

    // Reset turn to X
    gameStates[roomId] = { xTurn: true };

    io.to(roomId).emit("game-restarted", {
      index: null,
      gameState: {
        squares: Array(9).fill(""),
        xTurn: true,
      },
      xTurn: true,
    });
  });
  socket.on('leave-room', (roomId) => {
    console.log("Leaving room:", roomId);

    // Clean up waiting users
    waitingUsers = waitingUsers.filter((user) => user.id !== socket.id);

    // Leave the room
    socket.leave(roomId);
    
    // Notify other users in the room
    socket.to(roomId).emit("user-disconnected", { userId: socket.id });
  }); 
  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
    waitingUsers = waitingUsers.filter((user) => user.id !== socket.id);
  });
});

export { io, app, server };
