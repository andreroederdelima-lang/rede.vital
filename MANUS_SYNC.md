# Sincronizar Manus com GitHub

A Manus roda o código de produção (`credenciados.suasaudevital.com.br`). O GitHub é a fonte da verdade onde o Claude Code edita. **Manus puxa do GitHub** quando há mudanças — fluxo unidirecional, sem push do Manus de volta.

Repositório alvo: `https://github.com/andreroederdelima-lang/rede.vital` (público, sem PAT necessário).

---

## Quando usar

Sempre que o Claude (ou você) merger algo em `main` no GitHub e essa mudança precisa ir pro ar.

## Fluxo padrão

1. Claude edita aqui no Claude Code, abre PR, merge na `main`
2. Você cola o **Texto A** (abaixo) no chat da Manus
3. Manus reporta build OK
4. Você aperta **Publish** no painel da Manus
5. Pronto

---

## Texto A — Sync rotineiro (caso comum)

Cole este texto no chat da Manus quando houver novo commit no `main` do GitHub para sincronizar:

```
Sincroniza com o GitHub:

git fetch github main
git reset --hard github/main

pnpm install
pnpm run check
pnpm run build

# Smoke test rápido (sobe dev server, testa 4 rotas, mata)
pnpm dev &
sleep 10
PORT=3006
curl -s -o /dev/null -w "/cadastro-medico → %{http_code}\n" http://localhost:$PORT/cadastro-medico/test-token
curl -s -o /dev/null -w "/formulario-parceiro → %{http_code}\n" http://localhost:$PORT/formulario-parceiro
curl -s -o /dev/null -w "/admin → %{http_code}\n" http://localhost:$PORT/admin
curl -s -o /dev/null -w "/ → %{http_code}\n" http://localhost:$PORT/
kill %1

Reporta:
1. Build passou? (✓ built in Xs)
2. Os 4 status codes (devem ser 200)
3. Qualquer erro no log

NÃO faça publish. Aguarde meu OK pra eu apertar o botão Publish manualmente.
Se algum passo der erro, NÃO tente arrumar sozinho — me reporta.
```

Depois aperta **Publish** no painel da Manus.

---

## Texto B — Sync com nova branch específica (se for atualização cuidadosa)

Quando Claude criou uma branch específica (ex: `claude/manus-prod` para evitar Railway):

```
Sincroniza com a branch BRANCH_NAME do GitHub:

git fetch github BRANCH_NAME
git reset --hard github/BRANCH_NAME

(resto igual ao Texto A: install, check, build, smoke test, espera meu OK)
```

Substitua `BRANCH_NAME` pelo nome real (ex: `main`, `claude/manus-prod`, etc).

---

## Texto C — Rollback (se algo deu ruim em prod após deploy)

Cole no chat da Manus:

```
Reverte para o checkpoint anterior. Roda:

git tag | grep backup     # lista os backups
git reset --hard backup-pre-sync-DATA   # use o tag mais recente

pnpm install
pnpm run build

Reporta build OK. Eu vou apertar Publish manualmente para reverter o site.
```

Depois aperta **Publish**. O site volta pra versão antes do sync.

---

## Antes de cada sync — checklist Claude

Quando Claude prepara um sync, ele deve confirmar:

- [ ] `pnpm run check` passa local (typecheck)
- [ ] `pnpm run build` passa local
- [ ] Mudança não introduz dependência de env var nova **sem fallback** (especialmente: SMTP, AWS_*). Se introduzir, ou (a) configura no painel Manus antes, ou (b) faz código auto-detect (igual `server/storage.ts`).
- [ ] Mudança não introduz migration nova destrutiva. Se houver migration nova, validar com `drizzle-kit` antes.
- [ ] Mudança não força mudança em arquivo `.env` que só existe no Manus.

---

## Cuidados conhecidos (MUITO IMPORTANTE — não esquecer)

| Risco | Por quê | Como evitar |
|---|---|---|
| **Email parar** | Manus usa Forge (`BUILT_IN_FORGE_API_URL/notification/email`), não SMTP. Código que dependa puramente de nodemailer SMTP quebra emails. | `server/_core/email.ts` deve ter fallback Forge OU não trocar nada de email sem Manus ter SMTP configurado. |
| **Upload de imagem parar** | Manus usa Forge para storage. Mesmo problema. | `server/storage.ts` já tem dual-mode S3/Forge auto-detect (PR #15). Mantém. |
| **Migrations destrutivas** | Manus tem dados reais de produção. ALTER/DROP no schema pode perder dados. | Migrations só incrementais (ADD COLUMN, CREATE TABLE). DROP nunca. |
| **Push do Manus pro GitHub** | Pode sobrescrever trabalho do Claude. | Fluxo é unidirecional GitHub → Manus. Manus nunca empurra. |
| **Histórico Railway no GitHub** | PRs #9-15 são de migração Railway pausada. Se Manus puxar `main`, vai trazer essas mudanças e quebrar Forge/email. | Use branch `claude/manus-prod` ou crie nova sempre que houver Railway-stuff em `main`. |

---

## Histórico de sincronizações

| Data | Branch sincronizada | Resultado |
|---|---|---|
| 2026-05-06 | `claude/manus-prod` (ce9ffd1) | ✅ OK — primeiro sync após divergência de fev/2026 |
