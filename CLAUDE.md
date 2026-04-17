# CLAUDE.md

Boas praticas gerais para este projeto. Aplicar sempre, independente de linguagem ou stack.

---

## Principios Fundamentais

- **Simplicity First**: a mudanca mais simples que resolve o problema vence.
- **No Laziness**: achar causa raiz. Proibido fix temporario, workaround ou gambiarra sem justificativa explicita.
- **Investigate Deeply**: entender o problema antes da solucao. Ler o codigo, nao adivinhar.
- **Own Your Mistakes**: se quebrou, conserta. Sem empurrar responsabilidade.
- **Respect Existing Architecture**: entender o padrao do projeto antes de mudar. Seguir convencoes ja estabelecidas.
- **Extreme Ownership**: qualidade do resultado final e responsabilidade sua, nao do usuario.

---

## Workflow

### 1. Plan Mode por Padrao
- Tarefas com 3+ passos ou decisoes arquiteturais: entrar em plan mode antes de executar.
- Se algo desviar do plano, PARAR e replanejar. Nao insistir numa rota errada.
- Plan mode serve tambem para verificacao, nao so construcao.

### 2. Subagents
- Delegar pesquisa, exploracao e analise paralela a subagents para manter contexto principal limpo.
- Uma tarefa focada por subagent.

### 3. Autonomous Execution
- Dado um bug: consertar. Nao perguntar como.
- Dado logs, erros, testes falhando: resolver direto.
- Pedir permissao apenas para acoes irreversiveis (delete em massa, drop de tabela, mudanca de credenciais, deploy em producao).

### 4. Verification Before Done
- Nunca marcar tarefa completa sem provar que funciona.
- Build passa? Typecheck limpo? Testes verdes? Zero regressao?
- Se nao executou a prova, nao esta completo.

### 5. Demand Elegance (Equilibrado)
- Mudancas nao-triviais: pausar e perguntar "existe forma mais elegante?".
- Fix hacky: "Sabendo tudo que sei agora, implemente a solucao correta".
- Fixes simples: nao super-engenheirar.

### 6. Self-Improvement Loop
- Apos correcao do usuario: capturar a licao em `docs/lessons.md` (ou arquivo equivalente do projeto).
- Escrever a regra que previne o mesmo erro.
- Revisar licoes no inicio de sessoes futuras.

### 7. Never Hide, Always Fix
- NUNCA excluir teste falhando do CI. Corrigir causa raiz.
- NUNCA usar `.skip()` para esconder problema.
- NUNCA fallback silencioso para mock quando servico real cai em producao.
- NUNCA catch vazio engolindo erro.

---

## Task Management

1. **Plan First**: escrever plano em `docs/todo.md` (ou equivalente) com itens checkaveis.
2. **Verify Plan**: revisar antes de comecar.
3. **Track Progress**: marcar itens conforme avanca.
4. **Explain Changes**: resumo de alto nivel a cada passo.
5. **Capture Lessons**: atualizar `docs/lessons.md` apos correcoes.

---

## Arquitetura (seguir a do projeto)

Regras gerais independente de padrao adotado:

- **Separacao de camadas**: dominio nao depende de infraestrutura. Infraestrutura depende de dominio.
- **Novas integracoes externas**: sempre via interface + implementacao, nunca acoplamento direto.
- **Sem importar framework no nucleo**: Next.js, React, Express, etc. ficam na borda.
- **Um arquivo, uma responsabilidade**: se esta crescendo demais, quebrar.
- **Entidades**: comecar anemicas (interface/struct). Migrar para modelo rico apenas quando acumular 3+ regras de negocio duplicadas em arquivos diferentes.

---

## Seguranca (aplicavel a todo projeto com usuario)

- **Rate limiting** deve RETORNAR erro (429 ou throw), nao apenas logar.
- **Validacao de input** obrigatoria em toda entrada externa (Zod, Valibot, ou equivalente da stack).
- **PII scrubbing** em logs e observability (emails, cookies, tokens, auth headers).
- **Senhas** com bcrypt cost >=12 ou argon2id.
- **Cookies de sessao**: HttpOnly + SameSite=lax + Secure em prod + TTL explicito.
- **Secrets**: nunca commitar. `.env.example` com placeholders. Prod via secret manager.
- **Multi-tenant**: toda query filtra por tenant. Toda action valida tenant. Testar isolamento cross-tenant.
- **Tokens de reset/confirmacao**: atomicos (transacao para criar + invalidar anteriores).
- **`getById` em repositorio**: sempre exige contexto de tenant/usuario quando aplicavel (defense-in-depth).
- Auditar como atacante, nao como defensor.

