# Deployment

This project treats database migrations as an explicit release step.
The application does **not** run migrations automatically on startup.

## Principles

- Build one immutable application artifact per release.
- Run migrations explicitly before switching traffic to the new app version.
- Keep migrations backward-compatible whenever possible.
- Take a database backup before applying production migrations.
- Prefer forward fixes over ad-hoc rollback when a migration has already touched production data.

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

## Production Deployment Strategy

1. Build and publish the new application image.
2. Create a database backup/snapshot.
3. Pull the new image onto the server.
4. Run migrations as a one-off task using the new image.
5. Start or update the application containers.
6. Verify health checks and logs.

The key rule is:

- **Migrations first, traffic second**

That avoids serving a new app version against an old schema.

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
