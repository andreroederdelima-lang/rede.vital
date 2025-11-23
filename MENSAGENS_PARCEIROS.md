# 📋 Templates de Mensagens para Parceiros - Vital Serviços Médicos

Este documento contém mensagens prontas e links para envio aos parceiros da rede credenciada Vital.

---

## 🔗 Links Disponíveis

### 1. **Convidar um Parceiro** (Seja Parceiro)
**Link:** `https://credenciados.suasaudevital.com.br/parceiros`

**Descrição:** Formulário completo de solicitação de parceria. O parceiro preenche todos os dados e aguarda aprovação do admin.

**Fluxo:**
1. Parceiro preenche formulário em `/parceiros`
2. Solicitação vai para "Solicitações de Parceria" no Admin
3. Admin aprova ou rejeita
4. Se aprovado, credenciado aparece automaticamente na plataforma cliente e área interna

---

### 2. **Atualizar Dados do Parceiro**
**Link:** `https://credenciados.suasaudevital.com.br/atualizar-dados/:token`

**Descrição:** Link personalizado com token único para cada parceiro atualizar seus próprios dados.

**Fluxo:**
1. Admin gera link de atualização no painel (botão "Solicitar Atualização")
2. Parceiro acessa link e atualiza dados
3. Solicitação vai para "Solicitações de Atualização" no Admin
4. Admin aprova ou rejeita
5. Se aprovado, dados são atualizados automaticamente na plataforma

**⚠️ Nota:** O token é único por parceiro e deve ser gerado pelo admin no painel.

---

### 3. **Sugerir um Parceiro** (Formulário Simplificado)
**Link:** `https://credenciados.suasaudevital.com.br/sugerir-parceiro`

**Descrição:** Formulário simplificado para clientes sugerirem novos parceiros (apenas tipo de serviço, nome e município).

**Fluxo:**
1. Cliente preenche sugestão
2. Sugestão é enviada e salva no sistema
3. Admin visualiza sugestões e pode entrar em contato

---

## 📱 Templates de Mensagens WhatsApp

### **1. Mensagem para Convidar Novo Parceiro**

```
🌟 *Seja Parceiro da Rede Credenciada Vital!*

Olá! 👋

A *Vital Serviços Médicos* está expandindo sua rede credenciada no Vale do Itajaí e gostaríamos de convidá-lo(a) para fazer parte do nosso time de parceiros!

✅ *Benefícios de ser parceiro:*
• Divulgação no Guia do Assinante Vital
• Acesso a uma base crescente de clientes
• Suporte e materiais de divulgação
• Comissões por indicações

📋 *Para se cadastrar, acesse:*
https://credenciados.suasaudevital.com.br/parceiros

Preencha o formulário e nossa equipe entrará em contato em breve!

*Sua Saúde Vital - sempre ao seu lado.*
```

---

### **2. Mensagem para Atualização de Dados**

```
📝 *Atualização do Guia do Assinante Vital*

Olá, [NOME DO PARCEIRO]! 👋

Para mantermos nosso *Guia de Credenciados* sempre atualizado e garantir que nossos assinantes tenham as informações corretas sobre seu estabelecimento, solicitamos a atualização dos seus dados cadastrais.

🔄 *Informações que podem ser atualizadas:*
• Endereço e telefone
• Horário de atendimento
• Especialidades/Serviços oferecidos
• Fotos e logo do estabelecimento
• Desconto oferecido aos assinantes

🔗 *Acesse o link abaixo para atualizar:*
https://credenciados.suasaudevital.com.br/atualizar-dados/[TOKEN]

⏰ *Prazo:* Pedimos que atualize em até 7 dias para garantir que as informações estejam corretas no guia.

Qualquer dúvida, estamos à disposição!

*Vital Serviços Médicos*
📞 (47) XXXX-XXXX
✉️ contato@suasaudevital.com.br

*Sua Saúde Vital - sempre ao seu lado.*
```

---

### **3. Mensagem para Primeiro Cadastro (Formulário Direto)**

```
🎯 *Cadastro Rápido - Rede Credenciada Vital*

Olá! 👋

Gostaríamos de incluir seu estabelecimento no *Guia de Credenciados da Vital Serviços Médicos*!

Para agilizar o processo, preparamos um formulário rápido de cadastro:

📋 *Acesse e preencha:*
https://credenciados.suasaudevital.com.br/parceiros

✅ *O que você precisa ter em mãos:*
• Dados do estabelecimento (nome, endereço, telefone)
• Especialidades/Serviços oferecidos
• Logo e foto do estabelecimento (opcional)
• Desconto que pode oferecer aos assinantes Vital

Após o preenchimento, nossa equipe analisará e entrará em contato!

*Sua Saúde Vital - sempre ao seu lado.*
```

---

## 📊 Fluxo Completo de Aprovação

### **Solicitações de Parceria** (`/parceiros`)
1. Parceiro preenche formulário
2. Admin acessa "Solicitações de Parceria" no painel
3. Admin aprova → Credenciado criado automaticamente
4. Admin rejeita → Solicitação arquivada com motivo

### **Solicitações de Atualização** (`/atualizar-dados/:token`)
1. Admin gera link de atualização (botão no painel)
2. Parceiro acessa e atualiza dados
3. Admin acessa "Solicitações de Atualização" no painel
4. Admin aprova → Dados atualizados automaticamente
5. Admin rejeita → Dados mantidos, solicitação arquivada

### **Sugestões de Parceiros** (`/sugerir-parceiro`)
1. Cliente sugere parceiro
2. Sugestão salva no sistema
3. Admin visualiza e pode entrar em contato

---

## 🎨 Personalizações Recomendadas

Ao enviar as mensagens, personalize:
- `[NOME DO PARCEIRO]` - Nome do estabelecimento/profissional
- `[TOKEN]` - Token único gerado pelo admin para atualização
- `(47) XXXX-XXXX` - Telefone de contato da Vital
- `contato@suasaudevital.com.br` - Email de contato

---

## ✅ Checklist de Envio

Antes de enviar, verifique:
- [ ] Link correto para a finalidade
- [ ] Token gerado (se for atualização)
- [ ] Nome do parceiro personalizado
- [ ] Dados de contato da Vital atualizados
- [ ] Prazo definido (se aplicável)

---

**Última atualização:** 23/11/2025  
**Versão:** 1.0
