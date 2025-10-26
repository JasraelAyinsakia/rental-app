# Mould Rental Tracker

A comprehensive web application for managing mould rentals, tracking payments, and processing returns. Built with Next.js, PostgreSQL, and Tailwind CSS.

## Features

### Core Functionality
- **Rental Management**: Create and track mould rentals with customer information
- **Smart Charging**: Automatic calculation based on pickup/return times, excluding Sundays
- **Return Processing**: Calculate refunds or additional payments automatically
- **Receipt Generation**: Print professional receipts for pickup and return
- **Dashboard**: Real-time statistics on active rentals, revenue, and overdue items
- **Inventory Tracking**: Monitor mould availability and usage

### Business Logic
- Daily rental fee: GHS 100
- Deposit required: GHS 1,000
- **Time-based charging rules:**
  - Pickup before 12pm: day is charged
  - Pickup after 12pm: charging starts next day
  - Return before 12pm: day not charged
  - Return after 12pm: day is charged
  - Sundays are excluded from billing

### User Management
- **Admin**: Full access to all features including user management
- **Staff**: Can create rentals and process returns
- Secure authentication with password-based login

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: Custom shadcn/ui components
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Railway, Vercel Postgres, or local)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd rental
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Database (Railway PostgreSQL)
DATABASE_URL="postgresql://user:password@host:port/database"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Company Information (for receipts)
NEXT_PUBLIC_COMPANY_NAME="Your Company Name"
NEXT_PUBLIC_COMPANY_ADDRESS="Your Business Address"
NEXT_PUBLIC_COMPANY_CONTACT="+233 XX XXX XXXX"
NEXT_PUBLIC_COMPANY_EMAIL="info@yourcompany.com"
```

**To generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

4. **Set up the database**

```bash
# Generate Prisma Client
npx prisma generate

# Push database schema
npx prisma db push

# Seed the database with default admin and mould types
npm run prisma:seed
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Login Credentials

After seeding the database:

- **Email**: admin@mouldtracker.com
- **Password**: admin123

⚠️ **Important**: Change the default admin password after first login!

## Mould Types Included

The seed script creates these 17 mould types:
- Ashlar 8
- Indiana
- European fan
- Tile mart 1
- Ashler
- Ashlar Bold
- Ashler bold C
- Royal Ashler Bold 1
- Stone
- Stone/flower rock
- Big couble
- Square Ashlar
- Compass
- Y wood
- Royal ashler B2
- Double bold Wood
- London Couble stone

## Database Schema

### Users
- Authentication and role management (ADMIN/STAFF)

### Customers
- Full name, contact, Ghana Card ID
- Ghana Card collection tracking

### MouldTypes
- Inventory tracking with quantity and availability

### Rentals
- Complete rental records with pickup/return times
- Automatic charge calculations
- Status tracking (ACTIVE/RETURNED/OVERDUE)

## Deployment

### Vercel (Frontend)

1. Push your code to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

### Railway (Database)

1. Create a new PostgreSQL database in Railway
2. Copy the DATABASE_URL connection string
3. Run database migrations:
```bash
npx prisma db push
npm run prisma:seed
```

## Project Structure

```
rental/
├── app/                      # Next.js app directory
│   ├── api/                 # API routes
│   │   ├── auth/           # NextAuth endpoints
│   │   ├── rentals/        # Rental CRUD operations
│   │   ├── moulds/         # Mould inventory
│   │   ├── stats/          # Dashboard statistics
│   │   └── users/          # User management
│   ├── dashboard/          # Dashboard page
│   ├── rentals/            # Rental management pages
│   │   ├── new/           # Create rental
│   │   └── [id]/          # Rental details, return, receipt
│   ├── moulds/             # Inventory page
│   ├── users/              # User management (admin only)
│   └── login/              # Authentication
├── components/
│   ├── layout/             # Layout components (sidebar, header)
│   ├── ui/                 # Reusable UI components
│   └── providers/          # Context providers
├── lib/
│   ├── prisma.ts           # Prisma client
│   ├── auth.ts             # NextAuth configuration
│   ├── utils.ts            # Utility functions
│   └── rental-calculations.ts  # Business logic
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed script
└── types/                  # TypeScript type definitions
```

## Key Features Breakdown

### Dashboard
- Active rentals count
- Overdue rentals tracking
- Daily, weekly, monthly revenue
- Quick action links

### Rental Flow
1. **Create Rental**: Enter customer info, select mould, set pickup time
2. **Active Tracking**: Monitor active rentals, search, filter
3. **Process Return**: Select return time, auto-calculate charges
4. **Generate Receipt**: Print professional receipt with all details

### Calculations
The `rental-calculations.ts` utility handles:
- Billable days calculation
- Sunday exclusion
- Time-based day counting (before/after 12pm)
- Refund/additional payment computation

### Security
- Password hashing with bcrypt
- Session-based authentication
- Role-based access control
- Protected API routes

## API Endpoints

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

### Rentals
- `GET /api/rentals` - List all rentals (with filters)
- `POST /api/rentals` - Create new rental
- `POST /api/rentals/[id]/return` - Process return

### Statistics
- `GET /api/stats` - Dashboard statistics

### Moulds
- `GET /api/moulds` - List all mould types

### Users (Admin only)
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `PATCH /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

## Customization

### Rental Rates
Edit in `lib/rental-calculations.ts`:
```typescript
const DAILY_RATE = 100;
const DEPOSIT_AMOUNT = 1000;
```

### Company Branding
Update environment variables for receipts:
- `NEXT_PUBLIC_COMPANY_NAME`
- `NEXT_PUBLIC_COMPANY_ADDRESS`
- `NEXT_PUBLIC_COMPANY_CONTACT`
- `NEXT_PUBLIC_COMPANY_EMAIL`

### Mould Types
Edit `prisma/seed.ts` to modify the default mould types.

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check database is accessible
- Ensure SSL is properly configured (Railway requires it)

### Authentication Issues
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Clear browser cookies and try again

### Prisma Issues
```bash
# Regenerate Prisma Client
npx prisma generate

# Reset database (WARNING: deletes all data)
npx prisma db push --force-reset
npm run prisma:seed
```

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the code documentation
3. Check Prisma/Next.js documentation

## License

This project is proprietary software developed for mould rental business management.

---

Built with ❤️ using Next.js, TypeScript, and PostgreSQL

