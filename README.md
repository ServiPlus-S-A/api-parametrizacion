# Serviplus Parametrización

Arquitectura Multicapa (N-Tier) con patrón BFF implementado en NestJS y Next.js.

## Prerequisites
- Docker v24.0+
- Docker Compose v2.20+

## Quick Start
```bash
git clone <repository_url>
cp .env.example .env
docker compose up --build
```

## Unit Tests & Coverage
Para ejecutar las pruebas en el microservicio:
```bash
cd microservice-parametrizacion
npm run test
npm run test:cov # Generates coverage report in /coverage
```

## Architecture
- **Frontend**: Next.js (SSR)
- **API Gateway**: NestJS (JWT, Rate Limiting, Circuit Breaker)
- **Microservice**: NestJS (N-Tier, TypeORM)
- **Database**: PostgreSQL