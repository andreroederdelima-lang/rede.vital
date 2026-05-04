# Rede Vital - CLAUDE.md

## O que e este projeto

Plataforma de rede de credenciados (medicos e instituicoes) com descontos para assinantes Vital.
Permite consulta publica de parceiros, painel admin para gestao, formularios de cadastro/parceria,
avaliacoes, webhooks e API REST publica com API keys.

## Stack

- **Frontend:** React 19 + Vite 7 + Tailwind CSS 4 + Radix UI + wouter (routing) + TanStack Query
- **Backend:** Express + tRPC 11 + Drizzle ORM + MySQL (mysql2)
- **Auth:** JWT (jose/jsonwebtoken) + cookie-based sessions + Manus OAuth
- **Storage:** Dual-mode auto-detect em `server/storage.ts`:
  - Se `AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY + AWS_REGION + S3_BUCKET` setados → usa S3 direto (`@aws-sdk/client-s3`). Compatível com R2/MinIO via `S3_ENDPOINT`.
  - Senão, fallback para Manus Forge API (`BUILT_IN_FORGE_API_URL + BUILT_IN_FORGE_API_KEY`).
  - Em prod Manus hoje: roda em modo Forge (sem AWS_*).
- **Build:** Vite (client) + esbuild (server) -> `dist/`
- **Testes:** Vitest
- **DB Migrations:** Drizzle Kit (`drizzle-kit generate && drizzle-kit migrate`)

## Comandos

```bash
npm run dev          # Dev server com hot reload (tsx watch)
npm run build        # Build client (Vite) + server (esbuild) -> dist/
npm run start        # Producao: node dist/index.js
npm run check        # TypeScript check (tsc --noEmit)
npm run test         # Vitest run
npm run db:push      # Gerar + aplicar migrations Drizzle
npm run format       # Prettier
```

## Estrutura de Diretorios

```
client/src/
  pages/           # Paginas React (wouter routes)
  components/      # Componentes (UI + dominio)
  components/ui/   # shadcn/ui primitivos
  contexts/        # ThemeContext
  hooks/           # Custom hooks
  _core/hooks/     # useAuth
  lib/             # Utilidades

server/
  _core/           # Infra: index.ts (entry), trpc, auth, env, email, vite, oauth
  routers.ts       # Todas as rotas tRPC (app router)
  publicApi.ts     # API REST publica (/api/public) com API key auth
  db.ts            # Queries e logica de banco (funcoes exportadas)
  upload.ts        # Upload de imagens
  storage.ts       # Storage dual-mode (S3 direto OU Forge fallback, auto-detect)
  __tests__/       # Testes do server

shared/            # Tipos e constantes compartilhadas (client + server)
drizzle/
  schema.ts        # Schema Drizzle (todas as tabelas)
  *.sql            # Migrations geradas
```

## Banco de Dados (MySQL)

Tabelas principais em `drizzle/schema.ts`:
- `users` - Auth (OAuth + email/password)
- `medicos` - Medicos credenciados
- `instituicoes` - Instituicoes parceiras (clinicas, farmacias, labs)
- `procedimentos` / `procedimentosInstituicao` - Procedimentos por instituicao
- `solicitacoesParceria` - Solicitacoes de parceria (pendente/aprovado/rejeitado)
- `solicitacoesAtualizacao` - Pedidos de atualizacao de dados
- `solicitacoesAcesso` - Pedidos de acesso a area admin
- `usuariosAutorizados` - Usuarios da area /dados-internos
- `avaliacoes` - Avaliacoes de credenciados
- `tokens` - Tokens para links de atualizacao/cadastro
- `apiKeys` / `apiLogs` - API keys e logs de acesso
- `webhooks` / `webhookLogs` - Webhooks e logs de disparo
- `configuracoes` - Configs do sistema (key-value)
- `copys` - Textos editaveis (materiais de divulgacao)
- `termosUso` / `aceitesTermos` - Termos e aceites legais
- `sugestoesParceiros` - Sugestoes de novos parceiros
- `tokensRecuperacao` - Tokens de recuperacao de senha

## Rotas (Frontend)

- `/` - Consulta publica de credenciados (pagina principal)
- `/parceiros` - Listagem de parceiros
- `/formulario-parceiro` - Formulario de solicitacao de parceria
- `/atualizar-dados/:token` - Atualizacao de dados por parceiro (via token)
- `/cadastro-medico/:token` / `/cadastro-servico/:token` - Cadastro via token
- `/dados-internos` - Dashboard admin (protegido)
- `/admin` - Painel admin
- `/admin/avaliacoes` - Gestao de avaliacoes
- `/sugerir-parceiro` - Indicacao de parceiro
- `/login-dados-internos` - Login admin
- `/termos-uso` / `/politica-privacidade` - Paginas legais

## API REST Publica

Endpoint base: `/api/public`
Auth: Header `X-API-Key`
Rate limit: 100/min, 1000/hora por API key

## Variaveis de Ambiente

Ver `.env.example` para todas as variaveis necessarias.

## Convencoes

- Schema usa camelCase (Drizzle + MySQL)
- Soft delete via campo `ativo` (int 0/1), nao DELETE fisico
- Queries no `server/db.ts`, nao nos routers
- tRPC para frontend, REST para integracao externa
- Componentes UI em `client/src/components/ui/` (shadcn pattern)
- Imports com aliases: `@/` (client/src), `@shared/` (shared), `@assets/`
- Porta padrao: 3006 (configuravel via PORT)

## Notas

- Projeto originado no Manus (Forge API para storage e email)
- pnpm como package manager (com patch em wouter@3.7.1)
- 20 migrations Drizzle ja aplicadas
- Sistema de indicacoes foi removido (codigo comentado permanece)

## Fluxo de trabalho dev/stage/prod

| Estágio | Onde | Branch | Como |
|---------|------|--------|------|
| **Dev** | VPS `/root/rede.vital` (porta 3009) | `claude/<feature>` | Claude Code edita; `npm run dev` |
| **Stage** | GitHub PR | PR `claude/<feature>` → `main` | `gh pr create`; revisa diff |
| **Prod** | Manus (`credenciados.suasaudevital.com.br`) | `main` | Merge do PR; deploy Manus (manual ou auto, conforme painel) |

**Regras:**
- Nunca editar `main` direto. Sempre branch `claude/*` + PR.
- `.env` local ≠ envs do Manus. Manus tem painel próprio de variáveis.
- Storage roda em modo Forge no Manus (sem AWS_*) e em modo S3 onde AWS_* estiver setado.
- PRs Railway-specific (#10-#14, mergeados em 2026-04-24) preservados em main; o dual-mode storage neutraliza o impacto em Manus.
