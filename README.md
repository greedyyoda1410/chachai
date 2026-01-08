# Cha Chai Ordering System

A modern ordering system for Cha Chai restaurant with bilingual support (English/Bengali).

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: React Context + TanStack Query
- **Routing**: React Router v7
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Build Tool**: Vite

## Prerequisites

- Node.js 18+ (or use the version specified in your project)
- npm, yarn, or pnpm package manager
- Supabase account and project

## Setup Instructions

### 1. Install Dependencies

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm (recommended)
pnpm install
```

**Note**: This project uses React as peer dependencies. Make sure React and React DOM are installed:

```bash
npm install react@18.3.1 react-dom@18.3.1
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API
3. Copy your project URL and anon key

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

See `.env.example` for the template.

### 4. Set Up Database

1. Run the migration to create the database schema:
   - Go to your Supabase project → SQL Editor
   - Run the SQL from `supabase/migrations/001_initial_schema.sql`

2. Seed the database with initial data:
   - Run the SQL from `supabase/seed.sql` in the SQL Editor

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The app will be available at `http://localhost:5173` (or the port shown in the terminal).

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Project Structure

```
Figma Dump/
├── src/
│   ├── app/
│   │   ├── components/      # React components
│   │   │   ├── admin/       # Admin panel components
│   │   │   ├── customer/    # Customer-facing components
│   │   │   └── ui/          # Reusable UI components
│   │   ├── contexts/        # React Context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── locales/         # Translation files
│   │   └── App.tsx          # Main app component
│   ├── lib/
│   │   ├── services/        # API service functions
│   │   └── supabase/        # Supabase client configuration
│   ├── styles/              # Global styles
│   └── main.tsx             # App entry point
├── supabase/
│   ├── migrations/          # Database migrations (run in order)
│   ├── scripts/             # Utility scripts for setup and maintenance
│   ├── fixes/               # Historical emergency fixes (mostly incorporated into migrations)
│   ├── seed.sql             # Seed data for development
│   └── README.md            # Database files documentation
├── tests/                   # Test files and scripts
└── index.html               # HTML entry point
```

## Features

### Customer Features
- Browse menu by categories
- View item details with add-ons
- Shopping cart
- Checkout with pickup/delivery options
- Order tracking
- Bilingual interface (English/Bengali)

### Admin Features
- Admin dashboard
- Order management
- Menu item management
- Category management
- Real-time order updates

## Next Steps

After setting up the project:

1. **Configure Supabase RLS Policies**: Review and adjust Row Level Security policies in the migration file as needed
2. **Set up Authentication**: Configure admin authentication if not already set up
3. **Add Images**: Set up Supabase Storage buckets for menu item images
4. **Configure Delivery Zones**: Add delivery zones through the admin panel or database
5. **Test Order Flow**: Test the complete ordering flow from customer to admin

## Support

For issues or questions, please refer to the project documentation or contact the development team.

