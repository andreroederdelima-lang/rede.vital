import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { VITAL_COLORS } from "@shared/colors";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ModalAvaliacaoProps {
  open: boolean;
  onClose: () => void;
  tipoCredenciado: "medico" | "instituicao";
  credenciadoId: number;
  nomeCredenciado: string;
}

export function ModalAvaliacao({
  open,
  onClose,
  tipoCredenciado,
  credenciadoId,
  nomeCredenciado,
}: ModalAvaliacaoProps) {
  const [nota, setNota] = useState(0);
  const [hoverNota, setHoverNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [nomeAvaliador, setNomeAvaliador] = useState("");
  const [emailAvaliador, setEmailAvaliador] = useState("");
  const [telefoneAvaliador, setTelefoneAvaliador] = useState("");

  const criarAvaliacao = trpc.avaliacoes.criar.useMutation({
    onSuccess: () => {
      toast.success("Avaliação enviada com sucesso! Obrigado pelo feedback.");
      resetForm();
      onClose();
    },
    onError: (error) => {
      toast.error("Erro ao enviar avaliação: " + error.message);
    },
  });

  const resetForm = () => {
    setNota(0);
    setHoverNota(0);
    setComentario("");
    setNomeAvaliador("");
    setEmailAvaliador("");
    setTelefoneAvaliador("");
  };

  const handleSubmit = () => {
    if (nota === 0) {
      toast.error("Por favor, selecione uma nota de 1 a 5 estrelas");
      return;
    }

    criarAvaliacao.mutate({
      tipoCredenciado,
      credenciadoId,
      nomeCredenciado,
      nota,
      comentario: comentario.trim() || undefined,
      nomeAvaliador: nomeAvaliador.trim() || undefined,
      emailAvaliador: emailAvaliador.trim() || undefined,
      telefoneAvaliador: telefoneAvaliador.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle style={{ color: VITAL_COLORS.turquoise }}>
            Avaliar {nomeCredenciado}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nota com estrelas */}
          <div className="space-y-2">
            <Label>Como você avalia este credenciado?</Label>
            <div className="flex gap-2 justify-center py-2">
              {[1, 2, 3, 4, 5].map((estrela) => (
                <button
                  key={estrela}
                  type="button"
                  onClick={() => setNota(estrela)}
                  onMouseEnter={() => setHoverNota(estrela)}
                  onMouseLeave={() => setHoverNota(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    fill={
                      estrela <= (hoverNota || nota)
                        ? VITAL_COLORS.gold
                        : "transparent"
                    }
                    stroke={
                      estrela <= (hoverNota || nota)
                        ? VITAL_COLORS.gold
                        : VITAL_COLORS.darkGray
                    }
                  />
                </button>
              ))}
            </div>
            {nota > 0 && (
              <p className="text-center text-sm" style={{ color: VITAL_COLORS.darkGray }}>
                {nota === 1 && "Muito insatisfeito"}
                {nota === 2 && "Insatisfeito"}
                {nota === 3 && "Regular"}
                {nota === 4 && "Satisfeito"}
                {nota === 5 && "Muito satisfeito"}
              </p>
            )}
          </div>

          {/* Comentário */}
          <div className="space-y-2">
            <Label htmlFor="comentario">Comentário (opcional)</Label>
            <Textarea
              id="comentario"
              placeholder="Conte-nos sobre sua experiência..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={4}
            />
          </div>

          {/* Dados do avaliador (opcionais) */}
          <div className="space-y-2">
            <Label htmlFor="nome">Seu nome (opcional)</Label>
            <Input
              id="nome"
              type="text"
              placeholder="Nome"
              value={nomeAvaliador}
              onChange={(e) => setNomeAvaliador(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Seu e-mail (opcional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@exemplo.com"
              value={emailAvaliador}
              onChange={(e) => setEmailAvaliador(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Seu telefone (opcional)</Label>
            <Input
              id="telefone"
              type="tel"
              placeholder="(00) 00000-0000"
              value={telefoneAvaliador}
              onChange={(e) => setTelefoneAvaliador(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onClose();
            }}
            disabled={criarAvaliacao.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={criarAvaliacao.isPending}
            style={{
              backgroundColor: VITAL_COLORS.turquoise,
              color: VITAL_COLORS.white,
            }}
          >
            {criarAvaliacao.isPending ? "Enviando..." : "Enviar Avaliação"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
