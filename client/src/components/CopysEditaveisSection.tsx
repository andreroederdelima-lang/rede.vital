import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Edit2, Save, X, Copy, Share2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

const VITAL_COLORS = {
  turquoise: "#2B9C9C",
  beige: "#D4C5A0",
  white: "#FFFFFF",
  darkGray: "#333333",
  mediumGray: "#666666",
  lightGray: "#F5F5F5",
};

export default function CopysEditaveisSection() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  
  const { data: copys = [], refetch } = trpc.copys.listar.useQuery();
  const atualizarCopy = trpc.copys.atualizar.useMutation({
    onSuccess: () => {
      toast.success("Copy atualizada com sucesso!");
      refetch();
      setEditando(null);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar copy");
    },
  });
  
  const [editando, setEditando] = useState<number | null>(null);
  const [tituloEdit, setTituloEdit] = useState("");
  const [conteudoEdit, setConteudoEdit] = useState("");

  const copiarTexto = (texto: string) => {
    navigator.clipboard.writeText(texto);
    toast.success("Texto copiado!");
  };

  const compartilharTexto = (titulo: string, conteudo: string) => {
    if (navigator.share) {
      navigator.share({
        title: titulo,
        text: conteudo,
      }).catch(() => {
        copiarTexto(conteudo);
      });
    } else {
      copiarTexto(conteudo);
    }
  };

  const iniciarEdicao = (copy: any) => {
    setEditando(copy.id);
    setTituloEdit(copy.titulo);
    setConteudoEdit(copy.conteudo);
  };

  const cancelarEdicao = () => {
    setEditando(null);
    setTituloEdit("");
    setConteudoEdit("");
  };

  const salvarEdicao = () => {
    if (!editando) return;
    
    atualizarCopy.mutate({
      id: editando,
      titulo: tituloEdit,
      conteudo: conteudoEdit,
    });
  };

  // Agrupar copys por categoria
  const copysPlanos = copys.filter(c => c.categoria === "planos");
  const copysPromocoes = copys.filter(c => c.categoria === "promocoes");
  const copysOutros = copys.filter(c => c.categoria === "outros");

  return (
    <>
      {/* Planos */}
      {copysPlanos.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: VITAL_COLORS.turquoise }}>
            📋 Textos dos Planos
          </h2>
          <div className="space-y-4">
            {copysPlanos.map((copy) => (
              <Card key={copy.id} className="p-4" style={{ backgroundColor: VITAL_COLORS.white }}>
                {editando === copy.id ? (
                  // Modo de edição
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Título</label>
                      <Input
                        value={tituloEdit}
                        onChange={(e) => setTituloEdit(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Conteúdo</label>
                      <Textarea
                        value={conteudoEdit}
                        onChange={(e) => setConteudoEdit(e.target.value)}
                        rows={15}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={salvarEdicao}
                        style={{ backgroundColor: VITAL_COLORS.turquoise }}
                        disabled={atualizarCopy.isPending}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Salvar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={cancelarEdicao}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Modo de visualização
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg" style={{ color: VITAL_COLORS.darkGray }}>
                        {copy.titulo}
                      </h3>
                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => iniciarEdicao(copy)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg mb-3">
                      <p className="text-sm whitespace-pre-wrap" style={{ color: VITAL_COLORS.darkGray }}>
                        {copy.conteudo}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => copiarTexto(copy.conteudo)}
                        style={{ backgroundColor: VITAL_COLORS.turquoise, color: VITAL_COLORS.white }}
                      >
                        <Copy className="mr-1 h-4 w-4" />
                        Copiar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => compartilharTexto(copy.titulo, copy.conteudo)}
                      >
                        <Share2 className="mr-1 h-4 w-4" />
                        Compartilhar
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Promoções */}
      {copysPromocoes.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: VITAL_COLORS.turquoise }}>
            🎁 Textos de Promoções
          </h2>
          <div className="space-y-4">
            {copysPromocoes.map((copy) => (
              <Card key={copy.id} className="p-4" style={{ backgroundColor: VITAL_COLORS.white }}>
                {editando === copy.id ? (
                  // Modo de edição
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Título</label>
                      <Input
                        value={tituloEdit}
                        onChange={(e) => setTituloEdit(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Conteúdo</label>
                      <Textarea
                        value={conteudoEdit}
                        onChange={(e) => setConteudoEdit(e.target.value)}
                        rows={15}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={salvarEdicao}
                        style={{ backgroundColor: VITAL_COLORS.turquoise }}
                        disabled={atualizarCopy.isPending}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Salvar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={cancelarEdicao}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Modo de visualização
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg" style={{ color: VITAL_COLORS.darkGray }}>
                        {copy.titulo}
                      </h3>
                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => iniciarEdicao(copy)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg mb-3">
                      <p className="text-sm whitespace-pre-wrap" style={{ color: VITAL_COLORS.darkGray }}>
                        {copy.conteudo}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => copiarTexto(copy.conteudo)}
                        style={{ backgroundColor: VITAL_COLORS.turquoise, color: VITAL_COLORS.white }}
                      >
                        <Copy className="mr-1 h-4 w-4" />
                        Copiar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => compartilharTexto(copy.titulo, copy.conteudo)}
                      >
                        <Share2 className="mr-1 h-4 w-4" />
                        Compartilhar
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
