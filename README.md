# Commitchi

A Tamagotchi-style digital pet that lives or dies based on your GitHub commit activity.
Feed it commits. Keep it alive. Don't let it die.

**Live demo:** https://cludes.github.io/commitchi/?u=Cludes

---

## How it works

Your pet's survival is tied to your commit history:

| Situation | Pet state |
|---|---|
| Committed today + long streak | Ecstatic |
| Committed in the last 2 days | Happy |
| 3 days since last commit | Content |
| 4-6 days | Hungry |
| 7-10 days | Sad |
| 11-20 days | Critical |
| 21+ days without a commit | Dead |

Your pet's **species** is determined by your most-used language:

| Language | Pet |
|---|---|
| JavaScript / TypeScript | Hamster |
| Python | Snake |
| Lua | Moon Cat |
| Rust | Crab |
| Go | Gopher |
| Ruby | Gem |
| Everything else | Blob |

Your pet's **level**, **XP bar**, and **evolution stage** grow with your total commit
activity. A 12-week contribution heatmap and recent commit feed show on the device screen.

---

## Use it now

No setup needed. Just visit:

```
https://cludes.github.io/commitchi/?u=YOUR_GITHUB_USERNAME
```

Tap the SHARE YOUR PET button to copy a direct link to your creature.

---

## Self-host your own instance

Fork this repo and deploy your own copy in two steps:

**1. Fork this repo**

Click the Fork button at the top right of this page.

**2. Enable GitHub Pages**

In your forked repo: Settings - Pages - Source - select **GitHub Actions** - Save.

That's it. Every push to `main` or `master` will auto-deploy. Your instance will be live at:

```
https://YOUR_USERNAME.github.io/commitchi/
```

The base path is detected automatically from the repo name - no config needed.

---

## Run locally

```bash
git clone https://github.com/Cludes/commitchi.git
cd commitchi
npm install
npm run dev
```

Then open `http://localhost:5173` and enter any GitHub username.

---

## Notes

- Uses the public GitHub API - no authentication or API keys required
- The API allows 60 requests per hour per IP address unauthenticated
- Results are cached in your browser for 5 minutes to ease rate limits
- Only public commit activity is visible
- Activity data covers the last ~90 days of public events
