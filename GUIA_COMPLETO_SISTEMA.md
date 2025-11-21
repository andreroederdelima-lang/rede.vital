# 📘 GUIA COMPLETO DO SISTEMA - VITAL CREDENCIADOS

**Data:** 21 de Novembro de 2025  
**Versão:** 1.0 (Pós-Integração)  
**Status:** ✅ Sistema Funcional (85% completo)

---

## 🎯 VISÃO GERAL

O **GUIA DO ASSINANTE** é uma plataforma web completa que integra três sistemas principais:

1. **Consulta Pública de Credenciados** - Para assinantes Vital consultarem médicos e clínicas
2. **Sistema de Indicações** - Para promotores/vendedores gerenciarem indicações e comissões
3. **Gestão Administrativa** - Para administradores gerenciarem toda a rede

---

## 🌐 ESTRUTURA DE PÁGINAS

### 📍 **Página Principal** (`/`)

**Acesso:** Público (qualquer pessoa)  
**Propósito:** Consulta de credenciados para assinantes Vital

**Funcionalidades:**
- ✅ Listagem completa de médicos e clínicas credenciadas
- ✅ Filtros por especialidade e município
- ✅ Categorias: Médicos, Serviços de Saúde, Outros Serviços
- ✅ Botão "Agende por WhatsApp" (contato direto com credenciado)
- ✅ Botão "Compartilhar Credenciado" (via WhatsApp)
- ✅ Botão "Copiar Link" (link direto do credenciado)
- ✅ Banner de parceiros nacionais (+34.100 farmácias, +3.100 médicos, +350 laboratórios)
- ✅ Busca por nome, especialidade ou clínica

**Informações Exibidas:**
- Nome do credenciado
- Especialidade/Categoria
- Município
- Endereço
- Telefone/WhatsApp
- ❌ **NÃO exibe:** Preços ou descontos (dados sigilosos)

**Botões do Header:**
- Sugerir um Parceiro (modal com formulário)
- Fale Conosco (WhatsApp: 47 93385-3726)
- Acesso Interno (redireciona para login)

---

### 🔐 **Dados Internos** (`/dados-internos`)

**Acesso:** Restrito (usuários autorizados com senha própria)  
**Propósito:** Consulta interna com informações comerciais completas

**Como Acessar:**
1. Clicar em "Acesso Interno" na página principal
2. Fazer login em `/login-dados-internos`
3. Usar credenciais fornecidas pelo Admin

**Funcionalidades:**
- ✅ Listagem completa de credenciados
- ✅ **Exibe preços e descontos** (dados comerciais)
- ✅ Botão "Enviar Link de Atualização" (via WhatsApp)
- ✅ Filtros avançados
- ✅ Exportar PDF da lista completa
- ✅ Gerar encaminhamento médico
- ✅ Header com nome do usuário e logout

**Informações Adicionais Exibidas:**
- 💰 Preço da Consulta
- 🎯 % de Desconto Vital
- Todos os dados da página pública

**Botões do Header:**
- Preços das Assinaturas Vital
- Indique a Vital!
- Convide um Parceiro
- Sugerir um Parceiro
- Consulta Pública (volta para `/`)
- Admin (se for administrador)

**Sistema de Autenticação:**
- Login independente (não usa Manus OAuth)
- Senha com hash bcrypt
- Recuperação de senha por email
- Solicitação de acesso público

---

### 📊 **Indicações** (`/indicacoes`)

**Acesso:** Restrito (requer login Manus OAuth)  
**Propósito:** Promotores e vendedores gerenciarem indicações

**Como Acessar:**
1. Clicar em "Indicações" no menu
2. Fazer login via Manus OAuth
3. Aguardar cadastro como Promotor/Vendedor pelo Admin

**Funcionalidades:**
- ✅ Dashboard com estatísticas pessoais
  - Total de Indicações
  - Vendas Fechadas
  - Comissões Pendentes
- ✅ Formulário de nova indicação
- ✅ Geração de QR Code para WhatsApp
- ✅ Listagem de indicações próprias
- ✅ Filtros por status (Pendente, Contatado, Fechado, Perdido)

**Fluxo de Uso:**
1. Promotor cria nova indicação (nome, telefone, observações)
2. Sistema gera QR Code com link WhatsApp
3. Cliente escaneia QR Code e envia mensagem:  
   *"Recebi indicação para conhecer as assinaturas e benefícios da Vital ❤️🚑!"*
