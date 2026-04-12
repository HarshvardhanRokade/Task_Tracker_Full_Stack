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

🔗 **[Live Demo](www.tasktracker.quest)** &nbsp;·&nbsp;
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

## ✨ Feature Set

### 💎 Gamification Economy
- Tasks award XP and gems by priority — HIGH / MEDIUM / LOW
- Pomodoro sessions award XP with flow multiplier (1.0× to 2.0×) based on consecutive sessions without excessive pausing
- 7-day streak activates 1.2× task XP multiplier
- **Gem Store** — Streak Shield (tiered pricing), XP Boost (single-use 1.5×), Cosmic and Ember cosmetic themes
- Level-up gem bonus scales with new level — `level × 5` gems per level gained

### 📊 Analytics Dashboard
- 4 endpoints with WEEK / MONTH / QUARTER / ALL_TIME period selection
- XP progression chart combines task XP and Pomodoro XP by day
- Pomodoro session history with multiplier tracking per session
- Level-up history recording trigger source (TASK or POMODORO)

### 🏅 Badge System
- 19 badges across 6 categories: Progression, Streak, Tasks, Focus, Economy, Seasonal
- Event-driven checking via `BadgeContext` / `BadgeEvent` — only conditions relevant to the current event type are evaluated
- Seasonal badges awarded permanently to top 3 at season end
- Public badge shelf shows earned (full color) and locked (greyed with condition) badges

### 🏆 Competitive Leaderboard
- Weekly score reset every Monday with live countdown timer
- Personal breakdown showing exact score composition (tasks / pomodoro / consistency)
- Previous week's champions preserved as historical record
- 30-day seasons with cumulative scoring and permanent badge rewards
- Public profiles accessible without login — shareable via URL

### 📧 Email Reminders
- Scheduled background job evaluates upcoming task deadlines
- Dispatches formatted reminder emails via Gmail SMTP
- `reminder_sent` flag prevents duplicate notifications

### 🏷️ Tag System
- Hover-to-delete with safety check — cannot delete tags attached to active tasks
- 15 tag limit enforced at creation
- Smart filtering — only tags from open tasks appear in the picker

---

## 🚀 Running Locally

### Prerequisites
- Java 21+
- Node 18+
- MySQL 8+

### Backend Setup
```bash
git clone https://github.com/HarshvardhanRokade/Task_Tracker_Full_Stack
cd Task_Tracker_Full_Stack/Task_Tracker_Backend

# Copy and configure environment
cp src/main/resources/application-example.properties \
   src/main/resources/application.properties
# Fill in: DB credentials, JWT secret, Gmail app password

# Create database
mysql -u root -p -e "CREATE DATABASE task_tracker_db;"

# Start — schema creates automatically on first run
./mvnw spring-boot:run
```

### Frontend Setup
```bash
cd Task_Tracker_Full_Stack/Task_Tracker_Frontend/Task_Tracker

cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:8080/api

npm install
npm run dev
```

### Demo Users (seeded automatically on first run)

| Username | Password | Level | Notes |
|---|---|---|---|
| newbie_user | Password123! | 1 | Fresh account for testing |
| grinder_user | Password123! | 49 | Near max level — shows full badge shelf |

---

## 📁 Project Structure
```
Task_Tracker_Backend/
├── engine/           # Pure gamification math — zero Spring deps
│   ├── XpEngine.java
│   ├── StreakEngine.java
│   └── FlowEngine.java
├── security/         # JWT two-token auth system
│   ├── JwtUtil.java
│   ├── JwtAuthFilter.java
│   └── RefreshTokenService.java
├── leaderboard/      # Score calculation, seasons, public profiles
│   ├── WeeklyScoreCalculator.java
│   ├── LeaderboardService.java
│   └── SeasonService.java
├── badge/            # Event-driven badge system
│   ├── BadgeService.java
│   ├── BadgeContext.java
│   └── BadgeEvent.java
├── service/          # Business logic orchestration
├── controller/       # REST endpoints
├── entity/           # JPA entities (13 tables)
└── domain/dto/       # Request and response shapes
Task_Tracker_Frontend/Task_Tracker/
├── api/              # Axios client with silent refresh interceptor
├── store/            # Zustand global state with selective persistence
├── components/
│   ├── leaderboard/  # Entry, breakdown, countdown, champions
│   ├── rewards/      # XP float, toast, level-up screen, badge unlock
│   ├── sidebar/      # Navigation, player card, XP bar
│   └── ui/           # Skeleton loaders, error boundaries
├── hooks/            # useCountUp, useGameSounds
└── pages/            # Full page components
```

