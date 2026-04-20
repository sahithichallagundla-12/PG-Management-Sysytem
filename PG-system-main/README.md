# 🏘️ PG Management System

A modern web application for managing Paying Guest accommodations - connecting owners, tenants, and service providers in one platform.

## ⚡ Quick Start

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Supabase account (free tier available)

### Installation

```bash
# 1. Clone and install
git clone <repo-url>
cd pg-management-system
pnpm install

# 2. Create .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 3. Start development
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## ✨ Key Features

### 🏢 Owners

- Property & room management
- Tenant tracking & payments
- Complaint/maintenance system
- Staff management
- Real-time analytics

### 👥 Tenants

- Browse & book rooms
- Digital payments
- File complaints
- Rate services
- Personal dashboard

### 🔧 Service Providers

- View work assignments
- Update task status
- Request payments

### 🌐 Public

- Search & filter PGs
- View details & amenities
- Instant booking

## 🛠️ Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **UI:** Radix UI components, Framer Motion animations
- **Backend:** Next.js API routes
- **Database:** Supabase (PostgreSQL)
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts

## 📁 Project Structure

```
app/               → Pages & API routes
├── api/           → Backend endpoints
├── owner/         → Owner dashboard
├── tenant/        → Tenant portal
├── service/       → Service provider portal
└── find-pgs/      → Public search

components/        → Reusable UI components
lib/               → Utilities & contexts
public/            → Static assets
scripts/           → Database migrations
```

## 📖 Setup Guide

### 1. Supabase Setup (5 mins)

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get API keys from **Settings → API**
4. Copy credentials to `.env.local`

### 2. Database Setup

Run SQL migrations in Supabase SQL Editor:

```sql
-- See scripts/001_create_tables.sql for full schema
```

### 3. Storage Buckets

Create two public buckets:

- `pg-images` - Property photos
- `rooms` - Room photos

## 🚀 Development

```bash
# Development server
pnpm dev

# Production build
pnpm build
pnpm start

# Linting
pnpm lint
```

## 🌐 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repo to [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Self-Hosted

```bash
pnpm build
pnpm start
```

Use PM2 for production:

```bash
pm2 start "pnpm start" --name pg-system
```

## 📚 API Endpoints

### Auth

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login

### PGs

- `GET /api/pgs` - List all PGs
- `POST /api/pgs` - Create PG (owner only)
- `GET /api/pgs/[id]` - Get PG details

### Bookings

- `POST /api/bookings` - Create booking
- `GET /api/bookings/[id]` - Get booking status

### Payments

- `POST /api/payments` - Process payment
- `GET /api/payments/[id]` - Payment status

## 🗄️ Database Schema

**Users** → Profiles with roles (owner, tenant, service)  
**PGs** → Properties with rooms  
**Rooms** → Individual room listings  
**Bookings** → Room reservations  
**Payments** → Payment records  
**Complaints** → Maintenance tickets  
**Service Workers** → Staff assignments

## 🐛 Troubleshooting

| Issue                      | Solution                                                      |
| -------------------------- | ------------------------------------------------------------- |
| Database connection failed | Check Supabase URL & keys in `.env.local`                     |
| Images not loading         | Verify bucket names match code & policies allow public access |
| Build errors               | Run `rm -rf .next && pnpm install && pnpm build`              |
| Auth errors                | Clear browser cache, verify credentials                       |

## 📋 Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Optional
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=
```

## 🤝 Contributing

1. Fork repo
2. Create feature branch: `git checkout -b feature/name`
3. Commit: `git commit -am 'Add feature'`
4. Push: `git push origin feature/name`
5. Open Pull Request

## 📞 Support

- **Docs:** See [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
- **Issues:** GitHub Issues
- **Email:** support@pg-system.com

## 📦 Dependencies Summary

**Key Packages:**

- next 16.2.0, react 19.2.4
- @supabase/supabase-js, pg
- tailwindcss, framer-motion
- react-hook-form, zod
- @radix-ui/\* (UI components)

See [REQUIREMENTS.txt](REQUIREMENTS.txt) for complete list

## 🚀 Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Storage buckets created
- [ ] Auth providers enabled
- [ ] Build passes: `pnpm build`
- [ ] Test on production: `pnpm start`
- [ ] Deploy to Vercel/server

## 📄 License

MIT License - feel free to use this project

---

**Ready to get started?** Follow the [Quick Start](#quick-start) above!

For detailed setup, see [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
