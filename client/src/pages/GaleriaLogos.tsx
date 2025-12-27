import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Image as ImageIcon, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function GaleriaLogos() {
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "medico" | "instituicao">("todos");
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "ativo" | "inativo">("ativo");
  
  // Buscar médicos e instituições
  const { data: medicos, isLoading: loadingMedicos, refetch: refetchMedicos } = trpc.medicos.listar.useQuery();
  const { data: instituicoes, isLoading: loadingInstituicoes, refetch: refetchInstituicoes } = trpc.instituicoes.listar.useQuery();

  const isLoading = loadingMedicos || loadingInstituicoes;

  // Combinar e filtrar dados
  const todosCredenciados = [
    ...(medicos || []).map(m => ({ ...m, tipo: "medico" as const })),
    ...(instituicoes || []).map(i => ({ ...i, tipo: "instituicao" as const }))
  ];

  const credenciadosFiltrados = todosCredenciados.filter(c => {
    if (filtroTipo !== "todos" && c.tipo !== filtroTipo) return false;
    if (filtroStatus !== "todos") {
      if (filtroStatus === "ativo" && c.ativo !== 1) return false;
      if (filtroStatus === "inativo" && c.ativo === 1) return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D9B9B]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "#2D9B9B" }}>
          Galeria de Logos
        </h1>
        <p className="text-muted-foreground">
          Visualize e gerencie todos os logos cadastrados dos parceiros credenciados
        </p>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Credenciado</Label>
              <Select value={filtroTipo} onValueChange={(v: any) => setFiltroTipo(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="medico">Médicos</SelectItem>
                  <SelectItem value="instituicao">Instituições</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={filtroStatus} onValueChange={(v: any) => setFiltroStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativo">Ativos</SelectItem>
                  <SelectItem value="inativo">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Logos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {credenciadosFiltrados.map((credenciado) => (
          <Card key={`${credenciado.tipo}-${credenciado.id}`} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              {/* Logo */}
              <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                {('logoUrl' in credenciado && credenciado.logoUrl) ? (
                  <img 
                    src={('logoUrl' in credenciado && credenciado.logoUrl ? credenciado.logoUrl : '/logo-placeholder.png') as string} 
                    alt={credenciado.nome}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <ImageIcon className="w-12 h-12" />
                    <span className="text-xs">Sem logo</span>
                  </div>
                )}
              </div>

              {/* Informações */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm line-clamp-2" title={credenciado.nome}>
                  {credenciado.nome}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="px-2 py-1 rounded-full bg-[#2D9B9B]/10 text-[#2D9B9B]">
                    {credenciado.tipo === "medico" ? "Médico" : "Instituição"}
                  </span>
                  <span className={`px-2 py-1 rounded-full ${credenciado.ativo === 1 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                    {credenciado.ativo === 1 ? "Ativo" : "Inativo"}
                  </span>
                </div>
                
                {/* Foto (se houver) */}
                {('fotoUrl' in credenciado && credenciado.fotoUrl) ? (
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground mb-1">Foto:</p>
                    <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                      <img 
                        src={('fotoUrl' in credenciado && credenciado.fotoUrl ? credenciado.fotoUrl : '/logo-placeholder.png') as string} 
                        alt="Foto"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Ações */}
              <div className="mt-4 pt-4 border-t flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                  onClick={() => {
                    // Redirecionar para o Admin com o credenciado selecionado
                    const tipo = credenciado.tipo === "medico" ? "medicos" : "servicos";
                    window.location.href = `/admin?tab=${tipo}&edit=${credenciado.id}`;
                  }}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                  onClick={() => {
                    if (confirm(`Tem certeza que deseja excluir ${credenciado.nome}?\n\nEsta ação não pode ser desfeita.`)) {
                      if (credenciado.tipo === "medico") {
                        // Excluir médico
                        toast.promise(
                          fetch(`/api/trpc/medicos.excluir?input=${JSON.stringify({ id: credenciado.id })}`, {
                            method: 'DELETE',
                          }).then(() => refetchMedicos()),
                          {
                            loading: 'Excluindo...',
                            success: 'Médico excluído com sucesso!',
                            error: 'Erro ao excluir médico',
                          }
                        );
                      } else {
                        // Excluir instituição
                        toast.promise(
                          fetch(`/api/trpc/instituicoes.excluir?input=${JSON.stringify({ id: credenciado.id })}`, {
                            method: 'DELETE',
                          }).then(() => refetchInstituicoes()),
                          {
                            loading: 'Excluindo...',
                            success: 'Instituição excluída com sucesso!',
                            error: 'Erro ao excluir instituição',
                          }
                        );
                      }
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {credenciadosFiltrados.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum credenciado encontrado com os filtros selecionados</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
