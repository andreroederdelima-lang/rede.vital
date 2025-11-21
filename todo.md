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
