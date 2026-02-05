# Contributing

Thanks for contributing to GIPS V2. This repo contains a backend API and a frontend app. Please keep changes scoped to the relevant app and avoid cross-layer coupling.

## Quick setup

```bash
git clone https://github.com/Xavier-Botswana/gips-v2.git
cd gips-v2
```

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

## Branching

- Create a feature branch from `main`
- Use short, descriptive names: `feature/`, `fix/`, or `chore/`

## Commit style

- Use clear, scoped messages
- Examples: `feat: add admissions export endpoint`, `fix: guard null student id`

## Tests

- Backend: `cd GIPS-Backend && npm test`
- Frontend: `cd GIPS-Frontend && npm test`

## Pull requests

- Include a concise summary of changes
- Note any setup or migration steps
- Add screenshots for UI changes

## Security

- Never commit secrets or `.env` files
- Report any sensitive issues privately
