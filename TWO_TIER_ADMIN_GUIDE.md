# Two-Tier Admin System

## 🎯 Overview

Your Time For Hope platform now has a **two-tier admin hierarchy** for better security and control.

---

## 👥 Admin Roles

### 👑 **Super Admin** (Owner - Only You)
- **Full system control**
- **Permissions:**
  - ✅ Invite administrators
  - ✅ Invite support workers
  - ✅ Invite clients
  - ✅ Delete any user (clients, workers, admins)
  - ✅ Remove/demote other admins
  - ✅ Access system settings
  - ✅ View all reports and data
  - ✅ Full compliance management

### 🛡️ **Regular Admin** (Managers/Team)
- **Limited administrative access**
- **Permissions:**
  - ✅ Invite support workers
  - ✅ Invite clients
  - ✅ Manage workers and clients (view, edit)
  - ✅ View reports and compliance
  - ✅ Approve documents
  - ❌ Cannot invite other admins
  - ❌ Cannot delete users
  - ❌ Cannot access system settings
  - ❌ Cannot remove other admins

---

## 🔐 Security Model

### **Only ONE Super Admin**
- There should be only **one super admin** (you, the owner)
- This prevents unauthorized system-wide changes
- Emergency super admin can be created via Supabase if needed

### **Multiple Regular Admins**
- You can have as many regular admins as needed
- They help manage day-to-day operations
- Cannot escalate their own permissions

---

## 🚀 How It Works

### **Creating Your Super Admin Account**

1. **Go to Supabase Dashboard** → Authentication → Users
2. **Create your user account**
3. **Go to Table Editor** → `profiles`
4. **Set role to `super_admin`**
5. **Login at** `/login`

### **Inviting Regular Admins** (Super Admin Only)

1. **Login as super admin**
2. **Go to** `/admin/invite`
3. **Select "Administrator" role**
4. **Enter their email**
5. **Click "Invite Administrator"**
6. **Send them the invite link**

### **Inviting Workers/Clients** (Any Admin)

1. **Login as any admin** (super or regular)
2. **Go to** `/admin/invite`
3. **Select "Support Worker" or "Client"**
4. **Enter their email**
5. **Click invite button**
6. **Send them the invite link**

---

## 📊 Permission Matrix

| Action | Super Admin | Regular Admin | Worker | Client |
|--------|-------------|---------------|--------|--------|
| Invite Admins | ✅ | ❌ | ❌ | ❌ |
| Invite Workers/Clients | ✅ | ✅ | ❌ | ❌ |
| Delete Users | ✅ | ❌ | ❌ | ❌ |
| Edit Users | ✅ | ✅ (workers/clients only) | ❌ | ❌ |
| View All Reports | ✅ | ✅ | ❌ | ❌ |
| System Settings | ✅ | ❌ | ❌ | ❌ |
| Manage Compliance | ✅ | ✅ | ❌ | ❌ |

---

## 🗄️ Database Changes

### **Updated Roles**
```sql
role: 'client' | 'worker' | 'admin' | 'super_admin'
```

### **New Tables**
- `user_invites` - For client/worker invitations
- `admin_invites` - For admin invitations (super admin only)

### **Policies**
- Super admins can create admin invites
- Any admin can create client/worker invites
- Role-based access control on all operations

---

## 🔧 Setup Instructions

### **Step 1: Run Database Migration**
```sql
-- In Supabase SQL Editor, run:
supabase_super_admin.sql
```

This will:
- Add `super_admin` role
- Create `user_invites` table
- Update policies
- Set up permissions

### **Step 2: Create Your Super Admin**
1. Go to Supabase Dashboard
2. Authentication → Users
3. Add your user
4. Table Editor → profiles
5. Set role = `super_admin`

### **Step 3: Test the System**
1. Login as super admin
2. Try inviting an admin
3. Try inviting a worker
4. Verify permissions work

---

## 🎨 UI Differences

### **Super Admin Dashboard**
- Shows **crown icon** 👑
- "Super Admin" badge in gold
- Can see "Administrator" option in invite form
- Access to system settings (future feature)

### **Regular Admin Dashboard**
- Shows **shield icon** 🛡️
- "Admin" badge in blue
- Cannot see "Administrator" option in invite form
- Limited to worker/client invitations

---

## 🛡️ Best Practices

### **For Super Admin (You)**
1. **Keep credentials secure** - This account has full control
2. **Don't share super admin access** - Create regular admins instead
3. **Regular backups** - Ensure data is backed up
4. **Monitor admin activity** - Review who's inviting whom

### **For Regular Admins**
1. **Only invite necessary users** - Don't spam invites
2. **Verify email addresses** - Ensure they're correct
3. **Track invite usage** - Monitor who accepts invites
4. **Report issues** - Contact super admin if problems arise

---

## 📋 Common Scenarios

### **Scenario 1: Hiring a New Manager**
1. Super admin creates regular admin invite
2. Manager receives email with invite link
3. Manager completes signup
4. Manager can now invite workers/clients

### **Scenario 2: Manager Needs to Onboard Workers**
1. Regular admin goes to `/admin/invite`
2. Selects "Support Worker"
3. Enters worker email
4. Worker receives invite and signs up

### **Scenario 3: Need to Remove an Admin**
1. Only super admin can do this
2. Go to user management (future feature)
3. Change their role or delete account

---

## 🚨 Security Considerations

### **What if Super Admin Account is Compromised?**
1. Immediately change password in Supabase
2. Review all recent invites
3. Check for unauthorized changes
4. Revoke unused invite tokens

### **What if Regular Admin Goes Rogue?**
1. Super admin can demote them
2. Super admin can delete their account
3. Review and revoke their invites
4. No system-wide damage possible (they can't delete users)

---

## 🔄 Future Enhancements

Potential features to add:
- [ ] Admin activity logs
- [ ] Bulk user invitations
- [ ] Custom permission sets
- [ ] Temporary admin access
- [ ] Admin approval workflows
- [ ] Audit trail for deletions

---

## ✅ Verification Checklist

- [ ] Super admin account created
- [ ] Super admin can login
- [ ] Super admin can invite admins
- [ ] Super admin can invite workers/clients
- [ ] Regular admin account created (via invite)
- [ ] Regular admin can login
- [ ] Regular admin can invite workers/clients
- [ ] Regular admin CANNOT invite admins
- [ ] Regular admin CANNOT delete users
- [ ] UI shows correct badges (crown vs shield)

---

## 📞 Support

**Questions about the two-tier system?**
- Review this guide
- Check `ADMIN_INVITE_GUIDE.md`
- Test in development first
- Contact system administrator

---

**Your platform is now more secure with role-based admin hierarchy!** 🎉
