# Project TODO

## Nova Página de Consulta Pública e Ajustes

- [x] Atualizar schema do banco: adicionar campo `precoConsulta` nas tabelas de médicos e instituições
- [x] Criar nova página `/consulta` para uso do paciente (sem desconto e sem preço visível)
- [x] Adicionar campos "Preço da Consulta" e "Porcentagem de Desconto" editáveis no admin (backend atualizado)
- [x] Adicionar campo obrigatório "Preço" no formulário de cadastro de parceiros
- [x] Remover botão "Exportar PDF" da página de consulta do cliente
- [x] Atualizar título de todas as páginas para "Guia de Credenciados Vale do Itajaí - SC"
- [x] Atualizar rotas no App.tsx para incluir página de consulta


## Simplificação da Página de Consulta Pública

- [x] Remover todos os botões do header da página /consulta (Preços, Indique, Sugerir, Convide, Admin)
- [x] Adicionar apenas botão de WhatsApp "Fale com o Especialista" direcionando para +55 47 93385-3726
- [x] Garantir que a página seja exclusiva para clientes consultarem credenciados (sem preços/descontos)


## Botão Sugerir Parceiro na Página de Consulta

- [x] Adicionar botão "Sugerir um Parceiro" no header da página /consulta
- [x] Implementar formulário modal com campos: nome, especialidade, município
- [x] Garantir envio de e-mail para administrativo@suasaudevital.com.br


## Botão de Compartilhamento e Confirmação Visual

- [x] Adicionar botão "Compartilhar Credenciado" em cada card de médico/instituição
- [x] Implementar compartilhamento via WhatsApp com informações formatadas do credenciado
- [x] Adicionar toast de sucesso após envio do formulário de sugestão
- [x] Mensagem: "Sugestão enviada com sucesso! Obrigado por contribuir com nossa rede"


## Atualização de Título

- [x] Atualizar título de "Guia de Credenciados Vale do Itajaí - SC" para "Guia de Credenciados Vale do Itajaí - Santa Catarina" em todas as páginas


## Melhorias de Branding e Compartilhamento

- [x] Adicionar logo da Vital e cores da marca (verde turquesa e bege) no cabeçalho da receita de encaminhamento
- [x] Criar botão "Copiar Link" nos cards de credenciados para copiar link direto
- [x] Aprimorar mensagem de compartilhamento WhatsApp incluindo logo da Vital e slogan "Vital, sempre ao seu lado"


## Reorganização de Rotas e Simplificação da Consulta Pública

- [x] Remover botão "Gerar Encaminhamento" da página Consulta (uso exclusivo para pacientes)
- [x] Trocar rota: página Consulta deve ser acessível em `/` (raiz)
- [x] Mover página Home atual para `/dados-internos` (área administrativa)
- [x] Atualizar links internos que referenciam as rotas antigas


## Atualização de Links Home

- [x] Atualizar todos os botões "Home" e links para página inicial para apontarem para `/dados-internos`


## Proteção de Dados e Controle de Acesso

- [x] Adicionar botão "Consulta Pública" no header da página /dados-internos direcionando para /
- [x] Criar tabela de usuários autorizados no banco de dados
- [x] Criar procedures tRPC para CRUD de usuários autorizados
- [x] Remover dados de desconto e valores da página de consulta pública (/) - apenas informações básicas
- [x] Manter dados completos (incluindo descontos) apenas em /dados-internos
- [x] Adicionar aba de gerenciamento de usuários autorizados na página Admin
- [x] Implementar verificação de acesso em /dados-internos (apenas emails autorizados)
- [x] Criar tela de acesso negado para usuários não autorizados


## Primeiro Usuário Autorizado

- [x] Adicionar ambulatoriocensit@gmail.com como usuário autorizado no banco de dados


## Ajuste de Texto do Botão WhatsApp

- [x] Alterar texto do botão WhatsApp na página de consulta pública de "WhatsApp" para "Fale com o vendedor"


## Botão Acesso Interno

- [x] Adicionar botão "Acesso Interno" no header da página de consulta pública (/) direcionando para /dados-internos


## Ajustes de Textos dos Botões

