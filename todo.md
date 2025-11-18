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
