param(
  [string]$DatabaseUrl = ""
)

$ErrorActionPreference = "Stop"

# Prefer .env.test unless explicitly provided
if ([string]::IsNullOrWhiteSpace($DatabaseUrl)) {
  $DatabaseUrl = (Get-Content ".env.test" | Select-String "^DATABASE_URL=" | ForEach-Object { $_.Line.Substring(13) })
}

$env:DATABASE_URL = $DatabaseUrl

Write-Host "Resetting metroplex_test schema..."
docker compose exec -T postgres psql -U postgres -d metroplex_test -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;"

Write-Host "Applying migrations..."
npx prisma migrate deploy --schema prisma/schema.prisma

Write-Host "Generating Prisma client..."
npx prisma generate --schema prisma/schema.prisma

Write-Host "Done."