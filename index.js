import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import gameRouter from "./routes/game.js";
import { app, server } from "./lib/socket.js"; // 

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.send("Server is live");
});
app.use("/api/game", gameRouter);

// Port setup for Render and local
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
