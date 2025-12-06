// ================================
// TAB SWITCHING
// ================================
document.querySelectorAll(".tab-button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.getAttribute("data-tab")).classList.add("active");
  });
});


// ================================
// LOAD JSON HELPERS
// ================================
async function loadJSON(path) {
  const response = await fetch(path);
  return await response.json();
}


// ================================
// RENDER TEAMS
// ================================
function renderTeams(teams) {
  const container = document.getElementById("teams-list");
  container.innerHTML = "";

  teams
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 20)
    .forEach((team, i) => {
      const div = document.createElement("div");
      div.className = "rank-entry";

      div.innerHTML = `
        <div class="rank-number">${i + 1}</div>

        <div class="rank-bar ${team.color}">
          <img class="logo" src="${team.logo || ""}" />
          <span class="rank-name">${team.name}</span>
          <span class="rank-rating">${team.rating}</span>
        </div>
      `;

      container.appendChild(div);
    });
}


// ================================
// RENDER PLAYERS (later)
// ================================
function renderPlayers(players) {
  const container = document.getElementById("players-list");
  container.innerHTML = "";

  if (!players.length) {
    container.innerHTML = `<p class="no-data">No player data available yet.</p>`;
    return;
  }

  players
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 50)
    .forEach((player, i) => {
      const div = document.createElement("div");
      div.className = "rank-entry";

      div.innerHTML = `
        <div class="rank-number">${i + 1}</div>

        <div class="rank-bar ${player.color}">
          <span class="rank-name">${player.name}</span>
          <span class="rank-rating">${player.rating}</span>
        </div>
      `;

      container.appendChild(div);
    });
}


// ================================
// INITIAL LOAD
// ================================
async function init() {
  const teams = await loadJSON("data/teams.json");
  const players = await loadJSON("data/players.json");

  renderTeams(teams);
  renderPlayers(players);
}

init();
