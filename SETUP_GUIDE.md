# Mould Rental Tracker - Setup Guide

This guide will help you set up the application from scratch.

## Step 1: Prerequisites

Make sure you have:
- ✅ Node.js 18 or higher installed
- ✅ A Railway account (for PostgreSQL database)
- ✅ A code editor (VS Code recommended)

## Step 2: Database Setup (Railway)

### 2.1 Create PostgreSQL Database

1. Go to [Railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project"
4. Select "Provision PostgreSQL"
5. Once created, click on the PostgreSQL service
6. Go to "Variables" tab
7. Copy the `DATABASE_URL` connection string

### 2.2 Configure Connection String

The connection string format:
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

Example:
```
postgresql://postgres:abc123xyz@containers-us-west-123.railway.app:5432/railway
```

## Step 3: Project Setup

### 3.1 Install Dependencies

Open terminal in project folder:
```bash
npm install
```

### 3.2 Create Environment File

Create a file named `.env` in the root folder:

```env
# Database - Paste your Railway connection string here
DATABASE_URL="postgresql://user:password@host:port/database"

# NextAuth - Generate a secure secret
NEXTAUTH_SECRET="paste-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Company Info - Customize for your business
NEXT_PUBLIC_COMPANY_NAME="Your Mould Rental Company"
NEXT_PUBLIC_COMPANY_ADDRESS="123 Business Street, Accra, Ghana"
NEXT_PUBLIC_COMPANY_CONTACT="+233 XX XXX XXXX"
NEXT_PUBLIC_COMPANY_EMAIL="info@yourcompany.com"
```

### 3.3 Generate NextAuth Secret

#### On Windows (PowerShell):
```powershell
$bytes = New-Object byte[] 32
[Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

#### On Mac/Linux:
```bash
openssl rand -base64 32
```

Copy the output and paste it as your `NEXTAUTH_SECRET`.

## Step 4: Initialize Database

### 4.1 Push Database Schema
```bash
npx prisma generate
npx prisma db push
```

If successful, you'll see:
```
✔ Generated Prisma Client
✔ Database synchronized with Prisma schema
```

### 4.2 Seed Initial Data
```bash
npm run prisma:seed
```

This creates:
- ✅ Default admin account
- ✅ 17 mould types
- ✅ Initial inventory

You should see:
```
✅ Created admin user: admin@mouldtracker.com
📧 Email: admin@mouldtracker.com
🔑 Password: admin123
✅ Created 17 mould types
🎉 Seed completed successfully!
```

## Step 5: Run the Application

### 5.1 Start Development Server
```bash
npm run dev
```

### 5.2 Open in Browser

Go to: [http://localhost:3000](http://localhost:3000)

### 5.3 Login

Use the default credentials:
- **Email**: `admin@mouldtracker.com`
- **Password**: `admin123`

⚠️ **IMPORTANT**: Change this password immediately after login!

## Step 6: First Steps After Login

### 6.1 Change Admin Password
1. Go to "Users" in the sidebar
2. Click Edit on the admin user
3. Set a new secure password
4. Click "Update User"

### 6.2 Create Staff Users (Optional)
1. Stay on "Users" page
2. Click "Add User"
3. Fill in details:
   - Name: Staff member's name
   - Email: Their work email
   - Password: Temporary password (they should change it)
   - Role: Select "Staff"
4. Click "Create User"

### 6.3 Verify Mould Inventory
1. Go to "Moulds" in sidebar
2. You should see 17 mould types
3. Each should show 10 quantity and 10 available
4. Edit quantities as needed for your actual inventory

### 6.4 Create Your First Rental
1. Go to "Dashboard"
2. Click "New Rental" or use sidebar
3. Fill in customer details:
   - Full Name
   - Contact Number
   - Ghana Card ID
   - Check if Ghana Card collected
4. Select mould type
5. Set pickup date and time
6. Click "Create Rental"
7. Print the receipt

## Step 7: Daily Operations

### Creating a Rental
1. Click "Rentals" → "New Rental"
2. Enter customer information
3. Select mould and pickup time
4. System prints pickup receipt

### Processing a Return
1. Go to "Rentals" 
2. Find the active rental
3. Click the checkmark icon
4. Select return date and time
5. System calculates:
   - Days used (excluding Sundays)
   - Total charges
   - Refund or additional payment
6. Confirm return
7. Print return receipt

### Viewing Dashboard
- Active rentals count
- Overdue rentals alert
- Revenue tracking (daily/weekly/monthly)

## Troubleshooting

### Database Connection Fails

**Error**: "Can't reach database server"

**Solutions**:
1. Check DATABASE_URL is correct
2. Verify Railway database is running
3. Check internet connection
4. Try regenerating the connection string in Railway

### Prisma Generate Fails

**Error**: "Prisma schema not found"

**Solution**:
```bash
# Make sure you're in the project root
cd rental

# Try again
npx prisma generate
```

### Seed Script Fails

**Error**: "Email already exists"

**Solution**: Database already seeded. Skip or reset:
```bash
npx prisma db push --force-reset
npm run prisma:seed
```

### Can't Login

**Solutions**:
1. Check email is `admin@mouldtracker.com`
2. Check password is `admin123`
3. Clear browser cache and cookies
4. Try incognito/private window
5. Check NEXTAUTH_SECRET is set in .env

### Port 3000 Already in Use

**Solution**:
```bash
# Use a different port
npm run dev -- -p 3001
```

Then open: http://localhost:3001

## Advanced Configuration

### Changing Rental Rates

Edit `lib/rental-calculations.ts`:
```typescript
const DAILY_RATE = 100;  // Change to your rate
const DEPOSIT_AMOUNT = 1000;  // Change to your deposit
```

### Adding More Mould Types

Edit `prisma/seed.ts` and add to the `mouldTypes` array:
```typescript
const mouldTypes = [
  'Ashlar 8',
  'Your New Mould Type',  // Add here
  // ... rest of types
];
```

Then run:
```bash
npm run prisma:seed
```

### Customizing Receipt

Edit `app/rentals/[id]/receipt/page.tsx` to change:
- Layout
- Colors
- Logo (add image)
- Terms and conditions

## Deployment to Production

### Option 1: Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables (same as .env)
6. Click "Deploy"

### Option 2: Other Platforms

Works with:
- Netlify
- Render
- Digital Ocean
- AWS

Just ensure Node.js 18+ and PostgreSQL are supported.

## Getting Help

### Check These First
1. Is your .env file configured correctly?
2. Is the database running?
3. Did you run `prisma generate` and `prisma db push`?
4. Are there any error messages in the terminal?

### Common Commands Reference

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Update database schema
npx prisma db push

# Seed database
npm run prisma:seed

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# View database in browser
npx prisma studio
```

## Security Checklist

Before going live:
- ✅ Change default admin password
- ✅ Use strong NEXTAUTH_SECRET
- ✅ Enable SSL for database connection
- ✅ Set up database backups in Railway
- ✅ Don't commit .env file to git
- ✅ Use environment variables in production
- ✅ Regularly update staff passwords

## Congratulations! 🎉

Your Mould Rental Tracker is now set up and ready to use!

For more details, see the main README.md file.