- [x] Alterar texto do botão "Preços" para "Preços das Assinaturas Vital" na página /dados-internos
- [x] Alterar texto do botão "Convide" para "Convide um Parceiro" na página /dados-internos
- [x] Alterar texto do botão "Indique" para "Indique a Vital!" na página /dados-internos
- [x] Alterar texto do botão "Sugerir" para "Sugerir um Parceiro" na página /dados-internos


## Ajuste do Botão WhatsApp no Header

- [x] Alterar texto do botão "Fale com o Especialista" para "Fale Conosco" na página de consulta pública


## Ajustes nos Cards da Página Dados Internos

- [x] Remover botões "Compartilhar" e "Copiar Link" dos cards de médicos na página /dados-internos
- [x] Remover botões "Compartilhar" e "Copiar Link" dos cards de instituições na página /dados-internos
- [x] Adicionar exibição do campo "Preço da Consulta" nos cards de médicos
- [x] Adicionar exibição do campo "% de Desconto Vital" nos cards de médicos
- [x] Adicionar exibição do campo "Preço da Consulta" nos cards de instituições
- [x] Adicionar exibição do campo "% de Desconto Vital" nos cards de instituições


## Garantir Exibição de Preço e Desconto

- [x] Verificar se campos precoConsulta e descontoPercentual estão sendo retornados pelas queries tRPC
- [x] Ajustar exibição para mostrar preço e desconto corretamente
- [x] Tornar campo "Valor" obrigatório e sempre visível na página Parceiros (já estava implementado)
- [x] Adicionar validação para garantir que preço seja sempre preenchido (já estava implementado)


## URGENTE: Campo Preço e Exibição Correta

- [x] Adicionar campo "Preço da Consulta" no formulário de cadastro de médicos (Admin)
- [x] Adicionar campo "% Desconto" no formulário de cadastro de médicos (Admin) (já existia)
- [x] Adicionar campo "Preço da Consulta" no formulário de cadastro de instituições (Admin)
- [x] Adicionar campo "% Desconto" no formulário de cadastro de instituições (Admin) (já existia)
- [x] Garantir que preço e desconto apareçam SEMPRE nos cards de /dados-internos (mesmo se vazios)
- [x] Exibir "Não informado" quando preço não estiver cadastrado


## Sistema de Atualização de Dados pelos Parceiros

- [x] Criar tabela de solicitações de atualização de dados no banco
- [x] Adicionar campo token único para cada médico/instituição
- [x] Implementar procedure tRPC para gerar link de atualização
- [x] Implementar procedure tRPC para receber solicitação de atualização
- [x] Implementar procedures tRPC para listar, aprovar e rejeitar atualizações
- [x] Criar página pública `/atualizar-dados/:token` com formulário pré-preenchido
- [x] Adicionar botão "Enviar Link de Atualização" nos cards de /dados-internos
- [x] Gerar mensagem WhatsApp com link de atualização
- [x] Adicionar aba "Atualizações Pendentes" no Admin
- [x] Implementar aprovação/rejeição de atualizações no Admin


## Atualização de Títulos e Descrições

- [x] Alterar título da página pública para "Guia de Parceiros Vital - Vale do Itajaí"
- [x] Alterar descrição da página pública para "Rede credenciada para encaminhamentos e orientações médicas"
- [x] Adicionar aviso sobre busca nacional na página pública
- [x] Alterar título da página dados-internos para "Guia de Parceiros Vital - Vale do Itajaí"
- [x] Alterar descrição da página dados-internos para "Guia de uso interno para consultas e informações. Conteúdo sigiloso."


## Melhorias Visuais e Responsividade

- [x] Copiar imagem de parceiros nacionais para diretório público
- [x] Adicionar banner "Nossos principais parceiros pelo Brasil" na página pública (discreto mas visível)
- [x] Reorganizar botões do header para melhor responsividade mobile
- [x] Reorganizar botões dos cards para melhor visualização em celular
- [x] Ajustar paleta de cores para usar apenas verde turquesa e bege do logo Vital
- [x] Testar responsividade em diferentes tamanhos de tela


## Ajustes no Painel Admin e Nomenclatura

