# Sincronização com GitHub

Este projeto está conectado ao repositório GitHub: **andreroederdelima-lang/rede.vital**

## 🔄 Sincronização Automática

O script `.github-sync.sh` mantém o projeto sincronizado bidirecionalmente com o GitHub.

### Como funciona:

1. **Busca mudanças do GitHub** (pull)
2. **Detecta mudanças locais** e faz commit automático
3. **Faz merge** das mudanças remotas (se houver)
4. **Envia mudanças locais** para o GitHub (push)

### Executar manualmente:

```bash
cd /home/ubuntu/vital-credenciados
./.github-sync.sh
```

### Configurar execução automática (cron):

```bash
# Sincronizar a cada 15 minutos
*/15 * * * * /home/ubuntu/vital-credenciados/.github-sync.sh >> /home/ubuntu/github-sync.log 2>&1

# Sincronizar a cada hora
0 * * * * /home/ubuntu/vital-credenciados/.github-sync.sh >> /home/ubuntu/github-sync.log 2>&1
```

## 📝 Comandos Git Úteis

### Ver status do repositório:
```bash
cd /home/ubuntu/vital-credenciados
git status
```

### Ver histórico de commits:
```bash
git log --oneline -10
```

### Ver diferenças não commitadas:
```bash
git diff
```

### Fazer commit manual:
```bash
git add -A
git commit -m "Descrição das mudanças"
git push github main
```

### Baixar mudanças do GitHub:
```bash
git pull github main
```

## 🔑 Autenticação SSH

O projeto usa autenticação SSH com chave pública/privada.

**Chave pública** (já adicionada no GitHub):
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFDNdhjWWjpzraq3q4k6fGdAw7cAe0kCvV47Vvq8kA7c vital-credenciados@manus
```

**Localização das chaves:**
- Chave privada: `~/.ssh/id_ed25519`
- Chave pública: `~/.ssh/id_ed25519.pub`

## 🌐 Acessar Repositório

**URL do repositório:** https://github.com/andreroederdelima-lang/rede.vital

## ⚠️ Importante

- **Sempre sincronize** antes de fazer mudanças importantes
- **Não delete** a pasta `.git` ou o arquivo `.github-sync.sh`
- **Mantenha a chave SSH** segura (nunca compartilhe a chave privada)
- **Use o script** ao invés de comandos git manuais para evitar conflitos

## 🆘 Resolução de Problemas

### Erro de autenticação SSH:
```bash
# Verificar se a chave está carregada
ssh -T git@github.com
```

### Conflitos de merge:
```bash
# Abortar merge e tentar novamente
git merge --abort
./.github-sync.sh
```

### Resetar para última versão do GitHub:
```bash
# ⚠️ CUIDADO: Isso descarta todas as mudanças locais!
git fetch github
git reset --hard github/main
```
