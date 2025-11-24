// routes/admin.js
import express from "express";
// import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { authMiddleware } from "../middleware/authMiddleware.js"; 

import { upload } from "../utils/uploadConfig.js";
// import jwt from "jsonwebtoken";

import League from "../models/League.js";
import Player from "../models/Player.js";

const router = express.Router();

// === Настройка путей ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// === GET /admin/leagues ===
router.get("/leagues", authMiddleware(), async (req, res) => {
  try {
    console.log("👉 req.user:", req.user);
    const leagues = await League.find({
      $or: [{ owner: req.user.id }, { admins: req.user.id }],
    });
    console.log("👉 leagues:", leagues);
    res.json(leagues);
  } catch (err) {
    console.error("Ошибка при загрузке лиг:", err);
    res.status(500).json({ message: "Ошибка при загрузке лиг" });
  }
});



// === POST /admin/leagues ===
router.post("/leagues", authMiddleware(), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Введите название лиги" });

    const existing = await League.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Лига с таким названием уже существует" });
    }

    const league = new League({
      name,
      owner: req.user.id,
      admins: [req.user.id],
      createdAt: new Date(),
    });

    await league.save();
    res.json(league);
  } catch (err) {
    console.error("Ошибка при создании лиги:", err);
    res.status(500).json({ message: "Ошибка сервера при создании лиги" });
  }
});


// === POST /admin/players ===
router.post("/players", authMiddleware(), upload.single("image"), async (req, res) => {
  try {
    const { name, team, position, leagueId } = req.body;

    if (!name || !team || !position || !leagueId) {
      return res.status(400).json({ message: "Все поля обязательны для заполнения" });
    }

    // Проверка дубликата в пределах одной лиги
    const existing = await Player.findOne({ name, league: leagueId });
    if (existing) {
      return res.status(400).json({ message: `Игрок "${name}" уже существует в этой лиге` });
    }

    const newPlayer = new Player({
      name,
      team,
      position,
      league: leagueId,
      image: req.file ? `/uploads/${req.file.filename}` : null,
    });

    await newPlayer.save();
    res.status(201).json(newPlayer);
  } catch (err) {
    console.error("Ошибка при добавлении игрока:", err);
    res.status(500).json({ message: "Ошибка при добавлении игрока" });
  }
});


// === GET /admin/players/:leagueId ===
router.get("/players/:leagueId", authMiddleware(), async (req, res) => {
  try {
    const { leagueId } = req.params;
    const players = await Player.find({ league: leagueId });
    res.json(players);
  } catch (err) {
    console.error("Ошибка при загрузке игроков:", err);
    res.status(500).json({ error: "Ошибка при загрузке игроков" });
  }
});


// === PUT /admin/players/:id ===
router.put("/players/:id", authMiddleware(), upload.single("image"), async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ message: "Игрок не найден" });

    // Если пришло новое изображение — удаляем старое
    if (req.file) {
      if (player.image) {
        const oldPath = path.join(__dirname, "../", player.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      player.image = `/uploads/${req.file.filename}`;
    }

    Object.assign(player, req.body);
    await player.save();

    res.json(player);
  } catch (err) {
    console.error("Ошибка обновления игрока:", err);
    res.status(500).json({ message: "Ошибка при обновлении игрока" });
  }
});


// === DELETE /admin/players/:id ===
router.delete("/players/:id", authMiddleware(), async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ message: "Игрок не найден" });

    if (player.image) {
      const imgPath = path.join(__dirname, "../", player.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await player.deleteOne();
    res.json({ message: "Игрок и его изображение удалены" });
  } catch (err) {
    console.error("Ошибка удаления игрока:", err);
    res.status(500).json({ message: "Ошибка при удалении игрока" });
  }
});


// === Middleware обработки ошибок загрузки ===
router.use((err, req, res, next) => {
  if (err.message.startsWith("Недопустимый формат")) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

export default router;
