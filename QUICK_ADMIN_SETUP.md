# Quick Admin Setup - TL;DR

## 🚀 For First Time Setup (Recommended)

### Windows (PowerShell):

```powershell
cd scripts
.\setup-admin.ps1 -FirstUser
```

### Linux/Mac (Bash):

```bash
cd scripts
chmod +x setup-admin.sh
./setup-admin.sh -f
```

## 📧 Promote Specific User

### Windows:

```powershell
cd scripts
.\setup-admin.ps1 -Email "user@example.com"
```

### Linux/Mac:

```bash
cd scripts
./setup-admin.sh -e "user@example.com"
```

## 📝 List All Users First

### Windows:

```powershell
cd scripts
.\setup-admin.ps1 -ListUsers
```

### Linux/Mac:

```bash
cd scripts
./setup-admin.sh -l
```

## 🔍 Direct SQL (Copy & Paste)

### Promote by Email:

```sql
UPDATE public.profiles SET role = 'admin', updated_at = NOW() WHERE email = 'YOUR_EMAIL@example.com';
```

### Promote First User:

```sql
UPDATE public.profiles SET role = 'admin', updated_at = NOW() WHERE id = (SELECT id FROM public.profiles ORDER BY created_at ASC LIMIT 1);
```

### View All Users:

```sql
SELECT id, email, full_name, role, created_at FROM public.profiles ORDER BY created_at ASC;
```

### View All Admins:

```sql
SELECT email, full_name, role FROM public.profiles WHERE role = 'admin';
```

## ✅ After Promotion

1. Logout from the application
2. Login again
3. You should see "Import from Excel" button on dashboard

## 📚 Full Documentation

See `ADMIN_SETUP.md` for detailed instructions and troubleshooting.
