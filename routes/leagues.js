// routes/leagues.js
import express from "express";
import League from "../models/League.js";
import Player from "../models/Player.js";

const router = express.Router();

// === получить все лиги ===
router.get("/", async (req, res) => {
  try {
    const leagues = await League.find().select("name");
    res.json(leagues.map(l => ({ id: l._id, name: l.name })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === создать новую лигу ===
router.post("/", async (req, res) => {
  try {
    const { name, ownerId } = req.body;
    if (!name || !ownerId)
      return res.status(400).json({ message: "name и ownerId обязательны" });

    const exists = await League.findOne({ name });
    if (exists)
      return res.status(400).json({ message: "Такая лига уже существует" });

    const league = new League({ name, owner: ownerId, admins: [ownerId] });
    await league.save();
    res.json({ id: league._id, name: league.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === получить игроков конкретной лиги ===
router.get("/:leagueId/players", async (req, res) => {
  try {
    const players = await Player.find({ league: req.params.leagueId });
    res.json(players.map(p => ({ ...p.toObject(), id: p._id })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === добавить игрока в лигу ===
router.post("/:leagueId/players", async (req, res) => {
  try {
    const leagueId = req.params.leagueId;
    const player = new Player({ ...req.body, league: leagueId });
    await player.save();
    res.json(player);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === обновить игрока ===
router.put("/:leagueId/players/:id", async (req, res) => {
  try {
    const updated = await Player.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === удалить игрока ===
router.delete("/:leagueId/players/:id", async (req, res) => {
  try {
    await Player.findByIdAndDelete(req.params.id);
    res.json({ message: "Игрок удалён" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === получить лигу по умолчанию (для гостей) ===
router.get("/default", async (req, res) => {
  try {
    const league = await League.findById(process.env.DEFAULT_LEAGUE_ID);
    if (!league)
      return res.status(404).json({ message: "Лига по умолчанию не найдена" });
    res.json({ id: league._id, name: league.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
