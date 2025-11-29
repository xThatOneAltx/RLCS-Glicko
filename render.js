async function loadTeams() {
    const res = await fetch("data/Teams.json");  // <-- updated path
    const teams = await res.json();

    teams.sort((a, b) => b.rating - a.rating);

    teamsSection.innerHTML = "";

    teams.slice(0, 20).forEach((team, index) => {
        const div = document.createElement("div");
        div.className = "entry";

        div.innerHTML = `
            <div class="rank">${index + 1}</div>
            <div class="bar" style="background:${team.color};">
                ${team.rating} — ${team.name}
                ${team.logo ? `<img src="${team.logo}" alt="">` : ""}
            </div>
        `;
        teamsSection.appendChild(div);
    });
}

async function loadPlayers() {
    const res = await fetch("data/Players.json"); // <-- updated path
    const players = await res.json();

    if (players.length === 0) return;

    players.sort((a, b) => b.rating - a.rating);

    playersSection.innerHTML = "";

    players.slice(0, 50).forEach((p, i) => {
        const div = document.createElement("div");
        div.className = "entry";

        div.innerHTML = `
            <div class="rank">${i + 1}</div>
            <div class="bar" style="background:purple;">
                ${p.rating} — ${p.name}
            </div>
        `;
        playersSection.appendChild(div);
    });
}