---

## 🗄️ Database Schema
```
13 tables with composite indexes for time-series query performance:
users              — core user state and all gamification fields
tasks              — task records with priority, status, reminder time
tags               — tag catalog with color
task_tags          — many-to-many join
refresh_tokens     — SHA-256 hashed tokens with revocation state
pomodoro_sessions  — per-session history with multiplier and flow data
level_ups          — level-up events with trigger source
badges             — badge catalog (19 badges across 6 categories)
user_badges        — earned badge records with timestamps
weekly_scores      — hybrid-cached weekly score breakdowns
seasons            — season definitions with active flag
season_results     — final season rankings
user_themes        — owned cosmetic theme records
```

**Key indexes:**
```sql
-- Leaderboard ranking
(week_start_date, total_score DESC)  ON weekly_scores

-- Analytics time-series queries
(user_id, completed_at)              ON pomodoro_sessions
(user_id, week_start_date)           ON weekly_scores
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account, issue token pair |
| POST | `/api/auth/login` | Authenticate, issue token pair |
| POST | `/api/auth/refresh` | Rotate HttpOnly refresh cookie |
| POST | `/api/auth/logout` | Revoke refresh token, clear cookie |
| GET | `/api/v1/tasks` | Fetch paginated task list with filters |
| POST | `/api/v1/tasks` | Create task |
| POST | `/api/v1/tasks/{id}/complete` | Complete task, award XP, trigger badges |
| GET | `/api/v1/tasks/{id}/calendar` | Download ICS calendar file |
| POST | `/api/pomodoro/start` | Initialize 40-minute session deadline |
| POST | `/api/pomodoro/pause` | Record pause start time |
| POST | `/api/pomodoro/resume` | Extend deadline, evaluate pause tier |
| POST | `/api/pomodoro/complete` | Apply flow multiplier, award XP |
| POST | `/api/pomodoro/forfeit` | Clear session state |
| GET | `/api/v1/analytics/summary` | Hero card data |
| GET | `/api/v1/analytics/tasks?period=WEEK` | Task completion charts |
| GET | `/api/v1/analytics/pomodoro?period=WEEK` | Session charts |
| GET | `/api/v1/analytics/progression?period=MONTH` | XP over time |
| GET | `/api/v1/leaderboard` | Weekly rankings + personal breakdown |
| GET | `/api/v1/leaderboard/season` | Season standings |
| GET | `/api/v1/leaderboard/profile/{username}` | **Public** — no auth required |
| GET | `/api/v1/store/inventory` | User's current inventory |
| POST | `/api/v1/store/purchase` | Purchase item with gem validation |
| GET | `/api/v1/badges` | User's earned badges |
| GET | `/api/v1/tags` | Tags from open tasks only |

---

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| Language | Java 21 |
| Framework | Spring Boot 4.x |
| Security | Spring Security + JJWT 0.12.6 |
| Database | MySQL 8 + Hibernate 7 |
| Build | Maven |
| Frontend | React 18 + Vite |
| State | Zustand with selective persistence |
| Animation | Framer Motion |
| Charts | Recharts |
| HTTP | Axios with interceptors |
| Styling | Tailwind CSS + CSS custom properties |
| Hosting | Railway (backend) + Vercel (frontend) |

---

## 🔮 What I Would Build Next

- **Redis** for leaderboard caching instead of MySQL — eliminates the hybrid cache complexity
- **WebSocket** for real-time leaderboard position updates without polling
- **Rate limiting** on auth and completion endpoints via a Redis-backed token bucket
- **Velocity detection** — flag accounts completing 10+ tasks in a 60-minute window
- **React Native mobile app** sharing the same Spring Boot backend
- **Spring Security method-level authorization** with `@PreAuthorize`
