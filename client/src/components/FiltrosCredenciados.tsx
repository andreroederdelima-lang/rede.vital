import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { CATEGORIAS_SERVICOS_SAUDE, CATEGORIAS_OUTROS_SERVICOS } from "@shared/categorias";

interface FiltrosCredenciadosProps {
  // Estados de filtros
  busca: string;
  setBusca: (value: string) => void;
  especialidade: string;
  setEspecialidade: (value: string) => void;
  municipio: string;
  setMunicipio: (value: string) => void;
  categoria: string;
  setCategoria: (value: string) => void;
  descontoMinimo: number | undefined;
  setDescontoMinimo: (value: number | undefined) => void;
  tipoCredenciado: "medicos" | "servicos_saude" | "outros_servicos";
  setTipoCredenciado: (value: "medicos" | "servicos_saude" | "outros_servicos") => void;
  
  // Dados para os selects
  especialidades: string[];
  municipios: string[];
  
  // Botões adicionais (renderizados após os filtros)
  botoesAdicionais?: React.ReactNode;
}

export function FiltrosCredenciados({
  busca,
  setBusca,
  especialidade,
  setEspecialidade,
  municipio,
  setMunicipio,
  categoria,
  setCategoria,
  descontoMinimo,
  setDescontoMinimo,
  tipoCredenciado,
  setTipoCredenciado,
  especialidades,
  municipios,
  botoesAdicionais,
}: FiltrosCredenciadosProps) {
  const limparFiltros = () => {
    setBusca("");
    setEspecialidade("");
    setMunicipio("");
    setCategoria("");
    setDescontoMinimo(undefined);
  };

  const filtrosAtivos = useMemo(() => {
    return !!(busca || especialidade || municipio || categoria || descontoMinimo);
  }, [busca, especialidade, municipio, categoria, descontoMinimo]);

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        {/* Tabs de Tipo de Credenciado */}
        <Tabs value={tipoCredenciado} onValueChange={(v) => setTipoCredenciado(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="medicos">Médicos</TabsTrigger>
            <TabsTrigger value="servicos_saude">Serviços de Saúde</TabsTrigger>
            <TabsTrigger value="outros_servicos">Outros Serviços</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Campo de Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={
              tipoCredenciado === "medicos"
                ? "Buscar por nome do médico..."
                : "Buscar por nome do estabelecimento..."
            }
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tipoCredenciado === "medicos" ? (
            <Select value={especialidade || "all"} onValueChange={(v) => setEspecialidade(v === "all" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as especialidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as especialidades</SelectItem>
                {especialidades.map((esp) => (
                  <SelectItem key={esp} value={esp}>
                    {esp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Select value={categoria || "all"} onValueChange={(v) => setCategoria(v === "all" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {(tipoCredenciado === "servicos_saude" ? CATEGORIAS_SERVICOS_SAUDE : CATEGORIAS_OUTROS_SERVICOS).map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={municipio || "all"} onValueChange={(v) => setMunicipio(v === "all" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as cidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as cidades</SelectItem>
              {municipios.map((mun) => (
                <SelectItem key={mun} value={mun}>
                  {mun}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={descontoMinimo?.toString() || "all"}
            onValueChange={(v) => setDescontoMinimo(v === "all" ? undefined : parseInt(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Desconto mínimo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Qualquer desconto</SelectItem>
              <SelectItem value="10">Mínimo 10%</SelectItem>
              <SelectItem value="15">Mínimo 15%</SelectItem>
              <SelectItem value="20">Mínimo 20%</SelectItem>
              <SelectItem value="25">Mínimo 25%</SelectItem>
              <SelectItem value="30">Mínimo 30%</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <div className="flex gap-2">
            {filtrosAtivos && (
              <Button variant="outline" size="sm" onClick={limparFiltros}>
                <X className="h-4 w-4 mr-2" />
                Limpar filtros
              </Button>
            )}
          </div>
          {botoesAdicionais && <div className="flex gap-2">{botoesAdicionais}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
