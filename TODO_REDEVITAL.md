# TODO_REDEVITAL — Checklist de Produção

**Data da auditoria:** 2026-04-16
**Branch:** `claude/prepare-production-launch-NMbic`
**Escopo:** Preparar a plataforma Rede Vital para uso real por vendedores internos (dados-internos) e clientes assinantes.

---

## Mapa dos fluxos (estado real)

| Papel | Rota | Arquivo | Autenticação | Vê preços? |
|---|---|---|---|---|
| Cliente (público) | `/` | `client/src/pages/Consulta.tsx` | Nenhuma | UI esconde; **payload tRPC ainda retorna** |
| Vendedor interno | `/dados-internos` | `client/src/pages/Home.tsx` | `useDadosInternosAuth` (cookie `dados_internos_session`) | Sim (UI + payload) |
| Admin | `/admin` | `client/src/pages/Admin.tsx` | `adminProcedure` (role = admin) | Sim (CRUD completo) |
| Parceiro (token) | `/atualizar-dados/:token`, `/cadastro-medico/:token`, `/cadastro-servico/:token` | `AtualizarDados.tsx`, `CadastroMedico.tsx`, `CadastroServico.tsx` | Token assinado | Só próprios dados |

### Integração `plataforma.comissao.vital`
**Não existe no código ativo.** Foi removida — há marcadores `// [REMOVIDO] Router comissões de assinaturas removido` em `server/routers.ts` e `// [REMOVIDO]` em `server/db.ts`, `client/src/App.tsx`. Permanecem apenas:
- Scripts seed soltos: `seed-comissoes-assinaturas.mjs` / `.ts`
- Referências em migrations antigas (`drizzle/0009_*`, snapshots `0009–0032`)
- Docs: `INTEGRACAO_INDICACOES.md`
- Tabela `comissoesAssinaturas` ainda existe no schema (`drizzle/schema.ts:273`)

Se a integração for retomada, o ponto de entrada seria um novo router `comissoesAssinaturas` em `server/routers.ts`. Se não for retomada, limpar a tabela + seeds.

---

## 🔴 BLOQUEADOR (impede uso real)

Nenhum problema que impeça o sistema de subir. A aplicação compila (`pnpm check` sai com warnings não-fatais), rotas estão registradas, tRPC contextualizado, autenticação funcional.

---

## 🟠 ALTA (corrigir antes de vender acesso)

### A1. Preços vazam no payload tRPC para o cliente público
**Local:** `server/db.ts:146` (`listarMedicos`), `server/db.ts:266/299` (`listarInstituicoes`), `server/db.ts:1198` (`listarProcedimentos`) — todas chamadas de `publicProcedure`.

Hoje `db.select().from(medicos)` retorna **todos** os campos. O frontend público (`Consulta.tsx` + `CredenciadoListItem mostrarPrecoDesconto={false}`) apenas esconde visualmente, mas o JSON trafega `valorParticular`, `valorAssinanteVital`, `precoConsulta`, `descontoPercentual`, `email`, `whatsappParceria`, `observacoes`, `contatoParceria`, `telefoneOrganizacao`.

Qualquer um que abra DevTools → Network vê a tabela de preços completa. Viola a regra "cliente não pode ver o que não deve".

**Correção:** criar um `select({...})` explícito em `listarMedicos` e `listarInstituicoes` com apenas os campos públicos; criar funções `listarMedicosInterno` / `listarInstituicoesInterno` para `/dados-internos` usarem via `protectedProcedure`. Idem para procedimentos: `procedimentos.listar` hoje é `publicProcedure` — precisa separar em um endpoint público (sem valores) e outro interno (com valores).

### A2. BUG no update de instituições: `logoUrl`/`fotoUrl` são descartados
**Local:** `server/routers.ts:243-267`.

```ts
.input(z.object({
  id: z.number(),
  data: z.object({ ... /* sem logoUrl/fotoUrl */ }),
  logoUrl: z.string().optional(),   // ← declarado fora de data
  fotoUrl: z.string().optional(),   // ← declarado fora de data
}))
.mutation(async ({ input }) => {
  await atualizarInstituicao(input.id, input.data);  // ← só passa input.data
```

