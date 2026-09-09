# 🔴 Red Tetris

A real-time multiplayer Tetris game built with **React, Node.js and WebSockets** as part of the 42 curriculum.

Red Tetris goes beyond the classic single-player Tetris experience by introducing multiplayer rooms, competitive game modes, rankings, trapped pieces and real-time communication between players.

The project focuses heavily on **real-time client/server architecture**, game-state synchronization and multiplayer interactions.

---

## 🎮 Features

### Classic Tetris

The core game implements the traditional Tetris mechanics:

* Tetromino movement
* Rotation
* Collision detection
* Line clearing
* Increasing difficulty
* Score calculation
* Game over detection

The game can be played both **solo and multiplayer**.

---

### 🌐 Real-Time Multiplayer

Players can create or join multiplayer rooms and play together in real time.

The server manages:

* Room creation
* Player connections and disconnections
* Host management
* Game start
* Player state synchronization
* Game-over states
* Final rankings

Communication between the frontend and backend is handled using **WebSockets**.

---

## ⚔️ Game Modes

### Battle Royale

Players compete until only one player remains.

Clearing multiple lines can affect opponents through multiplayer penalty mechanics.

The last surviving player wins the game.

### Points Mode

Players compete to obtain the highest score.

Instead of winning through survival, the final ranking is determined by the score achieved during the game.

---

## 🏆 Ranking & Scoring

Red Tetris includes a ranking system capable of tracking players throughout a multiplayer game.

The final ranking is calculated once all required players have finished their games.

Depending on the selected game mode, players are ranked using:

* Survival position
* Score
* Game progression

---

## 💀 Trapped Pieces

Some tetrominoes can introduce special gameplay effects.

Trapped pieces add unpredictability and force players to adapt their strategy during the game.

Possible effects include:

* Random rotation
* Increased gravity
* Rotation lock
* Inverted controls

---

## 💬 Room Communication

Players can communicate during multiplayer sessions through a real-time room chat.

Messages are transmitted through the WebSocket connection and broadcast only to players belonging to the same room.

The system can also display game-related events such as players joining, leaving or being eliminated.

---

## 📊 Monitoring

The application can expose runtime metrics using **Prometheus**, visualized through **Grafana** dashboards.

Metrics can include:

* Connected players
* Active rooms
* Games started
* WebSocket activity
* Game duration

This provides basic observability over the multiplayer server while the application is running.

---

# 🏗️ Architecture

Red Tetris follows a client/server architecture.

```text
                    ┌─────────────────────┐
                    │      Browser        │
                    │                     │
                    │       React         │
                    │                     │
                    │  Game / UI / Hooks  │
                    └──────────┬──────────┘
                               │
                               │ WebSocket
                               │
                    ┌──────────▼──────────┐
                    │    Node.js Server   │
                    │                     │
                    │  Rooms              │
                    │  Players            │
                    │  Game Events        │
                    │  Ranking            │
                    │  Chat               │
                    └──────────┬──────────┘
                               │
                               │ Metrics
                               ▼
                    ┌─────────────────────┐
                    │     Prometheus      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       Grafana       │
                    └─────────────────────┘
```

The frontend is responsible for rendering the game and handling player interactions.

The backend acts as the central multiplayer coordinator and manages rooms, players and game events.

---

# 🧱 Frontend Architecture

The frontend is built with **React**.

The application separates UI components, game logic and networking responsibilities.

A simplified structure looks like:

```text
frontend/
│
├── components/
│   ├── game/
│   ├── lobby/
│   └── ui/
│
├── hooks/
│   ├── game/
│   └── socket/
│
├── pages/
│
├── services/
│
└── utils/
```

React hooks are used to isolate reusable stateful logic, while components remain primarily responsible for rendering the interface.

---

# 🔌 WebSocket Communication

Real-time communication is one of the central parts of the project.

Instead of relying on traditional HTTP requests for gameplay synchronization, multiplayer events are exchanged through WebSockets.

Typical events include:

```text
room:create
room:join
room:leave

game:start
game:update
game:over

player:update
player:eliminated

chat:send
chat:message
```

The server validates events and broadcasts updates to the appropriate room.

This allows multiple players to maintain a synchronized view of the current multiplayer session.

---

# 🐳 Docker

The application is containerized using Docker.

The infrastructure can include:

```text
┌────────────────────┐
│     Frontend       │
│      React         │
└────────────────────┘

┌────────────────────┐
│      Backend       │
│      Node.js       │
└────────────────────┘

┌────────────────────┐
│    Prometheus      │
└────────────────────┘

┌────────────────────┐
│      Grafana       │
└────────────────────┘
```

Docker Compose can be used to start the complete development environment.

---

# 🛠️ Tech Stack

### Frontend

* React
* JavaScript
* Vite
* HTML / CSS

### Backend

* Node.js
* WebSockets

### Infrastructure

* Docker
* Docker Compose
* Prometheus
* Grafana

### Development

* Git
* GitHub
* Linux

---

# 🚀 Installation

Clone the repository:

```bash
git clone <repository-url>
cd red-tetris
```

Install the dependencies:

```bash
npm install
```

Start the project:

```bash
npm run dev
```

Or, when using Docker:

```bash
docker compose up --build
```

Then open the application in your browser.

> Exact commands and ports may depend on the final project configuration.

---

# 🧠 What I Learned

Red Tetris was particularly useful for exploring problems that do not usually appear in traditional CRUD web applications.

The project required working on:

* Real-time communication
* Multiplayer synchronization
* WebSocket event architecture
* Shared game state
* React architecture
* Custom hooks
* Component separation
* Room lifecycle management
* Player lifecycle management
* Competitive game logic
* Error and disconnection handling
* Docker containerization
* Application monitoring

One of the main challenges was determining **which state should belong to the client and which state should be controlled by the server**.

The project also provided practical experience designing a WebSocket protocol capable of supporting several independent multiplayer rooms simultaneously.

---

# 🎯 Project Goals

The main objective of Red Tetris is not simply to recreate Tetris.

The project is an exploration of how a real-time multiplayer application can be structured using modern web technologies.

It combines:

**Frontend development**

**Backend development**

**Real-time networking**

**Game logic**

**Infrastructure & monitoring**

into a single application.

---

## 👤 Author

**Eric Trignau**

42 Paris

Interested in **Full-Stack Development, Backend, DevOps and Systems & Networks**.

Currently looking for an internship to continue developing these skills in a professional environment.
