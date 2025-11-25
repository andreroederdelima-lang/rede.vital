import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { APP_LOGO } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share2, Download, Home } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import Footer from "@/components/Footer";

/**
 * Galeria pública de logos e fotos dos parceiros credenciados
 * Organizada por categorias para divulgação da rede
 */
export default function GaleriaParceiros() {
  const [activeTab, setActiveTab] = useState("todos");
  
  const { data: medicos = [], isLoading: loadingMedicos } = trpc.medicos.listar.useQuery({});
  const { data: instituicoes = [], isLoading: loadingInstituicoes } = trpc.instituicoes.listar.useQuery({});

  const servicosSaude = instituicoes.filter(inst => (inst as any).tipoServico === "servicos_saude");
  const outrosServicos = instituicoes.filter(inst => (inst as any).tipoServico === "outros_servicos");

  const handleCompartilhar = () => {
    const url = window.location.href;
    const texto = "Conheça nossa rede de parceiros credenciados Sua Saúde Vital!";
    
    if (navigator.share) {
      navigator.share({
        title: "Rede Credenciada Vital",
        text: texto,
        url: url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copiado para área de transferência!");
    }
  };

  const handleBaixarImagem = (url: string, nome: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${nome}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download iniciado!");
  };

  if (loadingMedicos || loadingInstituicoes) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando galeria...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.98_0.01_165)] to-[oklch(0.95_0.02_165)] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b-4 border-[#1e9d9f] shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={APP_LOGO} alt="Vital" className="h-16 md:h-20" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#1e9d9f]">
                  Galeria de Parceiros
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-1">
                  Nossa rede credenciada
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Início</span>
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleCompartilhar}>
                <Share2 className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Compartilhar</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-8">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="medicos">Médicos</TabsTrigger>
            <TabsTrigger value="saude">Serviços de Saúde</TabsTrigger>
            <TabsTrigger value="outros">Outros Serviços</TabsTrigger>
          </TabsList>

          {/* Tab Todos */}
          <TabsContent value="todos">
            <div className="space-y-8">
              {/* Médicos */}
              {medicos.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-[#1e9d9f] mb-4">Médicos</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {medicos.map((medico) => (
                      <ParceiroCard
                        key={`medico-${medico.id}`}
                        nome={medico.nome}
                        categoria={medico.especialidade}
                        logoUrl={(medico as any).logoUrl}
                        // fotoUrl={medico.fotoUrl}
                        onBaixar={handleBaixarImagem}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Serviços de Saúde */}
              {servicosSaude.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-[#1e9d9f] mb-4">Serviços de Saúde</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {servicosSaude.map((inst) => (
                      <ParceiroCard
                        key={`saude-${inst.id}`}
                        nome={inst.nome}
                        categoria={inst.categoria}
                        logoUrl={(inst as any).logoUrl}
                        // fotoUrl={inst.fotoUrl}
                        onBaixar={handleBaixarImagem}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Outros Serviços */}
              {outrosServicos.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-[#1e9d9f] mb-4">Outros Serviços</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {outrosServicos.map((inst) => (
                      <ParceiroCard
                        key={`outros-${inst.id}`}
                        nome={inst.nome}
                        categoria={inst.categoria}
                        logoUrl={(inst as any).logoUrl}
                        // fotoUrl={inst.fotoUrl}
                        onBaixar={handleBaixarImagem}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          </TabsContent>

          {/* Tab Médicos */}
          <TabsContent value="medicos">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {medicos.map((medico) => (
                <ParceiroCard
                  key={`medico-${medico.id}`}
                  nome={medico.nome}
                  categoria={medico.especialidade}
                  logoUrl={(medico as any).logoUrl}
                  // fotoUrl={medico.fotoUrl}
                  onBaixar={handleBaixarImagem}
                />
              ))}
            </div>
          </TabsContent>

          {/* Tab Serviços de Saúde */}
          <TabsContent value="saude">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {servicosSaude.map((inst) => (
                <ParceiroCard
                  key={`saude-${inst.id}`}
                  nome={inst.nome}
                  categoria={inst.categoria}
                  logoUrl={(inst as any).logoUrl}
                  // fotoUrl={inst.fotoUrl}
                  onBaixar={handleBaixarImagem}
                />
              ))}
            </div>
          </TabsContent>

          {/* Tab Outros Serviços */}
          <TabsContent value="outros">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {outrosServicos.map((inst) => (
                <ParceiroCard
                  key={`outros-${inst.id}`}
                  nome={inst.nome}
                  categoria={inst.categoria}
                  logoUrl={(inst as any).logoUrl}
                  // fotoUrl={inst.fotoUrl}
                  onBaixar={handleBaixarImagem}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}

interface ParceiroCardProps {
  nome: string;
  categoria: string;
  logoUrl?: string | null;
  // fotoUrl?: string | null;
  onBaixar: (url: string, nome: string) => void;
}

function ParceiroCard({ nome, categoria, logoUrl, /* fotoUrl, */ onBaixar }: ParceiroCardProps) {
  const imagemPrincipal = logoUrl /* || fotoUrl */;

  if (!imagemPrincipal) {
    return null; // Não exibir se não houver imagem
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <CardContent className="p-0">
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          <img
            src={imagemPrincipal}
            alt={nome}
            className="w-full h-full object-contain p-4"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onBaixar(imagemPrincipal, nome)}
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar
            </Button>
          </div>
        </div>
        <div className="p-3 bg-white">
          <h3 className="font-semibold text-sm text-gray-900 truncate">{nome}</h3>
          <p className="text-xs text-gray-600 truncate capitalize">{categoria}</p>
        </div>
      </CardContent>
    </Card>
  );
}
