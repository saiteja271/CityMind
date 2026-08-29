# API Reference

Base: `/api/v1`

## Auth
- `POST /auth/register` — username, email, password
- `POST /auth/login` — email, password → tokens
- `GET /auth/me` — current user (Bearer token)
- `POST /auth/refresh` — refreshToken

## Cities
- `GET /cities` — list (owned + public)
- `POST /cities` — create
- `GET /cities/:id`
- `PATCH /cities/:id`
- `DELETE /cities/:id`

## Saves, Analytics, Achievements, Scenarios, Admin
Endpoints scaffolded and authenticated; extend with full persistence as needed.

## Health
- `GET /health`