4. Vendedor Vital entra em contato
5. Admin atualiza status da indicação
6. Se fechado, comissão é registrada

**Status Possíveis:**
- 🟡 Pendente (aguardando contato)
- 🔵 Contatado (em negociação)
- 🟢 Fechado (venda concluída)
- 🔴 Perdido (não converteu)

**⚠️ Limitação Atual:**
- Se usuário não está cadastrado como Promotor/Vendedor, aparece: "Cadastro Pendente"
- Admin precisa cadastrar manualmente (funcionalidade pendente)

---

### 🤝 **Seja Parceiro** (`/parceiros`)

**Acesso:** Público  
**Propósito:** Captação de novos parceiros para a rede Vital

**Conteúdo:**
- ✅ Apresentação da Vital (Quem Somos, História, Missão, Visão)
- ✅ Mantras Vitais (5 princípios da empresa)
- ✅ Benefícios para o Parceiro:
  - Aumento de Visibilidade
  - Mais Pacientes e Clientes Particulares
  - Ecossistema Vital
  - Crescimento com Atendimento Domiciliar
  - Parceria de Verdade
- ✅ Seção "Seja Parceiro + Assinante Empresarial"
- ✅ Formulário de cadastro de parceiro

**Formulário de Parceiro:**
- Nome do Responsável
- Nome do Estabelecimento
- Tipo de Credenciado (Médico/Instituição)
- Categoria (texto livre)
- Especialidade (se médico)
- Principal Área de Atuação (se médico)
- Endereço
- Cidade
- Telefone
- Preço (obrigatório)
- Desconto oferecido
- Imagem (opcional)

**Envio:** Email para `administrativo@suasaudevital.com.br`

**Botões:**
- Quero Crescer com a Vital!
- Quero Fazer Parte do Ecossistema Vital!
- COMPLETE SEU CADASTRO DE PARCEIRO
- Conheça as Assinaturas Empresariais
- Fale com o Especialista (WhatsApp)

---

### 🛡️ **Admin** (`/admin`)

**Acesso:** Restrito (requer login Manus OAuth + role admin)  
**Propósito:** Gestão completa do sistema

**Abas Disponíveis:**

#### 1️⃣ **Credenciados**
- Gerenciar médicos e clínicas
- Adicionar, editar, excluir
- Campos: nome, especialidade, município, endereço, telefone, WhatsApp, email, preço, desconto
- Coluna "Preços" visível na tabela

#### 2️⃣ **Solicitações**
- Aprovar/rejeitar solicitações de parceria
- Visualizar dados do formulário de parceiros
- Converter solicitação em credenciado

#### 3️⃣ **Atualizações Pendentes**
- Aprovar/rejeitar atualizações de dados enviadas pelos parceiros
- Visualizar dados atuais vs. dados novos
- Sistema de tokens únicos por credenciado

#### 4️⃣ **Usuários**
- Gerenciar usuários da área Dados Internos
- Adicionar novo usuário (email, nome, senha)
- Botão "Reenviar Senha" para cada usuário
- Excluir usuários

#### 5️⃣ **Acessos**
- Aprovar/rejeitar solicitações de acesso público
- Gerar senha temporária
- Exibir senha para admin copiar e enviar manualmente

#### 6️⃣ **Prospecção**
- Dashboard de cobertura por cidade
- 8 cidades foco: Rodeio, Rio dos Cedros, Benedito Novo, Pomerode, Ascurra, Apiúna, Timbó, Indaial
- Indicadores de cor:
  - 🔴 Vermelho: 0 credenciados
  - 🟡 Amarelo: 1 credenciado
  - 🟢 Verde: 2+ credenciados (meta atingida)
- Categorias monitoradas:
  - Médicos (por especialidade)
  - Serviços de Saúde (clínicas, fisioterapia, nutrição, exames)
  - Outros Serviços (academias, artes marciais, farmácias, mercados, padarias)

**❌ Aba FALTANDO:**
- **Indicações** - Gerenciar promotores, vendedores, indicações e comissões

---

## 🔐 SISTEMAS DE AUTENTICAÇÃO

### Sistema 1: Manus OAuth
**Usado em:** `/admin`, `/indicacoes`  
**Como funciona:**
- Login via portal Manus
- Roles: `admin` | `user`
- Apenas admins acessam `/admin`
- Todos os usuários autenticados acessam `/indicacoes` (se cadastrados como promotores)

