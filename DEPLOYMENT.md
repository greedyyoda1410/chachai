# Deployment Guide - GitHub + Vercel (v0)

## Prerequisites
- GitHub account
- Vercel account (sign up at https://vercel.com)

## Step 1: Push to GitHub

### Option A: Create a new repository on GitHub
1. Go to https://github.com/new
2. Create a new repository (e.g., `cha-chai-site`)
3. **Don't** initialize with README, .gitignore, or license
4. Copy the repository URL

### Option B: Use existing repository
If you already have a repository, use that URL.

### Push your code:
```bash
cd "/Users/nahiyanabubakr/Documents/Cha Chai Site/Figma Dump"

# Add your GitHub remote (replace with your actual repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### Via Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Vite configuration
5. Configure environment variables:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
6. Click "Deploy"

### Via Vercel CLI (Alternative):
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd "/Users/nahiyanabubakr/Documents/Cha Chai Site/Figma Dump"
vercel

# Follow the prompts:
# - Link to existing project or create new
# - Set environment variables when prompted
```

## Step 3: Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

Add:
- `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `your-anon-key`

**Important**: After adding environment variables, redeploy your project.

## Step 4: Database Migration

After deployment, run the tracking token migration in your Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Run the migration: `supabase/migrations/003_add_order_tracking_token.sql`

This enables order tracking links functionality.

## Step 5: Verify Deployment

1. Visit your Vercel deployment URL
2. Test the application:
   - Customer flow (browse menu, add to cart, checkout)
   - Admin login and dashboard
   - Reports section
   - Menu management

## Troubleshooting

### Build fails:
- Check that all environment variables are set
- Verify `package.json` scripts are correct
- Check Vercel build logs for specific errors

### Runtime errors:
- Verify Supabase environment variables are correct
- Check browser console for errors
- Ensure database migrations are run

### Tracking links not working:
- Run the migration: `003_add_order_tracking_token.sql`
- Verify the migration completed successfully

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:
- `main` branch → Production
- Other branches → Preview deployments

## Next Steps

1. Set up custom domain (optional) in Vercel settings
2. Configure production Supabase project
3. Set up monitoring and error tracking
4. Configure backup strategies for database

