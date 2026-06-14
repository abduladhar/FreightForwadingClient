# Freight Forwarding ERP Frontend

React, TypeScript, Vite, Tailwind CSS, shadcn/ui-style primitives, TanStack Query/Table, React Hook Form, Zod, Recharts, document upload, print, Excel, PDF, QR, and barcode foundations for the Freight Forwarding ERP.

## Structure

```text
src/
  app/          application bootstrap, providers, router, environment, styles
  api/          Axios client and API response contracts
  auth/         auth provider, storage, login screen
  layouts/      ERP shell, navigation, workspace context
  components/   shared UI, document, print, table, PDF, QR/barcode components
  hooks/        reusable React hooks
  modules/      feature screens by business area
  types/        shared TypeScript contracts
  utils/        formatting, class merging, export helpers
```

## Commands

```powershell
npm install
npm run dev
npm run build
```

Copy `.env.example` to `.env.local` and set `VITE_API_BASE_URL` to the backend API URL.

## Phase 1 Review Hardening

- Login now calls the backend `/api/auth/login` endpoint and stores the returned JWT, refresh token, tenant, branch, roles, and permissions. Demo auth remains available only through `VITE_ENABLE_DEMO_AUTH`.
- Axios applies tenant and branch headers from the active session, not hard-coded UI state.
- Navigation is permission-filtered, and protected routes redirect when the user lacks the required permission.
- Every sidebar route resolves to a real workbench screen; there are no empty placeholder pages or dead navigation links.
- Workspace context tracks tenant, branch, financial year, base currency, language, and culture for downstream modules.
- Currency and date formatting use workspace culture/currency helpers.
- The dashboard uses a TanStack Query API hook with seeded Phase 1 data as placeholder data until the backend dashboard endpoint is connected.

## Phase 2 API And Auth Foundation

- `src/api/axiosClient.ts` provides the shared Axios client with JWT bearer tokens, refresh-token retry, tenant/branch/language/currency headers, global API error mapping, and file upload/download helpers.
- `src/api/authApi.ts` centralizes login, logout, refresh, current-user, and password reset API calls.
- `AuthProvider` loads the current user from `/api/users/profile`, handles session expiry events, preserves remember-me storage, and exposes permission checks.
- `ProtectedRoute`, `PermissionGuard`, and `PermissionButton` provide route, section, and action-level access control.
- `ToastProvider` replaces browser alerts with professional toast notifications for auth and API feedback.
- `ThemeProvider` adds practical light/dark theme state for the ERP shell.
