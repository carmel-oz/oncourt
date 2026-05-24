import html
import json
import re
import urllib.request
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "rg2026.js"
BASE = "https://www.rolandgarros.com/en-us/results/{draw}?round=1&year=2026"
HOST = "https://www.rolandgarros.com"

DRAW_LABELS = {
    "SM": "men",
    "SD": "women",
}


class MatchLinkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_match = False
        self.href = ""
        self.text = []
        self.flags = []
        self.matches = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        href = attrs.get("href", "")
        if tag == "a" and "/en-us/matches/2026/" in href:
            self.in_match = True
            self.href = href
            self.text = []
            self.flags = []
        if self.in_match and tag == "img":
            src = attrs.get("src", "")
            alt = attrs.get("alt", "")
            if "flags-svg" in src and alt and alt.lower() != "nul":
                self.flags.append(alt.upper())

    def handle_data(self, data):
        if self.in_match:
            cleaned = " ".join(data.split())
            if cleaned:
                self.text.append(cleaned)

    def handle_endtag(self, tag):
        if tag == "a" and self.in_match:
            line = " ".join(self.text)
            if "first round" in line.lower():
                self.matches.append(
                    {
                        "href": self.href,
                        "line": html.unescape(line),
                        "flags": self.flags[:2],
                    }
                )
            self.in_match = False


def is_seed(token):
    return bool(re.fullmatch(r"\(\d+\)", token))


def strip_entry(token):
    return token not in {"(Q)", "(W)", "(L)", "(LL)", "(PR)"}


def parse_seed(tokens):
    for token in tokens:
        if is_seed(token):
            return int(token[1:-1])
    return None


def clean_name(tokens):
    return " ".join(token for token in tokens if strip_entry(token) and not is_seed(token)).strip()


def scoreish(token):
    return bool(re.fullmatch(r"(?:\d+|R\.|RET\.|w/o\.|W/O)", token))


def score_tokens(score):
    return [token.replace(".", "") for token in score.split() if token]


def parse_score_sets(score_a, score_b):
    a_tokens = score_tokens(score_a)
    b_tokens = score_tokens(score_b)
    a_scores = [int(token) for token in a_tokens if token.isdigit()]
    b_scores = [int(token) for token in b_tokens if token.isdigit()]
    sets = []
    index = 0

    while index < len(a_scores) and index < len(b_scores):
        a_score = a_scores[index]
        b_score = b_scores[index]
        next_a = a_scores[index + 1] if index + 1 < len(a_scores) else None
        next_b = b_scores[index + 1] if index + 1 < len(b_scores) else None
        is_tiebreak_set = (a_score == 7 and b_score == 6) or (a_score == 6 and b_score == 7)
        has_tiebreak_pair = next_a is not None and next_b is not None and max(next_a, next_b) >= 7
        sets.append((a_score, b_score))
        index += 2 if is_tiebreak_set and has_tiebreak_pair else 1

    completed_sets = [
        (a_score, b_score)
        for a_score, b_score in sets
        if ((a_score == 7 and b_score == 6) or (a_score == 6 and b_score == 7))
        or (max(a_score, b_score) >= 6 and abs(a_score - b_score) >= 2)
    ]
    a_sets = sum(1 for a_score, b_score in completed_sets if a_score > b_score)
    b_sets = sum(1 for a_score, b_score in completed_sets if b_score > a_score)
    return a_sets, b_sets


def parse_score_body(body):
    duration = None
    duration_match = re.match(r"(?P<duration>\d+h\d{2}|w/o\.)\s+(?P<body>.+)", body, flags=re.I)
    if duration_match:
        duration = duration_match.group("duration")
        body = duration_match.group("body")

    body_tokens = body.split()
    first_score = next((idx for idx, token in enumerate(body_tokens) if scoreish(token)), None)
    if first_score is None:
        return body, "", "", duration

    player_a_tokens = body_tokens[:first_score]
    rest = body_tokens[first_score:]
    player_b_start = next((idx for idx, token in enumerate(rest) if not scoreish(token)), None)
    if player_b_start is None:
        return body, "", "", duration

    score_a = rest[:player_b_start]
    rest_b = rest[player_b_start:]
    score_b_start = next((idx for idx, token in enumerate(rest_b) if scoreish(token)), len(rest_b))
    player_b_tokens = rest_b[:score_b_start]
    score_b = rest_b[score_b_start:]
    return " ".join(player_a_tokens + player_b_tokens), " ".join(score_a), " ".join(score_b), duration


def match_status(draw, score_a, score_b, duration=None):
    if duration and duration.lower() == "w/o.":
        return "past"
    if not score_a and not score_b:
        return "future"
    if any(token.upper() in {"R", "RET", "W/O"} for token in score_tokens(f"{score_a} {score_b}")):
        return "past"

    a_sets, b_sets = parse_score_sets(score_a, score_b)
    needed_sets = 3 if draw == "SM" else 2
    return "past" if max(a_sets, b_sets) >= needed_sets else "live"


