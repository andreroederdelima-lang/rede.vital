# Bug: Dropdown de Filtro de Procedimentos Não Aparece

## Problema
O dropdown de filtro de procedimentos não está sendo renderizado na interface, mesmo com o código aparentemente correto.

## Status Atual
- ✅ Backend funcionando: API `/api/trpc/procedimentos.listarNomes` retorna 3 procedimentos
- ✅ Backend de filtro funcionando: API aceita parâmetro `procedimento` e filtra corretamente
- ✅ Query React funcionando: `trpc.procedimentos.listarNomes.useQuery()` retorna dados
- ❌ Dropdown não renderiza no DOM: Apenas 1 dropdown aparece (categorias), faltam 2 (procedimentos + municípios)

## Código Implementado

### Backend (server/db.ts)
```typescript
// Função para listar nomes únicos de procedimentos
export async function listarNomesProcedimentos() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .selectDistinct({ nome: procedimentos.nome })
    .from(procedimentos)
    .orderBy(procedimentos.nome);
    
  return result.map(r => r.nome);
}

// Filtro de procedimento adicionado em listarInstituicoes
if (procedimento) {
  // Buscar IDs de instituições que têm esse procedimento
  const instituicoesComProc = await db
    .selectDistinct({ instituicaoId: procedimentos.instituicaoId })
    .from(procedimentos)
    .where(eq(procedimentos.nome, procedimento));
    
  const ids = instituicoesComProc.map(i => i.instituicaoId);
  if (ids.length > 0) {
    conditions.push(inArray(instituicoes.id, ids));
  } else {
    // Se não encontrou nenhuma instituição com esse procedimento, retornar vazio
    return [];
  }
}
```

### Backend (server/routers.ts)
```typescript
procedimentos: router({
  listarNomes: publicProcedure.query(async () => {
    return await listarNomesProcedimentos();
  }),
  // ...
}),

instituicoes: router({
  listar: publicProcedure
    .input(z.object({
      municipio: z.string().optional(),
      categoria: z.string().optional(),
      procedimento: z.string().optional(), // NOVO
    }))
    .query(async ({ input }) => {
      return await listarInstituicoes(input.municipio, input.categoria, input.procedimento);
    }),
}),
```

### Frontend (client/src/pages/Home.tsx)
```tsx
// Estado
const [procedimento, setProcedimento] = useState("");

// Query
const { data: procedimentos = [] } = trpc.procedimentos.listarNomes.useQuery();

// Query de instituições com filtro
const { data: instituicoesData = [] } = trpc.instituicoes.listar.useQuery({
  municipio: municipio || undefined,
  categoria: categoria || undefined,
  procedimento: procedimento || undefined, // NOVO
}, { enabled: tipoCredenciado === "servicos_saude" || tipoCredenciado === "outros_servicos" });

// Grid de filtros
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {/* Dropdown de Categorias (apenas para serviços) */}
  {tipoCredenciado !== "medicos" && (
    <Select value={categoria || "all"} onValueChange={(v) => setCategoria(v === "all" ? "" : v)}>
      <SelectTrigger>
        <SelectValue placeholder="Todas as categorias" />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        <SelectItem value="all">Todas as categorias</SelectItem>
        {(tipoCredenciado === "servicos_saude" 
          ? CATEGORIAS_SERVICOS_SAUDE 
          : CATEGORIAS_OUTROS_SERVICOS
        ).map((cat) => (
          <SelectItem key={cat.value} value={cat.value}>
            {cat.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )}

  {/* Dropdown de Procedimentos (apenas para serviços) */}
  {tipoCredenciado !== "medicos" && (
    <Select value={procedimento || "all"} onValueChange={(v) => setProcedimento(v === "all" ? "" : v)}>
      <SelectTrigger>
        <SelectValue placeholder="Todos os procedimentos" />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        <SelectItem value="all">Todos os procedimentos</SelectItem>
        {procedimentos.map((proc) => (
          <SelectItem key={proc} value={proc}>{proc}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )}

  {/* Dropdown de Municípios (sempre visível) */}
  <Select value={municipio || "all"} onValueChange={(v) => setMunicipio(v === "all" ? "" : v)}>
    <SelectTrigger>
      <SelectValue placeholder="Todos os municípios" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Todos os municípios</SelectItem>
      {municipios.map((mun) => (
        <SelectItem key={mun} value={mun}>{mun}</SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

## Hipóteses do Problema
1. **Grid CSS**: O grid `md:grid-cols-3` pode estar causando problema de layout
2. **React Render**: Condicionais `{tipoCredenciado !== "medicos" && ...}` podem não estar re-renderizando
3. **Componente Select**: Pode haver conflito no componente shadcn/ui Select
4. **Estado React**: O estado `tipoCredenciado` pode não estar atualizando corretamente

## Próximos Passos para Resolver
1. Testar com grid-cols-2 ao invés de grid-cols-3
2. Usar `key` prop nos dropdowns para forçar re-render
3. Verificar se há erro no console do browser (não consegui acessar logs)
4. Simplificar estrutura removendo condicionais e testando dropdown isolado
5. Verificar se há CSS global escondendo elementos

## Workaround Temporário
Enquanto o bug não é resolvido, usuários podem:
- Usar busca por texto para encontrar instituições
- Filtrar por categoria e município
- Acessar Admin para ver todos os procedimentos cadastrados
