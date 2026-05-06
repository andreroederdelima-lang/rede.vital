# Rede Vital — Credenciados

Plataforma de gestão de credenciados (médicos, clínicas, laboratórios, farmácias, outros serviços) da Rede Vital. Vitrine pública para clientes assinantes (rede local: Vale do Itajaí), painel interno para vendedores ("dados-internos") e admin para gestão completa.

Stack: Express + tRPC + React 19 + Drizzle (MySQL) + Vite. Estrutura em camadas simples (não DDD).

## Quick Start

```bash
pnpm install
pnpm dev              # Vite + tsx watch (server/_core/index.ts)
pnpm test             # vitest --run
pnpm build            # vite build + esbuild server
pnpm check            # tsc --noEmit
pnpm db:push          # drizzle-kit generate + migrate
```

## Estrutura

```
client/src/           # Frontend React 19 + wouter
├── pages/            # Rotas (Consulta, Home/dados-internos, Admin, etc.)
├── components/       # UI + componentes de domínio (CredenciadoListItem, etc.)
├── hooks/            # Hooks compartilhados (useDadosInternosAuth, etc.)
├── contexts/         # ThemeProvider
├── lib/              # trpc client, utils
└── _core/            # Infra do frontend (hooks Manus, etc.)

server/               # Backend Express + tRPC
├── _core/            # auth, context, cookies, email, env, sdk, sanitize, trpc
├── __tests__/        # vitest (setup.ts injeta JWT_SECRET de teste)
├── routers.ts        # appRouter tRPC
├── db.ts             # Acesso ao banco (Drizzle queries)
├── publicApi.ts      # REST pública com X-API-Key + rate limit
├── storage.ts        # S3 upload via Forge
└── index.ts          # Entry point Express

shared/               # Tipos e constantes compartilhados client/server
drizzle/              # Schema + migrations versionadas (MySQL)
scripts/              # Scripts utilitários (seed, tokens, QR)
```

---

## Workflow

### Plan mode primeiro
Para qualquer tarefa não-trivial (3+ passos ou decisões arquiteturais), pare e planeje antes de escrever código. Se o plano desviar no meio da execução, replaneje — não insista no plano errado.

### Subagents
Delegue pesquisa, exploração e análise paralela. Uma tarefa por subagent. Mantenha o contexto principal limpo.

### Verify before done
Nunca marcar tarefa como completa sem prova:
- `pnpm check` limpo
- testes verdes (ou explicar quais foram pulados e por quê)
- feature testada manualmente quando envolve UI/fluxo, ou ditar explicitamente que não foi testada

### Elegância balanceada
Se o fix parece hacky em mudança não-trivial: pause e pergunte "existe forma mais elegante?". Para fixes simples não super-engenhar.

### Autonomous bug fixing
Dado um bug com evidência (log, teste falhando, stack trace): conserte. Não pergunte como.

### Never exclude, always fix
- Nunca `.skip()` em teste para esconder bug.
- Nunca remover teste falhando do CI.
- Nunca silenciar erro sem entender root cause.
- Nunca degradar feature sem aviso (ex: fallback pra mock quando DB cai em prod).

---

## Convenções do Stack

### Database
- **Drizzle ORM + MySQL**, migrations versionadas em `drizzle/`.
- Tabelas e colunas em **camelCase** (padrão atual do schema; evitar snake_case novo).
- Soft delete via `ativo: 0/1` em `medicos`, `instituicoes`, `procedimentos`. Sempre filtrar `eq(t.ativo, 1)` em queries de leitura pública.

### Autenticação (3 sistemas coexistem)
| Papel | Mecanismo | Procedure tRPC |
|---|---|---|
| Admin | Manus OAuth → cookie `COOKIE_NAME` | `adminProcedure` (role=admin) |
| Vendedor interno | Login email/senha → cookie `dados_internos_session` (JWT) | `protectedProcedure` (Manus) ou cookie reconhecido pelo `ctx.isInterno` |
| Parceiro | Token assinado por URL (`/atualizar-dados/:token`) | `publicProcedure` + `verificarToken` + ownership check |

### `ctx.isInterno` (sanitização de payload)
- Setado em `server/_core/context.ts` quando há Manus OAuth válido OU cookie `dados_internos_session` válido.
- Usado por `server/_core/sanitize.ts` para remover campos sensíveis (preços, descontos, e-mail, contato de parceria, observações, telefoneOrganizacao, tokenAtualizacao) do payload tRPC quando `isInterno=false`.
- **Aplicar `sanitizar*()` em todo `publicProcedure` que retorne medico/instituicao/procedimento.** Sem isso, dados internos vazam.

### Env vars obrigatórias
- `JWT_SECRET` — assinar sessões + tokens. `server/_core/env.ts` faz throw se ausente.
- `DATABASE_URL` — MySQL.
- `OAUTH_SERVER_URL`, `VITE_APP_ID`, `OWNER_OPEN_ID` — Manus OAuth.
- `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY` — Forge (e-mails + S3).
- Ver `.env.example` para a lista completa.

### Upload e storage
- Imagens vão pra S3 via Forge (`server/storage.ts`).
- Path: `credenciados/<timestamp>-<random>.<ext>`.
- Validação client + server: JPG/PNG/WEBP, 5MB max.

