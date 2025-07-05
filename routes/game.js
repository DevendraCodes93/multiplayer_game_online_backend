import express from "express";
import { createNewGame } from "../controllers/gameController.js";

const router = express.Router();

router.post("/new-game", createNewGame);
export default router;
