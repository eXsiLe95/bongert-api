# SaaS App Roadmap — NestJS / TypeORM / PostgreSQL

> **Philosophy:** Defer decisions, not progress. Every phase ends with something running.
> One open decision = one future issue, not a blocker today.

---

## Stack (locked, no re-debate)

| Concern | Tool |
|---|---|
| Framework | **NestJS** |
| ORM | **TypeORM** (`synchronize: false`, hand-written migrations) |
| Auth | **Passport.js** + JWT |
| Cache | **Redis** (Phase 3) |
| Database | **PostgreSQL** on dedicated server |
| Hosting | Dedicated server (Docker or Node directly) |

---

## Anti-Stall Rules (pin these)

1. **Never leave a phase with an open architecture decision.** Can't decide? Pick one, create a "Revisit X in Phase N+2" issue, and move on.
2. **One issue = max 2 hours of work.** Bigger? Split it.
3. **The board is the source of truth.** Not in an issue = doesn't exist.
4. **Returning after a break?** Open the board, find the first `In Progress` issue, do only that. Do not re-read everything.
5. **Done beats perfect.** The codebase is a draft until Phase 4.

---

## Milestone Overview

| Milestone | Goal | Target |
|---|---|---|
| M0 – Foundation | Repo, pipeline, one working endpoint in prod | Week 1–2 |
| M1 – Auth & Tenancy | Sign up, login, tenant isolation | Week 3–4 |
| M2 – Core Domain | First real feature, full CRUD, REST conventions | Week 5–7 |
| M3 – Caching & Performance | Redis, rate limiting, query optimization | Week 8 |
| M4 – Production Readiness | Logging, error handling, safe for real users | Week 9 |

---

## Phase 0 — Foundation
**Milestone: M0 – Foundation**
**Done when:** `GET /health` returns 200 in production on your server.

### Decisions made
- `synchronize: false` in TypeORM config from day one — no auto-sync ever
- All migrations live in `src/migrations/`, named `YYYYMMDDHHMMSS-description.ts`
- Environment config via `@nestjs/config` + `.env` files per environment
- Deployment: Docker container on your server, exposed via nginx reverse proxy

### Issues
- [ ] Init NestJS project with TypeScript strict mode
- [ ] Configure ESLint + Prettier with pre-commit hook (`husky` + `lint-staged`)
- [ ] Set up TypeORM with Postgres — `synchronize: false`, connection via env vars
- [ ] Write first migration: empty schema baseline (`node-typeorm migration:run`)
- [ ] Implement `GET /health` endpoint returning `{ status: 'ok', timestamp }`
- [ ] Set up `@nestjs/config` for environment-based config (dev / prod)
- [ ] Write `Dockerfile` + `docker-compose.yml` for local dev
- [ ] Deploy container to server, confirm `/health` returns 200
- [ ] Set up GitHub repository + branch protection on `main`
- [ ] Create GitHub Project board (columns: Backlog / In Progress / Done)
- [ ] Create all milestones M0–M4 in GitHub with target dates

---

## Phase 1 — Auth & Tenancy
**Milestone: M1 – Auth & Tenancy**
**Done when:** Two test tenants exist and their data is strictly isolated — verified by a test.

### Decisions made
- **Multi-tenancy strategy:** Row-level tenancy — every table has a `tenant_id` column
- All repositories accept `tenantId` as a mandatory first argument — impossible to forget
- JWT payload always contains `userId` + `tenantId` — extracted once in a guard, available everywhere via `@CurrentTenant()` decorator
- Passwords hashed with `bcrypt` (cost factor 12)
- Access token: 15min TTL. Refresh token: 7 days, stored in DB

### RESTful Auth Endpoints
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
```

### Issues
- [ ] Install and configure `@nestjs/passport` + `passport-jwt`
- [ ] Create `tenants` table migration (`id`, `name`, `slug`, `created_at`)
- [ ] Create `users` table migration (`id`, `tenant_id`, `email`, `password_hash`, `created_at`)
- [ ] Implement `POST /api/v1/auth/register` — creates tenant + first user
- [ ] Implement `POST /api/v1/auth/login` — returns access + refresh token
- [ ] Implement `POST /api/v1/auth/refresh` + `POST /api/v1/auth/logout`
- [ ] Build `JwtAuthGuard` — validates token, rejects if expired
- [ ] Build `@CurrentTenant()` and `@CurrentUser()` decorators — extract from JWT payload
- [ ] Build `TenantScopeInterceptor` — injects tenantId into all repository calls
- [ ] Seed script: two test tenants with one user each
- [ ] Integration test: User A cannot read User B's tenant data
- [ ] Document auth flow in `docs/auth.md`

---

## Phase 2 — Core Domain
**Milestone: M2 – Core Domain**
**Done when:** Full CRUD on your core resource works via API, scoped to a tenant.

### RESTful API conventions (locked in)
- Resources are **nouns**, never verbs: `/projects` not `/getProjects`
- HTTP verbs: `GET` (read), `POST` (create), `PATCH` (partial update), `PUT` (full replace), `DELETE`
- Max one level of nesting: `/tenants/:id/projects` is fine — go deeper and flatten instead
- Consistent response envelope:
  ```json
  { "data": {}, "meta": {}, "error": null }
  ```
- Always paginate list endpoints: `?page=1&limit=20` → `meta: { total, page, limit }`
- Version from day one: all routes under `/api/v1/`

### TypeORM usage conventions (locked in)
- `synchronize: false` — already set in M0, never change this
- All DB access through a **Repository class** per entity: `src/[module]/[entity].repository.ts`
- Repositories take `tenantId` as first argument always
- Use `QueryBuilder` for anything beyond simple finds
- Drop to `.query()` for complex SQL — no shame, that's the point
- Never call TypeORM directly from a Controller or Service — always via repository

### Module structure
```
src/
  auth/
  tenants/
  users/
  [your-core-module]/
    [entity].entity.ts
    [entity].repository.ts
    [entity].service.ts
    [entity].controller.ts
    [entity].module.ts
    dto/
      create-[entity].dto.ts
      update-[entity].dto.ts
  common/
    decorators/
    guards/
    interceptors/
    pipes/
