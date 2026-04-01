# Code Review Completo

Data: 2026-02-19
Escopo analisado: backend (`server/`) e frontend (`client/src/`) do repositório.

## Premissas
- Esta revisão é estática (análise de código + execução de checks locais).
- Não houve acesso a banco/configuração de produção, então parte dos testes falha por dependências externas ausentes.

## 1) Bugs

### 1.1 Contagem de paginação inconsistente com filtros (API pública)
**Severidade:** Média  
**Onde:** `server/publicApi.ts`

Nos endpoints de listagem, o `count(*)` é feito apenas com `ativo = 1`, ignorando filtros como `municipio`, `especialidade`, `categoria` e `tipoServico`. Isso pode retornar `total` e `totalPages` incorretos quando filtros estão ativos.

**Impacto:** paginação inconsistente no cliente, UX ruim e potencial erro de navegação.

**Recomendação:** aplicar os mesmos filtros usados na query principal também na query de contagem.

---

### 1.2 Filtro de procedimento aplicado após paginação
**Severidade:** Média  
**Onde:** `server/publicApi.ts`

No endpoint `/credenciados/servicos`, o filtro por `procedimento` é aplicado depois de `limit/offset`, causando páginas com poucos/nenhum item e perda de resultados válidos em outras páginas.

**Impacto:** resultados incompletos e comportamento inesperado de paginação.

**Recomendação:** mover o filtro para a query SQL (join/subquery) antes da paginação.

---

### 1.3 Reset de senha retorna nova senha em texto puro
**Severidade:** Alta  
**Onde:** `server/routers.ts`

A mutation `resetarSenha` retorna `{ success: true, novaSenha }`.

**Impacto:** exposição de credencial sensível ao consumidor da API (inclusive logs/clientes intermediários).

**Recomendação:** não retornar senha em response; idealmente usar fluxo de token de redefinição + senha definida pelo usuário.

## 2) Vulnerabilidades

### 2.1 Endpoint de upload sem autenticação/autorização
**Severidade:** Crítica  
**Onde:** `server/upload.ts` + montagem em `server/_core/index.ts`

`POST /api/upload` aceita upload sem qualquer verificação de usuário/perfil.

**Impacto:** abuso de storage, DoS financeiro, upload de conteúdo malicioso.

**Recomendação:** proteger rota com autenticação + autorização (ex.: apenas admin/usuário interno autorizado).

---

### 2.2 Upload sem validação robusta de tipo/extensão
**Severidade:** Alta  
**Onde:** `server/upload.ts`

Há limite de tamanho, porém não há whitelist de MIME real com validação de assinatura de arquivo (magic bytes).

**Impacto:** envio de arquivos indevidos (executáveis disfarçados), risco de distribuição de conteúdo malicioso.

**Recomendação:** validar MIME + assinatura binária e renomear arquivo com extensão controlada.

---

### 2.3 Nome original do arquivo sendo incorporado na chave do storage
**Severidade:** Média  
**Onde:** `server/upload.ts`

`req.file.originalname` entra no `fileKey` sem sanitização.

**Impacto:** risco de caracteres problemáticos/injeção em integrações downstream e dificuldade de governança de objetos.

**Recomendação:** sanitizar nome (slug) ou ignorar nome original e gerar chave canônica.

---

### 2.4 Uso de `Math.random` para geração de senha temporária
**Severidade:** Alta  
**Onde:** `server/routers.ts`

Senha temporária é gerada com `Math.random()`, inadequado para segredo criptográfico.

**Impacto:** previsibilidade relativa em cenários de ataque.

**Recomendação:** usar `crypto.randomBytes`/`crypto.randomUUID` + política forte.

---

### 2.5 Dependência de `process.env.JWT_SECRET!` sem validação central
**Severidade:** Média  
**Onde:** `server/routers.ts`, `server/_core/env.ts`

Uso de non-null assertion (`!`) pode causar falha em runtime se variável não existir; também há acoplamento de segredo JWT com `cookieSecret`.

**Impacto:** indisponibilidade e risco de configuração insegura.

**Recomendação:** fail-fast no boot com schema de env (zod/envalid) e segredos separados por finalidade.

## 3) Performance

### 3.1 N+1 query ao carregar procedimentos por instituição
**Severidade:** Alta (escala)  
**Onde:** `server/publicApi.ts`

Para cada instituição, há uma query separada de procedimentos (`Promise.all` com select por id).

**Impacto:** aumento linear de queries, latência e carga no banco.

**Recomendação:** fazer fetch em lote (uma query com `inArray`) e agrupar em memória.

---

### 3.2 Arquivo de página muito grande (Home)
**Severidade:** Média  
**Onde:** `client/src/pages/Home.tsx` (~1263 linhas)

Componente concentra múltiplas responsabilidades (filtro, listagem, apresentação e regras de negócio de preço/desconto).

**Impacto:** renderizações mais caras, manutenção difícil, maior risco de regressão.

**Recomendação:** extrair subcomponentes e hooks (`useCredenciadosFilters`, `usePricePresentation`, etc.).

## 4) Organização

### 4.1 `routers.ts` monolítico
**Severidade:** Média  
**Onde:** `server/routers.ts` (~1739 linhas)

Arquivo único concentra muitos domínios de negócio e regras.

**Impacto:** baixa coesão, revisão difícil e onboarding lento.

**Recomendação:** dividir por bounded context (ex.: `routers/admin.ts`, `routers/parcerias.ts`, `routers/authInterna.ts`, `routers/uploads.ts`).

---

### 4.2 Alto uso de `any`
**Severidade:** Média  
**Onde:** backend e frontend (`publicApi.ts`, `routers.ts`, `Home.tsx`, etc.)

Muitos casts e objetos sem tipagem (`as any`, `: any`) enfraquecem contratos.

**Impacto:** bugs silenciosos e menor capacidade do TypeScript prevenir regressões.

**Recomendação:** introduzir tipos DTO explícitos para entrada/saída e remover `any` gradualmente.

## 5) Melhorias Recomendadas (Plano priorizado)

### Prioridade P0 (imediato)
1. Proteger `/api/upload` com authN/authZ.
2. Remover `novaSenha` da resposta de reset.
3. Trocar `Math.random` por gerador criptográfico.
4. Validar ambiente no boot (JWT_SECRET obrigatório).

### Prioridade P1 (curto prazo)
1. Corrigir paginação + filtros em `publicApi`.
2. Eliminar N+1 de procedimentos.
3. Implementar validação forte de upload (MIME + magic bytes + extensão segura).

### Prioridade P2 (médio prazo)
1. Modularizar `routers.ts` e `Home.tsx`.
2. Reduzir `any` com tipagem de contratos.
3. Adicionar middlewares de segurança HTTP (`helmet`, política de CORS explícita).

## 6) Padrões de código

### Pontos positivos
- Uso consistente de `zod` em várias entradas de procedures.
- Estrutura de testes existente cobre fluxos importantes.
- Existência de limiter na API pública.

### Pontos de atenção
- Mistura de responsabilidades em arquivos grandes.
- Tratamento de erro heterogêneo (às vezes com `throw new Error`, às vezes retorno controlado).
- Segurança de borda (uploads, segredos e credenciais temporárias) precisa endurecimento.

## 7) Checks executados
- `pnpm -s check` ✅
- `pnpm -s test` ❌ (falhas por dependências externas/ambiente: banco e credenciais de storage ausentes)

