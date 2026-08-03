# PetroTrade Customer Web Application

Enterprise B2B customer web portal (desktop companion to the PetroTrade Customer Mobile App).

## Stack

- Next.js 15 (App Router) · React 19 · TypeScript
- Tailwind CSS · shadcn/ui
- TanStack Query · Zustand · Axios
- React Hook Form · Zod · Framer Motion

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command                | Description                          |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Start development server (Turbopack) |
| `npm run build`        | Production build                     |
| `npm start`            | Start production server              |
| `npm run lint`         | ESLint                               |
| `npm run lint:fix`     | ESLint with autofix                  |
| `npm run format`       | Prettier write                       |
| `npm run format:check` | Prettier check                       |
| `npm run typecheck`    | TypeScript (`tsc --noEmit`)          |

## Architecture notes

- Frontend foundation only — mock data, local state, no live APIs
- Route groups prepared for all customer modules
- Axios + TanStack Query + Zustand wired and backend-ready
- Auth middleware placeholder (disabled via `NEXT_PUBLIC_ENABLE_AUTH_GUARD`)
