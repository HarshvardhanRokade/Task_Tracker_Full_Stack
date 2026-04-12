<div align="center">

# ⚔️ Workspace — Gamified Productivity App

<p align="center">
  <img src="https://img.shields.io/badge/Java_21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" />
  <img src="https://img.shields.io/badge/Spring_Boot_4-6DB33F?style=for-the-badge&logo=spring&logoColor=white" />
  <img src="https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/MySQL_8-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
</p>

A full-stack productivity application that applies RPG game mechanics to task management and Pomodoro focus sessions. Built to solve the retention problem in standard productivity tools — most apps get abandoned because completing a task feels like work, not progress. Workspace makes consistency feel rewarding by turning daily habits into a competitive game.

🔗 **[Live Demo](https://task-tracker-full-stack-sigma.vercel.app/)** &nbsp;·&nbsp;
💻 **[Repository](https://github.com/HarshvardhanRokade/Task_Tracker_Full_Stack)**

> **Demo credentials:** `newbie_user` / `Password123!`

</div>

---

## 📸 Screenshots

| 🏆 Leaderboard | 👤 Public Profile | 📊 Analytics Dashboard |
|:---:|:---:|:---:|
| ![Leaderboard](docs/leaderboard.png) | ![Profile](docs/profile.png) | ![Dashboard](docs/dashboard.png) |

| 📝 Active Quests | 🍅 Focus Timer | 💎 The Tavern |
|:---:|:---:|:---:|
| ![Tasks](docs/tasks.png) | ![Pomodoro](docs/pomodoro.png) | ![Tavern](docs/tavern.png) |

---

## 🏗️ Architecture Overview

### ⚙️ The Engine Layer — The Most Important Design Decision

The gamification math lives in three pure Java classes with **zero Spring annotations and zero database access**:

| Engine | Responsibility |
|---|---|
| `XpEngine` | XP calculation, leveling, multi-level jumps, additive multipliers |
| `StreakEngine` | Daily streak rules, freeze consumption, night owl grace period |
| `FlowEngine` | Pomodoro flow multiplier, pause tier evaluation, session validity |

These classes are independently unit testable in milliseconds without spinning up a Spring context or connecting to a database. Any bug in XP calculation is caught by a unit test before it ever touches the web layer.

```bash
# Run gamification engine unit tests
./mvnw test
```

### 🔐 Two-Token JWT Authentication
Access token  — 15 minutes · Zustand memory only · Never touches disk
Refresh token — 7 days · HttpOnly cookie · SHA-256 hashed in database

Every refresh **rotates** the token and revokes the old one. If a stolen refresh token is replayed after the legitimate user has already refreshed, the backend detects a revoked token being reused, immediately revokes **all sessions** for that user, and forces re-login. The attack window is limited to one token lifetime.

### 🏆 The Competitive Leaderboard

Weekly scores reset every Monday. The formula specifically rewards **daily consistency over one-time volume bursts**:
Weekly Score = Task Points + Pomodoro Points + Consistency Bonus
Task Points      HIGH=3 · MEDIUM=2 · LOW=1 per completed task
Capped at 3 HIGH, 5 MEDIUM, 10 LOW per day
Tasks must be 1+ hour old to score (anti-cheat)
Pomodoro Points  Base 2pts · +1pt per consecutive session that day
4 sessions in one day = 2+3+4+5 = 14 pts
Consistency      +5 pts per active day · Maximum 35 pts/week
Showing up every day beats doing everything at once

Scores are calculated on demand and cached for 1 hour. A nightly scheduler pre-calculates all user scores. 30-day seasons award permanent badges to the top 3 at season end.

---

## 🧠 Key Technical Decisions

### Why Pure Engine Classes?
When product requirements change — and they always do — the math changes in one place with test coverage confirming correctness. The engine layer has zero coupling to Spring, Hibernate, or HTTP concerns.

### Why Additive Multipliers?
XP = base × max(1, (flow - 1) + (event - 1) + 1)
Multiplicative stacking (flow × event) creates exponential inflation. A 2x flow streak with a 1.5x XP boost gives **2.5x additively**, not 3x multiplicatively. This keeps the economy balanced as users progress to higher levels.

### Why Refresh Token Rotation With Reuse Detection?
A refresh token that is used once is immediately revoked. If an attacker steals and uses a refresh token before the legitimate user does, the legitimate user's next refresh attempt presents a now-revoked token — triggering full revocation of all sessions. The detection window is one token lifetime rather than indefinite.

### Why Weekly Leaderboard Reset?
Lifetime leaderboards permanently lock out new users once early adopters accumulate large leads. Weekly resets give every user a fresh competitive opportunity each Monday. The **consistency bonus** (5 pts/day, max 35/week) means a user who shows up daily but does less work outscores a user who does a burst of work in one sitting — directly incentivizing the habit the app is designed to build.

### Why Anti-Cheat Defenses in the Score Calculator?
Task points are capped per priority per day and require a minimum 1-hour age gap between creation and completion. These defenses live entirely in the score calculator — no changes to task completion logic, no user-visible restrictions. Legitimate users never notice them. Score manipulation becomes pointless.

---
