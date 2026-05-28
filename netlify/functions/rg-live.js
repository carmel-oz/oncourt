const HOST = "https://www.rolandgarros.com";
const DRAW_LABELS = {
  SM: "men",
  SD: "women"
};
const ROUND_LABELS = {
  first: "First Round",
  second: "Second Round",
  third: "Third Round",
  fourth: "Fourth Round",
  quarterfinals: "Quarterfinals",
  semifinals: "Semifinals",
  final: "Final"
};

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreish(token) {
  return /^(?:\d+|R\.|RET\.|w\/o\.|W\/O)$/i.test(token);
}

function stripEntry(token) {
  return !["(Q)", "(W)", "(L)", "(LL)", "(PR)"].includes(token);
}

function isSeed(token) {
  return /^\(\d+\)$/.test(token);
}

function scoreTokens(score) {
  return String(score || "")
    .split(/\s+/)
    .filter(Boolean)
    .map(token => token.replace(".", ""));
}

function parseScoreSets(scoreA, scoreB) {
  const aScores = scoreTokens(scoreA).filter(token => !Number.isNaN(Number(token))).map(Number);
  const bScores = scoreTokens(scoreB).filter(token => !Number.isNaN(Number(token))).map(Number);
  const sets = [];
  let index = 0;

  while (index < aScores.length && index < bScores.length) {
    const a = aScores[index];
    const b = bScores[index];
    const nextA = aScores[index + 1];
    const nextB = bScores[index + 1];
    const isTiebreakSet = (a === 7 && b === 6) || (a === 6 && b === 7);
    const hasTiebreakPair = Number.isFinite(nextA) && Number.isFinite(nextB) && Math.max(nextA, nextB) >= 7;
    sets.push({ a, b });
    index += isTiebreakSet && hasTiebreakPair ? 2 : 1;
  }

  const completedSets = sets.filter(set => {
    const isTiebreakSet = (set.a === 7 && set.b === 6) || (set.a === 6 && set.b === 7);
    const isStandardSet = Math.max(set.a, set.b) >= 6 && Math.abs(set.a - set.b) >= 2;
    return isTiebreakSet || isStandardSet;
  });

  return {
    aSets: completedSets.filter(set => set.a > set.b).length,
    bSets: completedSets.filter(set => set.b > set.a).length
  };
}

function matchStatus(draw, scoreA, scoreB, duration = "") {
  if (duration.toLowerCase() === "w/o.") return "past";
  if (!scoreA && !scoreB) return "future";
  if (scoreTokens(`${scoreA} ${scoreB}`).some(token => ["R", "RET", "W/O"].includes(token.toUpperCase()))) {
    return "past";
  }

  const { aSets, bSets } = parseScoreSets(scoreA, scoreB);
  const neededSets = draw === "SM" ? 3 : 2;
  return Math.max(aSets, bSets) >= neededSets ? "past" : "live";
}

function splitPlayers(body) {
  const tokens = body.split(/\s+/).filter(Boolean);
  const nextPlayerIndex = tokens.findIndex((token, index) => index > 0 && /^[A-Z]{1,3}\./.test(token));
  if (nextPlayerIndex > 0) {
    return [tokens.slice(0, nextPlayerIndex), tokens.slice(nextPlayerIndex)];
  }

  const candidates = [];

  for (let idx = 1; idx < tokens.length; idx += 1) {
    const leftNames = tokens.slice(0, idx).filter(token => stripEntry(token) && !isSeed(token));
    const rightNames = tokens.slice(idx).filter(token => stripEntry(token) && !isSeed(token));
    if (!leftNames.length || !rightNames.length) continue;
    if (!/^[A-Z]/.test(leftNames[0]) || !/^[A-Z]/.test(rightNames[0])) continue;

    let score = Math.abs(leftNames.length - rightNames.length);
    if (isSeed(tokens[idx - 1])) score -= 0.5;
    if (tokens[idx + 1] && isSeed(tokens[tokens.length - 1])) score -= 0.5;
    candidates.push({ score, idx });
  }

  candidates.sort((a, b) => a.score - b.score);
  const splitAt = candidates[0]?.idx || 1;
  return [tokens.slice(0, splitAt), tokens.slice(splitAt)];
}