### Sistema 2: Autenticação Interna
**Usado em:** `/dados-internos`  
**Como funciona:**
- Login próprio em `/login-dados-internos`
- Usuários criados pelo Admin
- Senha com hash bcrypt
- Recuperação de senha em `/recuperar-senha-dados-internos`
- Solicitação de acesso em `/solicitar-acesso`

**Fluxo de Solicitação de Acesso:**
1. Usuário preenche formulário em `/solicitar-acesso`
2. Admin recebe solicitação na aba "Acessos"
3. Admin aprova e sistema gera senha temporária
4. Admin copia senha e envia manualmente ao usuário
5. Usuário faz login em `/login-dados-internos`

---

## 🎨 IDENTIDADE VISUAL

### Cores Oficiais Vital:
- **Turquesa:** `#1e9d9f` (cor principal)
- **Bege/Dourado:** `#c6bca4` (cor secundária)
- **Branco:** Fundo clean

### Tipografia:
- **Playfair Display** - Título "GUIA DO ASSINANTE" (elegante)
- **Sans-serif padrão** - Corpo do texto

### Aplicação:
- ✅ Botões com cores Vital
- ✅ Dropdowns com fundo sólido turquesa
- ✅ Tabs de categorias com verde discreto
- ✅ Charts do dashboard em tons de turquesa
- ✅ Logo horizontal "Serviços Médicos" em todas as páginas

---

## 📱 MENSAGENS WHATSAPP

### 1. Agendar Consulta (Página Pública)
**Botão:** "Agende por WhatsApp"  
**Número:** Do credenciado  
**Mensagem:** `Olá, eu sou assinante Vital, e desejo agendar um horário!`

### 2. Compartilhar Credenciado
**Botão:** "Compartilhar Credenciado"  
**Mensagem:**
```
💚 *Vital, sempre ao seu lado*

Encontrei este credenciado no Guia de Parceiros Vital - Vale do Itajaí - Santa Catarina:

👤 *[Nome]*
📋 *[Especialidade/Categoria]*
📍 *[Município]*
🏠 *[Endereço]*
📞 *[Telefone]*

🔗 Veja mais detalhes: [Link]

💚 *Seja Vital!*
Conheça nossos planos: https://wa.me/5547933853726
```

### 3. Fale Conosco (Secretaria Vital)
**Botão:** "Fale Conosco"  
**Número:** 47 93385-3726  
**Mensagem:** Livre (usuário digita)

### 4. Indicação (QR Code)
**Gerado em:** `/indicacoes`  
**Número:** Do vendedor Vital  
**Mensagem:** `Recebi indicação para conhecer as assinaturas e benefícios da Vital ❤️🚑!`

### 5. Enviar Link de Atualização (Dados Internos)
**Botão:** "Enviar Link de Atualização"  
**Número:** Do credenciado  
**Mensagem:**
```
Olá! Aqui é a equipe Vital.

Gostaríamos de manter seus dados sempre atualizados em nosso sistema.

Por favor, acesse o link abaixo para revisar e atualizar suas informações:
[Link com token único]

Qualquer dúvida, estamos à disposição!
```

---

## 📊 BANCO DE DADOS

### Tabelas Implementadas:

**Credenciados:**
- `medicos` - Médicos credenciados
- `instituicoes` - Clínicas e serviços de saúde

**Solicitações:**
- `solicitacoesParceria` - Solicitações de novos parceiros
- `solicitacoesAtualizacao` - Atualizações de dados
- `solicitacoesAcesso` - Solicitações de acesso à área Dados Internos

**Usuários:**
- `users` - Usuários Manus OAuth (Admin)
- `usuariosAutorizados` - Usuários Dados Internos (senha própria)

**Indicações:**
- `indicadores` - Promotores e Vendedores
- `indicacoes` - Indicações de clientes
- `comissoes` - Comissões pagas

**Recuperação:**
- `tokensRecuperacao` - Tokens de recuperação de senha

---

## ✅ FUNCIONALIDADES IMPLEMENTADAS

### Consulta Pública:
1. ✅ Filtros por especialidade e município
2. ✅ Categorias: Médicos, Serviços de Saúde, Outros Serviços
3. ✅ Botão "Agende por WhatsApp"
4. ✅ Botão "Compartilhar Credenciado"
5. ✅ Botão "Copiar Link"
6. ✅ Dropdown com fundo sólido turquesa
7. ✅ Banner de parceiros nacionais
8. ✅ Busca por nome/especialidade/clínica

