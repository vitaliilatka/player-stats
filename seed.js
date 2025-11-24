// seed.js
const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const users = [
    { username: "testuser1", password: "user1", role: "user" },
    { username: "testadmin1", password: "admin1", role: "admin" },
    { username: "testadmin2", password: "admin2", role: "admin" }
  ];

  for (const u of users) {
    let user = await User.findOne({ username: u.username });

    if (!user) {
      // 👶 создаём нового пользователя
      user = new User({ username: u.username, role: u.role });
      await user.setPassword(u.password);
      await user.save();
      console.log(`✅ Пользователь ${u.username} создан`);
    } else {
      // ✏️ если есть, обновляем только роль (пароль оставляем прежним!)
      if (user.role !== u.role) {
        user.role = u.role;
        await user.save();
        console.log(`♻️ Роль пользователя ${u.username} обновлена на ${u.role}`);
      } else {
        console.log(`ℹ️ Пользователь ${u.username} уже существует (без изменений)`);
      }
    }
  }

  mongoose.disconnect();
}

seed();
