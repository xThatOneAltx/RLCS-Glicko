let ratingMode = "fm";
let globalPlayers = [];
let globalTeamMap = {};
let teamDisplayMode = "name";
let encData = [];
let teamMode = "3v3";
let globalTeams = [];
let global2v2 = [];

document.querySelectorAll(".tab-button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.getAttribute("data-tab")).classList.add("active");

    const ratingToggle = document.getElementById("rating-toggle");
    const teamToggle = document.getElementById("team-mode-toggle");
    const teamDisplayToggle = document.getElementById("team-display-toggle");

    if (ratingToggle) {
      ratingToggle.style.display =
        btn.getAttribute("data-tab") === "players"
          ? "flex"
          : "none";
    }

    if (teamToggle) {
      teamToggle.style.display =
        btn.getAttribute("data-tab") === "teams"
          ? "flex"
          : "none";
    }

    if (teamDisplayToggle) {
      teamDisplayToggle.style.display =
        btn.getAttribute("data-tab") === "teams"
          ? "flex"
          : "none";
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

const TEAMS_LAST_UPDATED = "June 21, 2026 - Model v2.0 Update";
const PLAYERS_LAST_UPDATED = "June 21, 2026 - Model v2.0 Update";

function setLastUpdated() {
  const t = document.getElementById("teams-updated");
  const p = document.getElementById("players-updated");

  if (t) t.textContent = `LAST UPDATED: ${TEAMS_LAST_UPDATED}`;
  if (p) p.textContent = `LAST UPDATED: ${PLAYERS_LAST_UPDATED}`;
}

function renderTeams(teams, showRoster = false) {
  const container = document.getElementById("teams-list");

  if (!container) return;

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
        <div class="rank-bar ${team.color} ${showRoster ? "roster-mode" : ""}" style="width:${widthPercent}%;">
          <img class="logo" src="${team.logo || ""}">
          <span class="rank-name">
            ${showRoster ? team.players.join(" / ") : team.name}
          </span>
          <span class="rank-rating">${team.rating}</span>
        </div>
      </div>
    `;

    container.appendChild(div);
  });
}

function render2v2(teams, showRoster = false) {
  const container = document.getElementById("teams-list");

  if (!container) return;

  container.innerHTML = "";

  const sorted = [...teams]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);

  const maxRating = sorted[0].rating;

  sorted.forEach((team, i) => {
    const widthPercent = (team.rating / maxRating) * 100;

    const div = document.createElement("div");

    div.className = "rank-entry";

    div.innerHTML = `
      <div class="rank-number">${i + 1}</div>
      <div class="rank-bar-wrapper">
        <div class="rank-bar ${team.color} ${showRoster ? "roster-mode" : ""}" style="width:${widthPercent}%;">
          <img class="logo" src="${team.logo || ""}">
          <span class="rank-name">
            ${showRoster ? team.players.join(" / ") : team.name}
          </span>
          <span class="rank-rating">${team.rating}</span>
        </div>
      </div>
    `;

    container.appendChild(div);
  });
}

function renderPlayers(players, teamMap) {
  const container = document.getElementById("players-list");

  if (!container) return;

  container.innerHTML = "";

  if (!players || players.length === 0) {
    container.innerHTML =
      `<p class="no-data">No player data available yet.</p>`;
    return;
  }

  const sorted = [...players]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 50);

  const maxRating = 200;

  sorted.forEach((player, i) => {
    const rawRating = Number(player.rating) || 0;

    const displayRating =
      ratingMode === "fifa"
        ? Math.round(rawRating / 4 + 44.44)
        : Math.round(rawRating);

    const widthPercent =
      Math.max(0, Math.min(100, (rawRating / maxRating) * 100));

    const teamInfo =
      teamMap[player.team] || {
        color: "blue",
        logo: ""
      };

    const flag = flagUrl(player.country);

    const div = document.createElement("div");

    div.className = "rank-entry";

    div.innerHTML = `
      <div class="rank-number">${i + 1}</div>

      <div class="rank-bar-wrapper">
        <div class="rank-bar ${teamInfo.color}" style="width:${widthPercent}%;">
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

  if (!container) return;

  container.innerHTML = "";

  if (!regions || regions.length === 0) {
    container.innerHTML =
      `<p class="no-data">No region data available yet.</p>`;
    return;
  }

  const sorted = [...regions]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);

  const europe = regions.find(r => r.name === "Europe");

  const maxRating =
    europe
      ? europe.rating
      : sorted[0].rating;

  sorted.forEach((region, i) => {
    const widthPercent =
      (region.rating / maxRating) * 100;

    const div = document.createElement("div");

    div.className = "rank-entry";

    div.innerHTML = `
      <div class="rank-number">${i + 1}</div>

      <div class="rank-bar-wrapper">
        <div class="rank-bar ${region.color}" style="width:${widthPercent}%;">
          <img class="logo" src="${region.logo}">

          <span class="rank-name">
            ${window.innerWidth < 600
              ? (region.shortName || region.name)
              : region.name}
          </span>

          <span class="rank-rating">${Math.round(region.rating)}</span>
        </div>
      </div>
    `;

    container.appendChild(div);
  });
}

function renderENC(showRoster = false) {
  const container = document.getElementById("teams-list");

  if (!container) return;

  container.innerHTML = "";

  const sorted = [...encData]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 15);

  const maxRating = sorted[0].rating;

  sorted.forEach((nation, i) => {
    const widthPercent =
      (nation.rating / maxRating) * 100;

    const flag = flagUrl(nation.countryCode);

    const displayText =
      showRoster
        ? nation.players.join(" / ")
        : nation.country;

    const div = document.createElement("div");

    div.className = "rank-entry";

    div.innerHTML = `
      <div class="rank-number">${i + 1}</div>

      <div class="rank-bar-wrapper">
        <div class="rank-bar ${nation.color} ${showRoster ? "roster-mode" : ""}" style="width:${widthPercent}%;">
          <img class="enc-flag" src="${flag}" alt="${nation.country}">
          <span class="rank-name">${displayText}</span>
          <span class="rank-rating">${nation.rating}</span>
        </div>
      </div>
    `;

    container.appendChild(div);
  });
}

