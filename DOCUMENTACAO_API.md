# Documentação da API REST - Vital Credenciados

## Visão Geral

A API REST da Vital Credenciados permite que plataformas externas acessem informações sobre médicos e instituições de saúde credenciadas. Todos os endpoints requerem autenticação via API Key.

**Base URL:** `https://seu-dominio.com/api/public`

---

## Autenticação

Todas as requisições devem incluir o header `X-API-Key` com sua chave de API.

### Exemplo de Requisição

```bash
curl -H "X-API-Key: sua_api_key_aqui" \
  https://seu-dominio.com/api/public/credenciados/medicos
```

### Obter API Key

Entre em contato com o administrador da plataforma Vital para solicitar uma API Key. Você pode gerenciar suas chaves através do painel Admin.

---

## Endpoints Disponíveis

### 1. Listar Médicos

**Endpoint:** `GET /credenciados/medicos`

Lista todos os médicos credenciados com suporte a filtros e paginação.

#### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `municipio` | string | Não | Filtrar por município (ex: "Blumenau") |
| `especialidade` | string | Não | Filtrar por especialidade (ex: "Cardiologia") |
| `page` | number | Não | Número da página (padrão: 1) |
| `limit` | number | Não | Itens por página (padrão: 50, máx: 100) |

#### Exemplo de Requisição

```bash
curl -H "X-API-Key: sua_api_key_aqui" \
  "https://seu-dominio.com/api/public/credenciados/medicos?municipio=Blumenau&page=1&limit=20"
```

#### Exemplo de Resposta

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
      "tipoAtendimento": "presencial",
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
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

### 2. Listar Serviços de Saúde

**Endpoint:** `GET /credenciados/servicos`

Lista todas as instituições de serviços de saúde (clínicas, laboratórios, etc).

#### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `municipio` | string | Não | Filtrar por município |
| `categoria` | string | Não | Filtrar por categoria (ex: "Clínica") |
| `tipoServico` | string | Não | "servicos_saude" ou "outros_servicos" |
| `procedimento` | string | Não | Filtrar por procedimento oferecido |
| `page` | number | Não | Número da página (padrão: 1) |
| `limit` | number | Não | Itens por página (padrão: 50, máx: 100) |

#### Exemplo de Requisição

```bash
curl -H "X-API-Key: sua_api_key_aqui" \
  "https://seu-dominio.com/api/public/credenciados/servicos?categoria=Clínica&municipio=Blumenau"
```

#### Exemplo de Resposta

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
      "whatsappSecretaria": "(47) 99999-6666",
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

### 3. Buscar Credenciado por ID

**Endpoint:** `GET /credenciados/:id`

Retorna detalhes completos de um credenciado específico.

#### Path Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | number | ID do credenciado |

#### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `tipo` | string | Sim | "medico" ou "servico" |

#### Exemplo de Requisição

```bash
curl -H "X-API-Key: sua_api_key_aqui" \
  "https://seu-dominio.com/api/public/credenciados/1?tipo=medico"
```

#### Exemplo de Resposta

```json
{
  "success": true,
  "data": {
    "id": 1,
    "tipo": "medico",
    "nome": "Dr. João Silva",
    "especialidade": "Cardiologia",
    "areaAtuacao": "Cardiologia Clínica e Preventiva",
    "numeroRegistroConselho": "CRM 12345",
    "tipoAtendimento": "presencial",
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
}
```

---

### 4. Listar Municípios

**Endpoint:** `GET /credenciados/municipios`

Lista todos os municípios com credenciados e suas quantidades.

#### Exemplo de Requisição

```bash
curl -H "X-API-Key: sua_api_key_aqui" \
  https://seu-dominio.com/api/public/credenciados/municipios
```

#### Exemplo de Resposta

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

### 5. Listar Especialidades

**Endpoint:** `GET /credenciados/especialidades`

Lista todas as especialidades médicas disponíveis.

#### Exemplo de Requisição

```bash
curl -H "X-API-Key: sua_api_key_aqui" \
  https://seu-dominio.com/api/public/credenciados/especialidades
```

#### Exemplo de Resposta

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

### 6. Listar Categorias

**Endpoint:** `GET /credenciados/categorias`

Lista todas as categorias de serviços disponíveis.

#### Exemplo de Requisição

```bash
curl -H "X-API-Key: sua_api_key_aqui" \
  https://seu-dominio.com/api/public/credenciados/categorias
```

#### Exemplo de Resposta

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

## Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Requisição bem-sucedida |
| 400 | Parâmetros inválidos |
| 401 | API Key não fornecida ou inválida |
| 404 | Recurso não encontrado |
| 429 | Limite de requisições excedido |
| 500 | Erro interno do servidor |

---

## Rate Limiting

Para garantir a qualidade do serviço, implementamos os seguintes limites:

- **100 requisições por minuto** por API Key
- **1000 requisições por hora** por API Key

Quando o limite for excedido, você receberá um erro `429 Too Many Requests`.

---

## Exemplos de Integração

### JavaScript (Fetch API)

```javascript
const API_KEY = 'sua_api_key_aqui';
const BASE_URL = 'https://seu-dominio.com/api/public';

async function buscarMedicos(municipio) {
  const response = await fetch(
    `${BASE_URL}/credenciados/medicos?municipio=${municipio}`,
    {
      headers: {
        'X-API-Key': API_KEY
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`Erro: ${response.status}`);
  }
  
  const data = await response.json();
  return data.data;
}

// Uso
buscarMedicos('Blumenau')
  .then(medicos => console.log(medicos))
  .catch(error => console.error(error));
```

### Python (Requests)

```python
import requests

API_KEY = 'sua_api_key_aqui'
BASE_URL = 'https://seu-dominio.com/api/public'

def buscar_medicos(municipio):
    headers = {'X-API-Key': API_KEY}
    params = {'municipio': municipio}
    
    response = requests.get(
        f'{BASE_URL}/credenciados/medicos',
        headers=headers,
        params=params
    )
    
    response.raise_for_status()
    return response.json()['data']

# Uso
medicos = buscar_medicos('Blumenau')
print(medicos)
```

### PHP (cURL)

```php
<?php
$apiKey = 'sua_api_key_aqui';
$baseUrl = 'https://seu-dominio.com/api/public';

function buscarMedicos($municipio) {
    global $apiKey, $baseUrl;
    
    $url = $baseUrl . '/credenciados/medicos?municipio=' . urlencode($municipio);
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'X-API-Key: ' . $apiKey
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        throw new Exception("Erro: HTTP $httpCode");
    }
    
    $data = json_decode($response, true);
    return $data['data'];
}

// Uso
$medicos = buscarMedicos('Blumenau');
print_r($medicos);
?>
```

---

## Boas Práticas

1. **Cache de Dados**: Implemente cache local para reduzir requisições desnecessárias
2. **Tratamento de Erros**: Sempre trate erros HTTP adequadamente
3. **Rate Limiting**: Respeite os limites de requisições
4. **Segurança**: Nunca exponha sua API Key no frontend (use backend como proxy)
5. **Paginação**: Use paginação para grandes volumes de dados
6. **Filtros**: Use filtros para reduzir o volume de dados transferidos

---

## Suporte

Para dúvidas, problemas ou solicitação de API Keys, entre em contato:

- **Email**: administrativo@suasaudevital.com.br
- **WhatsApp**: (47) 93385-3726

---

## Changelog

### v1.0.0 (Janeiro 2025)
- Lançamento inicial da API
- Endpoints de listagem de médicos e serviços
- Autenticação via API Key
- Sistema de logs e estatísticas