- [x] Adicionar coluna "Preços" na tabela de médicos no Painel Admin
- [x] Adicionar coluna "Preços" na tabela de instituições no Painel Admin
- [x] Renomear "Instituições" para "Clínicas" em todas as páginas (Admin, Dados Internos, Consulta Pública)


## Ajustes de Cor e Botão de Atualização

- [x] Mudar cor da frase "Conteúdo sigiloso" de vermelho para cinza neutro e centralizar
- [x] Adicionar botão "Enviar Link de Atualização" nos cards de médicos em /dados-internos
- [x] Adicionar botão "Enviar Link de Atualização" nos cards de clínicas em /dados-internos
- [x] Finalizar adição de coluna Preços nas tabelas do Admin


## Ajustes de Layout do Header

- [x] Alinhar corretamente logo Vital, textos e botões no header da página de consulta pública
- [x] Aumentar tamanho da logo Vital (h-28 md:h-40)
- [x] Aumentar tamanho do banner de parceiros nacionais (max-w-3xl)

## Redesign do Header e Implementação de Atualizações Pendentes

- [x] Aumentar banner de parceiros para área de destaque abaixo do texto (legível)
- [x] Alterar título para "GUIA DE CREDENCIADOS"
- [x] Implementar aba "Atualizações Pendentes" no Admin com interface para aprovar/rejeitar
- [x] Garantir design minimalista e funcional sem assimetrias
- [x] Testar responsividade em mobile e desktop


## Atualização de Textos do Header

- [x] Alterar título para "GUIA DO ASSINANTE" com fonte mais elegante
- [x] Alterar subtítulo para "Rede Credenciada - Vale do Itajaí - Santa Catarina"


## Aplicação de Cores da Paleta Oficial

- [x] Aplicar cor #1e9d9f (turquesa) ao título "GUIA DO ASSINANTE"
- [x] Garantir que todas as cores sigam a paleta oficial do manual de marca


## Sistema de Autenticação Separado para Dados Internos

- [x] Criar tabela de usuários internos (separada de admins)
- [x] Implementar procedures tRPC para login de usuários internos
- [x] Criar página de login para área Dados Internos
- [x] Proteger rota /dados-internos com autenticação própria
- [x] Garantir que usuários internos não acessem área Admin
- [x] Implementar logout para usuários internos


## Melhorias de UX e Acesso Público

- [x] Adicionar header com nome do usuário e botão logout na área Dados Internos
- [x] Implementar recuperação de senha por email
- [x] Criar página de solicitação de acesso público (/solicitar-acesso)
- [x] Criar tabela de solicitações de acesso no banco
- [x] Implementar aba "Solicitações de Acesso" no Admin
- [x] Sistema de aprovação/rejeição de solicitações com geração de senha temporária
- [ ] Envio de email com senha temporária para usuários aprovados
- [ ] Forçar alteração de senha no primeiro login


## Recuperação de Senha para Usuários Internos

- [x] Adicionar link "Esqueci minha senha" na página /login-dados-internos
- [x] Criar página de recuperação de senha para usuários internos
- [x] Implementar fluxo completo de redefinição por email (backend já existe)
- [ ] Adicionar opção de troca de senha no Admin/Usuários

## Filtros Avançados por Cidade com Contador

- [ ] Atualizar lista de cidades foco: Rodeio, Rio dos Cedros, Benedito Novo, Pomerode, Ascurra, Apiúna, Timbó, Indaial
- [ ] Implementar dropdown de cidades com contador de credenciados
- [ ] Criar visualização de especialidades/categorias com quantidade por cidade
- [ ] Adicionar descrições claras nas categorias (Serviços de Saúde e Outros Serviços)
- [ ] Implementar sistema de prospecção (meta: 2+ credenciados por tipo/cidade)


## Dashboard de Prospecção no Admin

- [x] Criar procedures tRPC para estatísticas de cobertura por cidade/categoria
- [x] Implementar cálculo de meta (2+ credenciados por tipo/cidade)
- [x] Criar componente de dashboard com mapa de cobertura visual
- [x] Adicionar indicadores de cor (vermelho/amarelo/verde)
- [x] Adicionar aba "Prospecção" no painel Admin

