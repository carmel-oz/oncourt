const players = [
  { id: "alcaraz", draw: "men", name: "Carlos Alcaraz", country: "Spain", code: "ES", seed: 1 },
  { id: "sinner", draw: "men", name: "Jannik Sinner", country: "Italy", code: "IT", seed: 2 },
  { id: "djokovic", draw: "men", name: "Novak Djokovic", country: "Serbia", code: "RS", seed: 3 },
  { id: "zverev", draw: "men", name: "Alexander Zverev", country: "Germany", code: "DE", seed: 4 },
  { id: "medvedev", draw: "men", name: "Daniil Medvedev", country: "Neutral", code: "UN", seed: 5 },
  { id: "ruud", draw: "men", name: "Casper Ruud", country: "Norway", code: "NO", seed: 6 },
  { id: "rublev", draw: "men", name: "Andrey Rublev", country: "Neutral", code: "UN", seed: 7 },
  { id: "fritz", draw: "men", name: "Taylor Fritz", country: "United States", code: "US", seed: 8 },
  { id: "swiatek", draw: "women", name: "Iga Swiatek", country: "Poland", code: "PL", seed: 1 },
  { id: "sabalenka", draw: "women", name: "Aryna Sabalenka", country: "Neutral", code: "UN", seed: 2 },
  { id: "gauff", draw: "women", name: "Coco Gauff", country: "United States", code: "US", seed: 3 },
  { id: "rybakina", draw: "women", name: "Elena Rybakina", country: "Kazakhstan", code: "KZ", seed: 4 },
  { id: "pegula", draw: "women", name: "Jessica Pegula", country: "United States", code: "US", seed: 5 },
  { id: "jabeur", draw: "women", name: "Ons Jabeur", country: "Tunisia", code: "TN", seed: 6 },
  { id: "paolini", draw: "women", name: "Jasmine Paolini", country: "Italy", code: "IT", seed: 7 },
  { id: "sakkari", draw: "women", name: "Maria Sakkari", country: "Greece", code: "GR", seed: 8 }
];

const matches = [
  {
    id: "m1",
    draw: "women",
    status: "live",
    round: "R2",
    court: "Court Philippe-Chatrier",
    time: "Live now",
    playerA: "swiatek",
    playerB: "jabeur",
    scoreA: "6 3 2",
    scoreB: "4 6 1",
    server: "swiatek"
  },
  {
    id: "m2",
    draw: "men",
    status: "future",
    round: "R2",
    court: "Court Suzanne-Lenglen",
    time: "Today, 16:30",
    playerA: "alcaraz",
    playerB: "ruud",
    scoreA: "",
    scoreB: ""
  },
  {
    id: "m3",
    draw: "men",
    status: "future",
    round: "R2",
    court: "Court Simonne-Mathieu",
    time: "Tomorrow, 12:00",
    playerA: "sinner",
    playerB: "fritz",
    scoreA: "",
    scoreB: ""
  },
  {
    id: "m4",
    draw: "women",
    status: "future",
    round: "R2",
    court: "Court 14",
    time: "Tomorrow, 14:00",
    playerA: "gauff",
    playerB: "paolini",
    scoreA: "",
    scoreB: ""
  },
  {
    id: "m5",
    draw: "men",
    status: "past",
    round: "R1",
    court: "Court Philippe-Chatrier",
    time: "Completed",
    playerA: "djokovic",
    playerB: "zverev",
    scoreA: "6 7 6",
    scoreB: "4 5 3",
    winner: "djokovic"
  },
  {
    id: "m6",
    draw: "women",
    status: "past",
    round: "R1",
    court: "Court Suzanne-Lenglen",
    time: "Completed",
    playerA: "sabalenka",
    playerB: "rybakina",
    scoreA: "4 6 6",
    scoreB: "6 3 4",
    winner: "sabalenka"
  },
  {
    id: "m7",
    draw: "women",
    status: "future",
    round: "R2",
    court: "Court 7",
    time: "Friday, 11:00",
    playerA: "pegula",
    playerB: "sakkari",
    scoreA: "",
    scoreB: ""
  },
  {
    id: "m8",
    draw: "men",
    status: "future",
    round: "R2",
    court: "Court 6",
    time: "Friday, 13:00",
    playerA: "medvedev",
    playerB: "rublev",
    scoreA: "",
    scoreB: ""
  }
];

const state = {
  draw: "men",
  matchFilter: "all",
  search: "",
  followed: new Set(JSON.parse(localStorage.getItem("rg-followed") || "[]"))
};

const els = {
  followSummary: document.querySelector("#followSummary"),
  briefingText: document.querySelector("#briefingText"),
  radarTitle: document.querySelector("#radarTitle"),
  radarText: document.querySelector("#radarText"),
  playerSearch: document.querySelector("#playerSearch"),
  playerList: document.querySelector("#playerList"),
  matchList: document.querySelector("#matchList"),
  clearFollows: document.querySelector("#clearFollows")
};

function flagMarkup(code) {
  return `<span class="flag-icon flag-${code.toLowerCase()}" aria-hidden="true"></span>`;
}

function getPlayer(id) {
  return players.find(player => player.id === id);
}

function isFollowedMatch(match) {
  return state.followed.has(match.playerA) || state.followed.has(match.playerB);
}

function saveFollows() {
  localStorage.setItem("rg-followed", JSON.stringify([...state.followed]));
}

