# Rede Vital - CLAUDE.md

## O que e este projeto

Plataforma de rede de credenciados (medicos e instituicoes) com descontos para assinantes Vital.
Permite consulta publica de parceiros, painel admin para gestao, formularios de cadastro/parceria,
avaliacoes, webhooks e API REST publica com API keys.

## Stack

- **Frontend:** React 19 + Vite 7 + Tailwind CSS 4 + Radix UI + wouter (routing) + TanStack Query
- **Backend:** Express + tRPC 11 + Drizzle ORM + MySQL (mysql2)
- **Auth:** JWT (jose/jsonwebtoken) + cookie-based sessions + Manus OAuth
- **Storage:** Manus Forge API (upload proxy) -- NAO usa S3 diretamente em runtime
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
  storage.ts       # Storage proxy via Forge API
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
