# Leonida Trophy Guide — GTA VI (PS5)

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/aggsslim/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/aggsslim/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI (1 platinum, 2 gold, 6 silver, 46 bronze), built for the [make.fun GTA 6 trophy guide bounty](https://make.fun/bounty/gta6-trophy-guide-01).

## What it does

- **Tracker** — a checklist of all 55 trophies with their official names, descriptions, grades and PSN counts. Tick one off and it stays ticked (saved in the browser's localStorage). Export progress to a JSON file and import it back.
- **Filters** — by kind (story, missable, collectibles, activities, online), by grade, and by text search. The official list has no online trophies, so the online filter shows an honest empty state instead of pretending otherwise.
- **Spoiler setting** — hides story trophies' names and descriptions until they are earned.
- **Guide pane** — every trophy has a guide in the maker's own words, with its sources named beside it as links (Exophase and PSNProfiles for the official list). Deep-link any trophy with `#trophy=<name>`, e.g. `#trophy=The Shootist`.
- **Roadmap to the platinum** — five stages built only from the official descriptions: story, side strands, collectibles, activities, endgame.
- **Missables page** — six possible missables, each flagged with the basis for the flag. The game released 19 November 2026 and no published guide has yet confirmed a missable, so each flag is labelled a candidate, not a fact.

## Honesty note

GTA 6 released on 19 November 2026 and community guides are barely a day old. Where a step is not pinned down by a cited source, the guide says so plainly instead of inventing a location or a step. A cited, honest guide beats an invented detailed one.

## Run it offline

No build step, no network. Serve `app/` with any static server and open `index.html`:

```sh
node serve.ts
# then open http://localhost:8080
```

Or serve `app/` with any other static server (for example `python3 -m http.server` inside `app/`). The app loads only files under `app/` and makes no network requests at run time.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

## Screenshots

Four real renders of the app, in `screenshots/`, documented in `shots.json`:

1. `1-cover.jpg` — tracker with a trophy guide open, progress and filters visible, spoilers on
2. `2-roadmap.jpg` — the roadmap to the platinum
3. `3-missables.jpg` — the missables page
4. `4-spoilers.jpg` — the spoiler setting at work

## Licence

MIT. Unofficial fan guide, not affiliated with or endorsed by Rockstar Games. Trophy names and descriptions are shown as PlayStation publishes them. No Rockstar logo, artwork, box art or game screenshots are used.