def split_players(body):
    tokens = body.split()
    candidates = []
    for idx in range(1, len(tokens)):
        left = tokens[:idx]
        right = tokens[idx:]
        left_names = [token for token in left if strip_entry(token) and not is_seed(token)]
        right_names = [token for token in right if strip_entry(token) and not is_seed(token)]
        if not left_names or not right_names:
            continue
        if not left_names[0].startswith(tuple("ABCDEFGHIJKLMNOPQRSTUVWXYZ")):
            continue
        if not right_names[0].startswith(tuple("ABCDEFGHIJKLMNOPQRSTUVWXYZ")):
            continue
        score = abs(len(left_names) - len(right_names))
        if is_seed(left[-1]):
            score -= 0.5
        if len(right) > 1 and is_seed(right[-1]):
            score -= 0.5
        candidates.append((score, idx))
    if not candidates:
        return tokens[:1], tokens[1:]
    _, split_at = min(candidates, key=lambda item: item[0])
    return tokens[:split_at], tokens[split_at:]


def extract_court_and_body(line):
    scheduled = re.match(r"(?P<court>.+?)\s+-\s+first round\s+(?P<body>.+)", line, flags=re.I)
    if scheduled:
        return scheduled.group("court").strip(), scheduled.group("body").strip()
    return "Court TBD", re.sub(r"^first round\s+", "", line, flags=re.I).strip()


def normal_name(first_name, last_name):
    return f"{first_name} {last_name.title()}".strip()


def fetch_match_players(href, fallback_flags):
    with urllib.request.urlopen(f"{HOST}{href}", timeout=30) as response:
        html_text = response.read().decode("utf-8", errors="replace")

    player_pattern = re.compile(
        r'id:(?P<id>\d+),firstName:"(?P<first>[^"]+)",lastName:"(?P<last>[^"]+)".*?'
        r'country:"(?P<country>[A-Z-]+)"',
        flags=re.S,
    )
    players = []
    seen = set()
    for match in player_pattern.finditer(html_text):
        player_id = match.group("id")
        if player_id in seen:
            continue
        seen.add(player_id)
        players.append(
            {
                "rgId": player_id,
                "name": normal_name(match.group("first"), match.group("last")),
                "code": match.group("country"),
            }
        )
        if len(players) == 2:
            return players

    return [
        {"rgId": None, "name": None, "code": fallback_flags[0] if len(fallback_flags) > 0 else "UNK"},
        {"rgId": None, "name": None, "code": fallback_flags[1] if len(fallback_flags) > 1 else "UNK"},
    ]


def parse_match(item, draw):
    match_id = item["href"].rstrip("/").split("/")[-1]
    court, body = extract_court_and_body(item["line"])
    player_body, score_a, score_b, duration = parse_score_body(body)
    status = match_status(draw, score_a, score_b, duration)
    player_a_tokens, player_b_tokens = split_players(player_body)
    match_players = fetch_match_players(item["href"], item["flags"])
    player_a = match_players[0]["name"] or clean_name(player_a_tokens)
    player_b = match_players[1]["name"] or clean_name(player_b_tokens)
    if not player_a or not player_b:
        return None

    flags = item["flags"]
    code_a = match_players[0]["code"] or (flags[0] if len(flags) > 0 else "UNK")
    code_b = match_players[1]["code"] or (flags[1] if len(flags) > 1 else "UNK")
    player_a_id = match_players[0]["rgId"] or player_a
    player_b_id = match_players[1]["rgId"] or player_b

    return {
        "id": match_id,
        "year": 2026,
        "draw": DRAW_LABELS[draw],
        "status": status,
        "round": "First Round",
        "court": court,
        "time": "Completed" if status == "past" else "Live now" if status == "live" else "Schedule TBD",
        "duration": duration,
        "playerA": f"{DRAW_LABELS[draw]}:{player_a_id}",
        "playerB": f"{DRAW_LABELS[draw]}:{player_b_id}",
        "playerAName": player_a,
        "playerBName": player_b,
        "playerACode": code_a,
        "playerBCode": code_b,
        "playerASeed": parse_seed(player_a_tokens),
        "playerBSeed": parse_seed(player_b_tokens),
        "scoreA": score_a,
        "scoreB": score_b,
        "sourceLine": item["line"],
        "sourceUrl": f"https://www.rolandgarros.com{item['href']}",
    }


def fetch_matches(draw):
    with urllib.request.urlopen(BASE.format(draw=draw), timeout=30) as response:
        html_text = response.read().decode("utf-8", errors="replace")
    parser = MatchLinkParser()
    parser.feed(html_text)
    return [match for item in parser.matches if (match := parse_match(item, draw))]


def build():
    matches = []
    for draw in DRAW_LABELS:
        matches.extend(fetch_matches(draw))

    players = {}
    for match in matches:
        for side in ("A", "B"):
            player_id = match[f"player{side}"]
            name = match[f"player{side}Name"]
            code = match[f"player{side}Code"]
            seed = match[f"player{side}Seed"]
            existing = players.get(player_id, {})
            players[player_id] = {
                "id": player_id,
                "draw": match["draw"],
                "name": name,
                "country": code,
                "code": code,
                "seed": seed if seed is not None else existing.get("seed"),
            }

    data = {
        "players": sorted(players.values(), key=lambda item: (item["draw"], item["name"])),
        "matches": matches,
        "source": "https://www.rolandgarros.com/en-us/results",
    }

    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(
        "window.RG_2026_DATA = " + json.dumps(data, indent=2, ensure_ascii=True) + ";\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(data['players'])} players and {len(matches)} matches to {OUT}")


if __name__ == "__main__":
    build()