function cleanName(tokens) {
  return tokens.filter(token => stripEntry(token) && !isSeed(token)).join(" ").trim();
}

function parseScoreBody(body) {
  let duration = "";
  const durationMatch = body.match(/^(\d+h\d{2}|w\/o\.)\s+(.+)/i);
  if (durationMatch) {
    duration = durationMatch[1];
    body = durationMatch[2];
  }

  const tokens = body.split(/\s+/).filter(Boolean);
  const firstScore = tokens.findIndex(scoreish);
  if (firstScore === -1) return { playerBody: body, scoreA: "", scoreB: "", duration };

  const playerATokens = tokens.slice(0, firstScore);
  const rest = tokens.slice(firstScore);
  const playerBStart = rest.findIndex(token => !scoreish(token));
  if (playerBStart === -1) return { playerBody: body, scoreA: "", scoreB: "", duration };

  const scoreA = rest.slice(0, playerBStart);
  const restB = rest.slice(playerBStart);
  const scoreBStart = restB.findIndex(scoreish);
  const playerBTokens = restB.slice(0, scoreBStart === -1 ? restB.length : scoreBStart);
  const scoreB = scoreBStart === -1 ? [] : restB.slice(scoreBStart);

  return {
    playerBody: [...playerATokens, ...playerBTokens].join(" "),
    scoreA: scoreA.join(" "),
    scoreB: scoreB.join(" "),
    duration
  };
}

function parseMatch(draw, href, cardHtml) {
  const id = href.split("/").pop();
  const text = stripTags(cardHtml);
  const roundMatch = text.match(/(?:(.+?)\s+-\s+)?(first|second|third|fourth) round\s+(.+)/i)
    || text.match(/(?:(.+?)\s+-\s+)?(quarterfinals|semifinals|final)\s+(.+)/i);
  if (!roundMatch) return null;

  const court = (roundMatch[1] || "Court TBD").trim();
  const roundKey = roundMatch[2].toLowerCase();
  const { playerBody, scoreA, scoreB, duration } = parseScoreBody(roundMatch[3].trim());
  const [playerATokens, playerBTokens] = splitPlayers(playerBody);
  const status = matchStatus(draw, scoreA, scoreB, duration);

  return {
    id,
    draw: DRAW_LABELS[draw],
    status,
    round: ROUND_LABELS[roundKey] || `${roundMatch[2]} Round`,
    court,
    time: status === "past" ? "Completed" : status === "live" ? "Live now" : "Schedule TBD",
    duration,
    scoreA,
    scoreB,
    playerAName: cleanName(playerATokens),
    playerBName: cleanName(playerBTokens)
  };
}

async function fetchDrawRound(draw, round) {
  const response = await fetch(`${HOST}/en-us/results/${draw}?round=${round}&year=2026`, {
    headers: { "user-agent": "OnCourt live score refresh" }
  });
  if (!response.ok) throw new Error(`Roland-Garros ${draw} round ${round} returned ${response.status}`);

  const html = await response.text();
  const matches = [];
  const cardPattern = /<a href="(\/en-us\/matches\/2026\/(SM|SD)\d+)"[\s\S]*?<\/a>/g;
  let match;
  while ((match = cardPattern.exec(html))) {
    if (!match[1].includes(`/${draw}`)) continue;
    const parsed = parseMatch(draw, match[1], match[0]);
    if (parsed) matches.push(parsed);
  }
  return matches;
}

async function fetchDraw(draw) {
  const rounds = await Promise.all([1, 2, 3, 4, 5, 6, 7].map(round => fetchDrawRound(draw, round)));
  const matchesById = new Map();
  rounds.flat().forEach(match => matchesById.set(match.id, match));
  return [...matchesById.values()];
}

exports.handler = async () => {
  const headers = {
    "content-type": "application/json",
    "cache-control": "no-store, max-age=0",
    "access-control-allow-origin": "*"
  };

  try {
    const matches = (await Promise.all(["SM", "SD"].map(fetchDraw))).flat();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        source: `${HOST}/en-us/results`,
        updatedAt: new Date().toISOString(),
        matches
      })
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