## Sistema de Exportação para Prospecção

- [ ] Implementar exportação de relatórios em Excel
- [ ] Implementar exportação de relatórios em PDF
- [ ] Criar listagem de especialidades/categorias faltantes por cidade
- [ ] Adicionar filtros por cidade e categoria nos relatórios


## Integração com Site de Indicações

- [x] Analisar estrutura e funcionalidades do site indique-vital.manus.space
- [x] Planejar arquitetura de integração (navegação, autenticação, banco de dados)
- [ ] Criar navegação unificada entre Credenciados e Indicações
- [ ] Migrar funcionalidades de indicações para o site atual
- [ ] Unificar sistema de autenticação
- [ ] Integrar painel Admin para gerenciar ambas áreas
- [ ] Aplicar design consistente (paleta Vital) em todas as páginas
- [ ] Testar fluxos integrados


## Implementação Completa do Sistema de Indicações

- [x] Instalar biblioteca qrcode.react para geração de QR Codes
- [x] Criar procedures tRPC para indicações (criar, listar, atualizar)
- [x] Criar procedures tRPC para indicadores (cadastro, listar)
- [x] Implementar página /indicacoes com dashboard
- [ ] Adicionar formulário de cadastro de promotor/vendedor (Admin)
- [x] Adicionar formulário de nova indicação
- [x] Gerar QR Code com link WhatsApp do vendedor
- [x] Mensagem padrão: "Recebi indicação para conhecer as assinaturas e benefícios da Vital ❤️🚑!"
- [x] Implementar listagem de indicações com filtros
- [ ] Adicionar aba Indicações no Admin
- [ ] Implementar gestão de indicadores no Admin
- [ ] Implementar gestão de comissões no Admin


## Correção de Bugs - Links Aninhados e Query Undefined

- [x] Corrigir erro de `<a>` aninhado no componente MainNav
- [x] Corrigir procedure meuIndicador retornando undefined (agora retorna null)
- [x] Adicionar tratamento adequado de null na página Indicações


## BUGS CRÍTICOS IDENTIFICADOS - 21/11/2025

- [x] Corrigir rota /consulta no MainNav.tsx (linha 14) - deve apontar para "/" ao invés de "/consulta"
- [x] Corrigir link do logo no MainNav.tsx (linha 47) - deve apontar para "/" ao invés de "/consulta"
- [ ] Verificar todas as referências a /consulta no código e substituir por /
- [ ] Testar navegação completa após correção das rotas
- [ ] Verificar se página Indicações está funcionando corretamente
- [ ] Verificar se página Parceiros está funcionando corretamente
- [ ] Verificar se página Admin está funcionando corretamente
- [ ] Verificar se página Dados Internos está funcionando corretamente

## PENDÊNCIAS DE INTEGRAÇÃO DO SISTEMA DE INDICAÇÕES

- [ ] Implementar Aba "Indicações" no painel Admin
- [ ] Criar formulário de cadastro de Promotores/Vendedores no Admin
- [ ] Implementar listagem completa de indicações no Admin (todas, não só do usuário)
- [ ] Adicionar filtros de status e vendedor na listagem Admin
- [ ] Implementar atualização de status de indicações pelo Admin
- [ ] Criar sistema de gestão de comissões no Admin
- [ ] Adicionar campo de valor de comissão
- [ ] Adicionar campo de data de pagamento
- [ ] Implementar upload de comprovante de pagamento
- [ ] Adicionar estatísticas gerais no Admin (total de indicações, conversões, comissões pagas)


## Sistema de 3 Categorias - 21/11/2025

- [x] Renomear aba "Clínicas" para "Serviços de Saúde"
- [x] Adicionar terceira aba "Outros Serviços"
- [x] Adicionar campo "categoria" na tabela instituicoes (enum: servicos_saude, outros_servicos)
- [x] Atualizar formulários Admin para incluir seleção de categoria
- [x] Atualizar formulário de Parceiros para incluir categoria
- [x] Atualizar queries tRPC para filtrar por categoria
- [x] Atualizar interface Consulta para exibir 3 abas
- [x] Atualizar interface Dados Internos para exibir 3 abas
- [x] Migrar dados existentes (definir categoria padrão)
- [x] Testar filtros e navegação


