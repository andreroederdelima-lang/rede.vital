# Guia de Integração do FormularioCredenciado

## Visão Geral

O componente `FormularioCredenciado` foi criado para unificar os formulários de **Sugestão de Parceiros** e **Atualização de Dados**, garantindo consistência e eliminando duplicação de código.

## Componente: FormularioCredenciado

**Localização:** `client/src/components/FormularioCredenciado.tsx`

### Props

```typescript
interface FormularioCredenciadoProps {
  tipo: "medico" | "instituicao";
  modoEdicao?: boolean; // true para atualização, false para novo cadastro
  dadosIniciais?: any;
  onSubmit: (dados: any) => void;
  onCancel?: () => void;
  loading?: boolean;
}
```

### Campos do Formulário

**Dados Públicos (exibidos no site Home):**
- Nome
- Especialidade/Categoria
- Número de Registro no Conselho (apenas médicos)
- Tipo de Atendimento (Presencial/Online/Ambos)
- Município
- Endereço
- Telefone Fixo
- WhatsApp Comercial/Agendamento
- Logo (upload com preview)
- Foto (upload com preview)

**Dados Internos (apenas no modo edição - exibidos apenas em Dados Internos):**
- Contato do Responsável pela Parceria
- WhatsApp do Responsável pela Parceria
- Observações

**Opt-in:**
- Aceite de termos (apenas modo cadastro)

---

## Integração na Página Parceiros

**Arquivo:** `client/src/pages/Parceiros.tsx`

### Passo 1: Importar o componente

```typescript
import { FormularioCredenciado } from "@/components/FormularioCredenciado";
```

### Passo 2: Substituir formulário atual

**Antes:**
```typescript
// Formulário extenso com múltiplos useState e campos individuais
const [nomeResponsavel, setNomeResponsavel] = useState("");
const [nomeEstabelecimento, setNomeEstabelecimento] = useState("");
// ... muitos outros estados
```

**Depois:**
```typescript
const [tipoCredenciado, setTipoCredenciado] = useState<"medico" | "instituicao">("instituicao");

const handleSubmitParceiro = async (dados: any) => {
  try {
    setUploading(true);
    
    // Upload de imagens se fornecidas
    let logoUrl = null;
    let fotoUrl = null;
    
    if (dados.logoFile) {
      const logoUpload = await uploadImageMutation.mutateAsync({
        tipo: tipoCredenciado,
        tipoImagem: "logo",
        imageData: await fileToBase64(dados.logoFile),
      });
      logoUrl = logoUpload.url;
    }
    
    if (dados.fotoFile) {
      const fotoUpload = await uploadImageMutation.mutateAsync({
        tipo: tipoCredenciado,
        tipoImagem: "foto",
        imageData: await fileToBase64(dados.fotoFile),
      });
      fotoUrl = fotoUpload.url;
    }
    
    // Enviar solicitação
    await solicitarParceriaMutation.mutateAsync({
      tipoCredenciado,
      nome: dados.nome,
      especialidade: dados.especialidade,
      numeroRegistroConselho: dados.numeroRegistroConselho,
      tipoAtendimento: dados.tipoAtendimento,
      municipio: dados.municipio,
      endereco: dados.endereco,
      telefone: dados.telefone,
      whatsapp: dados.whatsapp,
      logoUrl,
      fotoUrl,
    });
    
    toast.success("Solicitação enviada com sucesso!");
    setMostrarFormulario(false);
  } catch (error) {
    toast.error("Erro ao enviar solicitação");
  } finally {
    setUploading(false);
  }
};

// Helper para converter File para base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
```

### Passo 3: Renderizar o componente

```typescript
{mostrarFormulario && (
  <div className="container mx-auto px-4 py-8">
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-6">Sugerir Novo Parceiro</h2>
        
        {/* Seletor de tipo */}
        <div className="mb-6">
          <Label>Tipo de Credenciado</Label>
          <Select value={tipoCredenciado} onValueChange={(v) => setTipoCredenciado(v as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="medico">Médico</SelectItem>
              <SelectItem value="instituicao">Instituição</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Formulário unificado */}
        <FormularioCredenciado
          tipo={tipoCredenciado}
          modoEdicao={false}
          onSubmit={handleSubmitParceiro}
          onCancel={() => setMostrarFormulario(false)}
          loading={uploading}
        />
      </CardContent>
    </Card>
  </div>
)}
```

---

## Integração na Página Atualizar Dados

**Arquivo:** `client/src/pages/AtualizarDados.tsx`

### Passo 1: Importar o componente

```typescript
import { FormularioCredenciado } from "@/components/FormularioCredenciado";
```

### Passo 2: Buscar dados atuais do credenciado

```typescript
const { token } = useParams();

const { data: credenciado, isLoading } = trpc.credenciados.buscarPorToken.useQuery({ token });
```

### Passo 3: Implementar submit com atualização

