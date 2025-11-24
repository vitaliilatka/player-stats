import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// === регистрация ===
router.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Введите логин и пароль" });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: "Такой пользователь уже существует" });
    }

    const user = new User({ username, role: role || "user" });
    await user.setPassword(password);
    await user.save();

    res.json({ message: "✅ Пользователь создан" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === логин ===
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Пользователь не найден" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Неверный пароль" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("🔹 Login success:", {
      id: user._id.toString(),
      username: user.username,
      role: user.role
    });

    res.json({
      token,
      role: user.role,
      userId: user._id.toString(),
      username: user.username
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// === проверка токена ===
router.get("/me", async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "Нет токена" });

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("username role");
    res.json(user);
  } catch (err) {
    res.status(401).json({ message: "Неверный или просроченный токен" });
  }
});

export default router;
