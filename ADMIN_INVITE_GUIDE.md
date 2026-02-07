# Admin Invite System - Setup Guide

## 🎯 Overview

Your Time For Hope application now has a **secure admin invite system**! Here's how it works:

### **User Types:**
1. **👤 Clients** - Can self-register via `/signup`
2. **👨‍⚕️ Support Workers** - Can self-register via `/signup`
3. **🛡️ Administrators** - Can ONLY be invited (no public signup)

---

## 🔧 Database Setup (IMPORTANT - Do This First!)

You need to run TWO SQL scripts in your Supabase dashboard:

### Step 1: Update Profiles Table
1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `supabase_setup.sql`
4. Click **Run**

This creates the profiles table with support for all 3 roles.

### Step 2: Create Admin Invites Table
1. Still in the **SQL Editor**
2. Copy and paste the contents of `supabase_admin_invites.sql`
3. Click **Run**

This creates the `admin_invites` table for managing invitation tokens.

---

## 👥 How to Create Your First Admin Account

Since admins can't self-register, you need to create the first admin manually:

### Option A: Via Supabase Dashboard (Recommended for First Admin)

1. **Go to Supabase Dashboard** → Authentication → Users
2. **Add a new user:**
   - Click "Add User"
   - Email: `your-email@example.com`
   - Password: `your-secure-password`
   - Click "Create User"

3. **Set the role to admin:**
   - Go to **Table Editor** → `profiles`
   - Find your newly created user
   - Set the `role` column to `admin`
   - Set `full_name` if desired

4. **Login:**
   - Go to `http://localhost:3000/login`
   - Enter your credentials
   - You'll be redirected to the admin dashboard!

---

## 📧 How to Invite Additional Administrators

Once you have your first admin account, you can invite others:

### Step 1: Access the Invite Page
1. Login as an admin
2. From your admin dashboard, click **"Invite Administrators"**
3. Or navigate directly to: `http://localhost:3000/admin/invite`

### Step 2: Generate an Invite
1. Enter the email address of the person you want to invite
2. Click **"Generate Invite Link"**
3. The system will create a unique, secure invite link

### Step 3: Share the Invite Link
1. Click **"Copy Invite Link"** on the invitation
2. Send it to the person via email, Slack, etc.
3. The link will look like:
   ```
   http://localhost:3000/signup/admin/abc123-unique-token-xyz789
   ```

### Step 4: They Complete Signup
1. The invited person clicks the link
2. They fill in their name and password (email is pre-filled)
3. They verify their email
4. They can now login as an admin!

---

## 🔒 Security Features

### ✅ Token-Based Invites
- Each invite has a unique, random token
- Tokens are cryptographically secure (UUID v4)

### ✅ Expiration
- Invites expire after **7 days**
- Expired invites cannot be used

### ✅ One-Time Use
- Each invite can only be used once
- After signup, the invite is marked as "used"

### ✅ Email Verification
- New admins must verify their email
- Prevents unauthorized account creation

### ✅ Role Verification
- Only existing admins can create invites
- Protected by Row Level Security (RLS)

---

## 📋 Managing Invites

On the `/admin/invite` page, you can:

- **View all invitations** (pending and used)
- **See expiration dates**
- **Copy invite links**
- **Track which invites have been used**

### Invite Statuses:
- **🟡 Pending** - Not yet used, still valid
- **✅ Used** - Account created successfully
- **❌ Expired** - Past expiration date (7 days)

---

## 🧪 Testing the System

### Test Flow:
1. **Create your first admin** (via Supabase dashboard)
2. **Login as admin** → `http://localhost:3000/login`
3. **Generate an invite** → Click "Invite Administrators"
4. **Copy the invite link**
5. **Open in incognito/private window**
6. **Complete the signup**
7. **Verify email** (check inbox)
8. **Login as the new admin**

---

## 🚀 Quick Reference

### URLs:
- **Public Signup:** `http://localhost:3000/signup` (Clients & Workers only)
- **Login:** `http://localhost:3000/login` (All users)
- **Admin Invite:** `http://localhost:3000/admin/invite` (Admins only)
- **Admin Signup:** `http://localhost:3000/signup/admin/[token]` (Via invite link)

### Database Tables:
- **`profiles`** - User roles and metadata
- **`admin_invites`** - Invitation tokens and tracking

---

## ❓ Troubleshooting

### "Invalid or expired invitation link"
- The invite may have expired (7 days limit)
- The invite may have already been used
- Generate a new invite

### "Unable to fetch user profile"
- Make sure you ran both SQL scripts
- Check that the user has a profile entry

### Can't access `/admin/invite` page
- Make sure you're logged in as an admin
- Check your role in the `profiles` table

### Email verification not working
- Check Supabase email settings
- For testing, manually verify users in Supabase dashboard

---

## 🎉 You're All Set!

Your admin invite system is now:
✅ Secure and token-based
✅ Protected from unauthorized access
✅ Easy to manage and track
✅ Professional and scalable

**Next Steps:**
1. Run the SQL scripts
2. Create your first admin account
3. Start inviting your team!
