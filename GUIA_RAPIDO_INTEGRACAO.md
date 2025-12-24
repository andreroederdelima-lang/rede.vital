# Guia Rápido de Integração - API Vital Credenciados

## 🚀 Começando em 5 Minutos

### 1. Obter API Key

Entre em contato com o administrador através do painel Admin (aba "API Keys") para gerar sua chave de API.

**Ou solicite por:**
- Email: administrativo@suasaudevital.com.br
- WhatsApp: (47) 93385-3726

### 2. Fazer Primeira Requisição

```bash
curl -H "X-API-Key: SUA_API_KEY_AQUI" \
  https://seu-dominio.com/api/public/credenciados/medicos
```

### 3. Endpoints Principais

| Endpoint | Descrição |
|----------|-----------|
| `GET /credenciados/medicos` | Lista médicos credenciados |
| `GET /credenciados/servicos` | Lista instituições de saúde |
| `GET /credenciados/:id?tipo=medico` | Detalhes de um credenciado |
| `GET /credenciados/municipios` | Lista municípios disponíveis |
| `GET /credenciados/especialidades` | Lista especialidades médicas |
| `GET /credenciados/categorias` | Lista categorias de serviços |

---

## 📋 Casos de Uso Comuns

### Buscar Médicos por Município

```javascript
const response = await fetch(
  'https://seu-dominio.com/api/public/credenciados/medicos?municipio=Blumenau',
  {
    headers: { 'X-API-Key': 'SUA_API_KEY' }
  }
);
const { data, pagination } = await response.json();
```

### Buscar Serviços por Categoria

```javascript
const response = await fetch(
  'https://seu-dominio.com/api/public/credenciados/servicos?categoria=Clínica&municipio=Indaial',
  {
    headers: { 'X-API-Key': 'SUA_API_KEY' }
  }
);
const { data } = await response.json();
```

### Buscar Detalhes de um Médico

```javascript
const response = await fetch(
  'https://seu-dominio.com/api/public/credenciados/1?tipo=medico',
  {
    headers: { 'X-API-Key': 'SUA_API_KEY' }
  }
);
const { data } = await response.json();
```

---

## 🎯 Exemplo Completo: Listagem de Credenciados

### HTML + JavaScript

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Credenciados Vital</title>
  <style>
    .credenciado {
      border: 1px solid #ddd;
      padding: 15px;
      margin: 10px 0;
      border-radius: 8px;
    }
    .credenciado h3 {
      margin: 0 0 10px 0;
      color: #1e9d9f;
    }
  </style>
</head>
<body>
  <h1>Médicos Credenciados</h1>
  <div id="lista-medicos"></div>

  <script>
    const API_KEY = 'SUA_API_KEY_AQUI';
    const BASE_URL = 'https://seu-dominio.com/api/public';

    async function carregarMedicos() {
      try {
        const response = await fetch(`${BASE_URL}/credenciados/medicos?limit=10`, {
          headers: { 'X-API-Key': API_KEY }
        });

        if (!response.ok) {
          throw new Error(`Erro: ${response.status}`);
        }

        const { data } = await response.json();
        const container = document.getElementById('lista-medicos');

        data.forEach(medico => {
          const div = document.createElement('div');
          div.className = 'credenciado';
          div.innerHTML = `
            <h3>${medico.nome}</h3>
            <p><strong>Especialidade:</strong> ${medico.especialidade}</p>
            <p><strong>Município:</strong> ${medico.municipio}</p>
            <p><strong>Telefone:</strong> ${medico.telefone || 'Não informado'}</p>
            <p><strong>WhatsApp:</strong> ${medico.whatsapp || 'Não informado'}</p>
            ${medico.valorAssinanteVital ? `
              <p><strong>Valor Assinante Vital:</strong> R$ ${medico.valorAssinanteVital}</p>
            ` : ''}
          `;
          container.appendChild(div);
        });
      } catch (error) {
        console.error('Erro ao carregar médicos:', error);
        document.getElementById('lista-medicos').innerHTML = 
          '<p style="color: red;">Erro ao carregar dados. Verifique sua API Key.</p>';
      }
    }

    carregarMedicos();
  </script>
</body>
</html>
```

---

## 🔐 Segurança

### ⚠️ NUNCA exponha sua API Key no frontend

**❌ Errado:**
```javascript
// Código rodando no navegador
const API_KEY = 'minha_api_key_secreta'; // Qualquer um pode ver!
```

**✅ Correto:**
```javascript
// Frontend faz requisição para seu próprio backend
fetch('/api/meu-backend/credenciados')

// Seu backend adiciona a API Key
// server.js (Node.js)
app.get('/api/meu-backend/credenciados', async (req, res) => {
  const response = await fetch('https://vital.com/api/public/credenciados/medicos', {
    headers: { 'X-API-Key': process.env.VITAL_API_KEY } // Seguro!
  });
  const data = await response.json();
  res.json(data);
});
```

---

## 📊 Estrutura de Resposta

### Sucesso (200)
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

### Erro (401)
```json
{
  "success": false,
  "error": "API Key inválida ou desativada"
}
```

---

## 🎨 Filtros Disponíveis

### Médicos
- `municipio` - Filtrar por cidade
- `especialidade` - Filtrar por especialidade
- `page` - Número da página
- `limit` - Itens por página (máx: 100)

### Serviços
- `municipio` - Filtrar por cidade
- `categoria` - Filtrar por categoria
- `tipoServico` - "servicos_saude" ou "outros_servicos"
- `procedimento` - Buscar por procedimento específico
- `page` - Número da página
- `limit` - Itens por página (máx: 100)

---

## 📈 Limites de Uso

- **100 requisições/minuto** por API Key
- **1000 requisições/hora** por API Key

Se exceder, receberá erro `429 Too Many Requests`.

**Dica:** Implemente cache local para reduzir requisições!

---

## 🆘 Suporte

**Problemas com integração?**

1. Verifique se sua API Key está correta
2. Confirme que está enviando o header `X-API-Key`
3. Verifique se não excedeu o rate limit
4. Consulte a documentação completa em `DOCUMENTACAO_API.md`

**Ainda com dúvidas?**
- Email: administrativo@suasaudevital.com.br
- WhatsApp: (47) 93385-3726

---

## 📚 Próximos Passos

1. ✅ Obter API Key
2. ✅ Testar endpoints básicos
3. 📖 Ler documentação completa (`DOCUMENTACAO_API.md`)
4. 🔨 Implementar integração no seu sistema
5. 🚀 Colocar em produção

**Boa integração! 🎉**