```typescript
const atualizarMutation = trpc.credenciados.atualizarDados.useMutation({
  onSuccess: () => {
    toast.success("Dados atualizados com sucesso!", {
      description: "Suas alterações serão revisadas pela equipe Vital."
    });
  },
  onError: () => {
    toast.error("Erro ao atualizar dados");
  }
});

const handleSubmitAtualizacao = async (dados: any) => {
  try {
    setUploading(true);
    
    // Upload de imagens se fornecidas
    let logoUrl = credenciado?.logoUrl || null;
    let fotoUrl = credenciado?.fotoUrl || null;
    
    if (dados.logoFile) {
      const logoUpload = await uploadImageMutation.mutateAsync({
        tipo: credenciado.tipo,
        tipoImagem: "logo",
        imageData: await fileToBase64(dados.logoFile),
      });
      logoUrl = logoUpload.url;
    }
    
    if (dados.fotoFile) {
      const fotoUpload = await uploadImageMutation.mutateAsync({
        tipo: credenciado.tipo,
        tipoImagem: "foto",
        imageData: await fileToBase64(dados.fotoFile),
      });
      fotoUrl = fotoUpload.url;
    }
    
    // Atualizar dados
    await atualizarMutation.mutateAsync({
      token,
      dados: {
        nome: dados.nome,
        especialidade: dados.especialidade,
        numeroRegistroConselho: dados.numeroRegistroConselho,
        tipoAtendimento: dados.tipoAtendimento,
        municipio: dados.municipio,
        endereco: dados.endereco,
        telefone: dados.telefone,
        whatsapp: dados.whatsapp,
        logoUrl,
        fotoUrl,
        contatoParceria: dados.contatoParceria,
        whatsappParceria: dados.whatsappParceria,
        observacoes: dados.observacoes,
      }
    });
  } catch (error) {
    toast.error("Erro ao atualizar dados");
  } finally {
    setUploading(false);
  }
};
```

### Passo 4: Renderizar o componente

```typescript
{isLoading ? (
  <div>Carregando...</div>
) : credenciado ? (
  <FormularioCredenciado
    tipo={credenciado.tipo}
    modoEdicao={true}
    dadosIniciais={credenciado}
    onSubmit={handleSubmitAtualizacao}
    loading={uploading}
  />
) : (
  <div>Credenciado não encontrado</div>
)}
```

---

## Fluxo de Aprovação Admin

### 1. Solicitação de Atualização

Quando um parceiro atualiza seus dados via link, os dados ficam em **status "pendente"** na tabela `solicitacoesAtualizacao`.

### 2. Revisão pelo Admin

Na página Admin, criar seção "Solicitações Pendentes" listando todas as atualizações aguardando aprovação:

```typescript
const { data: solicitacoes } = trpc.admin.listarSolicitacoesPendentes.useQuery();

solicitacoes?.map(sol => (
  <div key={sol.id}>
    <h3>{sol.nome}</h3>
    <p>Campos alterados: {sol.camposAlterados.join(", ")}</p>
    <Button onClick={() => aprovarSolicitacao(sol.id)}>Aprovar</Button>
    <Button onClick={() => rejeitarSolicitacao(sol.id)}>Rejeitar</Button>
  </div>
))
```

### 3. Aprovação Automática

Quando Admin clica em "Aprovar", os dados são automaticamente transferidos da tabela `solicitacoesAtualizacao` para `medicos` ou `instituicoes`:

```typescript
const aprovarMutation = trpc.admin.aprovarAtualizacao.useMutation({
  onSuccess: () => {
    toast.success("Dados atualizados no site!");
    refetch();
  }
});

const aprovarSolicitacao = (id: number) => {
  aprovarMutation.mutate({ id });
};
```

### 4. Edição Direta pelo Admin

Admin pode editar qualquer credenciado a qualquer momento diretamente na página Admin usando o mesmo `FormularioCredenciado`:

```typescript
<FormularioCredenciado
  tipo={credenciado.tipo}
  modoEdicao={true}
  dadosIniciais={credenciado}
  onSubmit={handleEditarDiretamente}
  loading={saving}
/>
```

A edição direta pelo Admin atualiza imediatamente os dados no site, sem passar por aprovação.

---

## Procedures tRPC Necessários

### server/routers.ts

```typescript
credenciados: router({
  buscarPorToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      // Buscar médico ou instituição pelo tokenAtualizacao
      return await db.buscarCredenciadoPorToken(input.token);
    }),
    
  atualizarDados: publicProcedure
    .input(z.object({
      token: z.string(),
      dados: z.object({
        nome: z.string(),
        especialidade: z.string(),
        // ... outros campos
      })
    }))
    .mutation(async ({ input }) => {
      // Criar solicitação de atualização pendente
      return await db.criarSolicitacaoAtualizacao(input.token, input.dados);
    }),
}),

admin: router({
  listarSolicitacoesPendentes: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      return await db.listarSolicitacoesPendentes();
    }),
    
  aprovarAtualizacao: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      // Transferir dados de solicitacoesAtualizacao para medicos/instituicoes
      return await db.aprovarAtualizacao(input.id);
    }),
    
  editarCredenciadoDiretamente: protectedProcedure
    .input(z.object({
      id: z.number(),
      tipo: z.enum(['medico', 'instituicao']),
      dados: z.object({
        // ... campos
      })
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      // Atualizar diretamente medicos ou instituicoes
      return await db.atualizarCredenciado(input.id, input.tipo, input.dados);
    }),
}),
```

---

## Benefícios da Unificação

1. ✅ **Consistência**: Mesmo formulário em Parceiros e Atualizar Dados
2. ✅ **Manutenibilidade**: Alterações em um lugar refletem em ambas as páginas
3. ✅ **Validação**: Regras de validação centralizadas
4. ✅ **UX**: Experiência uniforme para usuários
5. ✅ **Código limpo**: Elimina duplicação de 200+ linhas

---

## Checklist de Implementação

- [ ] Aplicar FormularioCredenciado na página Parceiros
- [ ] Aplicar FormularioCredenciado na página Atualizar Dados
- [ ] Criar procedures tRPC para atualização e aprovação
- [ ] Implementar seção "Solicitações Pendentes" no Admin
- [ ] Testar fluxo completo: Parceiro atualiza → Admin aprova → Site atualiza
- [ ] Testar edição direta pelo Admin
- [ ] Adicionar notificações (email/WhatsApp) quando solicitação for aprovada