### Dados Internos:
1. ✅ Login separado (não Manus)
2. ✅ Listagem completa com preços e descontos
3. ✅ Envio de link de atualização por WhatsApp
4. ✅ Recuperação de senha por email
5. ✅ Header com logout
6. ✅ Exportar PDF
7. ✅ Gerar encaminhamento médico

### Admin:
1. ✅ Gerenciamento de credenciados
2. ✅ Aprovação de solicitações de parceria
3. ✅ Aprovação de atualizações de dados
4. ✅ Gerenciamento de usuários internos
5. ✅ Aprovação de solicitações de acesso
6. ✅ Dashboard de prospecção com mapa de cobertura
7. ✅ Botão "Reenviar Senha" para usuários

### Indicações:
1. ✅ Dashboard com estatísticas
2. ✅ Formulário de nova indicação
3. ✅ Geração de QR Code para WhatsApp
4. ✅ Listagem de indicações próprias
5. ✅ Filtros por status

---

## ❌ FUNCIONALIDADES PENDENTES

### 🔴 Alta Prioridade (Críticas):
1. ❌ **Aba Indicações no Admin**
   - Cadastro de Promotores/Vendedores
   - Listagem completa de indicações (todas, não só do usuário)
   - Atualização de status de indicações
   - Gestão de comissões (valor, data, comprovante)
   - Estatísticas gerais

### 🟡 Média Prioridade (Melhorias UX):
2. ❌ **Menu Mobile Responsivo** - Hamburger menu para dispositivos móveis
3. ❌ **Busca em Tempo Real** - Campo de busca com resultados instantâneos
4. ❌ **Exportação de Relatórios** - Excel/PDF do dashboard de prospecção
5. ❌ **Notificações Automáticas** - Alertas por email para novas indicações/comissões

### 🟢 Baixa Prioridade (Futuro):
6. ❌ **Dashboard de Performance** - Gráficos e ranking de promotores
7. ❌ **Metas Personalizadas** - Definir metas diferentes por categoria
8. ❌ **Alertas de Lacunas** - Notificar admin quando cidade fica sem cobertura

---

## 🐛 BUGS CONHECIDOS

### ✅ Corrigidos:
- ✅ Links `<a>` aninhados no MainNav
- ✅ Query retornando `undefined` ao invés de `null`
- ✅ Rota `/consulta` não existia (corrigido para `/`)

### ⚠️ Não Afetam Funcionamento:
- ⚠️ Erros de TypeScript no `db.ts` (imports de `indicacoes`, `comissoes`)
- ⚠️ Servidor funcionando normalmente
- ⚠️ Tabelas criadas corretamente no banco

---

## 📖 GUIA DE USO POR PERFIL

### 👥 **Para Assinantes Vital (Público)**

**Como usar:**
1. Acesse o site (raiz `/`)
2. Use filtros para encontrar credenciados
3. Clique em "Agende por WhatsApp" para marcar consulta
4. Compartilhe credenciados com amigos/família
5. Sugira novos parceiros via botão "Sugerir um Parceiro"

**Dica:** Não precisa fazer login! A consulta é totalmente pública.

---

### 💼 **Para Equipe Interna (Dados Internos)**

**Como acessar:**
1. Clique em "Acesso Interno" na página principal
2. Faça login com suas credenciais
3. Se não tem acesso, clique em "Solicite aqui"

**Como usar:**
1. Consulte credenciados com preços e descontos
2. Envie links de atualização para parceiros
3. Exporte PDF da lista completa
4. Gere encaminhamentos médicos
5. Faça logout ao terminar

**Recuperar senha:**
1. Clique em "Esqueci minha senha"
2. Digite seu email
3. Siga instruções do email recebido

---

### 📈 **Para Promotores/Vendedores (Indicações)**

**Como acessar:**
1. Clique em "Indicações" no menu
2. Faça login via Manus OAuth
3. Se aparecer "Cadastro Pendente", entre em contato com o Admin

**Como usar:**
1. Crie nova indicação (nome, telefone, observações)
2. Gere QR Code e compartilhe com o cliente
3. Cliente escaneia e envia mensagem automática
4. Acompanhe status das suas indicações
5. Visualize comissões pendentes

