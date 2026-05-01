# Berves Engineering HRMS

Full-stack Human Resource Management System for Berves Engineering Limited.

## Stack

| Layer     | Technology |
|-----------|-----------|
| Backend   | Laravel 12, PHP 8.2+, Sanctum, Spatie Permissions |
| Frontend  | React 19, Vite, Tailwind CSS, SweetAlert2 |
| Database  | MySQL (berves_hrms) |
| Auth      | Laravel Sanctum (token-based) |

---

## Quick Start

### Backend

```bash
cd berves-backend
composer install
cp .env.example .env
php artisan key:generate
# Edit .env — set DB_DATABASE, DB_USERNAME, DB_PASSWORD
php artisan migrate
php artisan db:seed
php artisan serve
```

Default seed credentials:
| Role            | Email                    | Password           |
|-----------------|--------------------------|--------------------|
| Admin           | admin@berves.com         | Admin@Secure2024!  |
| HR              | hr@berves.com            | Hr@Secure2024!     |
| Payroll Officer | payroll@berves.com       | Payroll@Secure2024!|
| Employee        | employee@berves.com      | Employee@Secure2024!|

### Frontend

```bash
cd berves-frontend
npm install
# Create .env file:
echo "VITE_API_URL=http://127.0.0.1:8000/api/v1" > .env
npm run dev
```

Frontend runs on http://localhost:3000 and proxies `/api` to the Laravel backend.

---

## Architecture

```
berves-engineering-hrms/
├── berves-backend/          # Laravel 12 REST API
│   ├── app/
│   │   ├── Http/Controllers/Api/   # All API controllers
│   │   ├── Models/                  # Eloquent models
│   │   ├── Services/                # Business logic layer
│   │   └── Providers/               # AppServiceProvider (rate limiter)
│   ├── database/
│   │   ├── migrations/              # All 17 migration files
│   │   └── seeders/                 # Sites, departments, users
│   └── routes/api.php               # All API routes
│
└── berves-frontend/         # React 19 + Vite SPA
    └── src/
        ├── api/                     # Axios API layer (per module)
        ├── components/
        │   ├── common/              # Badge, Button, Table, Modal...
        │   └── layout/              # Sidebar, Navbar, AppLayout
        ├── hooks/                   # useAuth, useModal, usePagination
        ├── lib/
        │   ├── axios.js             # Axios instance + interceptors
        │   └── swal.js              # SweetAlert2 helpers (replaces toast)
        ├── pages/                   # One folder per module (11 modules)
        ├── routes/                  # React Router v7 routes
        └── store/                   # Zustand (authStore, uiStore)
```

## Modules

- **Dashboard** — Live stats, attendance chart, pending approvals
- **Employees** — Full CRUD, documents, allowances, audit log
- **Payroll** — Period management, payroll run (Ghana SSNIT + PAYE), payslips
- **Attendance** — GPS check-in/out, geofencing, shift scheduling
- **Leave** — Request, approve/reject, entitlements, off-days, holidays
- **Recruitment** — Job postings, applicant tracking, onboarding checklist
- **Training** — Programs, enrollments, expiry tracking, certifications
- **Performance** — KPI definitions, appraisal cycles, weighted scoring
- **Health & Safety** — Incident reporting, safety inspections
- **Reports** — Payroll, attendance, leave charts + PDF/Excel export
- **Settings** — Payroll cycle, overtime policies, leave policies, sites

## Key Fixes Applied (v2.0)

- ✅ Rate limiter `api` now defined in `AppServiceProvider`
- ✅ Removed broken `$this->authorize('canRunPayroll')` — replaced with role check
- ✅ `bank_account` field encrypted at rest (`encrypted` cast on Employee model)
- ✅ `.env` removed from version control; `.env.example` provided
- ✅ Session files removed from version control
- ✅ `forgotPassword` and `resetPassword` fully implemented
- ✅ Backend role enforcement on Employees, Leave, Attendance, Payroll controllers
- ✅ Migrated from Create React App (`react-scripts`) to Vite
- ✅ Removed `react-hot-toast` — replaced with SweetAlert2 (`src/lib/swal.js`)
- ✅ SweetAlert2 themed to match CSS custom properties (Sora font, teal palette)
- ✅ Duplicate token storage in authStore resolved
- ✅ Dead `useAuth.getState?.()` call in LoginPage removed
