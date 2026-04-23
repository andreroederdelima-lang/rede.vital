# Rede Vital - Arquitetura

## Visao Geral

Aplicacao full-stack monolitica com frontend SPA e backend API unificado.
O servidor Express serve tanto a API (tRPC + REST) quanto o frontend buildado.

```
Browser
  |
  v
Express Server (:3006)
  |-- /api/trpc/*       -> tRPC Router (frontend queries/mutations)
  |-- /api/public/*     -> REST API (integracao externa com API keys)
  |-- /api/upload       -> Upload de imagens
  |-- /api/oauth/*      -> OAuth callbacks (Manus)
  |-- /*                -> SPA estático (Vite build / dev proxy)
  |
  v
MySQL (drizzle-orm)
  |
  v
Manus Forge API (storage + email)
```

## Fluxo de Dados

### Frontend -> Backend (tRPC)
1. React component usa `trpc.useQuery()` ou `trpc.useMutation()`
2. TanStack Query gerencia cache e estado
3. Requisicao vai para `/api/trpc/{router}.{procedure}`
4. tRPC middleware cria contexto (req, res, user)
5. Procedure executa query via funcoes em `server/db.ts`
6. Drizzle ORM traduz para SQL e executa no MySQL

### API Publica (REST)
1. Cliente externo envia request com header `X-API-Key`
2. Middleware valida API key no banco
3. Rate limiter aplica (100/min, 1000/h)
4. Handler retorna dados + registra log em `apiLogs`
5. Webhooks disparam para URLs registradas em eventos relevantes

## Autenticacao

Dois fluxos coexistem:

1. **Manus OAuth** - Para usuarios via plataforma Manus (cookie JWT)
2. **Email/Senha** - Para area `/dados-internos` (admin)
   - Login gera JWT armazenado em cookie
   - Recuperacao de senha via token temporario
   - Solicitacao de acesso com aprovacao admin

### Tokens de Parceiro
- Tokens unicos para permitir que parceiros atualizem dados sem login
- Enviados via link direto (`/atualizar-dados/:token`, `/cadastro-medico/:token`)

## Camadas

### Client (`client/src/`)
- **Pages**: Componentes de pagina, roteados por wouter
- **Components**: UI reutilizavel (shadcn/ui) + componentes de dominio
- **Hooks**: useAuth, queries tRPC
- **Contexts**: ThemeProvider

### Server (`server/`)
- **_core/**: Infraestrutura (Express, tRPC setup, auth, env, vite dev server)
- **routers.ts**: Definicao de todos os endpoints tRPC
- **db.ts**: Toda logica de banco (queries, inserts, updates)
- **publicApi.ts**: Endpoints REST para integracao externa
- **storage.ts**: Proxy para storage via Forge API

### Shared (`shared/`)
- Tipos, constantes e enums usados por client e server

### Database (`drizzle/`)
- Schema Drizzle em `schema.ts`
- Migrations SQL geradas automaticamente
- Dialeto MySQL

## Decisoes Arquiteturais

- **Monolito**: Server serve API + SPA. Simplifica deploy e dev.
- **tRPC interno, REST externo**: tRPC para type-safety no frontend, REST para integracao com terceiros.
- **Soft delete**: Campo `ativo` (0/1) em vez de DELETE. Preserva historico.
- **Queries centralizadas**: Toda logica SQL em `db.ts`, routers sao finos.
- **Token-based partner access**: Parceiros nao precisam de conta/login para atualizar dados.
- **API Keys + Webhooks**: Permite que plataformas externas consumam dados e recebam notificacoes.

## Deploy

- Build: `npm run build` (Vite + esbuild -> `dist/`)
- Start: `npm run start` (Node.js, porta 3006)
- PM2 recomendado para producao
- MySQL local na mesma VPS
