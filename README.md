# bongert-api

NestJS API for the `bongert` project.

## Setup

```bash
npm install
```

## Environment Config

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

## Run

```bash
# default: NODE_ENV=development if unset
npm run start

# watch mode
npm run start:dev

# production build
npm run build
npm run start:prod
```

## Docker

Build and start the API plus Postgres locally:

```bash
cp .env.docker.example .env.docker
docker compose --env-file .env.docker up --build
```

The API is exposed on `http://localhost:3000` and Postgres on `localhost:5432`.

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

## Required Variables

```env
NODE_ENV=development
APP_PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=bongert_dev
```

## Validation

Application startup validates:

- `NODE_ENV`
- `APP_PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
