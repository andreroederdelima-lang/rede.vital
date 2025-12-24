# Planejamento da API REST para Integração

## Objetivo

Criar uma API REST completa para permitir que a plataforma de gestão de cartão de benefícios da Vital consuma dados dos parceiros credenciados (médicos e instituições de saúde).

---

## Arquitetura

### 1. Autenticação

**Sistema de API Keys**
- Cada cliente da API recebe uma API Key única
- API Key deve ser enviada no header `X-API-Key`
- Validação em middleware antes de processar requisições
- Logs de todas as requisições por API Key

**Tabela no Banco:**
```sql
CREATE TABLE apiKeys (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,           -- Nome do cliente (ex: "Plataforma Cartão Benefícios")
  apiKey VARCHAR(64) NOT NULL UNIQUE,   -- Chave gerada (UUID ou similar)
  ativa BOOLEAN DEFAULT true,           -- Permite desativar sem deletar
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lastUsedAt TIMESTAMP NULL,            -- Última vez que foi usada
  requestCount INT DEFAULT 0            -- Contador de requisições
);

CREATE TABLE apiLogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  apiKeyId INT NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  statusCode INT NOT NULL,
  responseTime INT NOT NULL,            -- Em milissegundos
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (apiKeyId) REFERENCES apiKeys(id)
);
```

---

### 2. Endpoints

#### **GET /api/public/credenciados/medicos**

Lista todos os médicos credenciados.

**Query Parameters:**
- `municipio` (string, opcional) - Filtrar por município
- `especialidade` (string, opcional) - Filtrar por especialidade
- `page` (number, opcional, default: 1) - Página atual
- `limit` (number, opcional, default: 50, max: 100) - Itens por página

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "Dr. João Silva",
      "especialidade": "Cardiologia",
      "areaAtuacao": "Cardiologia Clínica e Preventiva",
      "numeroRegistroConselho": "CRM 12345",
      "tipoAtendimento": "Presencial e Online",
      "municipio": "Blumenau",
      "endereco": "Rua das Flores, 123",
      "telefone": "(47) 3333-4444",
      "whatsapp": "(47) 99999-8888",
      "whatsappSecretaria": "(47) 98888-7777",
      "email": "contato@drjoao.com.br",
      "fotoUrl": "https://storage.../foto.jpg",
      "logoUrl": "https://storage.../logo.jpg",
      "valorParticular": "200.00",
      "valorAssinanteVital": "150.00",
      "descontoPercentual": 25,
      "updatedAt": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

---

#### **GET /api/public/credenciados/servicos**

Lista todas as instituições de serviços de saúde.

**Query Parameters:**
- `municipio` (string, opcional)
- `categoria` (string, opcional) - Ex: "Clínica", "Farmácia", "Laboratório"
- `tipoServico` (string, opcional) - "servicos_saude" ou "outros_servicos"
- `procedimento` (string, opcional) - Filtrar por procedimento oferecido
- `page` (number, opcional, default: 1)
- `limit` (number, opcional, default: 50, max: 100)

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "Clínica Saúde Total",
      "categoria": "Clínica de Multiespecialidades",
      "tipoServico": "servicos_saude",
      "municipio": "Blumenau",
      "endereco": "Av. Principal, 456",
      "telefone": "(47) 3333-5555",
      "whatsapp": "(47) 99999-6666",
      "whatsappSecretaria": "(47) 98888-5555",
      "email": "contato@clinicasaudetotal.com.br",
      "fotoUrl": "https://storage.../foto.jpg",
      "logoUrl": "https://storage.../logo.jpg",
      "valorParticular": null,
      "valorAssinanteVital": null,
      "procedimentos": [
        {
          "id": 1,
          "nome": "Colonoscopia",
          "valorParticular": "800.00",
          "valorAssinanteVital": "600.00"
        },
        {
          "id": 2,
          "nome": "Endoscopia",
          "valorParticular": "500.00",
          "valorAssinanteVital": "400.00"
        }
      ],
      "updatedAt": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 80,
    "totalPages": 2
  }
}
```

---

#### **GET /api/public/credenciados/:id**

Retorna detalhes de um credenciado específico (médico ou instituição).

**Path Parameters:**
- `id` (number) - ID do credenciado

**Query Parameters:**
- `tipo` (string, obrigatório) - "medico" ou "servico"

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tipo": "medico",
    "nome": "Dr. João Silva",
    "especialidade": "Cardiologia",
    // ... todos os campos detalhados
  }
}
```

---

#### **GET /api/public/credenciados/municipios**

Lista todos os municípios com credenciados.

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "municipio": "Blumenau",
      "totalMedicos": 15,
      "totalServicos": 8
    },
    {
      "municipio": "Indaial",
      "totalMedicos": 5,
      "totalServicos": 3
    }
  ]
}
```

---

#### **GET /api/public/credenciados/especialidades**

Lista todas as especialidades médicas disponíveis.

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "especialidade": "Cardiologia",
      "total": 5
    },
    {
      "especialidade": "Dermatologia",
      "total": 3
    }
  ]
}
```

---

#### **GET /api/public/credenciados/categorias**

Lista todas as categorias de serviços disponíveis.

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "categoria": "Clínica",
      "tipoServico": "servicos_saude",
      "total": 10
    },
    {
      "categoria": "Farmácia",
      "tipoServico": "servicos_saude",
      "total": 5
    }
  ]
}
```

---

### 3. Segurança

**Rate Limiting:**
- 100 requisições por minuto por API Key
- 1000 requisições por hora por API Key
- Resposta HTTP 429 (Too Many Requests) quando exceder

**CORS:**
- Configurar domínios permitidos
- Apenas HTTPS em produção

**Validação:**
- Validar todos os parâmetros de entrada
- Sanitizar strings para prevenir SQL injection
- Limitar tamanho de resposta (max 100 itens por página)

---

### 4. Performance

**Cache:**
- Cache de 5 minutos para listagens
- Invalidar cache quando dados forem atualizados

**Otimizações:**
- Índices no banco para campos de filtro (municipio, especialidade, categoria)
- Paginação obrigatória
- Seleção de campos específicos (não retornar observações internas)

---

### 5. Documentação

**Swagger/OpenAPI:**
- Documentação interativa em `/api/docs`
- Exemplos de requisição/resposta
- Descrição de todos os parâmetros
- Códigos de erro e suas causas

**Guia de Integração:**
- Como obter API Key
- Exemplos em diferentes linguagens (JavaScript, Python, PHP)
- Boas práticas
- Troubleshooting

---

## Implementação

### Fase 1: Backend
1. Criar tabelas no banco (apiKeys, apiLogs)
2. Implementar middleware de autenticação
3. Criar endpoints REST (fora do tRPC)
4. Implementar rate limiting
5. Adicionar logs de acesso

### Fase 2: Admin
1. Criar aba "API Keys" no Admin
2. Gerar/listar/revogar API Keys
3. Exibir logs e estatísticas

### Fase 3: Documentação
1. Criar documentação Swagger
2. Criar guia de integração
3. Testar com Postman/Insomnia

### Fase 4: Testes
1. Testar autenticação
2. Testar filtros e paginação
3. Testar rate limiting
4. Testar performance com muitos registros

---

## Cronograma Estimado

- **Fase 1**: 2-3 horas
- **Fase 2**: 1-2 horas
- **Fase 3**: 1 hora
- **Fase 4**: 1 hora

**Total**: 5-7 horas de desenvolvimento
