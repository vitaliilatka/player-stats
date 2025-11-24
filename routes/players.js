import express from "express";
// const multer = require("multer");
import Player from "../models/Player.js";
import { upload } from "../utils/uploadConfig.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const query = {}; // <-- добавляем это
    if (req.query.leagueId) query.league = req.query.leagueId;

    console.log("leagueId =", req.query.leagueId);

    const players = await Player.find(query);
    res.json(players);
  } catch (err) {
    res.status(500).json({ message: "Ошибка загрузки игроков", error: err.message });
  }
});

export default router;
