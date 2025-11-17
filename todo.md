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

## Ajustes na Página de Parceiros

- [x] Remover benefício "Gestão simplificada e transparente" (não fazemos intermediação)
- [x] Remover benefício "Integração com planos empresariais" (não aplicável)
- [x] Adicionar benefício "Aumento de visualização"
- [x] Adicionar benefício "Ecossistema Vital"
- [x] Adicionar benefício "Crescimento conjunto com atendimento domiciliar"
- [x] Adicionar benefício "Clientes particulares pagantes com valor reduzido"
- [x] Tornar chamado mais motivador: "Venha ser Vital e cresça conosco!"

## Ajustes de Logo e Busca

- [x] Remover fundo branco da logo
- [x] Aumentar tamanho da logo na página inicial
- [x] Adicionar campo de busca livre nas instituições (Pet Shop, Jiu-jitsu, etc)
- [x] Ajustar filtros para buscar em observações/descrição das instituições

## Ajustes de Cor e Tamanho da Logo

- [x] Ajustar cor de fundo do header para verde mais claro (melhor contraste)
- [x] Aumentar tamanho da logo para melhor visibilidade
- [x] Garantir logo bem visível com tamanho moderno

## Redesign Completo - Paleta Vital

- [x] Atualizar cor primary para verde turquesa vibrante (#1A9B8E / oklch)
- [x] Adicionar cor secondary bege/dourado claro
- [x] Mudar fundo para branco/claro
- [x] Redesenhar header com estilo moderno e clean
- [x] Ajustar cards e elementos para seguir identidade visual

## Ajuste de Tamanho da Logo

- [x] Aumentar significativamente o tamanho da logo no header

## Atualização de Logo e Página de Parceiros

- [x] Copiar nova logo oficial para pasta pública
- [x] Atualizar const.ts com caminho da nova logo
- [x] Verificar se logo aparece em todas as páginas (Home, Admin, Parceiros)
- [x] Revisar design da página de parceiros
- [x] Embelezar formulário de cadastro de parceiros
- [x] Adicionar botão flutuante de WhatsApp
- [x] Fornecer link de convite para parceiros

## Ajustes de WhatsApp e Seção Empresarial

- [x] Remover botão flutuante de WhatsApp de todas as páginas
- [x] Adicionar seção "Seja Parceiro + Assinante" na página de parceiros
- [x] Destacar benefícios: área protegida, assinaturas para funcionários
- [x] Adicionar botão "Conheça as Assinaturas Empresariais"

## Footer Informativo com Links e Funções

- [x] Adicionar footer explicativo em todas as páginas
- [x] Incluir 3 áreas: Plataforma de Consulta, Área Admin, Área do Parceiro
- [x] Links diretos para cada funcionalidade
- [x] Design consistente com identidade visual Vital

## Novos Botões no Footer

- [x] Adicionar botão "Preços das Assinaturas" → https://assinaturas.suasaudevital.com.br/
- [x] Adicionar botão "Programa Indique e Ganhe" → https://indicacao.suasaudevital.com.br
- [x] Expandir footer para 5 colunas com design responsivo
- [x] Aplicar em todas as páginas (Home, Parceiros, Admin)

## Processamento de Logos Limpas

- [x] Processar logo horizontal removendo "Serviços Médicos"
- [x] Processar logo vertical removendo "Serviços Médicos"
- [x] Entregar 2 versões limpas (só símbolo + VITAL) para avaliação

## Substituir Logo Horizontal Original

- [x] Usar logo horizontal "Serviços Médicos" em todas as páginas
- [x] Verificar se logo está visível e com tamanho adequado

## Atualização Final da Logo

- [x] Substituir logo pela versão mais recente enviada

## Simplificação do Footer da Página de Parceiros

- [x] Remover botões "Área Administrativa", "Área de Consulta" e "Indique e Ganhe" do footer da página de parceiros
