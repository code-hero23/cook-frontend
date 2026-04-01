# 🚀 Unified Cookscape: Enterprise Activity & Performance ERP

Unified Cookscape is a high-fidelity internal management system designed for showroom activity monitoring, performance tracking, and automated reporting. Built with a focus on executive productivity and administrative oversight, it bridges the gap between floor-level visitor intake and senior-level performance analytics.

## 🏗️ System Architecture

The project utilizes a modern **Decoupled Monorepo** architecture, separating the high-performance React frontend from the robust Node.js/Express backend.

### Data Flow Overview

```mermaid
graph TD
    A[User Browser] -- REST API / JWT --> B[Vite/React Frontend]
    B -- Axios Requests --> C[Express.js Server]
    C -- Middleware: Auth/Role Check --> D[Prisma ORM]
    D -- Query/Mutation --> E[(PostgreSQL Database)]
    C -- SMTP / WebPush --> F[Notifications Service]
    B -- XLSX / PapaParse --> G[Excel/CSV Reports]

Folder Structure

unified-cookscape/
├── public/                 # Static assets and PWA icons
├── server/                 # Backend Node.js Environment
│   ├── prisma/             # Schema definitions & database migrations
│   ├── src/
│   │   ├── controllers/    # Business logic (Auth, Walkins, reports)
│   │   ├── middleware/     # JWT Auth & RBAC (Role Based Access Control)
│   │   ├── routes/         # Express API endpoint definitions
│   │   └── services/       # Email, Backup, & Push Notifications
│   └── .env                # Server configuration
├── src/                    # Frontend React Environment
│   ├── components/         # Shared UI components (PWA, Forms)
│   ├── features/           # Feature-based modules (Admin, CRE, Client)
│   │   └── cre/            # Client Relationship Executive Hub
│   ├── shared/             # Global utilities (Axios, Excel, formatting)
│   └── App.jsx             # Main routing and entry point
├── .deploy.sh              # Unified automation deployment script
└── vite.config.js          # Build and PWA configuration
✨ Core Features
🏢 Client Relationship Executive (CRE) Hub
Live Walk-in Hub: Real-time showroom monitor tracking visitor entry/exit, Business Head assignments, and interactive showroom traffic cards.
Work Reports: Daily activity logs for tracking client follow-ups and service status with star-based performance ratings.
Monthly Performance Analytics: Automated tracking of Calls, SRVs, Proposals, and Orders with visual data representation.
📊 Advanced Administrative Tools
Hardened Excel Interoperability: Advanced bulk-import system with automatic date-serial conversion and time-format sanitization (AM/PM to 24h).
Persistent Action UI: Administrative tools (Export/Import/Sync) are strategically placed in persistent bars for 100% visibility during complex workflows.
30-Day Session Management: Extended session longevity to ensure continuity for high-volume data entry users.
🔒 Enterprise Security
RBAC (Role-Based Access Control): Granular permissions for Super Admins, Managers, Business Heads, and CREs.
JWT Authentication: Secure stateless authentication with extended token life.
Database Resilience: Safe schema updates with dedicated automation scripts and Prisma-driven migrations.

🛠️ Tech Stack
Layer	Technology	Primary Use
Frontend	React 19 + Vite	High-performance SPA with fast refresh
UI/UX	Lucide Icons + Framer Motion	Dynamic animations and premium icon set
Styles	TailwindCSS + Vanilla CSS	Utility-first styling and glassmorphism
Backend	Express.js + Node.js	Robust API with modular middleware architecture
Database	PostgreSQL + Prisma ORM	Relational data management and type-safety
Reporting	SheetJS (XLSX)	Advanced Excel parsing and generation
Auth	JWT + Google OAuth	Hybrid authentication (Email + Google SSO)

⚙️ Setup & Installation
1. Prerequisites
Node.js (v18+)
Git
PostgreSQL Instance
2. Standard Installation
bash
# Install root dependencies (Frontend)
npm install
# Install server dependencies (Backend)
cd server
npm install
3. Environment Configuration
Create a .env file in the /server directory:

env
DATABASE_URL="postgresql://user:password@localhost:5432/cookscape"
JWT_SECRET="your_secure_secret"
GOOGLE_CLIENT_ID="your_google_id"
PORT=5000
4. Database Initialization
bash
cd server
npx prisma generate
npx prisma db push
5. Running the Application
bash
# Run Frontend (from root)
npm run dev
# Run Backend (from /server)
npm run dev
📍 API & Internal Logic
Primary Entry Points
Authentication: GET /api/auth/login - Supports JWT generation with 30-day expiry.
Walk-in Management: POST /api/walkins/hub/bulk-import - Processes bulk Excel data with date/time sanitization.
Performance Sync: POST /api/monthly-reports/sync - Synchronizes individual CRE logs into aggregated monthly performance metrics.