`client/src/pages/Admin.tsx:225` envia `{ id, data: dadosLimpos }` onde `dadosLimpos` contém `logoUrl`/`fotoUrl`. Como zod strip-strips por padrão, esses dois campos são **silenciosamente descartados** pela validação antes de chegar ao handler. Resultado: admin edita imagem, UI mostra sucesso, banco não persiste.

**Correção (baixo risco, aplicada nesta branch):** mover `logoUrl` e `fotoUrl` para **dentro** do objeto `data`. Mesmo layout já usado em `medicos.atualizar`.

### A3. Suíte de testes quebrada por ausência de `JWT_SECRET`
**Local:** `server/_core/env.ts:13` lança `throw new Error("FATAL: JWT_SECRET não definido…")` no import. 9 de 10 arquivos de teste falham antes de rodar um único `it()`.

**Correção (baixo risco, aplicada nesta branch):** adicionar `setupFiles` em `vitest.config.ts` apontando para um `server/__tests__/setup.ts` que define `process.env.JWT_SECRET` antes do primeiro import.

### A4. Senha de recuperação gerada sem enviar email
**Local:** `server/routers.ts:931` e `:967` — endpoints `solicitacoesAcesso.aprovar` e `recuperacaoSenha.solicitar` têm TODO:

```ts
// TODO: Enviar email com credenciais
// TODO: Enviar email com link de recuperação
```

Fluxo fica meio-capenga: senha é gerada mas usuário nunca recebe.

**Correção:** reaproveitar `enviarEmailNovoUsuario` / criar `enviarEmailLinkRecuperacao` em `server/_core/email.ts`.

---

## 🟡 MÉDIA (recomendado antes de ampliar base)

### M1. Tabela `comissoesAssinaturas` órfã no schema
A integração foi removida do router/App, mas o schema em `drizzle/schema.ts` e uma migration (`drizzle/0009_gorgeous_stingray.sql`) ainda criam a tabela. Decidir: reativar integração OU dropar via nova migration.

### M2. `.env.example` inexistente
Não há template de variáveis de ambiente (`JWT_SECRET`, `DATABASE_URL`, `OAUTH_SERVER_URL`, `BUILT_IN_FORGE_API_KEY`, etc.). Dificulta onboarding e deploy. Criar `.env.example`.

### M3. Deprecation do TypeScript
`tsconfig.json` usa `baseUrl` (deprecada em TS 7.0) e declara tipos `node` / `vite/client` sem tê-los listados corretamente. Não quebra hoje, mas vai quebrar.

### M4. Duas bibliotecas de bcrypt instaladas
`package.json` tem `bcrypt` **e** `bcryptjs`. `server/routers.ts` usa `bcryptjs`. Remover `bcrypt` + `@types/bcrypt` (nativo, reduz ~8MB em node_modules e elimina necessidade de build nativo em container).

### M5. Scripts de uso único no root do projeto
`check-parceria.mjs`, `check_images.mjs`, `create_test_apikey.mjs`, `generate_token.mjs`, `get-token.mjs`, `test-token.mjs`, `generate-qrcode*.py` — espalhados no root. Mover para `scripts/` ou apagar se não forem mais usados.

### M6. Documentação fragmentada
17 arquivos `.md` no root com conteúdo sobreposto (`AUDITORIA.md`, `AUDITORIA_COMPLETA.md`, `AVALIACAO_PROJETO.md`, `CODE_REVIEW_COMPLETO.md`, `DOCUMENTACAO_SISTEMA.md`, `GUIA_COMPLETO_SISTEMA.md`, `RESUMO_IMPLEMENTACAO.md`, `REVISAO_PRE_LANCAMENTO.md`, `todo.md`). Consolidar em `docs/` com um `README.md` único no root.

---

## 🟢 BAIXA (polimento)

### B1. Arquivos backup e desabilitados versionados
- `client/src/pages/Consulta.tsx.backup`
- `client/src/pages/Home.tsx.backup`
- `client/src/pages/AdminMateriais.tsx.disabled`
- `client/src/components/ConfiguracoesTab.tsx.disabled`
- `.gitkeep` vazio no root (não dentro de diretório)

**Correção (aplicada):** remover.

