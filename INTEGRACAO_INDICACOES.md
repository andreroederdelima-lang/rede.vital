# Plano de Integração: Site de Credenciados + Site de Indicações

## Análise do Site de Indicações (indique-vital.manus.space)

### Estrutura Identificada

**Perfis de Usuário:**
1. **Promotor** - Indica clientes e recebe comissão por vendas fechadas
2. **Vendedor** - Fecha vendas e gerencia processo comercial

**Autenticação:**
- Sistema Manus OAuth (mesmo do site atual)
- Login unificado com Google, Microsoft, Apple ou email

**Funcionalidades Esperadas:**
- Registro de indicações de clientes
- Acompanhamento de status das indicações
- Cálculo e visualização de comissões
- Dashboard de performance
- Histórico de vendas fechadas

---

## Arquitetura de Integração Proposta

### 1. Navegação Unificada

**Menu Principal:**
```
┌─────────────────────────────────────────────────┐
│  VITAL - Logo                                   │
│                                                 │
│  [Credenciados] [Indicações] [Parceiros] [Admin]│
└─────────────────────────────────────────────────┘
```

**Estrutura de Rotas:**
- `/` - Home (Guia de Credenciados)
- `/consulta` - Consulta Pública de Credenciados
- `/indicacoes` - Sistema de Indicações (novo)
- `/indicacoes/dashboard` - Dashboard Promotor/Vendedor
- `/indicacoes/nova` - Registrar Nova Indicação
- `/parceiros` - Formulário de Parceiros
- `/admin` - Painel Administrativo Unificado

### 2. Banco de Dados

**Novas Tabelas:**

```sql
-- Perfis de Indicadores
CREATE TABLE indicadores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL, -- FK para users
  tipo ENUM('promotor', 'vendedor') NOT NULL,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(320) NOT NULL,
  telefone VARCHAR(20),
  cpf VARCHAR(14),
  pix VARCHAR(255),
  comissaoPercentual DECIMAL(5,2), -- Ex: 10.00 para 10%
  ativo BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indicações de Clientes
CREATE TABLE indicacoes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  indicadorId INT NOT NULL, -- FK para indicadores
  nomeCliente VARCHAR(255) NOT NULL,
  emailCliente VARCHAR(320),
  telefoneCliente VARCHAR(20) NOT NULL,
  cidadeCliente VARCHAR(100),
  observacoes TEXT,
  status ENUM('pendente', 'contatado', 'em_negociacao', 'fechado', 'perdido') DEFAULT 'pendente',
  vendedorId INT, -- FK para indicadores (vendedor responsável)
  valorVenda DECIMAL(10,2),
  valorComissao DECIMAL(10,2),
  dataPagamento TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Histórico de Comissões
CREATE TABLE comissoes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  indicacaoId INT NOT NULL, -- FK para indicacoes
  indicadorId INT NOT NULL, -- FK para indicadores
  valor DECIMAL(10,2) NOT NULL,
  status ENUM('pendente', 'pago', 'cancelado') DEFAULT 'pendente',
  dataPagamento TIMESTAMP NULL,
  comprovante VARCHAR(500), -- URL do comprovante
  observacoes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Funcionalidades a Implementar

#### Para Promotores:
- ✅ Cadastro como promotor (nome, email, telefone, CPF, PIX)
- ✅ Registrar nova indicação de cliente
- ✅ Visualizar lista de indicações próprias
- ✅ Acompanhar status de cada indicação
- ✅ Dashboard com métricas:
  - Total de indicações
  - Indicações pendentes/fechadas/perdidas
  - Comissões a receber
  - Comissões recebidas
  - Histórico de pagamentos

#### Para Vendedores:
- ✅ Visualizar todas as indicações (não apenas próprias)
- ✅ Atualizar status das indicações
- ✅ Registrar valor de venda fechada
- ✅ Calcular comissão automaticamente
- ✅ Dashboard com métricas:
  - Total de leads
  - Taxa de conversão
  - Vendas fechadas no mês
  - Pipeline de vendas

#### Para Admin:
- ✅ Gerenciar promotores e vendedores
- ✅ Aprovar/rejeitar cadastros de indicadores
- ✅ Visualizar todas as indicações
- ✅ Processar pagamentos de comissões
- ✅ Upload de comprovantes
- ✅ Relatórios gerenciais

### 4. Design e UX

**Cores Vital Aplicadas:**
- Turquesa `#1e9d9f` - Botões principais, destaques
- Bege `#c6bca4` - Elementos secundários, backgrounds
- Verde `#10b981` - Status positivo (vendas fechadas)
- Amarelo `#f59e0b` - Status em andamento
- Vermelho `#ef4444` - Status negativo (perdidos)

**Componentes Reutilizáveis:**
- Cards de indicações
- Badges de status
- Gráficos de performance
- Tabelas de histórico

### 5. Fluxo de Integração

**Fase 1: Estrutura Base**
1. Criar tabelas no banco de dados
2. Criar procedures tRPC para indicações
3. Adicionar navegação principal unificada

**Fase 2: Área de Indicações**
1. Página de cadastro de promotor/vendedor
2. Página de nova indicação
3. Dashboard básico

**Fase 3: Gestão Admin**
1. Aba "Indicações" no Admin
2. Gerenciamento de indicadores
3. Processamento de comissões

**Fase 4: Refinamento**
1. Notificações automáticas
2. Relatórios avançados
3. Exportação de dados

---

## Benefícios da Integração

1. **Experiência Unificada** - Um único login para acessar credenciados e indicações
2. **Gestão Centralizada** - Admin gerencia tudo em um só lugar
3. **Consistência Visual** - Mesma identidade visual Vital
4. **Dados Integrados** - Possibilidade de cruzar dados de credenciados com indicações
5. **Manutenção Simplificada** - Um único projeto para manter

---

## Próximos Passos

1. Aprovar arquitetura proposta
2. Criar estrutura de banco de dados
3. Implementar navegação unificada
4. Desenvolver área de indicações
5. Integrar com painel Admin
6. Testar fluxos completos
