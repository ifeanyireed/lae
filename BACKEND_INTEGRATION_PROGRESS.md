# Backend Integration & Implementation Progress Tracker

> **Goal**: Wire the Controls Dashboard (`/controls`), Schools Portal (`/schools`), Families Portal (`/families`), and Onboarding Wizard (`/onboarding`) to the `player_service` and `game_engine` Go microservices with live PostgreSQL/MySQL database persistence.

---

## 📊 Overall Progress Summary

- [x] **Phase 1: Database Schema Expansion & Microservice Models** *(Completed)*
- [x] **Phase 2: Go Microservice REST API Handlers (`player_service`)** *(Completed)*
- [x] **Phase 3: Frontend API Client Layer (`frontend/src/services/api.ts`)** *(Completed)*
- [x] **Phase 4: Dashboard & Portal Wiring (`/controls`, `/schools`, `/families`, `/onboarding`)** *(Completed)*
- [x] **Phase 5: E2E Verification, Type Checks & Production Build Validation** *(Completed)*

---

## 🗓️ Phase Breakdown & Task Lists

### Phase 1: Database Schema Expansion & Microservice Models
- [x] Add `Organisation` struct and `organisations` table to `player_service/internal/database/schema.go`
- [x] Add `organisation_id` foreign key to `groups` table
- [x] Add `organisation_id` and `assigned_world_id` columns to `users` table
- [x] Add `Subscription` struct and `subscriptions` table to `schema.go`
- [x] Update `InitPlayerServiceSchema()` auto-migration DDL and seed data in `schema.go`

### Phase 2: Go Microservice REST API Handlers (`player_service`)
- [x] Implement `OrganisationsHandler` (GET, POST, PUT, DELETE, Google Ads toggle) in `player_service/internal/handlers/handlers.go`
- [x] Implement `UsersAdminHandler` (GET, POST, PUT, DELETE, World assignment, code regeneration) in `handlers.go`
- [x] Implement `BatchSaveUsersHandler` (POST `/api/v1/users/batch`) for bulk user/child onboarding in `handlers.go`
- [x] Implement `SubscriptionsHandler` (GET, POST) in `handlers.go`
- [x] Register routes in `player_service/main.go` / `handlers.go` with CORS enabled for `http://localhost:3000`

### Phase 3: Frontend API Client Layer
- [x] Create `frontend/src/services/api.ts` with typed fetch wrappers:
  - `fetchOrganisations()`, `saveOrganisation()`, `deleteOrganisation()`, `toggleGoogleAds()`
  - `fetchUsers()`, `saveUser()`, `saveBatchUsers()`, `deleteUser()`, `assignWorld()`, `regenerateStudentCode()`
  - `fetchSubscriptions()`, `saveSubscription()`

### Phase 4: Dashboard & Portal Wiring
- [x] Wire `/controls/page.tsx` state and modals to live REST API
- [x] Wire `/schools/page.tsx` student roster, class management, and active school name to live REST API & onboarding session
- [x] Wire `/families/page.tsx` child accounts, access codes, and family profile name to live REST API & onboarding session
- [x] Wire `/onboarding/page.tsx` wizard submission (multi-child onboarding) to `saveBatchUsers` REST API and persist session state
- [x] Clean up avatar options across controls, schools, families, and onboarding (removed 4 obsolete avatars: cowboy, pirate, viking, indie character)

### Phase 5: Verification & Production Build
- [x] Run `go build ./...` and `go test ./...` on `player_service` to verify Go backend compilation and handlers
- [x] Run `npx tsc --noEmit` to verify TypeScript type safety
- [x] Run `npm run build` to validate Next.js static export
- [x] Commit and push changes to GitHub `main` branch
