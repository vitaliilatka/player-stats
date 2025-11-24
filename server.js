// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import playersRouter from "./routes/players.js";
import authRouter from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import leaguesRouter from "./routes/leagues.js";

// === Настройки окружения ===
dotenv.config();

// === Инициализация приложения ===
const app = express();

// === Эмуляция __dirname в ES Modules ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === Middleware ===
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public"))); // index.html

// === Подключаем роуты ===
app.use("/players", playersRouter);
app.use("/auth", authRouter);
app.use("/leagues", leaguesRouter); // публичные маршруты
app.use("/admin", adminRoutes); // админка

// === Подключаем MongoDB ===
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// === Запуск сервера ===
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));


