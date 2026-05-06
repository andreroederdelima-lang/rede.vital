# Guia de Testes — Rede Vital Credenciados

Material para validar o sistema em produção/staging antes de liberar para vendedores e clientes. **Não contém credenciais** — você vai criá-las seguindo as instruções abaixo, porque guardá-las no repo seria risco de segurança.

---

## 1. URLs do sistema (produção)

**Hostname de produção:** `https://credenciados.suasaudevital.com.br`

### Rotas públicas (cliente assinante, sem login)
| Rota | Descrição |
|---|---|
| `/` | Vitrine de credenciados (Consulta) — **cenário-mãe do cliente** |
| `/parceiros` | Landing para partner convidar novos credenciados |
| `/sugerir-parceiro` | Formulário de sugestão |
| `/termos-uso`, `/politica-privacidade` | LGPD |

### Rotas internas (vendedor / dados-internos)
| Rota | Descrição |
|---|---|
| `/login-dados-internos` | Login email+senha |
| `/dados-internos` | Painel do vendedor (lista com preços e descontos) |
| `/solicitar-acesso` | Pedido de acesso (para quem ainda não tem login) |
| `/recuperar-senha-dados-internos?token=...` | Redefinir senha via link recebido por email |

### Rotas admin
| Rota | Descrição |
|---|---|
| `/admin` | Painel completo (login via Manus OAuth) |
| `/admin/avaliacoes` | Avaliações recebidas |
| `/admin/notificacoes` | Notificações semestrais |

### Rotas via token (parceiro credenciado)
| Rota | Descrição |
|---|---|
| `/atualizar-dados/:token` | Credenciado já cadastrado atualiza próprios dados |
| `/cadastro-medico/:token` | Novo médico preenche cadastro |
| `/cadastro-servico/:token` | Nova instituição/serviço preenche cadastro |

---

## 2. Criar credenciais (um por vez, na primeira vez)

### 2.1 Primeiro admin (Manus OAuth)

Não tem login email/senha para admin. Funciona assim:

1. Configure `OWNER_OPEN_ID` no `.env` de produção com o `openId` da sua conta Manus.
2. Acesse `/admin`. Você é redirecionado para o login Manus OAuth.
3. Login com a conta cujo `openId` bate com `OWNER_OPEN_ID`.
4. Na primeira autenticação, `server/_core/sdk.ts` sincroniza o usuário em `users` com `role='admin'` automaticamente.

**Para saber o seu openId**: entrar na Manus logado e abrir o console do navegador em qualquer app Manus — o openId aparece no payload de auth.

### 2.2 Criar vendedor (dados-internos)

Duas formas:

**Via painel admin** (recomendado):
1. Logar em `/admin`.
2. Menu "Usuários Autorizados" → "Criar novo".
3. Preencher email, nome, senha (mín 6 chars), nivelAcesso=`visualizador`.
4. Sistema envia email de boas-vindas com as credenciais (via `enviarEmailNovoUsuario`).

**Via SQL direto** (se o admin não estiver disponível):
```sql
-- Senha hash gerada com: node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('SENHA_TEMP',10).then(console.log)"
INSERT INTO usuariosAutorizados (email, nome, senhaHash, nivelAcesso, ativo, createdAt)
VALUES ('vendedor@exemplo.com', 'Vendedor Teste', '$2b$10$...', 'visualizador', 1, NOW());
```

### 2.3 Gerar token de cadastro/atualização para parceiro

**Via admin (recomendado):**
1. Logar em `/admin`.
2. Médicos ou Instituições → selecionar → "Gerar Link de Atualização" OU "Adicionar Novo".
3. Copiar o link gerado (ex: `https://credenciados.suasaudevital.com.br/atualizar-dados/abc123...`).
4. Mandar via WhatsApp ao credenciado.

**Via script CLI (quando precisar gerar em lote):**
```bash
DATABASE_URL="mysql://..." node scripts/generate-token.mjs
```

### 2.4 Criar API Key para REST pública

```bash
DATABASE_URL="mysql://..." node scripts/create-test-apikey.mjs
```
Copie o valor de `apiKey` — é mostrado uma única vez. Use no header `X-API-Key` das chamadas à `/api/public/*`.

---

## 3. Variáveis de ambiente obrigatórias

Copie `.env.example` e preencha:

```bash
# OBRIGATÓRIAS (servidor não sobe sem estas)
JWT_SECRET=              # openssl rand -base64 48
DATABASE_URL=            # mysql://user:pass@host:3306/redevital

# AUTH MANUS (admin)
OAUTH_SERVER_URL=
VITE_APP_ID=
OWNER_OPEN_ID=           # openId da conta que vira admin na primeira sessão

# FORGE (email + upload S3)
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=

NODE_ENV=production
```

