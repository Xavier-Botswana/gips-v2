# GIPS V2

GIPS V2 is a full-stack platform with a dedicated backend API and a React frontend. The goal of this repo is to keep a clean separation of concerns between the client UI and the server-side data/services layer.

## Repo layout

- `GIPS-Backend/`: Node.js/Express API, integrations, and services
- `GIPS-Frontend/`: React app (Create React App)
- `PLAN.md`: Planning and notes

## Quick start

### Backend

```bash
cd GIPS-Backend
npm install
npm start
```

### Frontend

```bash
cd GIPS-Frontend
npm install
npm start
```

## Documentation

- Backend details: `GIPS-Backend/README.md`
- Frontend details: `GIPS-Frontend/README.md`

## Environment configuration

Both apps rely on environment variables. See the backend README for required keys and the frontend README for local dev details. Do not commit `.env` files.
