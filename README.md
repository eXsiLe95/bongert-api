# bongert-api

NestJS API for the `bongert` project.

## Setup

```bash
npm install
```

## Versioning

This project follows [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`):

- **PATCH** (`0.1.0` → `0.1.1`): bug fixes, internal changes, refactoring — no API changes
- **MINOR** (`0.1.1` → `0.2.0`): new features, new endpoints, backward-compatible API changes
- **MAJOR** (`0.2.0` → `1.0.0`): breaking API changes, removed endpoints, incompatible schema changes

The version in `package.json` is the single source of truth. The deploy pipeline tags every Docker image with this version. Every merge request must include a version bump in `package.json`.

## Available Scripts

```bash
# development server
npm run start:dev

# production build and start
npm run build
npm run start:prod

# lint and tests
npm run lint
npm test -- --runInBand

# end-to-end test entrypoint
npm run test:e2e
```

## Environment Configuration

The app uses `@nestjs/config` with environment-specific `.env` files.

Config loading order:

- `.env.${NODE_ENV}.local`
- `.env.${NODE_ENV}`
- `.env`

Supported `NODE_ENV` values:

- `development`
- `test`
- `production`

Example files:

- `.env.example`
- `.env.docker.example`

Local working files such as `.env`, `.env.docker`, `.env.development`, `.env.test`, and `.env.production` are gitignored.

Required variables:

```env
NODE_ENV=development
APP_PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=bongert_dev
```

Application startup validates:

- `NODE_ENV`
- `APP_PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

## Database Migrations

TypeORM runs with `synchronize: false` in all environments.
Schema changes must go through migrations.

Baseline commands:

```bash
# build the app first for production-style migration runs
npm run build

# run pending migrations against the built artifact
npm run db:migration:run

# revert the last migration against the built artifact
npm run db:migration:revert
```

For local development with env vars already exported in your shell:

```bash
npm run db:migration:run:dev
npm run db:migration:revert:dev
```

The dev migration commands read directly from the local TypeORM data source and therefore expect the database env vars to be available in the shell or provided by your process manager.

For ad-hoc TypeORM CLI usage:

```bash
npm run typeorm -- migration:show
npm run typeorm -- migration:generate ./src/migrations/<name>
```

Deployment and rollback guidance lives in [`docs/deployment.md`](docs/deployment.md).

## Run

```bash
# development
npm run start:dev

# production build
npm run build
npm run start:prod
```

The application verifies the database connection during startup. A running Postgres instance and valid DB env vars are required even for local starts.

## Health Check

The API exposes a lightweight liveness endpoint:

```bash
GET /health
```

Response shape:

```json
{
  "status": "ok",
  "timestamp": "2026-04-22T17:30:47.000Z"
}
```

## Docker

Build and start the API plus Postgres locally:

```bash
cp .env.docker.example .env.docker
docker compose --env-file .env.docker up --build
```

The API is exposed on `http://localhost:3000` and Postgres on `localhost:5432`.
The container health check also uses `GET /health`.

For containerized runs, pass `.env.docker` to Compose so it can resolve the stack configuration and inject the same values into the containers:

- `NODE_ENV=production`
- `APP_PORT=3000`
- `DB_HOST=db`
- `DB_PORT=5432`
- `DB_USER=postgres`
- `DB_PASSWORD=postgres`
- `DB_NAME=bongert`

The app and Docker Compose intentionally use the same variable names. The difference is the runtime context:

- local app runs usually use `.env` with `DB_HOST=localhost`
- Docker runs use `.env.docker` with `DB_HOST=db`

That keeps the app config consistent while allowing host-based and container-based networking to differ cleanly.

## Production Deployment

The deploy pipeline (`.github/workflows/deploy.yml`) builds and pushes a Docker image to `ghcr.io` on every push to `main`. It can also be triggered manually.

On the server, the production stack runs via `docker-compose.prod.yml` (API + Postgres + Watchtower). Watchtower automatically pulls new images and restarts the API container.

Quick start on a fresh server:

```bash
# authenticate with ghcr.io
echo "<PAT>" | docker login ghcr.io -u <github-username> --password-stdin

# configure environment
cp .env.prod.example .env.prod
# edit .env.prod and set a real DB_PASSWORD

# start the stack
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

For migration handling, rollback strategy, and detailed setup instructions see [`docs/deployment.md`](docs/deployment.md).
