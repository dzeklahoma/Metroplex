#!/bin/sh
set -e

echo "Resetting metroplex_test schema..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c 'DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;'

echo "Applying migrations..."
npx prisma migrate deploy --schema prisma/schema.prisma

echo "Done."