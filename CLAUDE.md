# Time For Hope - NDIS Support Platform

## Project Overview
NDIS (National Disability Insurance Scheme) support coordination platform built for Time For Hope. Manages workers, clients, compliance documents, and electronic document signing.

## Tech Stack
- **Framework**: Next.js 16 with App Router & Turbopack
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **PDF**: pdf-lib, @react-pdf/renderer
- **Signatures**: signature_pad
- **Animation**: Framer Motion, GSAP, Three.js

## Commands
```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Environment Variables
Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_key
```

## User Roles
| Role | Access |
|------|--------|
| `super_admin` | Full system access, can invite admins |
| `admin` | Manage workers, clients, documents |
| `worker` | Upload compliance docs, view assignments |
| `client` | Sign documents, view their files |

## Project Structure
```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── login/                      # Auth
│   ├── signup/                     # User registration
│   ├── sign/[token]/               # Public document signing
│   ├── admin/invite/               # Admin invitation page
│   └── dashboard/
│       ├── admin/                  # Admin dashboard
│       │   ├── documents/          # Document templates
│       │   ├── signing/            # Send docs for signing
│       │   └── workers/            # User management
│       ├── worker/                 # Worker dashboard
│       │   ├── documents/          # Upload compliance docs
│       │   └── inductions/         # Training modules
│       └── client/                 # Client dashboard
│           └── signing/            # Sign documents
├── components/                     # Reusable components
├── lib/
│   ├── supabase.ts                # Supabase client
│   ├── auth.ts                    # Auth utilities
│   └── fileValidation.ts          # File security validation
└── middleware.ts                   # Auth & role-based routing
```

## Database Tables
- `profiles` - User profiles with roles
- `workers` - Worker-specific data & compliance docs
- `clients` - Client information
- `document_templates` - PDF templates for signing
- `signing_requests` - Document signing workflows
- `signed_documents` - Completed signed documents
- `admin_invites` - Admin invitation tokens

## Storage Buckets
- `compliance-docs` - Worker compliance documents (10MB limit)
- `document-signing` - Templates & signed PDFs (50MB limit)

## Key Patterns

### Role Caching
Middleware caches user role in httpOnly cookie (`user_role`) for 1 hour to avoid DB queries on every request.

### File Validation
All uploads go through `/api/upload` with:
- Magic byte validation
- File type checking
- Size limits
- Admin review for large files

### RLS Policies
All tables have Row Level Security. Policies include `super_admin` in admin checks:
```sql
role IN ('admin', 'super_admin')
```

## Important Notes
- Always include `super_admin` when checking for admin role
- Use `getSupabaseServer()` for server components, `getSupabase()` for client
- Document signing uses secure tokens with expiration
- Clear role cookie on logout: `user_role`
