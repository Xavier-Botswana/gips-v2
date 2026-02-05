# Remediation Plan (Backend + Frontend)

## Guiding Principles
- Security first: enforce verified JWT, role-based access, minimal data exposure.
- Separation of concerns: controllers stay thin; services handle business logic and data access; middlewares handle cross-cutting concerns.
- Consistency: unified response contracts, validation, and transport patterns.
- Backward safety: avoid breaking consumer contracts without aligning frontend; gate risky changes behind validation and feature toggles where feasible.

## Backend Scope (GIPS-Backend)
1) **Auth & Access Control**
   - Replace `jwt.decode` with `jwt.verify` (secret + expiry); standardize error messages for invalid/expired tokens.
   - Apply `authenticate` + role middleware to protected routes (applications, students, users, modules, analytics, admin ops); define role matrix.
   - Normalize login response shape (token naming) for frontend alignment; ensure CORS/allowed origins match deployed hosts.
   - Add startup checks for required envs (JWT secret, PocketBase URL, mail/SMS keys). Fail fast with clear logs.

2) **Error Handling & Response Contracts**
   - Global error handler: prod-safe (no stack traces), consistent JSON `{status, message, errors?}`.
   - Controllers: use `AppError` and shared success helper; remove ad-hoc `res.status().json(error)`.
   - Logging: fix middleware wiring; ensure authenticated requests are logged with minimal PII.

3) **Validation & Payload Hygiene**
   - Add Joi schemas/middleware for applications, users, students, modules (create/update), and file uploads.
   - Enforce field whitelists, types, limits (phone lengths, enums, status transitions), and reject unknown fields.
   - Sanitize query params (page/limit bounds, filter allowlist).

4) **Service/Repository Layer**
   - Introduce services for Applications/Students/Users/Modules encapsulating PocketBase access.
   - Standardize on PocketBase SDK (eliminate mixed Axios calls); add timeouts/retries and filter sanitization.
   - Encapsulate business rules (prerequisite checks, dependent deletions) inside services.

5) **File Upload Safety**
   - Configure multer storage with size/type limits and expected fields.
   - Validate files before Blob conversion; avoid logging file metadata/content.
   - Structured error reporting for upload failures.

6) **Domain Logic Fixes**
   - Fix module controller export/validation clobbering pattern; attach validation without recursion.
   - Protect delete/update paths from dependency breakage; remove console debris.

## Frontend Scope (GIPS-Frontend)
1) **Auth Source of Truth & Token Alignment**
   - Choose Redux as canonical auth store; hydrate from persisted token and set `isInitialized=true` on load.
   - Align token naming with backend login response; ensure axios uses Bearer from state/localStorage.

2) **Guards & Navigation**
   - Fix GuestGuard logic bug and role checks; make RoleBasedGuard null-safe.
   - Ensure unauthenticated users route to login; align role redirect matrix with backend roles.

3) **Axios & Config**
   - Remove `UserObject` header; send only Bearer.
   - Align `baseURL` and path prefixes (`/v1/...`) with backend; provide sensible env defaults.

4) **UX Hotspots to Verify**
   - Login/remember-me, password reset/email change, application submission/upload, student CRUD, role dashboards.

## Implementation Order (High → Medium)
1) Backend auth + role enforcement + login response alignment.
2) Backend error handling and validation layers.
3) Backend services + transport unification; upload constraints for applications.
4) Frontend auth/guard/token alignment and axios cleanup.
5) Regression verification of critical flows above.

## Risks & Drift Points
- Token contract mismatch (`token` vs `accessToken`) can break frontend until aligned—coordinate deploy.
- Enforcing auth on routes may block existing unauthenticated clients; confirm role matrix and rollout plan.
- Validation may reject legacy malformed data; consider feature flag or phased rollout.
- Upload limits/type checks may block oversized/legacy file types; confirm allowed MIME types.
- Changing transport patterns (SDK vs Axios) could alter error shapes; ensure normalized responses before switching.

## Done/Deliverables
- Hardened auth middleware and protected routes.
- Consistent response/error contract and validation middleware across key resources.
- Services for applications/students/users/modules; unified PocketBase access.
- Safe file upload handling for applications.
- Frontend aligned with backend auth/token/guard behavior and axios configuration.

## Audit Tracker
- **Applications (list + API)**: server-side filters for status/course/semester; search/pagination wired to API; delete confirmations added; DTEF moves to backend proxy.
- **Assign Lecturer to Module**: submit wiring fixed, memoized module ID, lecturer load error handling; cleaned unused state.
- **Pending audits**: Results/Modules flows (ManageResults*, ManageSupplement*, Module*), Courses/CourseCreate, DTEF list/reports UI, ArchivesStudentResultsList, Registration/FirstTime flows, General* dashboards.
- **Known lint noise**: numerous unused imports/vars and missing deps across pending pages; requires targeted refactors per flow.
