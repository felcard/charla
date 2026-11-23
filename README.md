# Charla

Private chat rooms with a built-in, twisted Tic Tac Toe, synced in real time over WebSockets.

Live demo: https://powerchat.netlify.app/

## Repository layout

| Folder | What it is | Deployed to |
| --- | --- | --- |
| [`client/`](client) | React front end | Netlify (base directory `client`) |
| [`server/`](server) | Node.js + Socket.IO server | Koyeb (work directory `server`) |

## Running locally

From the repository root:

```sh
npm run install:all   # first time only
npm run dev           # server on :8000 + client on :3000
```

The local client talks to the local server automatically (see `client/.env.development`). Open http://localhost:3000 in two tabs to chat and play against yourself.

`npm test` runs the client tests.

> This repository combines the former `socket` (client) and `socket-be` (server) repositories, with their full commit history.