function renderPlayers() {
  const search = state.search.trim().toLowerCase();
  const visiblePlayers = players.filter(player => {
    const matchesDraw = player.draw === state.draw;
    const matchesSearch = !search || `${player.name} ${player.country}`.toLowerCase().includes(search);
    return matchesDraw && matchesSearch;
  });

  els.playerList.innerHTML = visiblePlayers
    .map(player => {
      const active = state.followed.has(player.id);
      return `
        <article class="player-row">
          <div class="flag">${flagMarkup(player.code)}</div>
          <div class="player-meta">
            <div class="player-name">${player.name}</div>
            <div class="player-sub">Seed ${player.seed} · ${player.country}</div>
          </div>
          <button class="follow-button ${active ? "active" : ""}" type="button" data-player="${player.id}" aria-label="${active ? "Unfollow" : "Follow"} ${player.name}">
            <img class="tennis-ball" src="assets/tennis-ball.jfif" alt="" aria-hidden="true" />
          </button>
        </article>
      `;
    })
    .join("");
}

function matchStatusLabel(status) {
  if (status === "future") return "Upcoming";
  if (status === "past") return "Final";
  return "Live";
}

function renderMatches() {
  const followedMatches = matches.filter(isFollowedMatch);
  const source = state.followed.size ? followedMatches : matches;
  const visibleMatches = source.filter(match => state.matchFilter === "all" || match.status === state.matchFilter);

  if (!visibleMatches.length) {
    els.matchList.innerHTML = `<div class="empty-state">No matches in this view yet. Try another tab or follow more players.</div>`;
    return;
  }

  els.matchList.innerHTML = visibleMatches
    .map(match => {
      const playerA = getPlayer(match.playerA);
      const playerB = getPlayer(match.playerB);
      const scoreA = match.scoreA || "Not started";
      const scoreB = match.scoreB || "";
      return `
        <article class="match-card">
          <div class="match-top">
            <div>
              <span class="round">${match.round}</span>
              <span class="status ${match.status}">${matchStatusLabel(match.status)}</span>
            </div>
            <div class="match-meta">${match.time}</div>
          </div>
          <div>
            <div class="score-row">
              <div class="competitor">${match.server === playerA.id ? '<span class="server-dot"></span>' : ""}${flagMarkup(playerA.code)} ${playerA.name}</div>
              <div class="score">${scoreA}</div>
            </div>
            <div class="score-row">
              <div class="competitor">${match.server === playerB.id ? '<span class="server-dot"></span>' : ""}${flagMarkup(playerB.code)} ${playerB.name}</div>
              <div class="score">${scoreB}</div>
            </div>
          </div>
          <div class="court">${match.court}</div>
        </article>
      `;
    })
    .join("");
}

function renderBriefing() {
  const followedPlayers = players.filter(player => state.followed.has(player.id));
  const liveCount = matches.filter(match => match.status === "live" && isFollowedMatch(match)).length;
  const nextMatches = matches.filter(match => match.status === "future" && isFollowedMatch(match));
  const pastCount = matches.filter(match => match.status === "past" && isFollowedMatch(match)).length;

  els.followSummary.textContent = `${state.followed.size} followed`;

  if (!followedPlayers.length) {
    els.briefingText.textContent = "Choose players from the men and women lists. Your schedule, live scores, and finished results will appear here.";
    els.radarTitle.textContent = "No followed matches yet";
    els.radarText.textContent = "The app is showing featured sample matches until you follow someone.";
    return;
  }

  const names = followedPlayers.slice(0, 3).map(player => player.name).join(", ");
  const more = followedPlayers.length > 3 ? ` and ${followedPlayers.length - 3} more` : "";
  els.briefingText.textContent = `You follow ${names}${more}. ${liveCount} live, ${nextMatches.length} upcoming, ${pastCount} completed.`;

  if (liveCount) {
    els.radarTitle.textContent = "Watch now";
    els.radarText.textContent = "One of your players is currently on court. The live card is at the top of your feed.";
  } else if (nextMatches.length) {
    const next = nextMatches[0];
    const playerA = getPlayer(next.playerA).name;
    const playerB = getPlayer(next.playerB).name;
    els.radarTitle.textContent = next.time;
    els.radarText.textContent = `${playerA} vs ${playerB} on ${next.court}.`;
  } else {
    els.radarTitle.textContent = "Quiet for now";
    els.radarText.textContent = "No upcoming sample matches for your followed players yet.";
  }
}

function render() {
  renderPlayers();
  renderMatches();
  renderBriefing();
}

document.querySelectorAll(".segment").forEach(button => {
  button.addEventListener("click", () => {
    state.draw = button.dataset.draw;
    document.querySelectorAll(".segment").forEach(item => item.classList.toggle("active", item === button));
    renderPlayers();
  });
});

document.querySelectorAll(".feed-tab").forEach(button => {
  button.addEventListener("click", () => {
    state.matchFilter = button.dataset.filter;
    document.querySelectorAll(".feed-tab").forEach(item => item.classList.toggle("active", item === button));
    renderMatches();
  });
});

els.playerSearch.addEventListener("input", event => {
  state.search = event.target.value;
  renderPlayers();
});

els.playerList.addEventListener("click", event => {
  const button = event.target.closest("[data-player]");
  if (!button) return;

  const playerId = button.dataset.player;
  if (state.followed.has(playerId)) {
    state.followed.delete(playerId);
  } else {
    state.followed.add(playerId);
  }

  saveFollows();
  render();
});

els.clearFollows.addEventListener("click", () => {
  state.followed.clear();
  saveFollows();
  render();
});

render();
