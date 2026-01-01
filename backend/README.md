# Backend (minimal scaffold)

This is a minimal Express + MySQL backend to use with the Hunt360 frontend during local development.

## Quick start
1. Copy `.env.example` to `.env` and set your DB credentials:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hunt360
```

2. Install dependencies (from `backend` folder):

```
npm install
```

3. Create DB and seed sample data:

```
npm run seed
```

4. Run dev server:

```
npm run dev
```

## Endpoints
- `GET /api/health` - health check
- `GET /api/reports` - list reports
- `POST /api/reports` - create report (body: { name, value })
- `GET /api/reports/:id` - get a single report
- `GET /api/hrhunt` - list sample hrhunt rows
- `GET /api/corporate` - list sample corporate rows
- `GET /api/campus` - list sample campus rows