### E-mail
- Sempre via função nomeada em `server/_core/email.ts` (`enviarEmailNovaParceria`, `enviarEmailNovoUsuario`, `enviarEmailLinkRecuperacao`, etc.).
- Falha de e-mail nunca pode quebrar o fluxo principal — wrap em try/catch + log.

### Logger
- Por ora `console.error('[Módulo]', ...)` com prefixo. Migrar pra logger estruturado é backlog.

---

## Segurança

- **Preços e dados de parceiro** só em payload quando `ctx.isInterno`. Use os helpers de `server/_core/sanitize.ts`.
- **Validação Zod** em todos os endpoints tRPC e REST públicos (`publicApi.ts`).
- **Cookies**: HttpOnly + sameSite + secure em prod + TTL explícito (ver `server/_core/cookies.ts`).
- **Rate limiting** na REST pública: 100 req/min e 1000 req/h por API Key (`express-rate-limit`).
- **API Keys**: armazenar hash, não plain.
- **IDOR**: ownership check antes de update/delete por token. Ver `verificarPropriedadeProcedimento` em `server/db.ts`.
- **Enumeração de conta**: `usuariosAutorizados.verificarAcesso` retorna só `{autorizado: boolean}`, sem dados do usuário.
- **Senhas**: `bcryptjs` cost 10. Tokens de reset criados via `crypto.randomBytes(32)`.
- **Não usar `bcrypt` nativo** — só `bcryptjs` (decisão de M4).

---

## Testes

- **Vitest** + `server/__tests__/setup.ts` injeta `JWT_SECRET` de teste antes de qualquer import.
- Helpers em `server/__tests__/helpers.ts`: `createMockContext`, `createAdminContext`, `createUserContext`, `createCaller`.
- Testes que dependem de DB real ou de Forge externo são pulados quando as env vars não estão presentes — mas a suíte deve **subir** sem essas vars.
- Cobertura medida em `server/` e `client/src/`. E2E (quando existir): testar comportamento (mutation + invalidate query + estado visual), não só render.

---

## Task Management

1. **Plano explícito** em tarefas não-triviais (TodoWrite quando disponível).
2. **Marcar progresso** em tempo real, não em batch.
3. **Resumir** em alto nível o que mudou ao final.
4. Após bug fix relevante: documentar a lição em `TODO_REDEVITAL.md` ou criar `docs/lessons.md`.

## O que NÃO fazer

- `any` — usar tipos inferidos do Drizzle ou generics.
- `console.log` — usar `console.error('[Módulo]', ...)` para erros (até migrar logger).
- Query sem filtro `ativo=1` em listagens públicas.
- `publicProcedure` com dados de parceiro **sem** passar pelo sanitize.
- Import de `server/` em `client/` (ou vice-versa) — usar `shared/` + tipos tRPC.
- `.skip()` em teste para evitar quebra temporária.
- Catch silencioso de erro sem log nem re-throw.
- Hardcode de URL de produção — sempre via env var.
- Criar `*.md`/README sem pedido explícito do usuário.

## Naming

- **Tabelas Drizzle**: camelCase JS, camelCase SQL (ex: `solicitacoesParceria`).
- **Routers tRPC**: `<recurso>.<verbo>` (ex: `medicos.listar`, `instituicoes.atualizar`, `procedimentos.gerenciarComToken`).
- **Páginas client**: PascalCase em `client/src/pages/` (ex: `Admin.tsx`, `Consulta.tsx`).
- **Componentes**: PascalCase em `client/src/components/` (ex: `CredenciadoListItem`).
- **Hooks**: `useXxx` em `client/src/hooks/`.
- **Scripts**: kebab-case em `scripts/` (ex: `seed-data.mjs`, `generate-token.mjs`).
- **Migrations**: nome gerado pelo `drizzle-kit` (não renomear).

---

## Pre-commit checklist

| Se mexeu em... | Atualize / verifique... |
|---|---|
| `drizzle/schema.ts` | Rodar `pnpm db:push` para gerar migration + snapshot |
| Rota tRPC com tipo novo | Verificar consumer no client (tipos propagam via inferência) |
| `publicProcedure` retornando medico/instituicao/procedimento | Passar pelo `sanitize` antes de devolver |
| Env var nova | `.env.example` com comentário do propósito |
| Fluxo crítico (auth, e-mail, upload, aprovação) | Testar manualmente em staging |
| Decisão arquitetural não-óbvia | Comentar 1 linha do PORQUÊ (não do quê) |
| Bug fix de regressão | Adicionar caso em `TODO_REDEVITAL.md` ou `docs/lessons.md` |

---

## Código

- Default: **zero comentários**. Adicionar só quando o PORQUÊ não for óbvio (invariante, workaround, regra de negócio sutil).
- Não comentar O QUE o código faz — nomes bem escolhidos resolvem.
- Preferir editar arquivo existente a criar novo.
- Referenciar código em revisão como `file_path:line_number`.

## Tom e estilo

- Sem emojis exceto se pedido explicitamente.
- Respostas curtas e concisas.
- Fim de turno: 1-2 frases. O que mudou e o que vem.
