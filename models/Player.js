// models/Player.js
import mongoose from "mongoose";


const playerSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  team: { type: String, default: "" },
  league: { type: mongoose.Schema.Types.ObjectId, ref: "League", required: true },
  position: { type: String, required: true },
  games: { type: Number, default: 0 },
  goals: { type: Number, default: 0 },
  assists: { type: Number, default: 0 },
  blocks: { type: Number, default: 0 },
  saves: { type: Number, default: 0 },
  cleansheets: { type: Number, default: 0 },
  goalsconceded: { type: Number, default: 0 },
  penalty_earned: { type: Number, default: 0 },
  penalty_missed: { type: Number, default: 0 },
  penalty_saved: { type: Number, default: 0 },
  yellowcards: { type: Number, default: 0 },
  redcards: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },
  image: { type: String, default: "" },
});

// Автоматический рейтинг по формуле
playerSchema.virtual("rating").get(function () {
  return Math.round(
    (this.games ?? 0) * 2 +
    (this.goals ?? 0) * 4 +
    (this.assists ?? 0) * 3 +
    (this.cleansheets ?? 0) * 4 +
    (this.saves ?? 0) +
    (this.blocks ?? 0) +
    (this.penalty_earned ?? 0) * 2 +
    (this.penalty_saved ?? 0) * 4 +
    (this.bonus ?? 0) * 3 -
    (this.goalsconceded ?? 0) -
    (this.penalty_missed ?? 0) * 2 -
    (this.yellowcards ?? 0) -
    (this.redcards ?? 0) * 2
  );
});

// Чтобы виртуальное поле rating попадало в JSON
playerSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Player", playerSchema);