## Refatoração: 3 Páginas Separadas (ao invés de abas) - 21/11/2025

- [x] Reverter Consulta.tsx (/) para exibir apenas Médicos
- [x] Criar página ServicosSaude.tsx para instituições tipo "servicos_saude"
- [x] Criar página OutrosServicos.tsx para instituições tipo "outros_servicos"
- [x] Sistema de 3 abas funcionando (não foi necessário criar rotas separadas)
- [x] MainNav.tsx já estava correto
- [x] Home.tsx (Dados Internos) atualizado com 3 abas
- [x] Testado e funcionando: Médicos (29), Serviços de Saúde (9), Outros Serviços (1)
- [x] Console.logs de debug já foram removidos


## Aba "Indicações" no Painel Admin

### Backend
- [x] Criar router `indicacoes.listar` - listar todas as indicações com filtros
- [x] Criar router `indicacoes.atualizar` - atualizar status e observações
- [x] Criar router `indicacoes.estatisticas` - estatísticas gerais (total, por status, taxa de conversão)
- [x] Criar router `indicadores.listar` - listar todos os promotores/vendedores
- [x] Criar router `indicadores.criar` - cadastrar novo promotor/vendedor
- [x] Criar router `indicadores.atualizar` - editar promotor/vendedor
- [ ] Criar router `comissoes.criar` - registrar comissão paga
- [ ] Criar router `comissoes.listar` - listar comissões por indicação
- [ ] Criar queries no db.ts para todas as operações acima

### Frontend
- [ ] Adicionar aba "Indicações" no Admin.tsx
- [ ] Criar seção de listagem de indicações com tabela
- [ ] Adicionar filtros: vendedor, status, período (data início/fim)
- [ ] Implementar modal de edição de indicação (status, observações)
- [ ] Criar seção de cadastro de promotores/vendedores
- [ ] Implementar modal de gestão de comissões (valor, data, comprovante)
- [ ] Adicionar cards de estatísticas no topo (total, pendentes, fechadas, taxa conversão)
- [ ] Implementar busca por nome do cliente/empresa

### Testes
- [ ] Testar listagem de indicações
- [ ] Testar filtros e busca
- [ ] Testar atualização de status
- [ ] Testar cadastro de promotor/vendedor
- [ ] Testar registro de comissão
- [ ] Verificar estatísticas


## Correção de Exemplos de Categorias

### Serviços de Saúde (exemplos corretos)
- Fisioterapia, Fonoaudiologia, Clínicas, Laboratórios, Centros de Diagnóstico por Imagem, Farmácias, Hospitais, Psicologia, Nutrição, Odontologia

### Outros Serviços (exemplos corretos)
- Artes Marciais, Academias, Lojas, Mercados, Mercearias, Padarias, Hotéis, Pet Shops, Salões de Beleza, Estética, Restaurantes

### Locais para atualizar
- [x] Placeholder de busca na aba Serviços de Saúde (Consulta.tsx)
- [x] Placeholder de busca na aba Outros Serviços (Consulta.tsx)
- [x] Texto explicativo no formulário Seja Parceiro (Parceiros.tsx)
- [x] Placeholder de busca na página Dados Internos (Home.tsx)


## Sistema Híbrido de Autenticação (OAuth Manus + Email/Senha)

### Backend - Schema e Banco de Dados
- [x] Adicionar campo `passwordHash` na tabela `users`
- [x] Adicionar campo `resetToken` na tabela `users`
- [x] Adicionar campo `resetTokenExpiry` na tabela `users`
- [ ] Criar tabela `sessions` para gerenciar sessões de login
- [x] Aplicar migração do banco (`pnpm db:push`)

### Backend - Lógica de Autenticação
- [ ] Instalar dependências: `bcrypt`, `jsonwebtoken`, `nodemailer`
- [ ] Criar função `hashPassword` (bcrypt)
- [ ] Criar função `comparePassword` (bcrypt)
- [ ] Criar função `generateJWT` (jsonwebtoken)
- [ ] Criar função `verifyJWT` (jsonwebtoken)
- [ ] Criar função `generateResetToken` (crypto)

