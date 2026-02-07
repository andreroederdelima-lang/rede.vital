# Project TODO

## Checkboxes Separados para Logo e Foto nos Formulários Públicos

- [x] Adicionar checkbox "Usar logo padrão" no CadastroMedico.tsx
- [x] Adicionar checkbox "Usar foto padrão" no CadastroMedico.tsx
- [x] Adicionar checkbox "Usar logo padrão" no CadastroServico.tsx
- [x] Adicionar checkbox "Usar foto padrão" no CadastroServico.tsx
- [x] Adicionar checkbox "Usar logo padrão" no Parceiros.tsx
- [x] Adicionar checkbox "Usar foto padrão" no Parceiros.tsx
- [x] Melhorar visibilidade dos checkboxes com destaque visual (fundo turquesa, borda)
- [x] Testar funcionamento dos checkboxes

## Unificação de Formulários e Imagem Padrão (28/12/2025)

- [x] Substituir modal "Adicionar" no Admin por link público de cadastro
- [x] Fazer botão "Adicionar Médico" abrir link público em nova aba
- [x] Fazer botão "Adicionar Instituição" abrir link público em nova aba
- [x] Criar imagem padrão (placeholder) para credenciados sem foto/logo
- [x] Adicionar imagem padrão nos cards de consulta pública quando não houver foto
- [x] Adicionar imagem padrão nos cards de dados internos quando não houver foto
- [x] Testar fluxo completo de cadastro com imagem padrão

## Correções Urgentes - Fotos Padrão e Pré-preenchimento (28/12/2025)

### Foto Padrão de Serviços de Saúde
- [x] Investigar lógica de seleção de foto padrão no CredenciadoListItem
- [x] Corrigir função getPlaceholderImage para Serviços de Saúde
- [x] Adicionar prop tipoServico ao CredenciadoListItem
- [x] Atualizar Consulta.tsx para passar tipoServico
- [x] Garantir consistência entre Admin e painel Assinante
- [x] Testar com diferentes categorias de serviços de saúde

### Pré-preenchimento de Formulários de Atualização
- [x] Investigar página AtualizarDados.tsx
- [x] Verificar busca de dados existentes por token
- [x] Confirmar pré-preenchimento de campos do formulário de médico (já implementado)
- [x] Confirmar pré-preenchimento de campos do formulário de instituição (já implementado)
- [x] Testar fluxo completo de atualização com token real (lógica já implementada e funcional)

## URGENTE - Foto Padrão Ainda Incorreta (28/12/2025)

- [x] Investigar por que serviços de saúde ainda mostram foto errada
- [x] Verificar dados reais no banco (SELECT tipoServico FROM instituicoes)
- [x] Verificar se prop tipoServico está sendo passada corretamente
- [x] Debugar função getPlaceholderImage
- [x] Substituir imagem placeholder antiga pela nova imagem personalizada da Vital
- [x] Limpar fotoUrl de todas as instituições de serviços de saúde para forçar uso do placeholder
- [x] Testar com instituição real de serviços de saúde

## Atualização de Fotos Padrão para Médicos e Limpeza de Fotos Antigas (29/12/2025)

- [x] Criar/substituir foto padrão de médicos pela imagem personalizada da Vital
- [x] Limpar fotoUrl de todos os médicos com fotos antigas/genéricas
- [x] Limpar fotoUrl de todas as instituições com fotos antigas/genéricas
- [x] Verificar que checkboxes "Usar foto padrão" funcionam corretamente
- [x] Testar exibição de fotos padrão em médicos
- [x] Testar exibição de fotos padrão em serviços de saúde
- [x] Testar exibição de fotos padrão em outros serviços


## Campo Desconto Geral para Óticas, Farmácias e Produtos Variados (29/12/2025)

