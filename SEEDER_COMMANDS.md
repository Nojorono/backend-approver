# Seeder Commands

This document explains how to use the database seeder commands in the NestJS application.

## Available Commands

### 1. Regular Seeding
```bash
npm run seed
```
- Runs all seeders (roles, menus, users)
- Only creates data if it doesn't already exist
- Safe to run multiple times

### 2. Refresh Seeding
```bash
npm run seed:refresh
```
- **WARNING**: This will clear ALL existing data
- Truncates all tables and re-creates fresh data
- Use this when you want to start with a clean database

## What Gets Seeded

### Roles
- `admin` - Administrator with full access
- `audit` - Audit role with read-only access
- `requestor` - Requestor role for creating requests
- `approver` - Approver role for approving requests

### Users
| Email | Username | Password | PIN | Phone | Role |
|-------|----------|----------|-----|-------|------|
| `admin@example.com` | `admin` | `admin123` | `1234567890` | `09123456789` | Admin |
| `audit@example.com` | `audit` | `audit123` | `1234567890` | `091234567891` | Audit |
| `requestor@example.com` | `requestor` | `requestor123` | `1234567890` | `091234567892` | Requestor |
| `approver@example.com` | `approver` | `approver123` | `1234567890` | `091234567893` | Approver |
| `multi@example.com` | `multi` | `multi123` | `1234567890` | `091234567894` | Requestor + Approver |

### Menus
- Complete menu structure with role-based permissions
- Hierarchical menu system (parent-child relationships)
- Menu-role assignments for access control

## When to Use Each Command

### Use `npm run seed` when:
- Setting up the application for the first time
- Adding new seed data
- Running in production (safe operation)

### Use `npm run seed:refresh` when:
- You want to reset all data to initial state
- Testing with fresh data
- Development environment cleanup
- **NEVER use in production**

## Database Tables Affected

The refresh command truncates these tables:
- `user_roles` - User-role relationships
- `menu_roles` - Menu-role relationships  
- `menu_children` - Menu hierarchy
- `users` - User accounts
- `user_profiles` - User profile data
- `menus` - Menu items
- `roles` - Role definitions

## Security Notes

- All passwords, PINs, emails, and phone numbers are hashed using bcrypt
- Users are created with `isActive: true`
- Role assignments are properly linked via foreign keys
- Use validation methods for comparing hashed values
