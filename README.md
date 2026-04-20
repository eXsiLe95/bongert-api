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

Local working files such as `.env`, `.env.development`, `.env.test`, and `.env.production` are gitignored.

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
