# Pulse

Pulse is a real-time, person-to-person and group chat application. This repository contains the backend API — built by hand from raw documentation as a learning-focused project, with authentication, friendships, and conversation management already working, and real-time messaging via Socket.io still in progress.

> **Status: work in progress.** The REST API for users, friendships, and conversations is functional. Messages and the Socket.io real-time layer are actively being built.

## Tech Stack

**Backend**

- [Express 5](https://expressjs.com/) — async route/middleware rejections are automatically forwarded to error-handling middleware, no manual `try/catch` boilerplate required
- [Socket.io](https://socket.io/) — real-time messaging layer (in progress)
- [Better Auth](https://www.better-auth.com/) — authentication (email/password, OAuth), cookie-based sessions
- [Drizzle ORM](https://orm.drizzle.team/) + PostgreSQL — schema, migrations, and queries
- [Neon](https://neon.tech/) — serverless Postgres hosting
- [Cloudinary](https://cloudinary.com/) — image upload/storage (profile pictures, group avatars)
- [Zod](https://zod.dev/) — request validation
- [Multer](https://github.com/expressjs/multer) — multipart/form-data file upload handling
- TypeScript, run via [tsx](https://github.com/privatenumber/tsx)

**Frontend** _(separate repository)_

- React + Vite
- ShadCN UI
- TanStack Query
- Axios

## Features

### Done

- **Auth** — email/password sign-up and sign-in via Better Auth, cookie-based sessions
- **Users** — profile retrieval and updates (name, avatar via Cloudinary upload), user search
- **Friendships** — send/accept/reject friend requests, list friends and pending requests (incoming/outgoing), block/remove
- **Conversations** — create direct (1:1) and group conversations, list a user's conversations, view conversation details, update group name/avatar, add/remove participants, leave a group (with automatic admin hand-off if the last admin leaves)

### In progress

- **Messages** — sending, editing (soft), deleting (soft), paginated history per conversation
- **Real-time layer** — Socket.io events for message delivery, typing indicators, and presence

### Planned

- Read receipts (per-message, beyond the existing per-conversation `lastReadAt`)
- Frontend integration

## Project Structure

```
pulse-backend/
├── config/
│   ├── cloudinary.ts   # Cloudinary client config
│   └── constants.ts    # centralized env var access
├── docs/
│   └── pulse-api.postman_collection.json   # Postman collection for manual API testing
├── drizzle/
│   ├── schemas/
│   │   ├── auth-schema.ts              # Better Auth tables (user, session, account, verification)
│   │   ├── conversation-schema.ts      # conversation, conversationParticipant
│   │   ├── message-schema.ts           # message
│   │   ├── friendship-schema.ts        # friendship (+ status enum)
│   │   └── relations.ts                # all relations() calls, kept separate to avoid circular imports
│   ├── schema.ts                       # barrel export of all schema files
│   └── db.ts                           # Drizzle db instance (Neon)
├── lib/
│   ├── auth.ts         # Better Auth configuration
│   ├── errors.ts       # AppError class for typed, status-coded service errors
│   └── multer.ts       # multer memory storage config
├── middlewares/
│   ├── auth.middleware.ts              # requireAuth — validates Better Auth session
│   ├── validate.middleware.ts          # generic Zod validation for body/query/params
│   ├── upload.middleware.ts            # streams uploaded files to Cloudinary
│   └── error.middleware.ts             # centralized error handler
├── modules/
│   ├── users/
│   │   ├── user.controller.ts
│   │   ├── user.schema.ts
│   │   ├── users.routes.ts
│   │   └── users.service.ts
│   ├── friendships/
│   │   ├── friendships.controller.ts
│   │   ├── friendships.routes.ts
│   │   ├── friendships.schema.ts
│   │   └── friendships.service.ts
│   ├── conversations/
│   │   ├── conversations.controller.ts
│   │   ├── conversations.routes.ts
│   │   ├── conversations.schema.ts
│   │   └── conversations.service.ts
│   └── messages/                       # in progress
├── types/
│   └── express.d.ts        # Request type augmentation (req.user, Multer.File.cloudinary)
├── index.ts                # server entry point (Express app, HTTP server, Socket.io)
├── drizzle.config.ts
├── tsconfig.json
└── package.json
```

Each module under `modules/` follows the same three-layer pattern:

- **`*.routes.ts`** — wires HTTP verbs/paths to controllers, applies middleware
- **`*.controller.ts`** — reads `req`/`res`, calls the service, sends the response
- **`*.service.ts`** — business logic and Drizzle queries, with no knowledge of Express (so it can eventually be called from Socket.io handlers too)

## Database Schema

Four custom tables sit alongside Better Auth's generated tables (`user`, `session`, `account`, `verification`):

- **`conversation`** — a chat thread, direct or group (`isGroup`, `name`, `avatarUrl`, `createdBy`)
- **`conversationParticipant`** — join table linking users to conversations, with a `role` (`member`/`admin`) and `lastReadAt` for unread tracking
- **`message`** — belongs to a conversation and a sender, with soft-delete (`deletedAt`) and edit tracking (`updatedAt`)
- **`friendship`** — self-referencing on `user`, with a `status` enum (`pending`, `accepted`, `rejected`, `blocked`)

Design notes:

- Direct messages and groups share the same `conversation`/`conversationParticipant` structure — no separate DM table — so the schema didn't need to change when group support was added.
- `randomUUID()` via `$defaultFn` generates IDs on all custom tables.
- A composite index on `message(conversationId, createdAt)` supports paginated message history.
- `relations()` calls live in a single `relations.ts` file, separate from table definitions, to avoid circular imports across schema files.

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (this project uses [Neon](https://neon.tech/)'s free tier)
- A [Cloudinary](https://cloudinary.com/) account (free tier) for image uploads

### Setup

1. Clone the repo and install dependencies:

   ```bash
   git clone <repo-url>
   cd pulse-backend
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in the values:

   ```env
   PORT=3000
   FRONTEND_URL=http://localhost:5173

   DATABASE_URL=

   BETTER_AUTH_SECRET=
   BETTER_AUTH_URL=http://localhost:3000

   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   ```

   Use the **pooled** Neon connection string for `DATABASE_URL`.

3. Run migrations:

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```

The server runs at `http://localhost:3000`.

## API Testing

A Postman collection is available at [`docs/pulse-api.postman_collection.json`](docs/pulse-api.postman_collection.json).

Import it into Postman, set the `base_url` and `frontend_url` collection variables, then run `Auth > SignIn` first — this API uses cookie-based sessions, so Postman will automatically store your session cookie for subsequent authenticated requests.

## Scripts

| Script                | Purpose                                                               |
| --------------------- | --------------------------------------------------------------------- |
| `npm run dev`         | Start the dev server with hot reload (`tsx watch`)                    |
| `npm run build`       | Type-check and compile to `dist/`                                     |
| `npm run start`       | Run the compiled build                                                |
| `npm run typecheck`   | Type-check without emitting output                                    |
| `npm run db:generate` | Generate a Drizzle migration from schema changes                      |
| `npm run db:migrate`  | Apply pending migrations                                              |
| `npm run db:studio`   | Open Drizzle Studio to browse the database                            |
| `npm run db:push`     | Push schema changes directly (dev convenience, skips migration files) |

## Notes on Free-Tier Hosting

- **Neon** free-tier compute auto-suspends after inactivity; the first request after idle time may be slow or occasionally fail with a connection error as the compute resumes. Retrying resolves it.
- Planned deployment targets: **Render** (backend, supports WebSockets), **Neon** (database), **Cloudflare Pages or Vercel** (frontend) — all free-tier.
