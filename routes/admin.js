// routes/admin.js
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { upload } from "../utils/uploadConfig.js";

import League from "../models/League.js";
import Player from "../models/Player.js";

const router = express.Router();

// Emulate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ============================
   GET /admin/leagues
   Returns leagues where user is owner or admin
============================ */
router.get("/leagues", authMiddleware(), async (req, res) => {
  try {
    console.log("👉 req.user:", req.user);

    const leagues = await League.find({
      $or: [{ owner: req.user.id }, { admins: req.user.id }],
    });

    console.log("👉 leagues:", leagues);
    res.json(leagues);
  } catch (err) {
    console.error("League loading error:", err);
    res.status(500).json({ message: "Failed to load leagues" });
  }
});

/* ============================
   POST /admin/leagues
   Create a new league
============================ */
router.post("/leagues", authMiddleware(), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "League name is required" });
    }

    const existing = await League.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "A league with this name already exists" });
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
    console.error("League creation error:", err);
    res.status(500).json({ message: "Server error while creating league" });
  }
});

/* ============================
   POST /admin/players
   Add a new player to a league
============================ */
router.post("/players", authMiddleware(), upload.single("image"), async (req, res) => {
  try {
    const { name, team, position, leagueId } = req.body;

    if (!name || !team || !position || !leagueId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for duplicates inside the same league
    const existing = await Player.findOne({ name, league: leagueId });
    if (existing) {
      return res
        .status(400)
        .json({ message: `Player "${name}" already exists in this league` });
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
    console.error("Player creation error:", err);
    res.status(500).json({ message: "Failed to add player" });
  }
});

/* ============================
   GET /admin/players/:leagueId
   Get all players from a specific league
============================ */
router.get("/players/:leagueId", authMiddleware(), async (req, res) => {
  try {
    const { leagueId } = req.params;
    const players = await Player.find({ league: leagueId });
    res.json(players);
  } catch (err) {
    console.error("Player loading error:", err);
    res.status(500).json({ error: "Failed to load players" });
  }
});

/* ============================
   PUT /admin/players/:id
   Edit player info
============================ */
router.put("/players/:id", authMiddleware(), upload.single("image"), async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ message: "Player not found" });

    // Replace player image if a new one arrives
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
    console.error("Player update error:", err);
    res.status(500).json({ message: "Failed to update player" });
  }
});

/* ============================
   DELETE /admin/players/:id
   Remove player and image
============================ */
router.delete("/players/:id", authMiddleware(), async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ message: "Player not found" });

    if (player.image) {
      const imgPath = path.join(__dirname, "../", player.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await player.deleteOne();
    res.json({ message: "Player and image deleted" });
  } catch (err) {
    console.error("Player deletion error:", err);
    res.status(500).json({ message: "Failed to delete player" });
  }
});

/* ============================
   Upload error handler
============================ */
router.use((err, req, res, next) => {
  if (err.message.startsWith("Invalid file format")) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

export default router;