function renderCurrentTeamMode() {

  if (teamMode === "3v3") {
    renderTeams(
      globalTeams,
      teamDisplayMode === "roster"
    );
  }

  else if (teamMode === "2v2") {
    render2v2(
      global2v2,
      teamDisplayMode === "roster"
    );
  }

  else {
    renderENC(
      teamDisplayMode === "roster"
    );
  }
}

async function init() {
  const teams = await loadJSON("data/teams.json");
  const twos = await loadJSON("data/2v2.json");
  const players = await loadJSON("data/players.json");
  const regions = await loadJSON("data/regions.json");
  const enc = await loadJSON("data/enc.json");

  const teamMap = buildTeamMap(teams);

  globalTeams = teams;
  global2v2 = twos;

  globalPlayers = players;
  globalTeamMap = teamMap;
  encData = enc;

  renderCurrentTeamMode();
  renderPlayers(globalPlayers, globalTeamMap);
  renderRegions(regions);

  setLastUpdated();
}

document.addEventListener("DOMContentLoaded", () => {
  const buttons =
    document.querySelectorAll(".rating-button");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));

      btn.classList.add("active");

      ratingMode = btn.getAttribute("data-mode");

      renderPlayers(globalPlayers, globalTeamMap);
    });
  });

  const teamButtons =
  document.querySelectorAll(".team-mode-button");

teamButtons.forEach(btn => {
  btn.addEventListener("click", () => {

    teamButtons.forEach(b =>
      b.classList.remove("active")
    );

    btn.classList.add("active");

    teamMode = btn.dataset.mode;

    renderCurrentTeamMode();
  });
});

  const displayButtons =
  document.querySelectorAll(".team-display-button");

displayButtons.forEach(btn => {
  btn.addEventListener("click", () => {

    displayButtons.forEach(b =>
      b.classList.remove("active")
    );

    btn.classList.add("active");

    teamDisplayMode =
      btn.dataset.mode;

    renderCurrentTeamMode();
  });
});

  const toggle =
    document.getElementById("rating-toggle");

  if (toggle) toggle.style.display = "none";

  const teamToggle =
    document.getElementById("team-mode-toggle");

  if (teamToggle) teamToggle.style.display = "flex";

  const teamDisplayToggle =
    document.getElementById("team-display-toggle");

  if (teamDisplayToggle) teamDisplayToggle.style.display = "flex";
});

init();
