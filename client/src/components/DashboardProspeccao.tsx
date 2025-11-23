import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CIDADES_FOCO } from "../../../shared/cidades";
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";

export default function DashboardProspeccao() {
  const { data: stats, isLoading } = trpc.prospeccao.estatisticasCobertura.useQuery();

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Carregando estatísticas...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhuma estatística disponível
      </div>
    );
  }

  // Processar dados para criar mapa de cobertura com contadores separados
  const coberturaMap = new Map<string, {
    medicos: number;
    servicosSaude: number;
    outrosServicos: number;
  }>();
  
  // Inicializar todas as cidades
  CIDADES_FOCO.forEach(cidade => {
    coberturaMap.set(cidade, {
      medicos: 0,
      servicosSaude: 0,
      outrosServicos: 0
    });
  });
  
  // Processar médicos
  if ('medicos' in stats) {
    stats.medicos.forEach((item: any) => {
      const cidade = coberturaMap.get(item.municipio);
      if (cidade) {
        cidade.medicos += item.quantidade;
      }
    });
  }

  // Processar instituições - separar por tipo de serviço
  if ('instituicoes' in stats) {
    stats.instituicoes.forEach((item: any) => {
      const cidade = coberturaMap.get(item.municipio);
      if (cidade) {
        if (item.tipoServico === 'servicos_saude') {
          cidade.servicosSaude += item.quantidade;
        } else if (item.tipoServico === 'outros_servicos') {
          cidade.outrosServicos += item.quantidade;
        }
      }
    });
  }

  // Função para determinar cor do indicador
  const getIndicadorCor = (quantidade: number) => {
    if (quantidade === 0) return { color: "bg-red-500", icon: AlertCircle, text: "Lacuna Crítica" };
    if (quantidade === 1) return { color: "bg-yellow-500", icon: AlertTriangle, text: "Abaixo da Meta" };
    return { color: "bg-green-500", icon: CheckCircle2, text: "Meta Atingida" };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1e9d9f]">Dashboard de Prospecção</h2>
          <p className="text-muted-foreground">
            Meta: 2+ credenciados por tipo em cada cidade
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm">0 credenciados</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm">1 credenciado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm">2+ credenciados</span>
          </div>
        </div>
      </div>

      {/* Mapa de Cobertura por Cidade */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CIDADES_FOCO.map((cidade) => {
          const cobertura = coberturaMap.get(cidade) || { medicos: 0, servicosSaude: 0, outrosServicos: 0 };
          const totalCredenciados = cobertura.medicos + cobertura.servicosSaude + cobertura.outrosServicos;
          
          return (
            <Card key={cidade}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {cidade}
                  <Badge variant={totalCredenciados >= 2 ? "default" : totalCredenciados === 1 ? "secondary" : "destructive"}>
                    {totalCredenciados} credenciados
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {totalCredenciados === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                    <p className="text-sm">Nenhum credenciado</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Médicos */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 flex-1">
                        <div className={`h-3 w-3 rounded-full ${getIndicadorCor(cobertura.medicos).color}`}></div>
                        <span className="font-medium">Médicos</span>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {cobertura.medicos}
                      </Badge>
                    </div>
                    
                    {/* Serviços de Saúde */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 flex-1">
                        <div className={`h-3 w-3 rounded-full ${getIndicadorCor(cobertura.servicosSaude).color}`}></div>
                        <span className="font-medium">Serviços de Saúde</span>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {cobertura.servicosSaude}
                      </Badge>
                    </div>
                    
                    {/* Outros Serviços */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 flex-1">
                        <div className={`h-3 w-3 rounded-full ${getIndicadorCor(cobertura.outrosServicos).color}`}></div>
                        <span className="font-medium">Outros Serviços</span>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {cobertura.outrosServicos}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Resumo Geral */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Geral</CardTitle>
          <CardDescription>Estatísticas consolidadas de cobertura</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#1e9d9f]">
                {CIDADES_FOCO.length}
              </div>
              <p className="text-sm text-muted-foreground">Cidades Foco</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {Array.from(coberturaMap.values()).filter(c => 
                  (c.medicos + c.servicosSaude + c.outrosServicos) >= 2
                ).length}
              </div>
              <p className="text-sm text-muted-foreground">Cidades com Meta Atingida</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {Array.from(coberturaMap.values()).filter(c => {
                  const total = c.medicos + c.servicosSaude + c.outrosServicos;
                  return total === 1;
                }).length}
              </div>
              <p className="text-sm text-muted-foreground">Cidades Abaixo da Meta</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {CIDADES_FOCO.filter(c => !coberturaMap.has(c)).length}
              </div>
              <p className="text-sm text-muted-foreground">Cidades sem Cobertura</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
