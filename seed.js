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
      // 👶 Create a new user
      user = new User({ username: u.username, role: u.role });
      await user.setPassword(u.password);
      await user.save();
      console.log(`✅ User ${u.username} created`);
    } else {
      // ✏️ If user already exists, update only the role (keep existing password)
      if (user.role !== u.role) {
        user.role = u.role;
        await user.save();
        console.log(`♻️ Role of user ${u.username} updated to ${u.role}`);
      } else {
        console.log(`ℹ️ User ${u.username} already exists (no changes)`);
      }
    }
  }

  mongoose.disconnect();
}

seed();
