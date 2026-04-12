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
