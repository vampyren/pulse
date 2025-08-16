# Pulse — Dev Quick Start
**Version: v0.1.0**

## Backend
```bash
cd backend
cp .env.example .env  # if present; otherwise set PORT=4010 etc.
node ./src/server.js  # dev run (or npm run dev if you have nodemon)
```

- Default port: **4010**
- Env of note: `PULSE_DB_PATH=/home/<user>/App/pulse/data/pulse.db`

## Frontend
```bash
cd web
npm run dev
# Vite dev server http://localhost:5173
# Proxy: /api/v2 -> http://localhost:4010 (see vite.config.ts)
```

## API Filters (Groups)
- `privacy=public|friends|invite|private`
- `sport=padel,tennis`
- `city` (exact)
- `city_like` (prefix, case-insensitive)
- `city_contains` (substring, case-insensitive) ← NEW
- `city_in=Malmö,Stockholm` (comma list, precedence over others)

**Precedence:** `city_in` > `city_contains` > `city_like`.
