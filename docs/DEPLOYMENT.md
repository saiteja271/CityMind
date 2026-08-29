# Deployment

## Docker

```bash
docker-compose up -d
```

Services: MongoDB (27017), API (4000), Simulation (4001), Client (3000).

## Environment

Copy `.env.example` to `.env` and set JWT secrets and MongoDB URI for production.

## Production Notes

- Use strong JWT secrets
- Enable HTTPS
- Restrict CORS origin
- Rate limiting is enabled by default
- Do not commit `.env`
