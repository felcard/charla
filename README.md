# Charla

Private chat rooms with a built-in, twisted Tic Tac Toe, synced in real time over WebSockets.

Live demo: https://powerchat.netlify.app/

## Repository layout

| Folder | What it is | Deployed to |
| --- | --- | --- |
| [`client/`](client) | React front end | Netlify (base directory `client`) |
| [`server/`](server) | Node.js + Socket.IO server | Koyeb (work directory `server`) |

## Running locally

```sh
cd server && npm install && npm run dev
cd client && npm install && npm start
```

> This repository combines the former `socket` (client) and `socket-be` (server) repositories, with their full commit history.
