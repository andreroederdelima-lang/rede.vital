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
