# Project TODO

## Fase 1: Schema e Planejamento
- [x] Criar tabelas de médicos credenciados
- [x] Criar tabelas de instituições parceiras
- [x] Definir campos completos incluindo contato da parceria

## Fase 2: Backend
- [x] Implementar procedures para listar médicos com filtros
- [x] Implementar procedures para listar instituições com filtros
- [x] Implementar CRUD completo para médicos (admin)
- [x] Implementar CRUD completo para instituições (admin)

## Fase 3: Interface Pública
- [x] Criar página inicial com busca e filtros
- [x] Implementar busca em tempo real
- [x] Implementar filtros por especialidade
- [x] Implementar filtros por município
- [x] Implementar filtro por categoria (médicos/instituições)
- [x] Implementar filtro opcional por % desconto
- [x] Design responsivo mobile-first
- [x] Cards/lista com informações completas

## Fase 4: Painel Administrativo
- [x] Criar layout de dashboard administrativo
- [x] Implementar tabela editável de médicos
- [x] Implementar tabela editável de instituições
- [x] Botões de adicionar/editar/excluir
- [x] Validação de formulários
- [x] Proteção de rotas (apenas admin)

## Fase 5: Dados e Estilização
- [x] Popular dados iniciais dos médicos do documento
- [x] Popular dados iniciais das instituições
- [x] Integrar logo da Vital
- [x] Aplicar paleta de cores da marca
- [x] Ajustes finais de UX
- [x] Testes de responsividade

## Novas Funcionalidades Solicitadas

- [x] Transformar números de telefone em links clicáveis para WhatsApp
- [x] Adicionar botão para exportar lista de credenciados em PDF
- [x] Implementar botão de encaminhamento médico com formulário
- [x] Formulário deve incluir: Especialista, Telefone, Endereço, Cidade, Motivo
- [x] Gerar documento de encaminhamento formatado para impressão

## Página de Cadastro de Parceiros

- [x] Criar tabela de solicitações de parceria no banco de dados
- [x] Adicionar campo de status (pendente/aprovado/rejeitado)
- [x] Implementar upload de imagem para S3
- [x] Criar endpoint de envio de e-mail para administrativo@suasaudevital.com.br
- [x] Criar página de apresentação dos benefícios para parceiros
- [x] Criar formulário de cadastro completo com todos os campos
- [x] Implementar painel administrativo para aprovar/rejeitar parceiros
- [x] Ao aprovar, migrar dados para tabela de instituições ativas
