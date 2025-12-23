import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Settings } from "lucide-react";
import { toast } from "sonner";
import { maskMoeda, unmaskMoeda } from "@/lib/masks";

interface GerenciarProcedimentosProps {
  instituicaoId: number;
  instituicaoNome: string;
}

export function GerenciarProcedimentos({ instituicaoId, instituicaoNome }: GerenciarProcedimentosProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingProcedimento, setEditingProcedimento] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: "",
    valorParticular: "",
    valorAssinanteVital: "",
  });

  const { data: procedimentos = [], refetch } = trpc.procedimentos.listar.useQuery(
    { instituicaoId },
    { enabled: dialogOpen }
  );

  const criarMutation = trpc.procedimentos.criar.useMutation({
    onSuccess: () => {
      toast.success("Procedimento criado com sucesso!");
      refetch();
      setFormDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao criar procedimento", { description: error.message });
    },
  });

  const atualizarMutation = trpc.procedimentos.atualizar.useMutation({
    onSuccess: () => {
      toast.success("Procedimento atualizado com sucesso!");
      refetch();
      setFormDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar procedimento", { description: error.message });
    },
  });

  const excluirMutation = trpc.procedimentos.excluir.useMutation({
    onSuccess: () => {
      toast.success("Procedimento excluído com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao excluir procedimento", { description: error.message });
    },
  });

  const resetForm = () => {
    setFormData({
      nome: "",
      valorParticular: "",
      valorAssinanteVital: "",
    });
    setEditingProcedimento(null);
  };

  const handleEdit = (proc: any) => {
    setEditingProcedimento(proc);
    setFormData({
      nome: proc.nome,
      valorParticular: proc.valorParticular || "",
      valorAssinanteVital: proc.valorAssinanteVital || "",
    });
    setFormDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.nome.trim()) {
      toast.error("Nome do procedimento é obrigatório");
      return;
    }

    const data = {
      nome: formData.nome.trim(),
      valorParticular: formData.valorParticular ? unmaskMoeda(formData.valorParticular) : undefined,
      valorAssinanteVital: formData.valorAssinanteVital ? unmaskMoeda(formData.valorAssinanteVital) : undefined,
    };

    if (editingProcedimento) {
      atualizarMutation.mutate({
        id: editingProcedimento.id,
        ...data,
      });
    } else {
      criarMutation.mutate({
        instituicaoId,
        ...data,
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este procedimento?")) {
      excluirMutation.mutate(id);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Procedimentos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Procedimentos - {instituicaoNome}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Procedimento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingProcedimento ? "Editar Procedimento" : "Novo Procedimento"}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome do Procedimento *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: Endoscopia, Colonoscopia, Ultrassom..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="valorParticular">Valor Particular</Label>
                      <Input
                        id="valorParticular"
                        value={formData.valorParticular}
                        onChange={(e) => setFormData({ ...formData, valorParticular: maskMoeda(e.target.value) })}
                        placeholder="R$ 0,00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="valorAssinanteVital">Valor Assinante Vital</Label>
                      <Input
                        id="valorAssinanteVital"
                        value={formData.valorAssinanteVital}
                        onChange={(e) => setFormData({ ...formData, valorAssinanteVital: maskMoeda(e.target.value) })}
                        placeholder="R$ 0,00"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setFormDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSubmit}>
                      {editingProcedimento ? "Atualizar" : "Criar"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {procedimentos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum procedimento cadastrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Procedimento</TableHead>
                  <TableHead>Valor Particular</TableHead>
                  <TableHead>Valor Assinante Vital</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {procedimentos.map((proc: any) => (
                  <TableRow key={proc.id}>
                    <TableCell className="font-medium">{proc.nome}</TableCell>
                    <TableCell>{proc.valorParticular || "-"}</TableCell>
                    <TableCell>{proc.valorAssinanteVital || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(proc)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(proc.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
