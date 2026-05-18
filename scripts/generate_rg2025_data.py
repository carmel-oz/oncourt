import html
import json
import re
import urllib.request
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "rg2025.js"
BASE = "https://www.rolandgarros.com/en-us/results/{draw}?round={round}&year=2025"

ROUNDS = {
    1: "First Round",
    2: "Second Round",
    3: "Third Round",
    4: "Fourth Round",
    5: "Quarterfinals",
    6: "Semifinals",
    7: "Final",
}

DRAW_LABELS = {
    "SM": "men",
    "SD": "women",
}


class MatchLinkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_match = False
        self.text = []
        self.flags = []
        self.matches = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "a" and "/en-us/matches/" in attrs.get("href", ""):
            self.in_match = True
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
            if "Court" in line or "court" in line:
                self.matches.append({"line": html.unescape(line), "flags": self.flags[:2]})
            self.in_match = False


def scoreish(token):
    return bool(re.fullmatch(r"(?:\d+|R\.|RET\.|w/o\.|W/O)", token))


def strip_entry_markers(tokens):
    return [token for token in tokens if token not in {"(Q)", "(W)", "(L)", "(PR)", "(LL)"}]


def parse_player(tokens):
    clean = strip_entry_markers(tokens)
    seed = None
    status = None
    name_parts = []
    for token in clean:
        seed_match = re.fullmatch(r"\((\d+)\)", token)
        if seed_match:
            seed = int(seed_match.group(1))
        elif token in {"R.", "RET.", "w/o.", "W/O"}:
            status = token
        else:
            name_parts.append(token)
    return {
        "name": " ".join(name_parts).strip(),
        "seed": seed,
        "status": status,
    }


def parse_line(line, flags, draw, round_number):
    round_key = ROUNDS[round_number].lower()
    lower = line.lower()
    if round_key.lower() not in lower:
        return None

    before, after = re.split(rf"\s+-\s+{re.escape(round_key)}\s+", line, flags=re.I, maxsplit=1)
    duration_match = re.match(r"(?P<duration>\d+h\d{2}|w/o\.)\s+(?P<body>.+)", after)
    if not duration_match:
        return None

    body_tokens = duration_match.group("body").split()
    first_score = next((idx for idx, token in enumerate(body_tokens) if scoreish(token)), None)
    if first_score is None:
        return None

    player_a_tokens = body_tokens[:first_score]
    rest = body_tokens[first_score:]
    player_b_start = next((idx for idx, token in enumerate(rest) if not scoreish(token)), None)
    if player_b_start is None:
        return None

    score_a = rest[:player_b_start]
    rest_b = rest[player_b_start:]
    score_b_start = next((idx for idx, token in enumerate(rest_b) if scoreish(token)), len(rest_b))
    player_b_tokens = rest_b[:score_b_start]
    score_b = rest_b[score_b_start:]

    player_a = parse_player(player_a_tokens)
    player_b = parse_player(player_b_tokens)
    if not player_a["name"] or not player_b["name"]:
        return None

    return {
        "id": f"2025-{draw}-{round_number}-{abs(hash(line))}",
        "year": 2025,
        "draw": DRAW_LABELS[draw],
        "status": "past",
        "round": ROUNDS[round_number],
        "court": before.strip(),
        "time": "Completed",
        "duration": duration_match.group("duration"),
        "playerA": player_a["name"],
        "playerB": player_b["name"],
        "playerACode": flags[0] if len(flags) > 0 else "UNK",
        "playerBCode": flags[1] if len(flags) > 1 else "UNK",
        "playerASeed": player_a["seed"],
        "playerBSeed": player_b["seed"],
        "scoreA": " ".join(score_a),
        "scoreB": " ".join(score_b),
        "sourceLine": line,
    }


def fetch_matches(draw, round_number):
    url = BASE.format(draw=draw, round=round_number)
    with urllib.request.urlopen(url, timeout=30) as response:
        html_text = response.read().decode("utf-8", errors="replace")
    parser = MatchLinkParser()
    parser.feed(html_text)
    matches = []
    for item in parser.matches:
        match = parse_line(item["line"], item["flags"], draw, round_number)
        if match:
            matches.append(match)
    return matches


def build():
    matches = []
    for draw in DRAW_LABELS:
        for round_number in ROUNDS:
            matches.extend(fetch_matches(draw, round_number))

    players = {}
    for match in matches:
        for side in ("A", "B"):
            name = match[f"player{side}"]
            code = match[f"player{side}Code"]
            seed = match[f"player{side}Seed"]
            key = f"{match['draw']}:{name}"
            existing = players.get(key)
            players[key] = {
                "id": key,
                "draw": match["draw"],
                "name": name,
                "country": code,
                "code": code,
                "seed": seed if seed is not None else (existing or {}).get("seed"),
            }

    data = {
        "players": sorted(players.values(), key=lambda item: (item["draw"], item["name"])),
        "matches": matches,
        "source": "https://www.rolandgarros.com/en-us/results",
    }

    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(
        "window.RG_2025_DATA = " + json.dumps(data, indent=2, ensure_ascii=True) + ";\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(data['players'])} players and {len(matches)} matches to {OUT}")


if __name__ == "__main__":
    build()
