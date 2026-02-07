# How to Login to Time For Hope

## 🚀 Quick Start Guide

Your Time For Hope application now supports **3 user types** with automatic role-based routing:

### User Types:
1. **👤 Clients** - People receiving care
2. **👨‍⚕️ Support Workers** - Care providers
3. **🛡️ Administrators** - Business owners/managers

---

## 📝 Creating Test Accounts

### Option 1: Using the Signup Page (For Clients & Support Workers)

1. **Navigate to the signup page:**
   - Open your browser and go to: `http://localhost:3000/signup`

2. **Select your role:**
   - Choose between **Client** or **Support Worker**
   - ⚠️ **Note:** Administrator is NOT available here (invite-only)

3. **Fill in your details:**
   - Email: Use any valid email format (e.g., `client@test.com`)
   - Password: Minimum 8 characters

4. **Verify your email:**
   - Check your email inbox for the verification link
   - Click the link to activate your account

5. **Login:**
   - Go to `http://localhost:3000/login`
   - Enter your email and password
   - You'll be automatically redirected to the correct dashboard based on your role!

---

### Option 3: Creating Administrator Accounts (Invite-Only)

⚠️ **Administrators cannot self-register!** They must be invited by an existing admin.

#### For Your First Admin (Manual Setup):
1. **Go to Supabase Dashboard** → Authentication → Users
2. **Add a new user** with your email and password
3. **Go to Table Editor** → `profiles`
4. **Set the `role` to `admin`**
5. **Login at** `http://localhost:3000/login`

#### For Additional Admins (Invite System):
1. **Login as an existing admin**
2. **Go to** `http://localhost:3000/admin/invite`
3. **Enter the new admin's email**
4. **Click "Generate Invite Link"**
5. **Send the unique link to them**
6. **They complete signup via the invite link**

📖 **See `ADMIN_INVITE_GUIDE.md` for detailed instructions**

---

### Option 2: Using Supabase Dashboard (For Testing)

If you want to bypass email verification for testing:

1. **Go to your Supabase project dashboard:**
   - Visit: https://supabase.com/dashboard

2. **Navigate to Authentication:**
   - Click on "Authentication" in the left sidebar
   - Click "Users"

3. **Add a new user:**
   - Click "Add User" or "Invite User"
   - Enter email and password
   - Click "Create User"

4. **Set the user's role:**
   - Go to "Table Editor" → "profiles"
   - Find the user you just created
   - Set the `role` column to either: `client`, `worker`, or `admin`

5. **Login:**
   - Go to `http://localhost:3000/login`
   - Enter the credentials
   - You'll be redirected to the appropriate dashboard!

---

## 🎯 What Happens After Login?

The system automatically detects your role and redirects you:

- **Clients** → `/dashboard/client` (View care plans, appointments, documents)
- **Support Workers** → `/dashboard/worker` (Manage tasks, submit reports)
- **Admins** → `/dashboard/admin` (Full system access, manage users)

---

## 🔧 Database Setup Required

**IMPORTANT:** Before you can login, you need to run the updated database schema:

1. **Open your Supabase SQL Editor:**
   - Go to your Supabase project
   - Click "SQL Editor" in the left sidebar

2. **Run the setup script:**
   - Copy the contents of `supabase_setup.sql`
   - Paste it into the SQL editor
   - Click "Run"

This will:
- Create the `profiles` table with support for all 3 roles
- Set up Row Level Security policies
- Create triggers for automatic profile creation

---

## 🧪 Quick Test Accounts

Here are some suggested test accounts you can create:

```
Client Account (via /signup):
Email: client@test.com
Password: client123
Role: client

Support Worker Account (via /signup):
Email: worker@test.com
Password: worker123
Role: worker

Admin Account (via Supabase Dashboard or Invite):
Email: admin@test.com
Password: admin123
Role: admin
⚠️ Must be created manually in Supabase or via invite link
```

---

## ❓ Troubleshooting

**"Unable to fetch user profile" error:**
- Make sure you've run the `supabase_setup.sql` script
- Check that the user has a profile entry in the `profiles` table

**Email verification not working:**
- Check your Supabase email settings
- For testing, you can manually verify users in the Supabase dashboard

**Wrong dashboard showing:**
- Check the user's `role` in the `profiles` table
- Make sure it's set to: `client`, `worker`, or `admin`

---

## 🎉 You're All Set!

Your login system now:
✅ Supports 3 user types
✅ Automatically detects roles from the database
✅ Redirects users to the correct dashboard
✅ Provides a clean, simple login experience

Visit `http://localhost:3000` to get started!
