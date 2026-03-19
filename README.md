# Chronexa NestJS Backend Boilerplate

> **Enterprise-ready Monorepo Starter Template for NestJS Backend**
>
> Maintained by [gowdaman-dev](https://github.com/gowdaman-dev) — Full Stack Developer
>
> [GitHub](https://github.com/gowdaman-dev) | [Instagram](https://instagram.com/_gxwdm_) | [LinkedIn](https://linkedin.com/in/gowdaman-dev)

---

## Table of Contents

- [Overview](#overview)
- [Goals & Audience](#goals--audience)
- [Project Structure](#project-structure)
- [Detailed Module Documentation](#detailed-module-documentation)
- [Installation & Local Development](#installation--local-development)
- [Environment Variables](#environment-variables)
- [Running & Debugging](#running--debugging)
- [Testing Strategy](#testing-strategy)
- [CI / CD Recommendations](#ci--cd-recommendations)
- [Deployment Guidance](#deployment-guidance)
- [Security & Best Practices](#security--best-practices)
- [Extending The Template](#extending-the-template)
- [Contributing](#contributing)
- [License & Contact](#license--contact)

---

## 🚀 Overview

This repository provides a production-minded NestJS backend boilerplate arranged as a monorepo. It contains opinionated defaults and modular building blocks to accelerate backend development for enterprise applications.

Designed to:

- Reduce bootstrap time for backend services
- Enforce scalable folder structure and modularity
- Provide ready-to-use authentication, config, email, and redis integration
- Encourage best practices for testing and CI/CD

---

## 🎯 Goals & Audience

Who this template is for:

- Backend engineers building microservices or monolithic APIs
- Teams who want a standardized, maintainable starting point
- Developers who prefer TypeScript-first, testable, and modular code

What it provides:

- Core features (auth, configs, email, redis)
- Clear module separation for easier ownership and testing
- Opinionated conventions for environment, logging, and deployment

---

## 🏗️ Project Structure (detailed)

Top-level layout (abridged):

```
backend/
├── apps/
│   ├── auth/           # Auth microservice (controllers, module, main)
│   └── gateway/        # API gateway (controllers, modules)
├── libs/
│   ├── authentication/ # Auth strategies, guards, decorators
│   ├── config/         # Centralized config & validation
│   ├── email/          # Email service, templates, processors
│   └── redis/          # Redis integration layer
├── package.json
└── README.md
```

- The `apps/auth/src` folder implements authentication endpoints and glue to `libs/authentication`.

### Database (Prisma)

This project uses Prisma via the `nestjs-prisma` integration. The generated Prisma client is placed in `generated/prisma` and the schema is located at `prisma/schema.prisma`.

Key points:

- Prisma schema: `prisma/schema.prisma` — modify this to evolve your data model.
- Generated client: `generated/prisma` — the codebase imports the client from here (run `pnpm prisma generate` to create/update it).
- The repo includes `nestjs-prisma` setup (see `libs/config/config.module.ts` where `PrismaModule.forRoot()` is configured).

Developer notes:

- After installing dependencies run `pnpm prisma generate` to produce the client locally.
- In CI add `pnpm prisma generate` before build/test steps so the generated client is available.
- To change output directory update the `generator.client.output` setting in `prisma/schema.prisma` and adjust imports.
- The `libs/authentication` package contains strategies (`jwt.strategy.ts`, `azure.strategy.ts`, `local.strategy.ts`), guards (`jwt-auth.guard.ts`), decorators (`current-user.decorator.ts`), and interfaces.
- `libs/config` centralizes environment configuration and validation (see `config.service.ts`).
- `libs/email` includes DTOs, `email.service.ts`, and Handlebars templates used for transactional emails.
- `libs/redis` provides a thin wrapper to create and inject Redis clients throughout the codebase.

---

## 📚 Detailed Module Documentation

This section documents the purpose and internals of each major module so maintainers can onboard quickly.

After installing, generate Prisma client (required when using Prisma locally):

```bash
pnpm prisma generate
```

### apps/auth

Purpose: expose authentication endpoints (login, refresh, logout, etc.) and orchestrate auth flows.

What to look for:

- `apps/auth/src/auth.controller.ts` — REST endpoints and request validation
- `apps/auth/src/auth.service.ts` — high-level business rules around authentication
- `apps/auth/src/main.ts` — app bootstrap and server configuration

### apps/gateway

Purpose: main API gateway that composes routes and integrates middleware, rate-limiting, and global guards.

What to look for:

- `apps/gateway/src/gateway.controller.ts` — example endpoint surface
- `apps/gateway/src/gateway.service.ts` — example service wiring
- `apps/gateway/src/main.ts` — gateway bootstrap

### libs/authentication

Purpose: encapsulates authentication logic that multiple apps can reuse.

Contents:

- Strategies:
  - `jwt.strategy.ts` — validates JWT tokens and extracts payloads
  - `local.strategy.ts` — username/password authentication flow
  - `azure.strategy.ts` — Azure AD integration (legacy passport-azure-ad; consider updating)
- Guards: `jwt-auth.guard.ts` — guard that protects routes requiring authentication
- Decorators: `current-user.decorator.ts` — helper to inject the current user into controllers
- Interfaces: shared types like `jwt-payload.interface.ts`

Notes:

- Password hashing uses `bcrypt`.
- Tokens are issued using `@nestjs/jwt` and validated in the `jwt.strategy`.

### libs/config

Purpose: central place for environment configuration and validation.

What to look for:

- `config.service.ts` — typed access for environment variables
- `schema.ts` — JSON schema or `joi`-style validation for required env vars (if present)

Best practices:

- Keep secrets out of the repo; inject via CI/CD secrets or runtime environment variables
- Add typed getters in `ConfigService` for high-value settings (e.g., `getJwtSecret()`)

### libs/email

Purpose: transaction email support.

What to look for:

- `email.service.ts` — wrapper around `nodemailer`/providers
- `templates/` — Handlebars templates for emails like welcome messages
- `dto/send-mail.dto.ts` — typed DTO for sending email requests

Notes:

- Replace SMTP provider configs with provider-specific packages (SendGrid, SES) later if needed.

### libs/redis

Purpose: extendable Redis client for caching, session, or pub/sub.

What to look for:

- `redis.service.ts` — initializes and exposes Redis client

---

## ⚡ Installation & Local Development

Prerequisites

- Node.js 18+ (LTS recommended)
- `pnpm` installed globally: `npm i -g pnpm`

Install dependencies

```bash
pnpm install
```

Run apps locally (examples)

```bash
# Run the auth app
pnpm --filter ./apps/auth start:dev

# Run the gateway app
pnpm --filter ./apps/gateway start:dev
```

Notes:

- We use `pnpm` workspaces — `pnpm --filter` runs commands in a workspace package.
- If you prefer `nx` or `turborepo`, this scaffold can be migrated; the current layout stays simple and framework-agnostic.

---

## 🔧 Environment Variables

Create a `.env` file at the repo root (do NOT commit it). Example variables:

```
# Server
PORT=3000

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=3600s

# Database (example)
DATABASE_URL=postgresql://user:pass@localhost:5432/app

# Redis
REDIS_URL=redis://localhost:6379

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=you@example.com
SMTP_PASS=supersecret

# Azure AD (if used)
AZURE_CLIENT_ID=...
AZURE_TENANT_ID=...
AZURE_CLIENT_SECRET=...

# Misc
NODE_ENV=development
```

Recommended: Use a secrets manager for production (AWS Secrets Manager, Azure Key Vault, Vault).

---

## 🏃 Running & Debugging

Start in development mode with hot reload (watch):

```bash
pnpm run start:dev
```

Debugging in VS Code

- Add a launch configuration that runs `pnpm run start:debug` or `ts-node-dev` if configured.
- Attach the VS Code debugger to the running process.

Logging

- The project uses Nest's logger by default. Consider integrating `pino` or `winston` for structured logs.

---

## ✅ Testing Strategy

This template aims to make testing first-class.

- Unit tests: located alongside modules using `*.spec.ts`
- E2E tests: run in an isolated environment using in-memory DB or test containers

Commands:

```bash
pnpm run test        # unit tests
pnpm run test:e2e    # e2e tests
pnpm run test:cov    # coverage
```

Best practices:

- Keep unit tests fast and focused on single modules
- Use integration tests for database and messaging interactions
- Run linting and tests in CI before merging PRs

---

## 🤖 CI / CD Recommendations

Provide at least the following steps in CI (GitHub Actions example):

- Install dependencies (`pnpm install`) with the lockfile
- Run `pnpm run lint` and `pnpm run test` (fail fast)
- Build artifacts (`pnpm run build`) and publish packages (if using private registry)
- Deploy via CD pipeline (triggered on `main`/`release` tags)

Example GitHub Actions steps (summary):

1. Checkout
2. Use Node.js 18
3. `pnpm install` with cache
4. `pnpm run lint` and `pnpm run test`
5. Build and optionally publish or deploy

---

## ☁️ Deployment Guidance

This template is cloud-agnostic. Recommended deployment patterns:

- Containerize with Docker and push to a container registry
- Use Kubernetes (EKS/GKE/AKS) for microservices
- For serverless APIs, migrate gateway to AWS Lambda / Azure Functions with Nest adapters

Example Dockerfile minimal:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build
CMD ["node", "dist/apps/gateway/main.js"]
```

---

### Local dev services with Docker Compose

This repository includes a `docker-compose.yaml` at the project root to quickly bring up local infrastructure services used by the apps (Redis and RabbitMQ).

To start the services in the background:

```bash
# using Docker Compose v2+ (recommended)
docker compose up -d

# or with the standalone docker-compose binary
docker-compose up -d
```

To stop and remove containers and networks:

```bash
docker compose down
# or
docker-compose down
```

Notes:

- The compose file exposes Redis on `6379` and the RabbitMQ management UI on port `15672`.
- Named volumes are declared in the compose file to persist service data across restarts.
- This compose file is intended for local development only — for production use, run services in your cloud provider or orchestration platform (Kubernetes, ECS, etc.).

If you want to run the full application stack with Docker, create a `docker-compose.override.yml` or extend the compose file to build application images (using the `Dockerfile` above) and wire service dependencies.

## 🔐 Security & Best Practices

- Keep secrets out of source control
- Rotate keys regularly and use short-lived tokens
- Validate and sanitize all external inputs
- Rate-limit sensitive endpoints (auth, password reset)
- Use HTTPS and HSTS in production
- Regularly run dependency audits (`pnpm audit`) and address high-severity findings

Notes:

- `passport-azure-ad` is deprecated; consider using MSAL or direct JWT validation for Azure integrations.

---

## ✨ Extending The Template

How to add a new package/app:

1. Create a new folder under `apps/` or `libs/` with a `package.json` and `tsconfig` (follow existing conventions)
2. Add build and start scripts to root `package.json` if needed
3. Wire shared libs via TypeScript path mappings or `pnpm` workspace references

Recommended steps for adding features:

- Add unit tests as you add logic
- Keep modules small and single-responsibility
- Expose shared functionality from `libs/` to avoid duplication

---

## 🤝 Contributing

Contributions are welcome. Suggested workflow:

- Fork the repository
- Create feature branch: `git checkout -b feat/your-feature`
- Run tests and lint locally
- Open a PR with a clear description and tests

Please follow conventional commits and include tests for new features/bug fixes.

---

## 📦 Changelog

Keep a `CHANGELOG.md` and update it for releases. Follow `Keep a Changelog` or semantic versioning.

---

## 📞 Contact & Support

If you find issues or want improvements, open an issue or PR.

Author: **gowdaman-dev**

- GitHub: https://github.com/gowdaman-dev
- Instagram: https://instagram.com/_gxwdm_
- LinkedIn: https://linkedin.com/in/gowdaman-dev

---

## 📝 License

This project is released under the MIT License.

---

_End of documentation — ask me to include architecture diagrams, example requests, or CI workflow files if you want them added._