**Dica:** Guarde os QR Codes para reutilizar!

---

### 🛡️ **Para Administradores**

**Como acessar:**
1. Clique em "Admin" no menu
2. Faça login via Manus OAuth (precisa ter role admin)

**Tarefas Principais:**

**Gerenciar Credenciados:**
1. Aba "Credenciados"
2. Adicionar novo médico/clínica
3. Editar dados existentes
4. Excluir se necessário

**Aprovar Solicitações de Parceria:**
1. Aba "Solicitações"
2. Revisar dados do formulário
3. Aprovar (cria credenciado) ou Rejeitar

**Aprovar Atualizações de Dados:**
1. Aba "Atualizações Pendentes"
2. Comparar dados atuais vs. novos
3. Aprovar (atualiza) ou Rejeitar

**Gerenciar Usuários Internos:**
1. Aba "Usuários"
2. Adicionar novo usuário (email, nome, senha)
3. Reenviar senha se necessário
4. Excluir usuários

**Aprovar Acessos:**
1. Aba "Acessos"
2. Revisar solicitação
3. Aprovar (gera senha temporária)
4. Copiar senha e enviar manualmente ao solicitante

**Monitorar Prospecção:**
1. Aba "Prospecção"
2. Visualizar mapa de cobertura
3. Identificar lacunas (vermelho/amarelo)
4. Priorizar captação de parceiros

**⚠️ PENDENTE - Gerenciar Indicações:**
- Cadastrar Promotores/Vendedores
- Atualizar status de indicações
- Processar comissões

---

## 🔗 LINKS IMPORTANTES

### Links Externos:
- **Assinaturas Vital:** https://assinaturas.suasaudevital.com.br/
- **Assinaturas Empresariais:** https://assinaturas.suasaudevital.com.br/empresarial
- **Indique e Ganhe:** https://indicacao.suasaudevital.com.br/ (antigo, agora integrado)

### WhatsApp:
- **Secretaria Vital:** 47 93385-3726
- **Email Administrativo:** administrativo@suasaudevital.com.br

---

## 🎯 CIDADES FOCO (Prospecção)

**Meta:** 2+ credenciados por categoria por cidade

1. **Rodeio**
2. **Rio dos Cedros**
3. **Benedito Novo**
4. **Pomerode**
5. **Ascurra**
6. **Apiúna**
7. **Timbó**
8. **Indaial**

---

## 📝 CATEGORIAS DE SERVIÇOS

### Médicos:
- Todas as especialidades médicas

### Serviços de Saúde:
- Clínicas
- Fisioterapia
- Nutrição
- Exames de imagem
- Laboratórios

### Outros Serviços:
- Academias
- Artes marciais
- Farmácias
- Mercados
- Padarias
- Pet Shops
- Outros estabelecimentos

---

## 🚀 PRÓXIMOS PASSOS

### Urgente (Completar Integração):
1. Implementar Aba "Indicações" no Admin
2. Criar formulário de cadastro de Promotores/Vendedores
3. Implementar gestão de comissões

### Importante (Melhorias):
4. Menu mobile responsivo
5. Busca em tempo real
6. Exportação de relatórios

### Desejável (Automação):
7. Notificações por email
8. Dashboard de performance

---

## 📞 SUPORTE

**Dúvidas sobre o sistema?**
- Email: administrativo@suasaudevital.com.br
- WhatsApp: 47 93385-3726

**Problemas técnicos?**
- Entre em contato com o desenvolvedor

---

## 📊 STATUS ATUAL DO PROJETO

**Progresso Geral:** 85% completo

**Áreas Completas:**
- ✅ Consulta Pública (100%)
- ✅ Dados Internos (100%)
- ✅ Página Parceiros (100%)
- ✅ Admin - Credenciados (100%)
- ✅ Admin - Solicitações (100%)
- ✅ Admin - Atualizações (100%)
- ✅ Admin - Usuários (100%)
- ✅ Admin - Acessos (100%)
- ✅ Admin - Prospecção (100%)
- ✅ Indicações - Página Usuário (100%)

**Áreas Pendentes:**
- ❌ Admin - Aba Indicações (0%)
- ❌ Menu Mobile (0%)
- ❌ Busca Tempo Real (0%)
- ❌ Exportação Relatórios (0%)

---

**Última Atualização:** 21/11/2025 20:50 BRT  
**Versão do Documento:** 1.0