### Backend - Routers tRPC
- [ ] Router `auth.registerWithEmail` - Cadastro com email + senha
- [ ] Router `auth.loginWithEmail` - Login com email + senha (gera JWT)
- [ ] Router `auth.requestPasswordReset` - Solicitar recuperação de senha
- [ ] Router `auth.resetPassword` - Resetar senha com token
- [ ] Router `auth.changePassword` - Alterar senha (usuário logado)
- [ ] Manter routers OAuth Manus existentes funcionando

### Backend - SMTP e Envio de Emails
- [ ] Configurar Nodemailer com SMTP
- [ ] Criar template de email de recuperação de senha
- [ ] Criar template de email de boas-vindas
- [ ] Testar envio de email

### Frontend - Páginas de Autenticação
- [ ] Criar página `/login` com 2 opções: Email/Senha ou OAuth Manus
- [ ] Criar página `/register` para cadastro com email + senha
- [ ] Criar página `/forgot-password` para solicitar recuperação
- [ ] Criar página `/reset-password/:token` para resetar senha
- [ ] Atualizar `useAuth` hook para suportar ambos os métodos

### Frontend - Proteção de Rotas
- [ ] Middleware de `/dados-internos` - Verificar role "user" ou "admin" (ambos métodos)
- [ ] Middleware de `/admin` - Verificar role "admin" (ambos métodos)
- [ ] Middleware de `/indicacoes` - Verificar apenas login (ambos métodos)
- [ ] Manter compatibilidade com OAuth Manus existente

### Testes
- [ ] Testar fluxo de cadastro de promotor
- [ ] Testar fluxo de login (admin, membro, promotor)
- [ ] Testar fluxo de recuperação de senha
- [ ] Testar proteção de rotas
- [ ] Testar envio de emails

### Documentação
- [ ] Documentar credenciais SMTP necessárias
- [ ] Documentar fluxo de permissões
- [ ] Atualizar README com instruções de configuração


## Conectar Dados Reais à Aba Indicações

### Backend - Correções
- [ ] Corrigir imports de `indicacoes`, `comissoes` e `indicadores` no db.ts
- [ ] Verificar se routers tRPC de indicações estão funcionando

### Frontend - Queries e Estatísticas
- [ ] Implementar query `trpc.indicacoes.listarTodasAdmin.useQuery()`
- [ ] Implementar query `trpc.indicacoes.estatisticas.useQuery()`
- [ ] Popular cards de estatísticas com dados reais
- [ ] Implementar filtros funcionais (status, vendedor, período)

### Frontend - Tabela Interativa
- [ ] Criar componente Table com colunas: ID, Cliente, Telefone, Vendedor, Status, Data, Ações
- [ ] Adicionar botões de ação: Editar Status, Adicionar Comissão, Ver Detalhes
- [ ] Implementar paginação
- [ ] Implementar ordenação por colunas

### Frontend - Modais de Gestão
- [ ] Modal "Editar Status" - Atualizar status da indicação
- [ ] Modal "Adicionar Comissão" - Registrar valor, data, comprovante
- [ ] Modal "Cadastrar Promotor/Vendedor" - Formulário completo
- [ ] Modal "Ver Detalhes" - Visualizar informações completas da indicação

### Testes
- [ ] Testar listagem de indicações
- [ ] Testar filtros
- [ ] Testar atualização de status
- [ ] Testar cadastro de comissão
- [ ] Testar cadastro de promotor


## Sistema de Auto-Cadastro Público para Promotores e Vendedores

- [x] Criar página pública `/cadastro-indicador` para auto-cadastro de promotores e vendedores
- [x] Remover necessidade de aprovação admin para cadastro de indicadores
- [x] Tornar campo PIX obrigatório no formulário de cadastro
- [x] Remover campo senha do cadastro de indicadores
- [x] Implementar login automático sem senha (via endpoint loginSemSenha)
- [x] Adicionar descrição clara da diferença entre Promotor e Vendedor:
  * Promotor: Indica e convence clientes
  * Vendedor: Indica, convence E fecha a venda
