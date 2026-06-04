let ratingMode = "fm";
let globalPlayers = [];
let globalTeamMap = {};

document.querySelectorAll(".tab-button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.getAttribute("data-tab")).classList.add("active");

    const toggle = document.getElementById("rating-toggle");
    if (toggle) {
      if (btn.getAttribute("data-tab") === "players") {
        toggle.style.display = "flex";
      } else {
        toggle.style.display = "none";
      }
    }
  });
});

async function loadJSON(path) {
  const response = await fetch(path);
  return await response.json();
}

function buildTeamMap(teams) {
  const map = {};
  teams.forEach(t => {
    map[t.name] = {
      color: t.color || "blue",
      logo: t.logo || ""
    };
  });
  return map;
}

function flagUrl(countryCode) {
  if (!countryCode) return "";
  return `https://flagcdn.com/w40/${String(countryCode).toLowerCase()}.png`;
}

const TEAMS_LAST_UPDATED = "May 24, 2026";
const PLAYERS_LAST_UPDATED = "May 24, 2026";

function setLastUpdated() {
  const t = document.getElementById("teams-updated");
  const p = document.getElementById("players-updated");
  if (t) t.textContent = `LAST UPDATED: ${TEAMS_LAST_UPDATED}`;
  if (p) p.textContent = `LAST UPDATED: ${PLAYERS_LAST_UPDATED}`;
}

function renderTeams(teams) {
  const container = document.getElementById("teams-list");
  container.innerHTML = "";

  const sorted = [...teams]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 25);

  const maxRating = sorted[0].rating;

  sorted.forEach((team, i) => {
    const widthPercent = (team.rating / maxRating) * 100;

    const div = document.createElement("div");
    div.className = "rank-entry";

    div.innerHTML = `
      <div class="rank-number">${i + 1}</div>
      <div class="rank-bar-wrapper">
        <div class="rank-bar ${team.color}" style="width: ${widthPercent}%;">
          <img class="logo" src="${team.logo || ""}">
          <span class="rank-name">${team.name}</span>
          <span class="rank-rating">${team.rating}</span>
        </div>
      </div>
    `;

    container.appendChild(div);
  });
}

function renderPlayers(players, teamMap) {
  const container = document.getElementById("players-list");
  container.innerHTML = "";

  if (!players || players.length === 0) {
    container.innerHTML = `<p class="no-data">No player data available yet.</p>`;
    return;
  }

  const sorted = [...players]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 50);

  const maxRating = 200;

  sorted.forEach((player, i) => {
    const rawRating = Number(player.rating) || 0;

    let displayRating;
    if (ratingMode === "fifa") {
      displayRating = Math.round(rawRating / 4 + 44.44);
    } else {
      displayRating = Math.round(rawRating);
    }

    const widthPercent = Math.max(0, Math.min(100, (rawRating / maxRating) * 100));
    const teamInfo = teamMap[player.team] || { color: "blue", logo: "" };
    const flag = flagUrl(player.country);

    const div = document.createElement("div");
    div.className = "rank-entry";

    div.innerHTML = `
      <div class="rank-number">${i + 1}</div>
      <div class="rank-bar-wrapper">
        <div class="rank-bar ${teamInfo.color}" style="width: ${widthPercent}%;">
          ${teamInfo.logo ? `<img class="logo" src="${teamInfo.logo}">` : ""}
          ${flag ? `<img class="flag" src="${flag}" alt="${player.country || ""}">` : ""}
          <span class="rank-name">${player.name}</span>

          ${player.liquipedia ? `
            <a
              class="liquipedia-link"
              href="${player.liquipedia}"
              target="_blank"
              rel="noopener noreferrer"
              title="View Liquipedia page"
            >
              <img src="logos/liquipedia.png" alt="Liquipedia">
            </a>
          ` : ""}

          <span class="rank-rating">${displayRating}</span>
        </div>
      </div>
    `;

    container.appendChild(div);
  });
}

function renderRegions(regions) {
  const container = document.getElementById("regions-list");
  container.innerHTML = "";

  if (!regions || regions.length === 0) {
    container.innerHTML = `<p class="no-data">No region data available yet.</p>`;
    return;
  }

  const sorted = [...regions]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);

  const europe = regions.find(r => r.name === "Europe");
  const maxRating = europe ? europe.rating : sorted[0].rating;

  sorted.forEach((region, i) => {
    const widthPercent = (region.rating / maxRating) * 100;

    const div = document.createElement("div");
    div.className = "rank-entry";

    div.innerHTML = `
      <div class="rank-number">${i + 1}</div>

      <div class="rank-bar-wrapper">
        <div class="rank-bar ${region.color}" style="width: ${widthPercent}%;">
          <img class="logo" src="${region.logo}">
          <span class="rank-name">${region.name}</span>
          <span class="rank-rating">${Math.round(region.rating)}</span>
        </div>
      </div>
    `;

    container.appendChild(div);
  });
}

async function init() {
  const teams = await loadJSON("data/teams.json");
  const players = await loadJSON("data/players.json");
  const regions = await loadJSON("data/regions.json");

  const teamMap = buildTeamMap(teams);

  globalPlayers = players;
  globalTeamMap = teamMap;

  renderTeams(teams);
  renderPlayers(globalPlayers, globalTeamMap);
  renderRegions(regions);
  setLastUpdated();
}

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".rating-button");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      ratingMode = btn.getAttribute("data-mode");
      renderPlayers(globalPlayers, globalTeamMap);
    });
  });

  const toggle = document.getElementById("rating-toggle");
  if (toggle) toggle.style.display = "none";
});

init();
