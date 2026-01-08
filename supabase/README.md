# Supabase Database Files

This directory contains all database-related SQL files organized by purpose.

## Directory Structure

### `migrations/`
Official database migrations that should be run in order to set up or update the database schema.

- `001_initial_schema.sql` - Initial database schema with all tables, RLS policies, and functions
- `003_add_order_tracking_token.sql` - Adds order tracking token functionality

**Usage**: Run these migrations in order in your Supabase SQL Editor when setting up a new database or updating the schema.

### `scripts/`
Utility scripts for common database operations and setup tasks.

- `create_admin_account.sql` - Script to create an admin account
- `enable_menu_items_for_sale.sql` - Enable all menu items for sale
- `populate_dummy_orders.sql` / `populate_dummy_orders_fixed.sql` - Populate test orders
- `update_null_icons_and_images.sql` - Update null icons and images
- `verify_and_fix_admin.sql` - Verify and fix admin access

**Usage**: Run these scripts as needed for setup, testing, or maintenance tasks.

### `fixes/`
Emergency fixes and patches that were created to resolve specific issues.

- `fix_all_admin_access.sql` - Fix admin access issues
- `fix_orders_insert.sql` / `fix_orders_insert_final.sql` - Fix order insertion issues
- `fix_orders_policies_complete.sql` - Fix order-related RLS policies
- `fix_rls.sql` / `fix_rls_simple.sql` / `fix_rls_emergency.sql` - Various RLS policy fixes
- `fix_rpc_permissions.sql` - Fix RPC function permissions

**Usage**: These are historical fixes. Only use if you encounter the specific issues they address. Most fixes have been incorporated into the main migrations.

### `seed.sql`
Initial seed data for development and testing.

**Usage**: Run this after migrations to populate the database with sample data.

## Setup Order

1. Run migrations in order: `migrations/001_initial_schema.sql`, then `migrations/003_add_order_tracking_token.sql`
2. (Optional) Run `seed.sql` for sample data
3. (Optional) Run scripts from `scripts/` as needed
4. Only use files from `fixes/` if you encounter specific issues

## Notes

- Always backup your database before running any SQL scripts
- Test scripts in a development environment first
- The fixes directory contains historical patches - most issues are now resolved in the main migrations

