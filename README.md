# Time For Hope

**NDIS & Aged Care Management Platform**

A comprehensive platform for managing NDIS and Aged Care services, designed for clients, support workers, and administrators. Features electronic document signing, user management, and real-time analytics.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account (for database and authentication)
- npm or yarn package manager

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd Time-For-Hope
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Copy `env.example` to `.env.local`
   - Add your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
     ```

4. **Set up the database:**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run `supabase_setup.sql` (creates profiles table)
   - Run `supabase_document_signing.sql` (creates document signing system)
   - Run `supabase_admin_invites.sql` (creates admin invite system)
   - Run `supabase_super_admin.sql` (creates two-tier admin system)

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   - Visit [http://localhost:3000](http://localhost:3000)

---

## 👥 User Types

### 1. **Clients** 👤
- People receiving NDIS or Aged Care services
- Can view care plans, appointments, and documents
- Sign documents electronically
- Self-registration available at `/signup`

### 2. **Support Workers** 👨‍⚕️
- Care providers and support staff
- Manage tasks, submit reports, complete inductions
- Upload required documents
- Self-registration available at `/signup`

### 3. **Administrators** 🛡️

**Two-Tier Admin System:**

**👑 Super Admin (Owner):**
- Full system control
- Can delete users
- Can invite/remove admins
- Manage document templates
- Send documents for signing
- View analytics and reports
- Only ONE super admin (you)
- Created manually via Supabase

**🛡️ Regular Admin (Managers):**
- Invite clients and workers
- Manage day-to-day operations
- Create signing requests
- View compliance reports
- Cannot delete users or invite admins
- Invited by super admin

---

## 🎯 Key Features

### 📄 Document Management System
- **Document Templates** - Create and manage reusable document templates
- **Categories** - Organize by onboarding, consent, compliance, policy
- **Template Types** - Support for PDF documents and online forms
- **Active/Inactive Status** - Control which templates are available

### ✍️ Electronic Document Signing
- **Signing Requests** - Send documents for signature via email
- **Signature Pad** - Draw or type signatures
- **Token-Based Access** - Secure signing links with expiration
- **Audit Trail** - Complete compliance logging
- **Status Tracking** - Pending, sent, viewed, signed, expired

### 📊 Admin Dashboard
- **Real-Time Statistics** - Users, signatures, documents at a glance
- **User Distribution Charts** - Visual breakdown by role
- **Signing Completion Rates** - Track document signing progress
- **Quick Actions** - Fast access to common tasks
- **Recent Users** - View latest registered users

### 👥 User Management
- **Users List** - View all users with search and filter
- **Role Filtering** - Filter by worker, client, admin
- **User Details** - View individual user profiles
- **Role-Based Access** - Secure access control

### For Clients
- ✅ View care plans and appointments
- ✅ Sign documents electronically
- ✅ Track care history
- ✅ Secure document access

### For Support Workers
- ✅ Manage daily tasks
- ✅ Submit progress reports
- ✅ Complete induction modules
- ✅ Upload required documents

### For Administrators
- ✅ Full user management (create, edit, delete)
- ✅ Document template management
- ✅ Send documents for electronic signing
- ✅ Real-time analytics dashboard
- ✅ System-wide compliance tracking
- ✅ Generate reports

---

## 🔐 Authentication System

### Login
- **All users:** Single login page at `/login`
- Automatic role detection and dashboard routing
- No manual role selection needed

### Registration

**Clients & Support Workers:**
- Public signup at `/signup`
- Choose role during registration
- Email verification required

**Administrators:**
- **Super Admin:** Created manually via Supabase (first admin)
- **Regular Admin:** Invite-only by super admin
- No public signup available
- Invite system at `/admin/invite`

📖 **See [TWO_TIER_ADMIN_GUIDE.md](./TWO_TIER_ADMIN_GUIDE.md) for admin hierarchy details**

---

## 📁 Project Structure

```
Time-For-Hope/
├── src/
│   ├── app/
│   │   ├── page.tsx                        # Homepage
│   │   ├── login/                          # Login page
│   │   ├── signup/                         # Public signup (clients & workers)
│   │   │   └── admin/[token]/              # Admin invite signup
│   │   ├── sign/[token]/                   # Public document signing page
│   │   ├── dashboard/
│   │   │   ├── admin/                      # Admin dashboard
│   │   │   │   ├── page.tsx                # Dashboard with stats & charts
│   │   │   │   ├── documents/              # Document templates management
│   │   │   │   ├── signing/                # Signing requests
│   │   │   │   │   ├── page.tsx            # List all signing requests
│   │   │   │   │   └── new/                # Create new signing request
│   │   │   │   └── workers/                # User management
│   │   │   │       ├── page.tsx            # Users list with filters
│   │   │   │       └── [id]/               # User detail view
│   │   │   ├── worker/                     # Worker dashboard
│   │   │   │   ├── page.tsx                # Worker home
│   │   │   │   ├── documents/              # Worker documents
│   │   │   │   └── inductions/             # Induction modules
│   │   │   └── client/                     # Client dashboard
│   │   │       ├── page.tsx                # Client home
│   │   │       └── signing/                # Client signing requests
│   │   ├── admin/
│   │   │   └── invite/                     # Admin invite management
│   │   └── api/
│   │       ├── documents/                  # Document API routes
│   │       │   ├── templates/              # Template CRUD
│   │       │   ├── signing-requests/       # Signing request management
│   │       │   └── sign/[token]/           # Public signing endpoint
│   │       └── upload/                     # File upload endpoint
│   ├── components/
│   │   ├── DashboardLayout.tsx             # Shared dashboard layout
│   │   ├── HeroScene.tsx                   # Homepage hero section
│   │   └── signing/
│   │       └── SignaturePad.tsx            # Electronic signature component
│   └── lib/
│       ├── supabase.ts                     # Supabase client
│       ├── fileValidation.ts               # File upload validation
│       └── services/
│           ├── signing.ts                  # Signing service logic
│           ├── audit.ts                    # Audit logging service
│           └── docuseal.ts                 # DocuSeal integration
├── public/                                 # Static assets
├── supabase_setup.sql                      # Core database schema
├── supabase_document_signing.sql           # Document signing tables
├── supabase_admin_invites.sql              # Admin invite system
└── supabase_super_admin.sql                # Two-tier admin system
```

---

## 🔧 Database Setup

### Required Tables

**Core Tables:**
1. **`profiles`** - User roles and metadata
   - Stores: role, full_name, phone, timestamps
   - Created by: `supabase_setup.sql`

2. **`admin_invites`** - Admin invitation system
   - Stores: invite tokens, expiration, usage tracking
   - Created by: `supabase_admin_invites.sql`

3. **`user_invites`** - Client/Worker invitation system
   - Created by: `supabase_super_admin.sql`

**Document Signing Tables:**
4. **`document_templates`** - Document template storage
   - Stores: name, description, category, template_type, file_url
   - Created by: `supabase_document_signing.sql`

5. **`signing_requests`** - Document signing requests
   - Stores: recipient info, access_token, status, expiry
   - Created by: `supabase_document_signing.sql`

6. **`signed_documents`** - Completed signed documents
   - Stores: signature data, signed PDF, completion timestamp
   - Created by: `supabase_document_signing.sql`

7. **`signing_audit_log`** - Audit trail for compliance
   - Stores: all signing events, IP addresses, user agents
   - Created by: `supabase_document_signing.sql`

8. **`saved_signatures`** - User saved signatures
   - Stores: reusable signature images
   - Created by: `supabase_document_signing.sql`

### Setup Instructions

1. Open Supabase SQL Editor
2. Run `supabase_setup.sql`
3. Run `supabase_document_signing.sql`
4. Run `supabase_admin_invites.sql`
5. Run `supabase_super_admin.sql`
6. Create your super admin manually (see [TWO_TIER_ADMIN_GUIDE.md](./TWO_TIER_ADMIN_GUIDE.md))

---

## 🔒 Security Features

- ✅ **Two-Tier Admin Hierarchy** - Super admin and regular admin roles
- ✅ **Row Level Security (RLS)** - Database-level access control
- ✅ **Role-Based Access Control (RBAC)** - User permissions by role
- ✅ **Token-Based Invites** - Secure invitation system
- ✅ **Token-Based Signing** - Secure document access via unique links
- ✅ **Email Verification** - Required for all new accounts
- ✅ **Automatic Role Detection** - Prevents role spoofing
- ✅ **Invite Expiration** - 7-day limit on admin invites
- ✅ **Signing Expiration** - Configurable expiry on signing requests
- ✅ **Audit Logging** - Complete trail of all signing events

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Styling:** CSS-in-JS (styled-jsx)
- **Icons:** Lucide React
- **Deployment:** Vercel (recommended)

---

## 📚 Documentation

- **[HOW_TO_LOGIN.md](./HOW_TO_LOGIN.md)** - Complete login and registration guide
- **[TWO_TIER_ADMIN_GUIDE.md](./TWO_TIER_ADMIN_GUIDE.md)** - Two-tier admin hierarchy explained
- **[ADMIN_INVITE_GUIDE.md](./ADMIN_INVITE_GUIDE.md)** - Admin invite system setup and usage
- **[AUTHENTICATION_SUMMARY.md](./AUTHENTICATION_SUMMARY.md)** - System architecture overview
- **[SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md)** - Database setup guide

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Environment Variables

Required for production:
```env
NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

---

## 📝 Development Workflow

1. **Start dev server:** `npm run dev`
2. **Build for production:** `npm run build`
3. **Start production server:** `npm start`
4. **Lint code:** `npm run lint`

---

## ❓ Troubleshooting

### "Unable to fetch user profile"
- Ensure `supabase_setup.sql` has been run
- Check user has entry in `profiles` table

### "Invalid invitation link"
- Invite may be expired (7-day limit)
- Invite may already be used
- Generate new invite

### Wrong dashboard after login
- Check user's `role` in `profiles` table
- Should be: `client`, `worker`, `admin`, or `super_admin`

### "Cannot find module" errors
- Run `rm -rf .next && npm install`
- Restart the dev server

### Document signing not working
- Ensure `supabase_document_signing.sql` has been run
- Check that document_templates table exists
- Verify signing_requests RLS policies are in place

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

[Your License Here]

---

## 📞 Support

For issues or questions:
- Check documentation files
- Review troubleshooting guides
- Contact your system administrator

---

**Built with ❤️ for NDIS and Aged Care providers**
