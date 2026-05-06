#!/bin/bash

# Script de Sincronização Bidirecional com GitHub
# Repositório: andreroederdelima-lang/rede.vital

set -e

PROJECT_DIR="/home/ubuntu/vital-credenciados"
REMOTE_NAME="github"
BRANCH="main"

cd "$PROJECT_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Iniciando sincronização com GitHub..."

# 1. Buscar mudanças do GitHub
echo "Buscando mudanças do repositório remoto..."
git fetch "$REMOTE_NAME" "$BRANCH" 2>&1 || {
    echo "Erro ao buscar mudanças do GitHub"
    exit 1
}

# 2. Verificar se há mudanças locais
if [[ -n $(git status --porcelain) ]]; then
    echo "Mudanças locais detectadas. Fazendo commit..."
    git add -A
    git commit -m "Auto-sync: $(date '+%Y-%m-%d %H:%M:%S')" 2>&1 || {
        echo "Nada para commitar"
    }
fi

# 3. Fazer merge das mudanças remotas (se houver)
LOCAL_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse "$REMOTE_NAME/$BRANCH")

if [ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]; then
    echo "Sincronizando mudanças..."
    git pull "$REMOTE_NAME" "$BRANCH" --rebase 2>&1 || {
        echo "Conflito detectado. Resolvendo automaticamente..."
        git rebase --abort 2>&1 || true
        git pull "$REMOTE_NAME" "$BRANCH" --no-rebase 2>&1
    }
fi

# 4. Enviar mudanças locais para o GitHub
echo "Enviando mudanças para o GitHub..."
git push "$REMOTE_NAME" "$BRANCH" 2>&1 || {
    echo "Erro ao enviar mudanças para o GitHub"
    exit 1
}

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Sincronização concluída com sucesso!"
