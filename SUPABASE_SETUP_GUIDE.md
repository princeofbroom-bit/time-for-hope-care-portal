# 🚀 Quick Supabase Setup Guide

## What You Need to Do:

Copy and paste **3 SQL files** into Supabase, **in this exact order**:

---

## Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Select your **Time For Hope** project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

---

## Step 2: Run SQL File #1

**File:** `supabase_setup.sql`

1. Open the file in your code editor
2. **Copy ALL the content** (Ctrl+A, Ctrl+C)
3. **Paste** into Supabase SQL Editor
4. Click **"Run"** (or press Ctrl+Enter)
5. ✅ You should see: "Success. No rows returned"

**What this does:**
- Creates `profiles` table
- Adds roles: client, worker, admin, super_admin
- Sets up Row Level Security
- Creates auto-signup trigger

---

## Step 3: Run SQL File #2

**File:** `supabase_admin_invites.sql`

1. Click **"New Query"** again
2. Open `supabase_admin_invites.sql`
3. **Copy ALL the content**
4. **Paste** into Supabase SQL Editor
5. Click **"Run"**
6. ✅ You should see: "Success. No rows returned"

**What this does:**
- Creates `admin_invites` table
- Sets up invite token system
- Adds security policies for super admins

---

## Step 4: Run SQL File #3

**File:** `supabase_super_admin.sql`

1. Click **"New Query"** again
2. Open `supabase_super_admin.sql`
3. **Copy ALL the content**
4. **Paste** into Supabase SQL Editor
5. Click **"Run"**
6. ✅ You should see: "Success. No rows returned"

**What this does:**
- Creates `user_invites` table (for client/worker invites)
- Updates policies for two-tier admin system
- Adds helper functions

---

## Step 5: Create Your Super Admin Account

1. In Supabase, go to **Authentication** → **Users**
2. Click **"Add User"**
3. Enter:
   - **Email:** your@email.com
   - **Password:** YourSecurePassword123
4. Click **"Create User"**
5. Go to **Table Editor** → **profiles**
6. Find your user in the list
7. Click on the **role** cell
8. Change it to: `super_admin`
9. Click **Save**

---

## Step 6: Test Your Login

1. Go to: http://localhost:3000/login
2. Enter your email and password
3. You should be redirected to `/dashboard/admin`
4. You should see a **gold crown icon** 👑 and "Super Admin" badge

---

## ✅ Verification Checklist

- [ ] Ran `supabase_setup.sql` successfully
- [ ] Ran `supabase_admin_invites.sql` successfully
- [ ] Ran `supabase_super_admin.sql` successfully
- [ ] Created super admin user in Supabase
- [ ] Set role to `super_admin` in profiles table
- [ ] Can login successfully
- [ ] See crown icon and "Super Admin" badge
- [ ] Can access `/admin/invite` page
- [ ] See 3 role options: Client, Worker, Administrator

---

## 🔒 About Giving Me Access

**I cannot access your Supabase directly**, and that's a good thing for security! 

However, if you encounter errors, you can:

1. **Share the error message** - Copy/paste any error text
2. **Share screenshots** - Show me what you see (hide sensitive data)
3. **Describe the issue** - Tell me what's not working

I can help troubleshoot without needing direct access!

---

## ❓ Common Issues

### "relation 'profiles' already exists"
- The table was already created
- You can skip that file or drop the table first

### "permission denied"
- Make sure you're the project owner
- Check you're in the right project

### "syntax error"
- Make sure you copied the ENTIRE file
- Check for any missing characters

### Can't login after setup
- Verify user exists in Authentication → Users
- Check role is set to `super_admin` in profiles table
- Try clearing browser cache

---

## 🎉 You're Done!

Once all steps are complete, your system will have:
- ✅ All database tables created
- ✅ Security policies active
- ✅ Your super admin account ready
- ✅ Two-tier admin system working

**Next:** Start inviting your team! 🚀
