# Local PostgreSQL Database

Local PostgreSQL development database for FewWords using Docker Compose.

## Quick Start

```bash
# Start PostgreSQL container
bun run db:start:pg

# Stop PostgreSQL container
bun run db:stop:pg
```

## Connection Details

- **Host**: `localhost:5433`
- **Database**: `fewwords`
- **User**: `fewwords`
- **Password**: `fewwords_dev_password`
- **Connection URL**: `postgresql://fewwords:fewwords_dev_password@localhost:5433/fewwords`

## Environment

The `.env` file already contains:

```bash
DATABASE_URL="postgresql://fewwords:fewwords_dev_password@localhost:5433/fewwords"
```

## Why Port 5433?

Using port 5433 instead of default 5432 to avoid conflicts with system PostgreSQL.

## Production

For production, use a managed PostgreSQL service:
- Neon
- Supabase
- Heroku PostgreSQL
- AWS RDS
- Railway

Update `DATABASE_URL` in your production environment variables.
