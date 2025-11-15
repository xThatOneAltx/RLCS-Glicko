document.addEventListener("DOMContentLoaded", () => {
    const contentDiv = document.getElementById("content");
    const buttons = document.querySelectorAll(".tab-button");
    const sectionHeader = document.getElementById("section-header");

    const MAX_TEAMS = 20;

    loadSection("teams");
    setLastUpdated();

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            loadSection(btn.dataset.target);
        });
    });

    async function loadSection(type) {
        sectionHeader.textContent =
            type === "teams" ? "Top 20 Teams" : "Top Players";

        const response = await fetch(`data/${type}.json`);
        let data = await response.json();

        if (type === "teams") {
            data.sort((a, b) => b.rating - a.rating);
            data = data.slice(0, MAX_TEAMS);
        }

        renderItems(data);
    }

    function renderItems(data) {
        contentDiv.innerHTML = "";
        const maxRating = data[0].rating;

        data.forEach(item => {
            const percent = (item.rating / maxRating) * 100;

            const row = document.createElement("div");
            row.className = "list-item";

            row.innerHTML = `
                <div class="logo-block" style="background:${mapBlockColor(item.color)}">
                    <img src="${item.logo}">
                </div>

                <div class="bar-wrapper">
                    <div class="bar ${item.color}" style="width:${percent}%">
                        <span class="inside-rating">${item.rating}</span>
                    </div>

                    <div class="label">
                        <span>${item.name}</span>
                    </div>
                </div>
            `;

            contentDiv.appendChild(row);
        });
    }

    function mapBlockColor(color) {
        return {
            green: "#1e8720",
            blue: "#1f4c99",
            red: "#a50000",
            yellow: "#9c7c00",
            magenta: "#7a007a"
        }[color] || "#333";
    }

    /* Automatically get Last-Modified date from JSON file */
    async function setLastUpdated() {
        const res = await fetch("data/teams.json");
        const modified = res.headers.get("Last-Modified");

        if (modified) {
            const date = new Date(modified);
            const text = date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
            });

            document.getElementById("last-updated").textContent =
                `(Last updated: ${text})`;
        }
    }
});
