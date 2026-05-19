const players2026 = [
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

const matches2026 = [
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
    scoreB: "4 5 3"
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
    scoreB: "6 3 4"
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

const tournaments = {
  2025: {
    label: "Roland-Garros 2025",
    realData: true,
    players: (window.RG_2025_DATA && window.RG_2025_DATA.players) || [],
    matches: (window.RG_2025_DATA && window.RG_2025_DATA.matches) || []
  },
  2026: {
    label: "Roland-Garros 2026",
    realData: false,
    players: players2026,
    matches: matches2026
  }
};

const countryNames = {
  "---": "Neutral",
  ARG: "Argentina",
  ARM: "Armenia",
  AUS: "Australia",
  AUT: "Austria",
  BEL: "Belgium",
  BIH: "Bosnia and Herzegovina",
  BOL: "Bolivia",
  BRA: "Brazil",
  BUL: "Bulgaria",
  CAN: "Canada",
  CHI: "Chile",
  CHN: "China",
  COL: "Colombia",
  CRO: "Croatia",
  CZE: "Czech Republic",
  DEN: "Denmark",
  EGY: "Egypt",
  ESP: "Spain",
  FRA: "France",
  GBR: "Great Britain",
  GEO: "Georgia",
  GER: "Germany",
  GRE: "Greece",
  HUN: "Hungary",
  ITA: "Italy",
  JPN: "Japan",
  KAZ: "Kazakhstan",
  LAT: "Latvia",
  LBN: "Lebanon",
  MEX: "Mexico",
  NED: "Netherlands",
  NOR: "Norway",
  NZL: "New Zealand",
  PHI: "Philippines",
  POL: "Poland",
  POR: "Portugal",
  ROU: "Romania",
  RSA: "South Africa",
  SRB: "Serbia",
  SUI: "Switzerland",
  SVK: "Slovakia",
  TPE: "Chinese Taipei",
  TUN: "Tunisia",
  TUR: "Turkey",
  UKR: "Ukraine",
  USA: "United States"
};

const state = {
  year: "2026",
  draw: "men",
  matchFilter: "all",
  search: "",
  followed: loadFollows("2026")
};

const els = {
  followSummary: document.querySelector("#followSummary"),
  briefingTitle: document.querySelector("#briefingTitle"),
  briefingText: document.querySelector("#briefingText"),
  radarTitle: document.querySelector("#radarTitle"),
  radarText: document.querySelector("#radarText"),
  playerSearch: document.querySelector("#playerSearch"),
  playersTitle: document.querySelector("#playersTitle"),
  feedTitle: document.querySelector("#feedTitle"),
  playerList: document.querySelector("#playerList"),
  matchList: document.querySelector("#matchList"),
  clearFollows: document.querySelector("#clearFollows")
};

function loadFollows(year) {
  return new Set(JSON.parse(localStorage.getItem(`oncourt-followed-${year}`) || "[]"));
}

function currentTournament() {
  return tournaments[state.year];
}

function currentPlayers() {
  return currentTournament().players;
}

function currentMatches() {
  return currentTournament().matches;
}

function playerIdForMatch(match, side) {
  const value = match[`player${side}`];
  if (String(state.year) === "2025") {
    return `${match.draw}:${value}`;
  }
  return value;
}

function flagMarkup(code) {
  if (!code) return `<span class="flag-icon flag-un" aria-hidden="true"></span>`;
  if (code.length === 3) {
    return `<img class="flag-img" src="https://www.rolandgarros.com/img/flags-svg/${code}.svg" alt="" aria-hidden="true" />`;
  }
  return `<span class="flag-icon flag-${code.toLowerCase()}" aria-hidden="true"></span>`;
}

function countryName(player) {
  return countryNames[player.code] || player.country || "Country unavailable";
}

function getPlayer(id) {
  return currentPlayers().find(player => player.id === id);
}

function isFollowedMatch(match) {
  return state.followed.has(playerIdForMatch(match, "A")) || state.followed.has(playerIdForMatch(match, "B"));
}

function saveFollows() {
  localStorage.setItem(`oncourt-followed-${state.year}`, JSON.stringify([...state.followed]));
}

function playerSub(player) {
  const seed = player.seed ? `Seed ${player.seed}` : "Unseeded";
  return `${seed} · ${countryName(player)}`;
}

function playerSearchText(player) {
  return `${player.name} ${player.country || ""} ${player.code || ""} ${countryName(player)}`.toLowerCase();
}

function renderPlayers() {
  const search = state.search.trim().toLowerCase();
  const visiblePlayers = currentPlayers().filter(player => {
    const matchesDraw = player.draw === state.draw;
    const matchesSearch = !search || playerSearchText(player).includes(search);
    return matchesDraw && matchesSearch;
  });

  els.playersTitle.textContent = `${state.year} favorites`;

  els.playerList.innerHTML = visiblePlayers
    .map(player => {
      const active = state.followed.has(player.id);
      return `
        <article class="player-row">
          <div class="flag">${flagMarkup(player.code)}</div>
          <div class="player-meta">
            <div class="player-name">${player.name}</div>
            <div class="player-sub">${playerSub(player)}</div>
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

function scoreTokens(score) {
  return String(score || "")
    .split(/\s+/)
    .filter(Boolean)
    .map(token => token.replace(".", ""));
}

function parseScoreSets(match) {
  const aTokens = scoreTokens(match.scoreA);
  const bTokens = scoreTokens(match.scoreB);
  const aStatus = aTokens.find(token => Number.isNaN(Number(token)));
  const bStatus = bTokens.find(token => Number.isNaN(Number(token)));
  const aScores = aTokens.filter(token => !Number.isNaN(Number(token))).map(Number);
  const bScores = bTokens.filter(token => !Number.isNaN(Number(token))).map(Number);
  const sets = [];
  let index = 0;

  while (index < aScores.length && index < bScores.length) {
    const a = aScores[index];
    const b = bScores[index];
    const set = { a, b };
    const nextA = aScores[index + 1];
    const nextB = bScores[index + 1];
    const isTiebreakSet = (a === 7 && b === 6) || (a === 6 && b === 7);
    const hasTiebreakPair = Number.isFinite(nextA) && Number.isFinite(nextB) && Math.max(nextA, nextB) >= 7;

    if (isTiebreakSet && hasTiebreakPair) {
      set.tiebreakA = nextA;
      set.tiebreakB = nextB;
      index += 2;
    } else {
      index += 1;
    }

    sets.push(set);
  }

  return { sets, aStatus, bStatus };
}

function renderScoreGrid(match) {
  const parsed = parseScoreSets(match);

  if (!parsed.sets.length) {
    return `
      <div class="score-grid pending-score">
        <div class="score-empty">Not started</div>
      </div>
    `;
  }

  const headers = parsed.sets.map((_, index) => `<span>${index + 1}</span>`).join("");
  const row = side =>
    parsed.sets
      .map(set => {
        const main = side === "a" ? set.a : set.b;
        const tiebreak = side === "a" ? set.tiebreakA : set.tiebreakB;
        return `
          <span class="set-score">
            ${main}
            ${Number.isFinite(tiebreak) ? `<small>${tiebreak}</small>` : ""}
          </span>
        `;
      })
      .join("");

  return `
    <div class="score-grid" style="--set-count: ${parsed.sets.length}">
      <div class="set-header">${headers}</div>
      <div class="set-row">${row("a")}</div>
      <div class="set-row">${row("b")}</div>
    </div>
  `;
}

function renderMatches() {
  const allMatches = currentMatches();
  const followedMatches = allMatches.filter(isFollowedMatch);
  const visibleMatches = state.followed.size
    ? followedMatches.filter(match => state.matchFilter === "all" || match.status === state.matchFilter)
    : [];

  els.feedTitle.textContent = `${currentTournament().label} matches`;

  if (!visibleMatches.length) {
    const emptyText = state.followed.size
      ? "No matches in this view yet. Try another tab or follow more players."
      : "No favorites selected yet. Pick players from the list to build your personal match feed.";
    els.matchList.innerHTML = `<div class="empty-state">${emptyText}</div>`;
    return;
  }

  els.matchList.innerHTML = visibleMatches
    .map(match => {
      const playerA = getPlayer(playerIdForMatch(match, "A"));
      const playerB = getPlayer(playerIdForMatch(match, "B"));
      if (!playerA || !playerB) return "";
      const duration = match.duration ? ` · ${match.duration}` : "";
      const scoreGrid = renderScoreGrid(match);
      return `
        <article class="match-card">
          <div class="match-top">
            <div>
              <span class="round">${match.round}</span>
              <span class="status ${match.status}">${matchStatusLabel(match.status)}</span>
            </div>
            <div class="match-meta">${match.time}${duration}</div>
          </div>
          <div class="scoreboard">
            <div class="competitors">
              <div class="competitor">${match.server === playerA.id ? '<span class="server-dot"></span>' : ""}${flagMarkup(playerA.code)} ${playerA.name}</div>
              <div class="competitor">${match.server === playerB.id ? '<span class="server-dot"></span>' : ""}${flagMarkup(playerB.code)} ${playerB.name}</div>
            </div>
            ${scoreGrid}
          </div>
          <div class="court">${match.court}</div>
        </article>
      `;
    })
    .join("");
}

function renderBriefing() {
  const allMatches = currentMatches();
  const followedPlayers = currentPlayers().filter(player => state.followed.has(player.id));
  const liveCount = allMatches.filter(match => match.status === "live" && isFollowedMatch(match)).length;
  const nextMatches = allMatches.filter(match => match.status === "future" && isFollowedMatch(match));
  const pastCount = allMatches.filter(match => match.status === "past" && isFollowedMatch(match)).length;

  els.followSummary.textContent = `${state.followed.size} followed`;

  if (String(state.year) === "2025") {
    els.briefingTitle.textContent = "2025 tournament archive";
    if (!followedPlayers.length) {
      els.briefingText.textContent = `Browse ${currentPlayers().length} real 2025 singles players and ${allMatches.length} completed matches from Roland-Garros. Follow a player to filter the archive.`;
      els.radarTitle.textContent = "Completed tournament";
      els.radarText.textContent = "No live or upcoming matches here. This tab is a finished-results archive.";
      return;
    }
    const names = followedPlayers.slice(0, 3).map(player => player.name).join(", ");
    const more = followedPlayers.length > 3 ? ` and ${followedPlayers.length - 3} more` : "";
    els.briefingText.textContent = `You follow ${names}${more}. Showing ${pastCount} completed 2025 matches for your players.`;
    els.radarTitle.textContent = `${pastCount} archive matches`;
    els.radarText.textContent = "Use All or Past to review their completed Roland-Garros 2025 run.";
    return;
  }

  els.briefingTitle.textContent = "Your personal tournament desk";
  if (!followedPlayers.length) {
    els.briefingText.textContent = "Choose players from the men and women lists. Your schedule, live scores, and finished results will appear here.";
    els.radarTitle.textContent = "No followed matches yet";
    els.radarText.textContent = "Your feed stays empty until you choose favorites.";
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
    const playerA = getPlayer(playerIdForMatch(next, "A")).name;
    const playerB = getPlayer(playerIdForMatch(next, "B")).name;
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

document.querySelectorAll(".year-tab").forEach(button => {
  button.addEventListener("click", () => {
    state.year = button.dataset.year;
    state.followed = loadFollows(state.year);
    state.matchFilter = "all";
    document.querySelectorAll(".year-tab").forEach(item => item.classList.toggle("active", item === button));
    document.querySelectorAll(".feed-tab").forEach(item => item.classList.toggle("active", item.dataset.filter === "all"));
    render();
  });
});

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
