// guest.js

const API_URL = "http://localhost:4000";

// -------------------------
// Загрузка игроков
// -------------------------
async function loadPlayers(leagueId) {
  let url = `${API_URL}/players`;
  if (leagueId) url += `?leagueId=${leagueId}`;

  console.log("Запрос игроков:", url);

  const res = await fetch(url);
  const players = await res.json();

  const container = document.getElementById("players-cards");
  container.innerHTML = "";

  players.forEach((p) => {
    const card = document.createElement("div");
    card.className = "col-md-4";
    card.innerHTML = `
      <div class="card h-100">
        <div class="card-header">${p.name}</div>
        <div class="card-body">
          <p><strong>Команда:</strong> ${p.team}</p>
          <p><strong>Позиция:</strong> ${p.position}</p>
        </div>
      </div>`;
    container.appendChild(card);
  });
}

// -------------------------
// Логин
// -------------------------
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    console.log("Ответ сервера:", data);

    if (!res.ok) {
      document.getElementById("loginMessage").innerText =
        data.message || "Ошибка входа";
      return;
    }

    // Сохраняем всё в localStorage
    if (data.token) localStorage.setItem("token", data.token);
    if (data.role) localStorage.setItem("role", data.role);
    if (data.username) localStorage.setItem("username", data.username);
    if (data.userId) {
      localStorage.setItem("userId", data.userId);
      console.log("✅ userId сохранён:", data.userId);
    }

    // Перенаправление
    if (data.role === "admin") {
      window.location.href = "/admin.html";
    } else {
      window.location.href = "/user.html";
    }
  } catch (err) {
    console.error("Ошибка входа:", err);
    document.getElementById("loginMessage").innerText =
      "Ошибка подключения к серверу";
  }
});

// -------------------------
// Автозагрузка default-лиги
// -------------------------
async function initDefaultLeague() {
  try {
    console.log("Получаю лигу по умолчанию…");

    const res = await fetch(`${API_URL}/leagues/default`);
    const data = await res.json();

    console.log("Лига по умолчанию:", data);

    if (!data.id) {
      console.warn("⚠ default-лига не найдена, загружаю всех игроков.");
      await loadPlayers();
      return;
    }

    // Загружаем игроков выбранной лиги
    await loadPlayers(data.id);

  } catch (err) {
    console.error("Ошибка загрузки default-лиги:", err);
    loadPlayers(); // fallback
  }
}

// -------------------------
// Запуск при загрузке страницы
// -------------------------
initDefaultLeague();
