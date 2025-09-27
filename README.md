# Digital India Shop — MERN Starter

Tech: React 19.1 (Vite), Node.js (Express), MongoDB (Mongoose), JWT auth.

## Quick start
1) Copy envs:
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```
2) Install deps:
```bash
cd server && npm i && cd ../client && npm i
```
3) Now start mongo DB.
a. open cmd from window and run 
    code = net start MongoDB
b. open MongoDB compass and connect to your project

4) Run both:
```bash
cd .. && npm run dev
```

## Scripts
- `npm run dev` (root): run server + client together
- `npm run build` (client): build React app
- `npm run start` (server): production server

## Notes
- Server: `http://localhost:4000`
- Client dev: `http://localhost:5173`
- Set `VITE_API_URL` in client `.env` to the server URL.
