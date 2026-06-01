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

## Put your pet on your GitHub profile

Your profile README can't run JavaScript, but it can show an image. This repo ships
a GitHub Action that regenerates an SVG of your pet once a day and commits it as
`commitchi.svg`, so you can embed a live, self-updating pet on your profile.

**1. Fork this repo** (see below) so the Action runs under your account.

**2. Let the Action run.** It runs daily at 06:00 UTC, and you can trigger it
manually from the Actions tab (Update Pet SVG - Run workflow). It uses your account
(`github.repository_owner`) automatically, so no config is needed. It produces
`commitchi.svg` in the repo root.

**3. Add the image to your profile README.** Create a repo named exactly your
username (e.g. `Cludes/Cludes`), and put this in its `README.md`:

```markdown
![My Commitchi](https://raw.githubusercontent.com/YOUR_USERNAME/commitchi/master/commitchi.svg)
```

The pet's mood, level, streak, and stats update every day as you commit.

### Auto-embed in your profile (optional)

You can have the Action insert that image line into your profile README for you,
so you never touch it manually. Because the Action's built-in token can only write
to this repo, you need to give it write access to your profile repo via a token:

1. Create a [Personal Access Token](https://github.com/settings/tokens). A
   fine-grained token with **Contents: Read and write** on your `<username>/<username>`
   repo is enough (or a classic token with the `repo` scope).
2. In this repo: Settings - Secrets and variables - Actions - New repository secret.
   Name it `PROFILE_TOKEN` and paste the token.
3. Create your `<username>/<username>` repo if you haven't.

On the next run, the `profile` job clones your profile repo and inserts the embed
between `<!-- COMMITCHI:START -->` / `<!-- COMMITCHI:END -->` markers. It is
idempotent - it only commits when the block is missing or changed. Without the
`PROFILE_TOKEN` secret, the job is skipped.

To regenerate the pet SVG locally:

```bash
COMMITCHI_USER=YOUR_USERNAME node scripts/generate-pet-svg.mjs
```

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