---

## 4. Checklist de smoke test (antes de abrir para o time)

### 4.1 Cliente público (`/`)
- [ ] Abrir `/` em aba anônima
- [ ] Listagem de médicos carrega; procurar por especialidade funciona
- [ ] Filtro por município funciona
- [ ] Cards mostram nome, especialidade, endereço, WhatsApp, "Como Chegar"
- [ ] **Abrir DevTools → Network → clicar num card → confirmar que a resposta tRPC de `medicos.listar` NÃO contém `valorParticular`, `valorAssinanteVital`, `precoConsulta`, `descontoPercentual`, `email`, `contatoParceria`, `whatsappParceria`, `observacoes`** — essa é a validação do item A1 de segurança
- [ ] Botão "Compartilhar" abre WhatsApp com link formatado
- [ ] Botão "Como Chegar" abre Google Maps

### 4.2 Vendedor (`/dados-internos`)
- [ ] Logar com vendedor criado em 2.2
- [ ] Listagem mostra **COM preços** (Particular, Assinante Vital, % desconto)
- [ ] Filtros por especialidade + município funcionam
- [ ] Botão "Gerar Encaminhamento" abre diálogo e imprime PDF
- [ ] Botão "Enviar Link de Atualização" gera link e copia para clipboard
- [ ] Botão "Alterar Senha" funciona (testar senha atual incorreta → erro; senha válida → sucesso)
- [ ] Logout redireciona para `/login-dados-internos`

### 4.3 Admin (`/admin`)
- [ ] Logar via Manus OAuth
- [ ] Criar um médico novo → aparece na lista
- [ ] **Editar instituição → trocar imagem → confirmar que persiste após refresh** (validação do bug A2 da PR #3)
- [ ] Aprovar solicitação de parceria → checa se o email de aprovação chegou ao parceiro
- [ ] Aprovar solicitação de acesso → checa se o email com credenciais chegou ao novo vendedor (validação do A4)
- [ ] Gerar token de atualização → compartilhar → abrir em outra sessão anônima → verificar se `/atualizar-dados/:token` carrega os dados preenchidos

### 4.4 Recuperação de senha
- [ ] Acessar `/login-dados-internos` → "Esqueci minha senha"
- [ ] Informar email de um vendedor válido → mensagem "Se o email existir..."
- [ ] **Verificar que o email com link chegou** (validação do A4)
- [ ] Clicar no link → formulário de nova senha funciona
- [ ] Login com nova senha funciona; token antigo não aceita segunda vez

### 4.5 API REST pública
- [ ] Criar API Key (ver 2.4)
- [ ] `curl -H "X-API-Key: <KEY>" https://credenciados.suasaudevital.com.br/api/public/credenciados/medicos` → 200 com JSON
- [ ] Sem header → 401
- [ ] Chave inválida → 401
- [ ] Disparar 105 requests em 1 min → 429 (rate limit)

### 4.6 Segurança (sanity check)
- [ ] Acessar `/admin` sem login → redireciona para Manus OAuth
- [ ] Acessar `/dados-internos` sem login → redireciona para `/login-dados-internos`
- [ ] Acessar `/atualizar-dados/token-invalido` → erro claro
- [ ] Tentar editar procedimento de outra instituição via token → erro de ownership (bug IDOR)

---

## 5. Se algo não responder como email

Se um email de aprovação/recuperação/criação não chegar:

1. Conferir `BUILT_IN_FORGE_API_URL` e `BUILT_IN_FORGE_API_KEY` em produção.
2. `console.error('[Email]', ...)` do servidor vai logar falhas — checar logs.
3. Forge é usado para todo envio — `server/_core/email.ts::sendEmail` posta em `/notification/email` com Bearer token.
4. Fluxo principal nunca trava por falha de email (wrap em try/catch). Então sucesso de mutation ≠ email enviado.

---

## 6. Contatos institucionais (para footer/termos)

Já presentes no código:
- `comercial@suasaudevital.com.br` — comercial
- `administrativo@suasaudevital.com.br` — administrativo
- `privacidade@suasaudevital.com.br` — LGPD
- `contato@suasaudevital.com.br` — genérico

---

## 7. O que NÃO tem (e precisa vir de fora)

Essas coisas não moram no código e não podem ser "entregues" pelo repositório:

- Credenciais reais de usuários específicos (criar via 2.1–2.4).
- Chaves de produção (`JWT_SECRET`, `DATABASE_URL`, `BUILT_IN_FORGE_*`, `OAUTH_*`) — ficam no cofre de segredos do ambiente de deploy.
- openId da sua conta Manus para virar `OWNER_OPEN_ID` (pegar no console Manus).
- Acesso ao banco de produção para rodar os scripts em `scripts/`.
