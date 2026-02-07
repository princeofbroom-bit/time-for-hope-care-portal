# Time For Hope

**NDIS & Aged Care Management Platform**

A comprehensive platform for managing NDIS and Aged Care services, designed for clients, support workers, and administrators.

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
   - Copy `.env.example` to `.env.local`
   - Add your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
     ```

4. **Set up the database:**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run `supabase_setup.sql` (creates profiles table)
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
- Self-registration available at `/signup`

### 2. **Support Workers** 👨‍⚕️
- Care providers and support staff
- Manage tasks, submit reports, complete inductions
- Self-registration available at `/signup`

### 3. **Administrators** 🛡️

**Two-Tier Admin System:**

**👑 Super Admin (Owner):**
- Full system control
- Can delete users
- Can invite/remove admins
- Only ONE super admin (you)
- Created manually via Supabase

**🛡️ Regular Admin (Managers):**
- Invite clients and workers
- Manage day-to-day operations
- Cannot delete users or invite admins
- Invited by super admin

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
│   │   ├── page.tsx                    # Homepage
│   │   ├── login/                      # Login page
│   │   ├── signup/                     # Public signup (clients & workers)
│   │   │   └── admin/[token]/          # Admin invite signup
│   │   ├── dashboard/
│   │   │   ├── client/                 # Client dashboard
│   │   │   ├── worker/                 # Worker dashboard
│   │   │   └── admin/                  # Admin dashboard
│   │   └── admin/
│   │       └── invite/                 # Admin invite management
│   ├── components/                     # Reusable components
│   └── lib/                           # Utilities and helpers
├── public/                            # Static assets
├── supabase_setup.sql                # Database schema
├── supabase_admin_invites.sql        # Admin invite system
├── supabase_super_admin.sql          # Two-tier admin system
└── Documentation/
    ├── HOW_TO_LOGIN.md               # Login guide
    ├── ADMIN_INVITE_GUIDE.md         # Admin invite system guide
    ├── TWO_TIER_ADMIN_GUIDE.md       # Two-tier admin hierarchy
    └── AUTHENTICATION_SUMMARY.md     # System overview
```

---

## 🔧 Database Setup

### Required Tables

1. **`profiles`** - User roles and metadata
   - Stores: role (client/worker/admin/super_admin), full_name, timestamps
   - Created by: `supabase_setup.sql`

2. **`admin_invites`** - Admin invitation system (super admin only)
   - Stores: invite tokens, expiration, usage tracking
   - Created by: `supabase_admin_invites.sql`

3. **`user_invites`** - Client/Worker invitation system
   - Stores: invite tokens, role, expiration, usage tracking
   - Created by: `supabase_super_admin.sql`

### Setup Instructions

1. Open Supabase SQL Editor
2. Run `supabase_setup.sql`
3. Run `supabase_admin_invites.sql`
4. Run `supabase_super_admin.sql`
5. Create your super admin manually (see [TWO_TIER_ADMIN_GUIDE.md](./TWO_TIER_ADMIN_GUIDE.md))

---

## 🎯 Key Features

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

**Super Admin:**
- ✅ Full user management (create, edit, delete)
- ✅ Invite and remove administrators
- ✅ System-wide compliance tracking
- ✅ Generate all reports
- ✅ Access system settings

**Regular Admin:**
- ✅ Invite clients and workers
- ✅ Manage clients and workers (view, edit)
- ✅ View compliance reports
- ✅ Monitor worker progress
- ✅ Approve documents

---

## 🔒 Security Features

- ✅ **Two-Tier Admin Hierarchy** - Super admin and regular admin roles
- ✅ **Row Level Security (RLS)** - Database-level access control
- ✅ **Role-Based Access Control (RBAC)** - User permissions by role
- ✅ **Token-Based Invites** - Secure invitation system
- ✅ **Email Verification** - Required for all new accounts
- ✅ **Automatic Role Detection** - Prevents role spoofing
- ✅ **Invite Expiration** - 7-day limit on admin invites

---

## 📚 Documentation

- **[HOW_TO_LOGIN.md](./HOW_TO_LOGIN.md)** - Complete login and registration guide
- **[TWO_TIER_ADMIN_GUIDE.md](./TWO_TIER_ADMIN_GUIDE.md)** - Two-tier admin hierarchy explained
- **[ADMIN_INVITE_GUIDE.md](./ADMIN_INVITE_GUIDE.md)** - Admin invite system setup and usage
- **[AUTHENTICATION_SUMMARY.md](./AUTHENTICATION_SUMMARY.md)** - System architecture overview

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Styling:** CSS Modules
- **Deployment:** Vercel (recommended)

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
- Should be: `client`, `worker`, or `admin`

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
- Check documentation in `/docs`
- Review troubleshooting guides
- Contact your system administrator

---

**Built with ❤️ for NDIS and Aged Care providers**