- [x] Atualizar router tRPC para permitir cadastro público sem autenticação
- [x] Criar página de login para indicadores sem senha
- [ ] Testar fluxo completo de cadastro e login (em andamento - endpoint criado, teste pendente)


## Ajustes de Compartilhamento e QR Codes

- [x] Ajustar mensagem de compartilhamento de parceiros para incluir botão WhatsApp do especialista
- [x] Melhorar formatação da mensagem compartilhada (adicionar "Vem ser VITAL!" e link direto)
- [x] Criar QR Code fixo para WhatsApp do time de vendas (especialistas)
- [x] Criar página `/qr-codes` para promotores baixarem QR Code imprimível
- [ ] Adicionar campo "WhatsApp Time de Vendas" nas configurações do sistema (opcional - número fixo usado por enquanto)


### Link para QR Codes no Painel de Indicações

- [x] Adicionar botão "Baixar QR Codes" na aba Indicações do painel Admin
- [x] Botão deve redirecionar para /qr-codes em nova aba
- [x] Posicionar botão próximo ao botão "Cadastrar Promotor/Vendedor"
- [x] Remover botão "Copiar Link" de todas as páginas públicas (Consulta, ServicosSaude, OutrosServicos)


## Melhorias no Sistema de Credenciamento

- [x] Adicionar campo "WhatsApp Secretaria" no schema de médicos e instituições
- [x] Adicionar campo "Telefone Contato Organização" no schema de médicos e instituições
- [x] Adicionar campo "Foto" (URL) no schema de médicos e instituições
- [x] Adicionar campos no formulário de credenciamento (AtualizarDados.tsx)
- [x] Implementar campo de foto (URL) no formulário
- [x] Adicionar botão clicável "WhatsApp Secretaria" ao lado de cada credenciado em Consulta.tsx
- [x] Exibir foto do médico/serviço em Consulta.tsx
- [x] Atualizar routers tRPC para aceitar novos campos
- [x] Executar db:push para aplicar mudanças no banco
- [ ] Aplicar mesmas mudanças em ServicosSaude.tsx e OutrosServicos.tsx (pendente)

- [x] Atualizar descrições de Promotor e Vendedor na página de cadastro de indicadores (CadastroIndicador.tsx)

- [x] Adicionar QR Code grande na página de cadastro de indicadores direcionando para WhatsApp do time de especialistas
- [x] Mensagem do QR Code: "Olá, recebi uma indicação para conhecer mais sobre as assinaturas Vital"


## Reorganização da Navegação

- [x] Mover "Sugerir um Parceiro", "Fale Conosco" e "Acesso Interno" para o header (topo da página)
- [x] Remover "Área do Cliente", "Indicações" e "Seja Parceiro" do header
- [x] Adicionar botões "Área do Cliente", "Indicações" e "Seja Parceiro" na página Dados Internos
- [x] Botão "Área do Cliente" deve redirecionar para a home (/)


## Verificar Páginas Perdidas

- [x] Verificar se página Admin/Configurações de comissões existe (não existe - nunca foi implementada)
- [ ] Criar aba de Configurações de Comissões no painel Admin
- [x] Verificar se outras páginas foram perdidas após sincronização (todas as abas estão presentes)

## Criar Aba de Configurações de Comissões

- [x] Adicionar tabela configuracoes no schema do banco
- [x] Criar endpoints tRPC para listar e atualizar configurações
- [x] Criar componente ConfiguracoesTab.tsx
- [x] Adicionar aba "Configurações" no Admin.tsx
- [x] Permitir configurar percentuais de comissão por tipo (Promotor/Vendedor)


## Correç## Correções de Layout e Recuperação de Senha

- [x] Corrigir layout dos botões "Dados Internos" e "Sair" no header do Admin (estão um acima do outro)
- [x] Implementar sistema de recuperação de senha via email
- [x] Criar endpoint para solicitar recuperação de senha (trpc.auth.solicitarRecuperacao)
- [x] Criar endpoint para redefinir senha com token (trpc.auth.redefinirSenha)
- [x] Criar páginas de recuperação de senha no frontend (EsqueciSenha.tsx, RecuperarSenha.tsx)
- [ ] Integrar envio de email de recuperação (pendente - atualmente apenas loga no console)