### B2. Comentários `[REMOVIDO]` ruidosos
`client/src/App.tsx:15-28, 44-53, 62-63` acumula ~15 linhas de imports/rotas comentadas. Mesmo padrão em `server/routers.ts` e `server/db.ts`. Git preserva o histórico; comentário morto não.

### B3. Header desktop da Consulta ainda diz "Vale do Itajaí"
`REVISAO_PRE_LANCAMENTO.md:21` aponta que deveria ter sido removido. `Consulta.tsx:102` ainda tem "no Vale do Itajaí" no texto. Se o objetivo é rede nacional, ajustar copy.

### B4. Texto "MANUS" no footer/algum lugar?
Não confirmado — verificar. Se estiver, trocar por "Rede Vital".

### B5. `.manus/` no repositório
Diretório de ferramenta externa versionado. Incluir em `.gitignore`.

---

## Resumo executivo

| Gravidade | Itens | Status |
|---|---|---|
| BLOQUEADOR | 0 | — |
| ALTA | 4 | **A1, A2, A3, A4 todos corrigidos** |
| MÉDIA | 6 | M1 já havia sido resolvido por migration 0033; M2, M4 corrigidos; M3/M5/M6 documentados |
| BAIXA | 5 | B1, B5 corrigidos; B2/B3/B4 abertos (cosmético) |

### Correções aplicadas

**ALTA**
- **A1** — `server/_core/context.ts` agora expõe `ctx.isInterno` (Manus OAuth ou cookie `dados_internos_session`). Novo `server/_core/sanitize.ts` remove `precoConsulta`, `valorParticular`, `valorAssinanteVital`, `descontoPercentual`, `observacoes`, `contatoParceria`, `whatsappParceria`, `telefoneOrganizacao`, `tokenAtualizacao`, `email` do payload quando `!isInterno`. Aplicado em `medicos.listar/obter`, `instituicoes.listar/obter`, `instituicoes.listarProcedimentos`, `procedimentos.listar`.
- **A2** — movidos `logoUrl`/`fotoUrl` para dentro de `data` em `instituicoes.atualizar`.
- **A3** — `server/__tests__/setup.ts` + `setupFiles` em `vitest.config.ts` injeta `JWT_SECRET` (4 → 19 testes passando).
- **A4** — `solicitacoesAcesso.aprovar` agora chama `enviarEmailNovoUsuario`. Nova função `enviarEmailLinkRecuperacao` em `server/_core/email.ts`, chamada por `recuperacaoSenha.solicitar` com link apontando para `/recuperar-senha-dados-internos?token=…`.

**MÉDIA**
- **M1** — tabela `comissoesAssinaturas` já dropada pela migration `drizzle/0033_slow_rumiko_fujikawa.sql`. Nada a fazer no DB.
- **M2** — `.env.example` criado.
- **M4** — `server/_core/auth.ts` era código morto usando `bcrypt` nativo: removido. `server/db.ts` trocou `import("bcrypt")` por `bcryptjs`. `bcrypt` e `@types/bcrypt` removidos do `package.json`.
- **M5** — scripts soltos consolidados em `scripts/`.

**BAIXA**
- **B1** — removidos `*.backup`, `*.disabled`, `.gitkeep` vazio no root.
- **B5** — `.manus/` versionado removido; entrada no `.gitignore`.

**Bônus**
- Erro TS pré-existente em `useDadosInternosAuth.ts` corrigido (acesso a `.usuario` em `verificarAcesso` que só retorna `{autorizado}`).
- `*.backup` e `*.disabled` agora ignorados pelo git.

Após todas as correções: `pnpm check` limpo; testes 19/49 (os 30 restantes dependem de `DATABASE_URL` e `BUILT_IN_FORGE_API_*` — esperado em CI sem infra).

### Restam apenas cosméticos (BAIXA)
- **B2** comentários `[REMOVIDO]` em vários arquivos — cosmético.
- **B3** header ainda menciona "Vale do Itajaí" em `Consulta.tsx:102` — copy tem que ser decidido pelo time (rede nacional vs. regional).
- **B4** verificar textos "MANUS" remanescentes em UI (não confirmado).
- **M3** `tsconfig.json` com `baseUrl` deprecado — só quebra em TS 7.0.
- **M6** 17 `.md` na raiz — consolidar em `docs/` quando sobrar tempo.
