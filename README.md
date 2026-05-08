# Blind Collab

A multiplayer drawing + guessing game where each player draws ONE layer of a combined image without seeing other players' layers. All layers merge into one chaotic, funny final image.

## How to Play

1. Create or join a room with 2–8 players
2. Everyone gets a **secret role** (BACKGROUND / CHARACTER / OBJECT / DETAIL / ATMOSPHERE) and a **secret word**
3. Draw only your role — **60 seconds**, no peeking at others
4. All layers merge into one image
5. Everyone guesses what the word was — **30 seconds**
6. Vote for the most helpful and most chaotic layers
7. Scores are tallied — play 5 rounds, highest score wins

## Scoring

| Event | Points |
|---|---|
| Correct guess | +15 |
| First correct guess | +5 bonus |
| Most Helpful Layer vote | +10 |
| Most Chaotic Layer vote | +5 |
| Nobody guesses the word | -3 everyone |

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Socket.io
- **Drawing**: HTML5 Canvas API (no external lib — RN-ready)
- **Hosting**: Frontend → Vercel, Backend → Render

## Local Development

### Backend

```bash
cd server
npm install
npm run dev
```

Server starts at `http://localhost:3001`

### Frontend

```bash
cd client
npm install
npm run dev
```

Client starts at `http://localhost:5173`

Make sure `client/.env` has:
```
VITE_SOCKET_URL=http://localhost:3001
```

## Deployment

### Frontend → Vercel

1. Push to GitHub
2. Import `/client` folder in Vercel
3. Set framework to **Vite**
4. Add env var: `VITE_SOCKET_URL=https://blindcollab-server.onrender.com`
5. Every push to `main` auto-deploys

### Backend → Render

1. Push to GitHub
2. Create new **Web Service** pointing to `/server` folder
3. Build command: `npm install`
4. Start command: `node index.js`
5. Add env var: `CLIENT_URL=https://blindcollab.vercel.app`
6. Every push to `main` auto-deploys

## Project Structure

```
blindcollab/
├── client/                    ← Connect to Vercel
│   ├── src/
│   │   ├── components/
│   │   │   ├── DrawingCanvas.jsx   ← touch+mouse drawing, base64 export
│   │   │   ├── LayerReveal.jsx     ← animated layer merge
│   │   │   ├── PlayerLobby.jsx
│   │   │   ├── ScoreBoard.jsx
│   │   │   └── Confetti.jsx
│   │   ├── hooks/
│   │   │   ├── useGameState.js     ← RN compatible: YES
│   │   │   ├── useSocket.js        ← RN compatible: YES
│   │   │   ├── useCanvas.js        ← RN compatible: PARTIAL
│   │   │   └── usePlayers.js       ← RN compatible: YES
│   │   ├── screens/
│   │   │   ├── HomeScreen.jsx
│   │   │   ├── LobbyScreen.jsx
│   │   │   ├── RoleScreen.jsx
│   │   │   ├── DrawingScreen.jsx
│   │   │   ├── RevealScreen.jsx
│   │   │   ├── GuessScreen.jsx
│   │   │   ├── VoteScreen.jsx
│   │   │   └── ResultsScreen.jsx
│   │   └── utils/
│   │       ├── wordBank.js
│   │       ├── scoring.js
│   │       └── canvasUtils.js
│   ├── vercel.json
│   └── package.json
│
├── server/                    ← Connect to Render
│   ├── index.js               ← Express + Socket.io
│   ├── gameManager.js         ← room + round logic
│   ├── wordBank.js
│   ├── render.yaml
│   └── package.json
│
└── README.md
```

## React Native Conversion Notes

All hooks annotated with RN compatibility:
- `useGameState.js` — **YES**: pure state with useReducer
- `useSocket.js` — **YES**: socket.io-client works in RN
- `usePlayers.js` — **YES**: pure data transformations
- `useCanvas.js` — **PARTIAL**: swap Canvas API with `@shopify/react-native-skia`

`DrawingCanvas.jsx` accepts props:
- `onDrawingComplete(base64)` — callback when drawing is submitted
- `readOnly` — disable all drawing tools
- `layerImage` — display a previous layer underneath

## Commercial Roadmap Hooks

Already in code, not yet implemented:

- `isPremium` flag in room object → private rooms with password
- `customWords[]` in room config → custom word packs
- `maxRounds` config in gameManager → extended rounds
- `maxPlayers` config → up to 20 players
- `shareCard` feature flag → save and share final merged image
- `showAds` flag in ResultsScreen → Google AdSense integration
- `<AdSlot />` component placeholders in HomeScreen + ResultsScreen
