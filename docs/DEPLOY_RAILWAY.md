# Deploy no Railway — Migração do Manus

Guia passo-a-passo para migrar o Rede Vital do Manus para o Railway. Assume que você já tem conta no Railway (https://railway.com) e acesso ao painel do Manus pra fazer o dump do banco.

A infraestrutura de deploy (`Dockerfile`, `railway.toml`, CORS) já está no repo. Falta provisionar os recursos, migrar dados e apontar o domínio.

---

## 1. Criar projeto Railway

1. https://railway.com → **New Project** → **Deploy from GitHub repo**
2. Selecionar `andreroederdelima-lang/rede.vital`
3. Railway detecta o `Dockerfile` automaticamente (já configurado em `railway.toml`)
4. Primeiro deploy vai **falhar** — é esperado, faltam env vars e banco. Seguir com os próximos passos.

---

## 2. Provisionar MySQL

No projeto Railway:

1. **+ New** → **Database** → **MySQL**
2. Railway cria o serviço `MySQL` automaticamente, com `DATABASE_URL` injetada como variável de referência.
3. No serviço do app (rede-vital), adicionar a variável:
   - `DATABASE_URL` = `${{ MySQL.MYSQL_URL }}` (Railway substitui automaticamente em runtime)

---

## 3. Migrar dados do Manus

### 3.1 Dump do banco atual (no Manus)

Pedir ao suporte Manus um `mysqldump` do banco `redevital` em formato SQL. Ou, se tiver acesso de leitura ao DB do Manus:

```bash
mysqldump \
  --single-transaction \
  --quick \
  --set-gtid-purged=OFF \
  -h <manus_db_host> -u <user> -p<pass> \
  redevital > dump-manus-$(date +%Y%m%d).sql
```

### 3.2 Restore no Railway MySQL

1. No painel Railway → serviço MySQL → aba **Connect** → copiar o `MYSQL_URL` público (com `proxy.rlwy.net`)
2. Rodar localmente:
   ```bash
   mysql "<MYSQL_URL_COPIADO>" < dump-manus-20260424.sql
   ```
3. Conferir que tabelas existem: `mysql "<MYSQL_URL>" -e "SHOW TABLES FROM railway"`

### 3.3 Verificar migrations do Drizzle

O dump traz o schema atual. Se houver migrations novas depois:

```bash
# Local, apontando pra Railway MySQL
DATABASE_URL="<MYSQL_URL_DO_RAILWAY>" pnpm db:push
```

---

## 4. Variáveis de ambiente

No serviço do app no Railway → aba **Variables** → adicionar:

### Obrigatórias
| Nome | Valor | Observação |
|---|---|---|
| `JWT_SECRET` | `openssl rand -base64 48` | Novo segredo para prod |
| `DATABASE_URL` | `${{ MySQL.MYSQL_URL }}` | Referência Railway |
| `NODE_ENV` | `production` | |
| `PORT` | _(não definir — Railway injeta)_ | |
| `CORS_ORIGINS` | `https://credenciados.suasaudevital.com.br` | Separar com vírgula se tiver múltiplos |

### Auth Manus (admin login continua via Manus OAuth)
| Nome | Valor |
|---|---|
| `OAUTH_SERVER_URL` | `<valor_do_manus>` |
| `VITE_APP_ID` | `<app_id_do_manus>` |
| `OWNER_OPEN_ID` | `<openId_da_sua_conta_manus>` |

### Forge → precisa substituir (Manus proprietary)

Hoje o projeto usa `BUILT_IN_FORGE_API_*` para envio de emails e upload S3. Fora do Manus, precisamos substituir:

**S3 direto (AWS ou compatível Cloudflare R2):**
```
AWS_ACCESS_KEY_ID=<sua_key>
AWS_SECRET_ACCESS_KEY=<sua_secret>
AWS_REGION=sa-east-1
S3_BUCKET=redevital-credenciados
```

**SMTP direto (nodemailer já instalado):**
```
SMTP_HOST=smtp.resend.com (ou Mailgun, SES, etc.)
SMTP_PORT=587
SMTP_USER=<user>
SMTP_PASS=<pass>
SMTP_FROM=contato@suasaudevital.com.br
```

⚠️ **`server/storage.ts` e `server/_core/email.ts` ainda chamam o Forge.** Precisa de uma PR separada para trocar por AWS SDK direto / nodemailer. Alinhar antes do go-live.

---

## 5. Primeiro deploy (válido)

Depois de preencher as env vars:

1. Railway → serviço do app → **Deployments** → **Deploy latest**
2. Logs devem mostrar: `Server running on http://0.0.0.0:8080/`
3. Clicar em **Generate Domain** → pegar a URL tipo `rede-vital-production.up.railway.app`
4. Acessar → vitrine pública de credenciados deve abrir

---

## 6. Domínio custom (`credenciados.suasaudevital.com.br`)

1. Railway → app → aba **Settings** → **Networking** → **Custom Domain** → adicionar `credenciados.suasaudevital.com.br`
2. Railway mostra um CNAME alvo (tipo `xxx.up.railway.app`)
3. No painel DNS do domínio (Registro.br/Cloudflare/etc):
   - Criar **CNAME** `credenciados` → `xxx.up.railway.app`
   - TTL: 300 (baixo durante migração)
4. Voltar ao Railway → aguardar verificação (SSL Let's Encrypt automático, ~2min)
5. Testar https://credenciados.suasaudevital.com.br

---

## 7. Controle Railway via MCP

Este repo tem `.mcp.json` configurado com o servidor MCP oficial do Railway. Para usar:

### 7.1 Gerar API token do Railway

1. https://railway.com/account/tokens → **Create Token**
2. Nomear: `claude-code-mcp`
3. Copiar o token (só aparece uma vez)

### 7.2 Configurar na sua máquina

Exportar o token antes de iniciar o Claude Code:

```bash
# Bash / Zsh (adicionar ao ~/.zshrc ou ~/.bashrc)
export RAILWAY_API_TOKEN="seu_token_aqui"

# Windows PowerShell
$env:RAILWAY_API_TOKEN = "seu_token_aqui"
```

Reiniciar o Claude Code após exportar.

### 7.3 Conferir

Dentro do Claude Code, dentro do repo do projeto:

```
/mcp list
```

Deve listar o server `railway` como conectado. A partir daí eu posso:
- Listar projetos/serviços
- Ver deployments e logs
- Disparar novo deploy
- Ler/editar variáveis de ambiente
- Checar health do serviço

Sem o token, o MCP não conecta — é read-only-impossible (não consegue nada).

---

## 8. Checklist final antes de apontar DNS

Antes de trocar o DNS pro Railway:

- [ ] `pnpm check` limpo local
- [ ] Build do Dockerfile passa local (`docker build .`)
- [ ] Railway deploy verde
- [ ] URL pública provisória (`*.up.railway.app`) abre a vitrine
- [ ] Login `/dados-internos` funciona com usuário real
- [ ] `/admin` funciona com Manus OAuth
- [ ] Imagem de instituição salva persiste (PR #3 fix)
- [ ] `/api/public/credenciados/medicos` responde com API Key
- [ ] Email de aprovação de acesso chega (se SMTP já migrado)
- [ ] Upload de foto funciona (se S3 já migrado)
- [ ] Backup do dump do Manus guardado em local seguro
- [ ] TTL do DNS baixo (300s) antes da troca

---

## 9. Rollback se der ruim

Enquanto o DNS ainda aponta pro Manus:
- Não houve troca — nada a reverter.

Depois de apontar pro Railway:
1. DNS: trocar CNAME de volta pro Manus (efeito em 5min com TTL=300)
2. Se dados foram escritos no Railway MySQL entre o switch e o rollback, pode haver divergência de dados entre Manus e Railway. Bloquear novos cadastros no Manus (ou pausar ambos e reconciliar manualmente).

---

## 10. Custo estimado Railway

Tráfego esperado (Vale do Itajaí, rede regional):
- App: ~512MB RAM / 0.25 vCPU → ~US$5–8/mês
- MySQL: ~512MB / 1GB storage → ~US$5–7/mês
- Bandwidth: <10GB/mês → incluído

**Total estimado: US$10–15/mês** (~R$50–75).

Créditos gratuitos: US$5/mês no plano Hobby. Passando disso, vira pay-as-you-go.
