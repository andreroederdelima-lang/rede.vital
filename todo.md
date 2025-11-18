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
