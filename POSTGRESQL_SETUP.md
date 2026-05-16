# Comprehensive PostgreSQL Setup Guide for Symptom Checker App

This guide provides detailed step-by-step instructions to set up PostgreSQL for storing user signup credentials and enabling login functionality in your Next.js symptom checker application.

## Prerequisites
- Windows operating system
- Node.js and npm installed
- Basic knowledge of command line operations

## Step 1: Install PostgreSQL

### Download and Install
1. Visit https://www.postgresql.org/download/windows/
2. Download the latest stable version (15.x or 16.x recommended)
3. Run the installer as Administrator
4. Choose default installation directory (C:\Program Files\PostgreSQL\)
5. Select components to install:
   - PostgreSQL Server
   - pgAdmin 4 (GUI tool)
   - Command Line Tools
   - Stack Builder (optional)
6. Set a password for the postgres user (remember this password!)
7. Choose default port (5432)
8. Select locale (default is fine)
9. Complete the installation

### Verify Installation
1. Open Command Prompt
2. Run: `psql --version`
   - Should show: `psql (PostgreSQL) 15.x.x`
3. Run: `pg_ctl --version`
   - Should show PostgreSQL version

## Step 2: Create Database

### Using pgAdmin (Recommended for beginners)
1. Launch pgAdmin 4 from Start Menu
2. Connect to server:
   - Host: localhost
   - Port: 5432
   - Username: postgres
   - Password: [the password you set during installation]
3. Right-click on "Databases" in the left panel
4. Select "Create" → "Database..."
5. Database name: `symptom_checker`
6. Owner: postgres
7. Encoding: UTF8
8. Click "Save"

### Using Command Line (Alternative)
1. Open Command Prompt
2. Run: `psql -U postgres`
3. Enter the postgres password when prompted
4. Execute SQL commands:
```sql
CREATE DATABASE symptom_checker;
GRANT ALL PRIVILEGES ON DATABASE symptom_checker TO postgres;
\q
```

### Verify Database Creation
In pgAdmin:
- Refresh the Databases section
- You should see `symptom_checker` database

Or via command line:
```bash
psql -U postgres -d symptom_checker -c "SELECT version();"
```

## Step 3: Configure Application Database Connection

### Update Prisma Schema
1. Open `prisma/schema.prisma`
2. Change the datasource from sqlite to postgresql:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Update Environment Variables
1. Open `.env.local` file
2. Replace the DATABASE_URL line:
```
DATABASE_URL="postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/symptom_checker?schema=public"
```
Replace `YOUR_POSTGRES_PASSWORD` with the actual password you set during PostgreSQL installation.

### Update API Routes (Remove SQLite Adapter)
The signup and login API routes currently use a SQLite adapter. For PostgreSQL, we need to remove this.

1. Open `app/api/auth/signup/route.ts`
2. Remove these lines:
```typescript
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });
```
3. Change to:
```typescript
const prisma = new PrismaClient();
```

4. Do the same for `app/api/auth/login/route.ts`

## Step 4: Install PostgreSQL Client (if needed)
If not already installed, add PostgreSQL client to your project:
```bash
npm install pg
```

## Step 5: Generate Prisma Client
```bash
npx prisma generate
```
This generates the database client based on your schema.

## Step 6: Create and Run Database Migrations
```bash
npx prisma migrate dev --name init
```
This will:
- Create migration files in `prisma/migrations/`
- Apply the schema to your PostgreSQL database
- Generate the database tables

### Expected Output
```
Loaded Prisma config from prisma.config.ts.
Prisma schema loaded from prisma/schema.prisma.
Datasource "db": PostgreSQL database "symptom_checker", schema "public" at "localhost:5432"

Applying migration `20240120000000_init`
The following migration(s) will be applied:
20240120000000_init

✅ Migration applied successfully
```

## Step 7: Verify Database Tables

### Using pgAdmin
1. In pgAdmin, expand `symptom_checker` database
2. Expand `Schemas` → `public` → `Tables`
3. You should see tables: `User`, `Account`, `Session`

### Using Command Line
```bash
psql -U postgres -d symptom_checker -c "\dt"
```

Expected output:
```
             List of relations
 Schema |     Name     | Type  |  Owner
--------+--------------+-------+----------
 public | Account      | table | postgres
 public | Session      | table | postgres
 public | User         | table | postgres
 public | _prisma_migrations | table | postgres
```

### Check Table Structure
```sql
-- Check User table structure
\d User

-- Check Account table structure
\d Account

-- Check Session table structure
\d Session
```

## Step 8: Test Database Connection
```bash
npx prisma db push
```
This should complete without errors.

## Step 9: Start the Application
```bash
npm run dev
```
Visit http://localhost:3000 to test signup and login.

## Step 10: Manual Database Operations (Optional)

### Insert Test User (via SQL)
```sql
-- Connect to database
psql -U postgres -d symptom_checker

-- Insert a test user (password should be hashed in production)
INSERT INTO "User" (id, name, email, "password", "emailVerified", image)
VALUES (
  'test-user-id',
  'Test User',
  'test@example.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6fMmiP2l6', -- 'password' hashed
  NULL,
  NULL
);

-- Verify insertion
SELECT * FROM "User";
```

### Query Users
```sql
-- List all users
SELECT id, name, email FROM "User";

-- Count users
SELECT COUNT(*) FROM "User";

-- Find user by email
SELECT * FROM "User" WHERE email = 'test@example.com';
```

### Delete Test Data
```sql
-- Delete test user
DELETE FROM "User" WHERE email = 'test@example.com';

-- Reset auto-increment sequences if needed
ALTER SEQUENCE "User_id_seq" RESTART WITH 1;
```

## Step 11: Troubleshooting

### Common Issues

#### Authentication Failed
- Check DATABASE_URL in .env.local
- Ensure PostgreSQL service is running: `net start postgresql-x64-15`
- Verify password in connection string

#### Database Does Not Exist
```sql
-- Create database manually
CREATE DATABASE symptom_checker;
```

#### Migration Errors
```bash
# Reset database
npx prisma migrate reset

# Or drop and recreate
npx prisma db push --force-reset
```

#### Connection Timeout
- Check if PostgreSQL is running on port 5432
- Verify firewall settings
- Try connecting with psql directly

### Useful Commands
```bash
# Check PostgreSQL status
net start postgresql-x64-15

# Stop PostgreSQL
net stop postgresql-x64-15

# View logs
# Logs are in C:\Program Files\PostgreSQL\15\data\log\

# Backup database
pg_dump -U postgres symptom_checker > backup.sql

# Restore database
psql -U postgres symptom_checker < backup.sql
```

## Step 12: Production Deployment Considerations

### Environment Variables
- Use strong passwords
- Set `DATABASE_URL` in production environment
- Consider connection pooling for high traffic

### Security
- Change default postgres password
- Use SSL connections in production
- Implement proper password hashing (already done with bcryptjs)

### Backup Strategy
- Regular automated backups
- Test restore procedures
- Store backups securely

## Summary
You have successfully set up PostgreSQL to store user credentials for signup and login. The application now uses a robust database system suitable for production use.

Key files modified:
- `prisma/schema.prisma`: Changed provider to postgresql
- `.env.local`: Updated DATABASE_URL
- `app/api/auth/signup/route.ts`: Removed SQLite adapter
- `app/api/auth/login/route.ts`: Removed SQLite adapter

The database now contains tables for User, Account, and Session management, ready to handle authentication operations.