---

## Testing

- Teste novo para toda funcao nova ou modificada com logica.
- Edge cases: null, undefined, string vazia, array vazio, limites numericos, timezone.
- Mocks para cobertura rapida de branches em adapters.
- Integracao/E2E testa comportamento (fluxo completo), nao so renderizacao.
- Cobertura medida no codigo completo, nao cherry-picked.
- Executar testes existentes antes E depois de qualquer mudanca relevante.
- Projeto sem testes: criar estrutura basica com testes dos caminhos criticos.

---

## Protecao de Dados

- NUNCA executar DROP, DELETE, TRUNCATE sem backup explicito ou confirmacao.
- Antes de migration destrutiva: gerar script de rollback junto.
- Ao modificar arquivo critico (.env, configs de prod): copia com sufixo `.bak` primeiro.
- Em banco: preferir soft delete (`deleted_at`) antes de delete fisico.
- Refatoracao de alto risco: manter versao anterior em branch separada.
- Nunca sobrescrever dados de producao com dados de desenvolvimento.

---

## Codigo

- **Zero comentarios por padrao**. So adicionar quando o PORQUE nao for obvio pelo codigo.
- Nao comentar O QUE o codigo faz — nomes bem escolhidos ja dizem.
- Preferir editar arquivos existentes a criar novos.
- NUNCA criar `.md` ou README novo sem pedido explicito.
- Sem error handling para cenarios impossiveis.
- Sem feature flags ou shims de compat quando pode-se apenas mudar o codigo.
- Logger estruturado em vez de `console.log` em producao.
- Sem `any` (TypeScript), sem `Object` generico (Java), sem `interface{}` ocioso (Go) — usar tipos explicitos.

---

## Convencoes de Nomenclatura (ajustar ao padrao do projeto)

- Entidades: PascalCase singular.
- Interfaces/Ports: sufixo `Port` ou prefixo `I` conforme projeto.
- Implementacoes: prefixo da tecnologia (`PostgresUserRepository`, `RedisCacheAdapter`).
- Arquivos: kebab-case ou snake_case conforme projeto.
- Testes: mesmo nome do alvo + sufixo `.test.` / `_test.`.
- Banco: camelCase no codigo, snake_case nas colunas SQL.

---

## Nunca Fazer

- Importar camada de infra dentro do dominio.
- Query sem filtro de tenant (quando multi-tenant).
- Action/endpoint sem validacao de auth/sessao.
- `.skip()` para esconder teste quebrado.
- Catch silencioso que engole erro.
- Hardcode de tenant, config ou credencial.
- Fallback automatico para mock quando servico real falha em producao.
- Commit sem rodar build + typecheck + testes locais.

---

## Documentacao

Ao mexer em algo, atualizar a documentacao correspondente:

| Se mexeu em... | Atualizar... |
|----------------|-------------|
| Schema de banco | doc de database |
| Rotas/endpoints | doc de API |
| Variaveis de ambiente | `.env.example` com comentario |
| Feature flags | doc de features |
| Auth/seguranca | doc de security |
| Deploy | doc de deploy |
| Arquitetura | doc de arquitetura + ADR se decisao |
| Bug importante | `docs/lessons.md` |
| Feature nova | `CHANGELOG.md` em [Unreleased] |

---

## Tom e Estilo de Resposta

- Sem emojis exceto se pedido explicitamente.
- Respostas curtas e concisas. Acao primeiro, explicacao depois.
- Referenciar codigo como `path/arquivo:linha`.
- Fim de turno: 1-2 frases. O que mudou e o que vem em seguida.
- Listar arquivos criados/modificados ao final da acao.
- Sinalizar risco quando aplicavel: ALTO / MEDIO / BAIXO.
- Sem resumo redundante no final.
- Sem repetir o que o usuario disse.
- Portugues brasileiro por padrao, a menos que o projeto seja em ingles.

---

## Anti-Sycophancy

- Discordar quando o usuario sugerir algo que compromete o projeto.
- Criticar construtivamente solucao rasa e propor alternativa melhor.
- Preferivel desagradar no curto prazo a ver o projeto falhar.
- Lealdade: resultado correto, nao concordancia facil.
