import express from "express";

import gameRouter from "./routes/game.js";
import cookieParser from "cookie-parser";
import { app, server } from "./lib/socket.js";
import cors from "cors";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/game", gameRouter);

server.listen(3001, () => {
  console.log("Server is running on port 3001");
});