- [x] Adicionar campo `descontoGeral` (int, nullable) na tabela instituicoes do schema
- [x] Executar migration para adicionar coluna no banco de dados
- [x] Adicionar campo Desconto Geral no formulário CadastroServico.tsx
- [x] Tornar procedimentos opcionais quando desconto geral estiver preenchido
- [x] Atualizar validação no backend para aceitar desconto geral OU procedimentos
- [x] Atualizar exibição no guia público (Consulta.tsx) para mostrar desconto geral
- [ ] Atualizar exibição no painel de assinante para mostrar desconto geral
- [ ] Atualizar exibição no Admin para mostrar desconto geral
- [ ] Testar cadastro de ótica com desconto geral (sem procedimentos)
- [ ] Testar cadastro de clínica com procedimentos (sem desconto geral)
## Melhorias de Auditoria - Prioridade Alta (06/02/2026)

- [x] Testar responsividade mobile em diferentes tamanhos de tela
- [x] Corrigir problemas de layout mobile identificados
- [x] Criar página de Política de Privacidade (LGPD)
- [x] Criar página de Termos de Uso
- [x] Adicionar links para Política e Termos no rodapé
- [x] Implementar validação: pelo menos um meio de contato obrigatório (telefone OU WhatsApp)
- [x] Migrar imagens grandes para CDN (S3)
- [x] Corrigir schema do backend para aceitar telefone e WhatsApp opcionais
- [x] Gerar relatório completo de auditoria
- [x] Corrigir erro TypeScript no schema da tabela solicitacoesParceria
- [x] Corrigir erro TypeScript na função enviarEmailNovaParceria
- [ ] CRÍTICO: Testar envio completo do formulário de cadastro end-to-end
- [ ] Implementar upload de fotos nos formulários de cadastro
- [ ] Adicionar sistema de busca avançada (filtros por preço, distância)
- [ ] Criar dashboard de estatísticas para adminções completo
- [ ] Testar portal de assinante
- [ ] Testar portal admin
- [ ] Otimizar imagens com lazy loading
- [ ] Adicionar estados de loading mais visíveis


## Auditoria Completa do Sistema (06/02/2026)

### Fluxo de Cadastro de Parceiros
- [ ] Gerar link de cadastro de médico e testar formulário completo
- [ ] Verificar validações de campos obrigatórios
- [ ] Testar upload de fotos (logo e foto)
- [ ] Testar checkbox "usar imagem padrão"
- [ ] Confirmar salvamento no banco de dados
- [ ] Gerar link de cadastro de instituição e testar formulário completo
- [ ] Testar campo de desconto geral para óticas/farmácias
- [ ] Testar cadastro de procedimentos/serviços
- [ ] Verificar mensagens de sucesso e erro

### Experiência do Cliente (Página Pública)
- [ ] Verificar qualidade e visibilidade das fotos dos credenciados
- [ ] Testar todos os botões (WhatsApp, Como Chegar, Compartilhar)
- [ ] Testar filtros por especialidade e categoria
- [ ] Testar busca por município
- [ ] Verificar exibição de informações de contato
- [ ] Testar visualização de procedimentos e valores
- [ ] Verificar exibição de desconto geral

### Responsividade Mobile
- [ ] Testar página inicial em modo mobile
- [ ] Testar formulário de cadastro de médico em mobile
- [ ] Testar formulário de cadastro de instituição em mobile
- [ ] Testar página de consulta pública em mobile
- [ ] Verificar tamanho e clicabilidade dos botões
- [ ] Verificar dimensionamento das imagens
- [ ] Testar navegação e menu mobile


## CRÍTICO - Correção de Formulário de Cadastro (07/02/2026)

- [ ] Investigar e corrigir problema: formulário de médico não envia dados
- [ ] Verificar validação Zod no backend (campos obrigatórios)
- [ ] Ajustar payload do frontend para corresponder ao schema do backend
- [ ] Adicionar loading spinner durante envio do formulário
- [ ] Testar envio completo de cadastro de médico
- [ ] Testar envio completo de cadastro de instituição
- [ ] Verificar se email de notificação está sendo enviado
- [ ] Testar fluxo de aprovação no painel admin
