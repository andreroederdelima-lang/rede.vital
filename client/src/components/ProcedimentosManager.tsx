import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export interface Procedimento {
  id?: number;
  nome: string;
  valorParticular: string;
  valorAssinante: string;
}

interface ProcedimentosManagerProps {
  procedimentos: Procedimento[];
  onChange: (procedimentos: Procedimento[]) => void;
  readonly?: boolean;
}

export default function ProcedimentosManager({ 
  procedimentos, 
  onChange,
  readonly = false 
}: ProcedimentosManagerProps) {
  
  const adicionarProcedimento = () => {
    onChange([...procedimentos, { nome: "", valorParticular: "", valorAssinante: "" }]);
  };

  const removerProcedimento = (index: number) => {
    const novos = procedimentos.filter((_, i) => i !== index);
    onChange(novos);
  };

  const atualizarProcedimento = (index: number, campo: keyof Procedimento, valor: string) => {
    const novos = [...procedimentos];
    novos[index] = { ...novos[index], [campo]: valor };
    onChange(novos);
  };

  const calcularDesconto = (valorParticular: string, valorAssinante: string): string => {
    const vp = parseFloat(valorParticular);
    const va = parseFloat(valorAssinante);
    
    if (isNaN(vp) || isNaN(va) || vp === 0) return "0";
    
    const desconto = ((vp - va) / vp) * 100;
    return desconto.toFixed(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Procedimentos/Serviços Oferecidos</Label>
        {!readonly && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={adicionarProcedimento}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Procedimento
          </Button>
        )}
      </div>

      {procedimentos.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">
          Nenhum procedimento cadastrado. Clique em "Adicionar Procedimento" para começar.
        </p>
      )}

      <div className="space-y-4">
        {procedimentos.map((proc, index) => {
          const desconto = calcularDesconto(proc.valorParticular, proc.valorAssinante);
          
          return (
            <div key={index} className="border rounded-lg p-4 space-y-3 bg-muted/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Procedimento #{index + 1}
                </span>
                {!readonly && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removerProcedimento(index)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid gap-3">
                <div>
                  <Label htmlFor={`proc-nome-${index}`}>Nome do Procedimento/Serviço *</Label>
                  <Input
                    id={`proc-nome-${index}`}
                    value={proc.nome}
                    onChange={(e) => atualizarProcedimento(index, "nome", e.target.value)}
                    placeholder="Ex: Consulta, Exame de Sangue, Raio-X..."
                    required
                    disabled={readonly}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor={`proc-particular-${index}`}>Valor Particular (R$)</Label>
                    <Input
                      id={`proc-particular-${index}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={proc.valorParticular}
                      onChange={(e) => atualizarProcedimento(index, "valorParticular", e.target.value)}
                      placeholder="0.00"
                      disabled={readonly}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`proc-assinante-${index}`}>Valor Assinante Vital (R$)</Label>
                    <Input
                      id={`proc-assinante-${index}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={proc.valorAssinante}
                      onChange={(e) => atualizarProcedimento(index, "valorAssinante", e.target.value)}
                      placeholder="0.00"
                      disabled={readonly}
                    />
                  </div>

                  <div>
                    <Label>Desconto Calculado</Label>
                    <div className="h-10 px-3 py-2 border rounded-md bg-muted flex items-center justify-center font-semibold text-primary">
                      {desconto}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {procedimentos.length > 0 && !readonly && (
        <p className="text-xs text-muted-foreground">
          * Campos obrigatórios. Os valores são opcionais mas recomendados para melhor divulgação.
        </p>
      )}
    </div>
  );
}
