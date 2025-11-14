import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { APP_LOGO, APP_TITLE } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, MapPin, Percent, User, Building2, Search, X } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const [busca, setBusca] = useState("");
  const [especialidade, setEspecialidade] = useState<string>("");
  const [municipio, setMunicipio] = useState<string>("");
  const [categoria, setCategoria] = useState<string>("");
  const [descontoMinimo, setDescontoMinimo] = useState<number | undefined>();
  const [tipoCredenciado, setTipoCredenciado] = useState<"medicos" | "instituicoes">("medicos");

  const { data: medicos = [], isLoading: loadingMedicos } = trpc.medicos.listar.useQuery({
    busca: busca || undefined,
    especialidade: especialidade || undefined,
    municipio: municipio || undefined,
    descontoMinimo,
  }, { enabled: tipoCredenciado === "medicos" });

  const { data: instituicoes = [], isLoading: loadingInstituicoes } = trpc.instituicoes.listar.useQuery({
    busca: busca || undefined,
    categoria: categoria || undefined,
    municipio: municipio || undefined,
    descontoMinimo,
  }, { enabled: tipoCredenciado === "instituicoes" });

  const { data: especialidades = [] } = trpc.medicos.listarEspecialidades.useQuery();
  const { data: municipios = [] } = trpc.municipios.listar.useQuery();

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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container py-6">
          <div className="flex items-center gap-4">
            <img src={APP_LOGO} alt="Vital Logo" className="h-16 w-auto" />
            <div>
              <h1 className="text-3xl font-bold">Guia de Credenciados</h1>
              <p className="text-primary-foreground/90 text-sm mt-1">
                Rede credenciada para encaminhamentos e orientações médicas
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Link href="/admin">
              <Button variant="secondary" size="sm">
                <User className="h-4 w-4 mr-2" />
                Área Administrativa
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Tabs: Médicos / Instituições */}
        <Tabs value={tipoCredenciado} onValueChange={(v) => {
          setTipoCredenciado(v as "medicos" | "instituicoes");
          limparFiltros();
        }} className="mb-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="medicos" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Médicos
            </TabsTrigger>
            <TabsTrigger value="instituicoes" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Instituições
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Busca e Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar Credenciados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Campo de busca global */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={tipoCredenciado === "medicos" 
                  ? "Buscar por nome do médico, especialidade ou clínica..." 
                  : "Buscar por nome da instituição ou endereço..."}
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
                      <SelectItem key={esp} value={esp}>{esp}</SelectItem>
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
                    <SelectItem value="clinica">Clínica</SelectItem>
                    <SelectItem value="farmacia">Farmácia</SelectItem>
                    <SelectItem value="laboratorio">Laboratório</SelectItem>
                    <SelectItem value="academia">Academia</SelectItem>
                    <SelectItem value="hospital">Hospital</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              )}

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

              <Select 
                value={descontoMinimo?.toString() || "all"} 
                onValueChange={(v) => setDescontoMinimo(v === "all" ? undefined : parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Desconto mínimo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Qualquer desconto</SelectItem>
                  <SelectItem value="10">Mín. 10%</SelectItem>
                  <SelectItem value="20">Mín. 20%</SelectItem>
                  <SelectItem value="30">Mín. 30%</SelectItem>
                  <SelectItem value="50">Mín. 50%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filtrosAtivos && (
              <Button variant="outline" size="sm" onClick={limparFiltros}>
                <X className="h-4 w-4 mr-2" />
                Limpar filtros
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Resultados */}
        {tipoCredenciado === "medicos" ? (
          <div className="space-y-4">
            {loadingMedicos ? (
              <div className="text-center py-12 text-muted-foreground">
                Carregando...
              </div>
            ) : medicos.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Nenhum médico encontrado com os filtros selecionados.
                </CardContent>
              </Card>
            ) : (
              medicos.map((medico) => (
                <Card key={medico.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-xl font-semibold text-primary">{medico.nome}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {medico.especialidade}
                            {medico.subespecialidade && ` • ${medico.subespecialidade}`}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">
                            <MapPin className="h-3 w-3 mr-1" />
                            {medico.municipio}
                          </Badge>
                          <Badge variant="outline">
                            {medico.tipoAtendimento === "presencial" ? "Presencial" :
                             medico.tipoAtendimento === "telemedicina" ? "Telemedicina" : "Presencial e Telemedicina"}
                          </Badge>
                          {medico.descontoPercentual > 0 && (
                            <Badge className="bg-accent text-accent-foreground">
                              <Percent className="h-3 w-3 mr-1" />
                              {medico.descontoPercentual}% desconto
                            </Badge>
                          )}
                        </div>

                        <div className="text-sm space-y-1">
                          <p className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                            <span>{medico.endereco}</span>
                          </p>
                          {(medico.telefone || medico.whatsapp) && (
                            <p className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{medico.telefone || medico.whatsapp}</span>
                            </p>
                          )}
                        </div>

                        {medico.observacoes && (
                          <p className="text-sm text-muted-foreground italic">
                            {medico.observacoes}
                          </p>
                        )}

                        {medico.contatoParceria && (
                          <p className="text-xs text-muted-foreground">
                            Parceria: {medico.contatoParceria}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {loadingInstituicoes ? (
              <div className="text-center py-12 text-muted-foreground">
                Carregando...
              </div>
            ) : instituicoes.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Nenhuma instituição encontrada com os filtros selecionados.
                </CardContent>
              </Card>
            ) : (
              instituicoes.map((inst) => (
                <Card key={inst.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-xl font-semibold text-primary">{inst.nome}</h3>
                          <p className="text-sm text-muted-foreground mt-1 capitalize">
                            {inst.categoria}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">
                            <MapPin className="h-3 w-3 mr-1" />
                            {inst.municipio}
                          </Badge>
                          {inst.descontoPercentual > 0 && (
                            <Badge className="bg-accent text-accent-foreground">
                              <Percent className="h-3 w-3 mr-1" />
                              {inst.descontoPercentual}% desconto
                            </Badge>
                          )}
                        </div>

                        <div className="text-sm space-y-1">
                          <p className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                            <span>{inst.endereco}</span>
                          </p>
                          {inst.telefone && (
                            <p className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{inst.telefone}</span>
                            </p>
                          )}
                          {inst.email && (
                            <p className="text-sm">
                              Email: {inst.email}
                            </p>
                          )}
                        </div>

                        {inst.observacoes && (
                          <p className="text-sm text-muted-foreground italic">
                            {inst.observacoes}
                          </p>
                        )}

                        {inst.contatoParceria && (
                          <p className="text-xs text-muted-foreground">
                            Parceria: {inst.contatoParceria}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-muted mt-12 py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 Sua Saúde Vital - Todos os direitos reservados</p>
          <p className="mt-1">Atendendo Timbó, Indaial, Pomerode, Rodeio, Benedito Novo, Rio dos Cedros, Apiúna e Ascurra</p>
        </div>
      </footer>
    </div>
  );
}