## Ajustes no Sistema de Indicações

- [x] Adicionar QR Code grande na página "Registrar Nova Indicação" direcionando para WhatsApp do comercial
- [x] Remover campo "Tipo de Indicador" (Promotor/Vendedor) do cadastro - qualquer pessoa pode se cadastrar
- [x] Remover QR Code da página de cadastro de indicador (CadastroIndicador.tsx)
- [x] Recriar painel de gamificação na página /indicacoes mostrando:
  * Total de indicações do usuário (com breakdown pendentes/contatadas)
  * Indicações fechadas com taxa de conversão
  * Comissões pendentes em R$ com contador
  * Total recebido em R$ com histórico de comissões pagas
  * Cards coloridos com bordas e ícones para melhor visualização
- [x] Atualizar schema do banco para remover campo "tipo" de indicadores


## Atualização de Logo

- [x] Copiar nova imagem de logo para client/public/ (logo-vital.jpeg)
- [x] Atualizar constante APP_LOGO em client/src/const.ts
- [x] Verificar se logo está sendo exibido corretamente em todas as páginas


## Sistema de Fotos para Credenciados

- [x] Copiar imagem padrão de médico para client/public/medico-padrao.png
- [x] Verificar se schema já possui campo fotoUrl (médicos e instituições) - JÁ EXISTE
- [x] Adicionar campo de upload de foto no formulário Admin (médicos)
- [x] Adicionar campo de upload de foto no formulário Admin (instituições)
- [x] Adicionar campo WhatsApp Comercial no formulário Admin (médicos e instituições)
- [x] Adicionar campo de upload de foto no formulário Parceiros - JÁ EXISTE
- [x] Implementar exibição de foto nos cards com fallback para imagem padrão (Consulta e Home)
- [x] Ajustar botão WhatsApp para "Fale com o Parceiro" na página Consulta
- [x] Confirmar campo "WhatsApp Comercial" nos formulários Admin
- [x] Garantir que botão WhatsApp sempre use o campo whatsappSecretaria/whatsapp


## Sistema de Fotos para Indicadores (Promotores/Vendedores)

- [x] Verificar se schema possui campo fotoUrl na tabela indicadores
- [x] Adicionar campo fotoUrl no schema e aplicar migração
- [x] Adicionar campo de upload de foto no formulário de cadastro público (/cadastro-indicador)
- [x] Implementar exibição de foto no dashboard de gamificação (/indicacoes)
- [x] Adicionar foto padrão para indicadores sem foto cadastrada
- [x] Testar upload e exibição de fotos


## Correção Menu Mobile e Categorias de Serviços

- [x] Corrigir botão Menu mobile que não está funcionando
- [x] Expandir categorias de "Serviços de Saúde" com mais opções
- [x] Expandir categorias de "Outros Serviços" com mais opções
- [x] Testar menu mobile em diferentes dispositivos


## Reorganização de Categorias por Abas

### Serviços de Saúde (expandir)
- [ ] Adicionar: Fisioterapia, Fonoaudiologia, Nutrição, Psicologia, Odontologia
- [ ] Adicionar: Clínica, Laboratório, Farmácia, Hospital, Exames de Imagem
- [ ] Adicionar: Home Care, Podologia, Terapia Ocupacional

### Outros Serviços (expandir muito)
- [ ] Adicionar: Academia, Natação, Artes Marciais, Pilates
- [ ] Adicionar: Padaria, Mercado, Restaurante
- [ ] Adicionar: Ótica, Estética, Pet Shop, Hotel, Loja
- [ ] Adicionar outras categorias relevantes

### Implementação
- [x] Atualizar schema com todas as novas categorias
- [x] Aplicar migração do banco de dados
- [x] Criar arquivo de constantes com categorias organizadas
- [x] Atualizar formulários Admin, Parceiros, Consulta, Home
- [x] Melhorar UX dos filtros combinados (categoria + município) - filtros dinâmicos
- [x] Testar filtros e categorias