```

### Issues
- [ ] Define your core entity — write the TypeORM entity class
- [ ] Write migration for core entity table (with `tenant_id` column)
- [ ] Implement repository with `findAll(tenantId, pagination)`, `findOne(tenantId, id)`, `create`, `update`, `delete`
- [ ] Implement service layer with business logic
- [ ] Implement `GET /api/v1/[resource]` with pagination + tenant scope
- [ ] Implement `GET /api/v1/[resource]/:id`
- [ ] Implement `POST /api/v1/[resource]` with `class-validator` DTO validation
- [ ] Implement `PATCH /api/v1/[resource]/:id`
- [ ] Implement `DELETE /api/v1/[resource]/:id`
- [ ] Add global validation pipe (`ValidationPipe` with `whitelist: true, forbidNonWhitelisted: true`)
- [ ] Add global response envelope interceptor
- [ ] Manual smoke test: full CRUD via Hoppscotch / Postman, two tenants isolated

---

## Phase 3 — Caching & Performance
**Milestone: M3 – Caching & Performance**
**Done when:** Repeated GETs return from cache, visible via response header.

### Decisions made
- **Cache-aside pattern** — check cache → miss → hit DB → write cache. Simple, explicit, no magic.
- Cache key convention: `tenant:{tenantId}:{resource}:{id}` and `tenant:{tenantId}:{resource}:list`
- TTLs: 60s for lists, 300s for individual records (tune later with real data)
- Invalidate on every write: `PATCH`, `POST`, `DELETE` all bust the relevant keys
- Never cache anything auth-related
- Add `X-Cache: HIT | MISS` header on all cached endpoints — essential for debugging

### Issues
- [ ] Spin up Redis container on server, add to `docker-compose.yml`
- [ ] Integrate `@nestjs/cache-manager` with Redis adapter (`cache-manager-ioredis`)
- [ ] Build `CacheService` wrapper with `get`, `set`, `del`, `delByPattern` methods
- [ ] Cache `GET /api/v1/[resource]` list endpoint
- [ ] Cache `GET /api/v1/[resource]/:id`
- [ ] Invalidate cache keys on `POST`, `PATCH`, `DELETE`
- [ ] Add `X-Cache: HIT/MISS` response header
- [ ] Add per-tenant rate limiting (`@nestjs/throttler` + Redis store)
- [ ] Load test with `autocannon` or `k6` — before/after comparison

---

## Phase 4 — Production Readiness
**Milestone: M4 – Production Readiness**
**Done when:** A real person outside your machine can use the app without it breaking.

### Issues
- [ ] Set up structured logging with `nestjs-pino` — JSON output in prod, pretty in dev
- [ ] Build global exception filter — consistent error shape, no stack traces leaked in prod
- [ ] Add `GET /api/v1/me` — returns current user + tenant info
- [ ] Security headers via `helmet`
- [ ] CORS config — explicit allowlist, not wildcard
- [ ] Request ID middleware — every request gets a `X-Request-Id` header, logged with every log line
- [ ] Health check endpoint extended: DB connectivity + Redis connectivity
- [ ] Write `docs/local-setup.md` — full setup from scratch (for future-you returning after a break)
- [ ] Write `docs/deployment.md` — how to deploy, rollback, run migrations in prod
- [ ] Set up basic uptime monitoring (UptimeRobot free tier)
- [ ] Final checklist: no `.env` in git, no `synchronize: true` anywhere, no hardcoded secrets

---

## Best Practice References

### RESTful API Design
- [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines)
- [JSONapi.org](https://jsonapi.org/) — response envelope conventions
- Rule of thumb: if you're unsure, ask "would a new developer understand this URL without docs?"

### TypeORM in Production
- Always `synchronize: false`
- Use `migration:generate` to scaffold, then **review and edit** the generated migration before running it
- Use transactions for anything that touches multiple tables
- TypeORM docs: [typeorm.io](https://typeorm.io)

### Multi-Tenancy Security
- `tenant_id` on every table, indexed
- Every query — even internal ones — must include `WHERE tenant_id = $1`
- Postgres RLS is an optional extra safety net (can be added in Phase 4+)
- Never expose internal IDs in URLs — use UUIDs

### NestJS
- [NestJS official docs](https://docs.nestjs.com) are excellent — trust them
- Guards → Authentication/Authorization
- Interceptors → Transform responses, logging
- Pipes → Validation + transformation
- Filters → Exception handling
