# Deployment

This project treats database migrations as an explicit release step.
The application does **not** run migrations automatically on startup.

## Principles

- Build one immutable application artifact per release.
- Run migrations explicitly before switching traffic to the new app version.
- Keep migrations backward-compatible whenever possible.
- Take a database backup before applying production migrations.
- Prefer forward fixes over ad-hoc rollback when a migration has already touched production data.

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and pushes a Docker image to `ghcr.io/exsile95/bongert-api` on every push to `main`. It can also be triggered manually via `workflow_dispatch`.

Each image is tagged with:

- `latest` – always points to the most recent build
- `sha-<commit>` – pinned to a specific commit

## Server Setup (First Time)

### Prerequisites

- Docker and the Compose plugin (`docker compose`) installed
- A GitHub Personal Access Token (PAT) with `read:packages` scope

### 1. Authenticate Docker with ghcr.io

```bash
echo "<PAT>" | docker login ghcr.io -u <github-username> --password-stdin
```

This stores credentials in `/root/.docker/config.json`, which Watchtower uses to pull new images.

### 2. Prepare environment

Clone the repo or copy `docker-compose.prod.yml` and `.env.prod.example` onto the server, then create the env file:

```bash
cp .env.prod.example .env.prod
# edit .env.prod and set a real DB_PASSWORD
```

### 3. Start the stack

```bash
# start only Postgres first
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d db

# run migrations
docker compose -f docker-compose.prod.yml --env-file .env.prod run --rm api npm run db:migration:run

# start everything
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

### 4. Verify

```bash
curl http://localhost:3000/health
```

## Ongoing Deployments

Watchtower polls ghcr.io every 60 seconds. When a new `latest` image appears, it automatically pulls and restarts the API container. No manual action needed for code-only changes.

For deployments that include migrations:

1. Create a database backup.
2. Pull the new image: `docker compose -f docker-compose.prod.yml pull api`
3. Run migrations: `docker compose -f docker-compose.prod.yml --env-file .env.prod run --rm api npm run db:migration:run`
4. Restart the API: `docker compose -f docker-compose.prod.yml --env-file .env.prod up -d api`
5. Verify: `curl http://localhost:3000/health`

The key rule is: **migrations first, traffic second**.

## Local Docker Workflow

1. Prepare Docker env:

```bash
cp .env.docker.example .env.docker
```

2. Build the image:

```bash
docker compose --env-file .env.docker build
```

3. Start only Postgres:

```bash
docker compose --env-file .env.docker up -d db
```

4. Run pending migrations from the application image:

```bash
docker compose --env-file .env.docker run --rm api npm run db:migration:run
```

5. Start the API:

```bash
docker compose --env-file .env.docker up -d api
```

6. Verify the liveness endpoint:

```bash
curl http://localhost:3000/health
```

## Rollback Strategy

Rollback depends on whether the migration already ran.

### If the app deploy failed before migrations ran

- redeploy the previous app image
- no database rollback is needed

### If migrations ran and are backward-compatible

- redeploy the previous app image
- keep the migrated schema in place

This is the preferred release shape. It is why additive, backward-compatible migrations are safest.

### If migrations ran and are not backward-compatible

- restore the database from backup
- redeploy the previous app image

Only use `migration:revert` when all of these are true:

- exactly one migration needs to be undone
- the down migration is correct and tested
- no incompatible data transformations have already occurred

For real production incidents, backup restore is usually more trustworthy than assuming a down migration is safe.

## Commands

Run migrations against the built artifact:

```bash
npm run build
npm run db:migration:run
```

Revert the last migration against the built artifact:

```bash
npm run build
npm run db:migration:revert
```

For local development with shell-provided env vars:

```bash
npm run db:migration:run:dev
npm run db:migration:revert:dev
```

The production container does not run migrations automatically on startup. Its health check targets `GET /health`, so rollout validation should use that endpoint as well.
