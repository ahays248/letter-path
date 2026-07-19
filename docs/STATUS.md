# Status — Letter Path

**Latest handoff:** **`docs/HANDOFF.md`**  
**Last updated:** 2026-07-19 (R-7 / R-6b / R-9)  
**Phase:** core loop kept; touch + dialogue + **public web share**  
**Health:** on track  

## Current goal

Path-first spelling for ~6yo: animals, letter gates, stars, bow on back; family can open a free URL; later reward hub (dog) / shoot only after design.

## Live share

| | |
|--|--|
| **URL** | https://ahays248.github.io/letter-path/ |
| **Repo** | https://github.com/ahays248/letter-path |
| **Redeploy** | `./scripts/deploy-github-pages.sh` |

## Next session

| Prefer | Id | Notes |
|--------|-----|--------|
| 1 | **R-8** | Playtest on phone with live URL |
| 2 | **R-11** | Design pass only (hub + dog) |
| 3 | **R-12** | Design pass only (shoot toy) |

**Done this arc:** R-7 touch · R-6b audio + toast (no corner text) · thin HUD · R-9 Pages · R-11/12 design notes parked  

## Shipped

| Item | Notes |
|------|--------|
| Core R-0…R-6 | Loop + unlock |
| R-7 | On-screen L/R, swipe; parent gear for mute / name·sound |
| R-6b | Letter sound mode; toast only on word/set complete |
| HUD | Thin center-top strip; middle clear for animal |
| R-9 | GitHub Pages family URL |
| Bow | GLB modular, back carry, taut string, sockets |

## Run

```bash
cd /mnt/c/Users/datav/Games/LetterPath && python3 -m http.server 8080
```
