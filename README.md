# API Test Project (Playwright)

This project contains API tests for KalSense using Playwright.

## Requirements
- Node.js 18+
- npm

## Install
```bash
npm install
```

## Environment
Create `.env` based on `.env.example` and fill required values:
```bash
cp .env.example .env
```

Required keys:
- `API_BASE_URL`
- `API_ORG_NAME`
- `API_ORG_ID`
- `API_PROJECT_ID`
- `API_USERNAME`
- `API_PASSWORD`

Optional:
- `API_PRODUCT` (default `KalMedia`)
- `HEADLESS` (default `true`)
- `TIMEOUT` (default `30000`)

## Run tests
Run all tests:
```bash
npm test
```

Run setup auth only:
```bash
npm run test:setup
```

Run API tests only:
```bash
npm run test:api
```

Run a single file:
```bash
npx playwright test tests/album/album.spec.ts
```

## Test structure
- `tests/auth/` — authentication and login scenarios
- `tests/album/` — album create/get/delete flows
- `tests/files/` — file upload, descriptions, tags, collections
- `config/endpoints.ts` — centralized API endpoints
- `utils/auth.ts` — token acquisition and storage

## Notes
- Auth token is stored in `.auth/user.json` (ignored by git).
- Tests are mostly serial where needed to share IDs.
