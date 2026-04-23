#!/usr/bin/env bash
# verify-docs.sh - Verifica integridade da documentacao e configuracao do projeto Rede Vital
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ERRORS=0

check() {
  local desc="$1"
  shift
  if "$@" >/dev/null 2>&1; then
    echo "  [OK] $desc"
  else
    echo "  [FAIL] $desc"
    ERRORS=$((ERRORS + 1))
  fi
}

echo "=== Verificando documentacao ==="
check "CLAUDE.md existe" test -f "$PROJECT_ROOT/CLAUDE.md"
check "docs/ARCHITECTURE.md existe" test -f "$PROJECT_ROOT/docs/ARCHITECTURE.md"
check ".env.example existe" test -f "$PROJECT_ROOT/.env.example"

echo ""
echo "=== Verificando arquivos essenciais ==="
check "package.json existe" test -f "$PROJECT_ROOT/package.json"
check "tsconfig.json existe" test -f "$PROJECT_ROOT/tsconfig.json"
check "vite.config.ts existe" test -f "$PROJECT_ROOT/vite.config.ts"
check "drizzle.config.ts existe" test -f "$PROJECT_ROOT/drizzle.config.ts"
check "drizzle/schema.ts existe" test -f "$PROJECT_ROOT/drizzle/schema.ts"

echo ""
echo "=== Verificando estrutura de diretorios ==="
check "client/src/ existe" test -d "$PROJECT_ROOT/client/src"
check "client/src/pages/ existe" test -d "$PROJECT_ROOT/client/src/pages"
check "client/src/components/ existe" test -d "$PROJECT_ROOT/client/src/components"
check "server/ existe" test -d "$PROJECT_ROOT/server"
check "server/_core/ existe" test -d "$PROJECT_ROOT/server/_core"
check "shared/ existe" test -d "$PROJECT_ROOT/shared"
check "drizzle/ existe" test -d "$PROJECT_ROOT/drizzle"

echo ""
echo "=== Verificando configuracao ==="
check ".env existe" test -f "$PROJECT_ROOT/.env"
check ".gitignore existe" test -f "$PROJECT_ROOT/.gitignore"

if [ -f "$PROJECT_ROOT/.env" ]; then
  echo ""
  echo "=== Verificando variaveis de ambiente ==="
  check "DATABASE_URL definida" grep -q "^DATABASE_URL=" "$PROJECT_ROOT/.env"
  check "JWT_SECRET definida" grep -q "^JWT_SECRET=" "$PROJECT_ROOT/.env"
  check "PORT definida" grep -q "^PORT=" "$PROJECT_ROOT/.env"
fi

echo ""
echo "=== Verificando node_modules ==="
check "node_modules/ existe" test -d "$PROJECT_ROOT/node_modules"
check "drizzle-orm instalado" test -d "$PROJECT_ROOT/node_modules/drizzle-orm"
check "express instalado" test -d "$PROJECT_ROOT/node_modules/express"
check "@trpc/server instalado" test -d "$PROJECT_ROOT/node_modules/@trpc/server"

echo ""
echo "=== Verificando build ==="
if [ -d "$PROJECT_ROOT/dist" ]; then
  check "dist/index.js existe (server build)" test -f "$PROJECT_ROOT/dist/index.js"
  check "dist/public/ existe (client build)" test -d "$PROJECT_ROOT/dist/public"
else
  echo "  [SKIP] dist/ nao encontrado (execute npm run build)"
fi

echo ""
echo "=== Verificando consistencia da documentacao ==="
# Verifica se CLAUDE.md menciona os arquivos principais que existem
if [ -f "$PROJECT_ROOT/CLAUDE.md" ]; then
  check "CLAUDE.md menciona routers.ts" grep -q "routers.ts" "$PROJECT_ROOT/CLAUDE.md"
  check "CLAUDE.md menciona schema.ts" grep -q "schema.ts" "$PROJECT_ROOT/CLAUDE.md"
  check "CLAUDE.md menciona db.ts" grep -q "db.ts" "$PROJECT_ROOT/CLAUDE.md"
  check "CLAUDE.md menciona publicApi" grep -q "publicApi" "$PROJECT_ROOT/CLAUDE.md"
fi

echo ""
if [ "$ERRORS" -gt 0 ]; then
  echo "RESULTADO: $ERRORS problema(s) encontrado(s)"
  exit 1
else
  echo "RESULTADO: Tudo OK"
  exit 0
fi
