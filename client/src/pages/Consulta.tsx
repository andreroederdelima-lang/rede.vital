import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { APP_LOGO, APP_TITLE } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { Phone, MapPin, User, Building2, Search, X, MessageCircle, Share2, Copy, Lock } from "lucide-react";
import { formatWhatsAppLink, abrirComoChegar } from "@/lib/utils";
import { Link } from "wouter";
import { toast } from "sonner";
import { MainNav } from "@/components/MainNav";
import { CredenciadoListItem } from "@/components/CredenciadoListItem";
import { ModalAvaliacao } from "@/components/ModalAvaliacao";
import Footer from "@/components/Footer";
import { CATEGORIAS_SERVICOS_SAUDE, CATEGORIAS_OUTROS_SERVICOS } from "@shared/categorias";
import { VITAL_COLORS, MUNICIPIOS_VALE_ITAJAI } from "@shared/colors";

export default function Consulta() {
  const renderMainNav = () => <MainNav />;
  const [busca, setBusca] = useState("");
  const [especialidade, setEspecialidade] = useState<string>("");
  const [municipio, setMunicipio] = useState<string>("");
  const [categoria, setCategoria] = useState<string>("");
  const [tipoCredenciado, setTipoCredenciado] = useState<"medicos" | "servicos_saude" | "outros_servicos">("medicos");
  const [modalAvaliacaoOpen, setModalAvaliacaoOpen] = useState(false);
  const [credenciadoSelecionado, setCredenciadoSelecionado] = useState<{
    tipo: "medico" | "instituicao";
    id: number;
    nome: string;
  } | null>(null);

  const { data: medicos = [], isLoading: loadingMedicos } = trpc.medicos.listar.useQuery({
    busca: busca || undefined,
    especialidade: especialidade && especialidade !== "_all" ? especialidade : undefined,
    municipio: municipio || undefined,
  }, { enabled: tipoCredenciado === "medicos" });

  const { data: instituicoes = [], isLoading: loadingInstituicoes } = trpc.instituicoes.listar.useQuery({
    busca: busca || undefined,
    categoria: categoria && categoria !== "_all" ? categoria : undefined,
    municipio: municipio || undefined,
    tipoServico: tipoCredenciado === "servicos_saude" ? "servicos_saude" : tipoCredenciado === "outros_servicos" ? "outros_servicos" : undefined,
  }, { enabled: tipoCredenciado !== "medicos" });

  const { data: especialidades = [] } = trpc.medicos.listarEspecialidades.useQuery();

  const limparFiltros = () => {
    setBusca("");
    setEspecialidade("");
    setMunicipio("");
    setCategoria("");
  };

  const filtrosAtivos = useMemo(() => {
    return !!(busca || especialidade || municipio || categoria);
  }, [busca, especialidade, municipio, categoria]);

  const compartilharCredenciado = (nome: string, endereco: string, telefone?: string) => {
    // Formato organizado e visual para WhatsApp
    const texto = `Confira este credenciado da Rede Vital:\n\n${nome}\n${endereco}${telefone ? `\nTelefone: ${telefone}` : ''}\n\nSua Saúde Vital - sempre ao seu lado.\nPara ver todos os credenciados acesse: ${window.location.origin}`;
    
    // Abre WhatsApp diretamente com o texto formatado
    const textoEncoded = encodeURIComponent(texto);
    const whatsappUrl = `https://wa.me/?text=${textoEncoded}`;
    
    window.open(whatsappUrl, '_blank');
  };



  return (
    <div className="min-h-screen" style={{ backgroundColor: VITAL_COLORS.white }}>
      {renderMainNav()}
      
      {/* Header com Logo Centralizada */}
      <header className="py-12 px-4" style={{ backgroundColor: VITAL_COLORS.lightGray }}>
        <div className="container max-w-6xl mx-auto text-center">
          <img 
            src={APP_LOGO} 
            alt="Vital Serviços Médicos" 
            className="mx-auto mb-6 h-24 object-contain"
          />
          <h1 
            className="text-4xl font-semibold mb-3" 
            style={{ color: VITAL_COLORS.turquoise }}
          >
            GUIA DO ASSINANTE
          </h1>
          <p 
            className="text-lg mt-2 max-w-3xl mx-auto" 
            style={{ color: VITAL_COLORS.darkGray }}
          >
            Encontre aqui todos os parceiros credenciados da Sua Saúde Vital na região do Vale do Itajaí. Navegue pelas categorias, escolha sua cidade ou utilize a busca para localizar rapidamente clínicas, especialistas, serviços de saúde e demais parceiros onde você possui condições exclusivas como assinante.
          </p>
          <p 
            className="text-sm mt-3 max-w-3xl mx-auto" 
            style={{ color: VITAL_COLORS.mediumGray }}
          >
            Para acessar a Busca de Parceiros a nível Nacional - acesse sua área do cliente (+34.100 farmácias | +3.100 médicos, clínicas e hospitais | +350 laboratórios).
          </p>
        </div>
      </header>

      {/* Parceiros Principais */}
      <section className="py-8 px-4" style={{ backgroundColor: VITAL_COLORS.white }}>
        <div className="container max-w-6xl mx-auto">
          <h2 
            className="text-center text-xl font-semibold mb-6" 
            style={{ color: VITAL_COLORS.darkGray }}
          >
            Nossos principais parceiros pelo Brasil
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <img src="/parceiros-nacionais.jpeg" alt="Parceiros Nacionais" className="max-w-full h-auto" />
          </div>
        </div>
      </section>

      {/* Filtros Principais */}
      <section className="py-12 px-4" style={{ backgroundColor: VITAL_COLORS.lightGray }}>
        <div className="container max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { value: "medicos", label: "Médicos" },
              { value: "servicos_saude", label: "Serviços de Saúde" },
              { value: "outros_servicos", label: "Outros Serviços" },
            ].map((tipo) => (
              <button
                key={tipo.value}
                onClick={() => {
                  setTipoCredenciado(tipo.value as any);
                  setCategoria("");
                  setEspecialidade("");
                }}
                className="py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200"
                style={{
                  border: `1px solid ${VITAL_COLORS.turquoise}`,
                  backgroundColor: tipoCredenciado === tipo.value ? VITAL_COLORS.turquoise : VITAL_COLORS.white,
                  color: tipoCredenciado === tipo.value ? VITAL_COLORS.white : VITAL_COLORS.turquoise,
                }}
                onMouseEnter={(e) => {
                  if (tipoCredenciado !== tipo.value) {
                    e.currentTarget.style.backgroundColor = VITAL_COLORS.beige;
                  }
                }}
                onMouseLeave={(e) => {
                  if (tipoCredenciado !== tipo.value) {
                    e.currentTarget.style.backgroundColor = VITAL_COLORS.white;
                  }
                }}
              >
                {tipo.label}
              </button>
            ))}
          </div>

          {/* Barra de Busca */}
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <Search 
                className="absolute left-4 top-1/2 transform -translate-y-1/2" 
                size={20} 
                style={{ color: VITAL_COLORS.mediumGray }}
              />
              <Input
                type="text"
                placeholder="Buscar por clínica, profissional ou serviço…"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-12 py-6 text-lg rounded-xl"
                style={{
                  border: `1px solid ${VITAL_COLORS.turquoise}`,
                }}
              />
            </div>
          </div>

          {/* Grid de Municípios */}
          <div className="mb-8">
            <h3 
              className="text-xl font-semibold mb-6 text-center" 
              style={{ color: VITAL_COLORS.turquoise }}
            >
              Buscar por município
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {MUNICIPIOS_VALE_ITAJAI.map((mun) => (
                <button
                  key={mun}
                  onClick={() => setMunicipio(municipio === mun ? "" : mun)}
                  className="py-4 px-6 rounded-xl font-medium text-base transition-all duration-200 shadow-sm hover:shadow-md"
                  style={{
                    border: `1px solid ${VITAL_COLORS.turquoise}`,
                    backgroundColor: municipio === mun ? VITAL_COLORS.turquoise : VITAL_COLORS.white,
                    color: municipio === mun ? VITAL_COLORS.white : VITAL_COLORS.turquoise,
                  }}
                  onMouseEnter={(e) => {
                    if (municipio !== mun) {
                      e.currentTarget.style.backgroundColor = VITAL_COLORS.beige;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (municipio !== mun) {
                      e.currentTarget.style.backgroundColor = VITAL_COLORS.white;
                    }
                  }}
                >
                  {mun}
                </button>
              ))}
            </div>
          </div>

          {/* Filtros Adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {tipoCredenciado === "medicos" && (
              <div>
                <Label className="mb-2 block" style={{ color: VITAL_COLORS.darkGray }}>
                  Especialidade
                </Label>
                <Select value={especialidade} onValueChange={setEspecialidade}>
                  <SelectTrigger 
                    className="rounded-lg"
                    style={{ border: `1px solid ${VITAL_COLORS.turquoise}` }}
                  >
                    <SelectValue placeholder="Todas as especialidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">Todas as especialidades</SelectItem>
                    {especialidades.map((esp: string) => (
                      <SelectItem key={esp} value={esp}>{esp}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {tipoCredenciado !== "medicos" && (
              <div>
                <Label className="mb-2 block" style={{ color: VITAL_COLORS.darkGray }}>
                  Categoria
                </Label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger 
                    className="rounded-lg"
                    style={{ border: `1px solid ${VITAL_COLORS.turquoise}` }}
                  >
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="_all">Todas as categorias</SelectItem>
                    {(tipoCredenciado === "servicos_saude" ? CATEGORIAS_SERVICOS_SAUDE : CATEGORIAS_OUTROS_SERVICOS).map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {filtrosAtivos && (
            <div className="text-center">
              <Button
                onClick={limparFiltros}
                variant="outline"
                className="rounded-lg"
                style={{
                  border: `1px solid ${VITAL_COLORS.turquoise}`,
                  color: VITAL_COLORS.turquoise,
                }}
              >
                <X size={16} className="mr-2" />
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Resultados */}
      <section className="py-12 px-4" style={{ backgroundColor: VITAL_COLORS.white }}>
        <div className="container max-w-6xl mx-auto">
          {tipoCredenciado === "medicos" ? (
            <>
              <h2 
                className="text-2xl font-semibold mb-8" 
                style={{ color: VITAL_COLORS.turquoise }}
              >
                Médicos Credenciados
              </h2>
              {loadingMedicos ? (
                <p style={{ color: VITAL_COLORS.mediumGray }}>Carregando...</p>
              ) : medicos.length === 0 ? (
                <p style={{ color: VITAL_COLORS.mediumGray }}>Nenhum médico encontrado.</p>
              ) : (
                <div className="space-y-4">
                  {medicos.map((medico: any) => (
                    <CredenciadoListItem
                      key={medico.id}
                      tipo="medico"
                      nome={medico.nome}
                      especialidadeOuCategoria={medico.especialidade}
                      municipio={medico.municipio}
                      endereco={medico.endereco}
                      telefone={medico.telefone}
                      whatsapp={medico.whatsapp}
                      logoUrl={medico.logoUrl}
                      fotoUrl={medico.fotoUrl}
                      mostrarPrecoDesconto={false}
                      credenciadoId={medico.id}
                      onCompartilhar={() => compartilharCredenciado(medico.nome, medico.endereco, medico.telefone)}
                      onAvaliar={() => {
                        setCredenciadoSelecionado({ tipo: "medico", id: medico.id, nome: medico.nome });
                        setModalAvaliacaoOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <h2 
                className="text-2xl font-semibold mb-8" 
                style={{ color: VITAL_COLORS.turquoise }}
              >
                {tipoCredenciado === "servicos_saude" ? "Serviços de Saúde" : "Outros Serviços"}
              </h2>
              {loadingInstituicoes ? (
                <p style={{ color: VITAL_COLORS.mediumGray }}>Carregando...</p>
              ) : instituicoes.length === 0 ? (
                <p style={{ color: VITAL_COLORS.mediumGray }}>Nenhum serviço encontrado.</p>
              ) : (
                <div className="space-y-4">
                  {instituicoes.map((inst: any) => (
                    <CredenciadoListItem
                      key={inst.id}
                      tipo="instituicao"
                      nome={inst.nome}
                      especialidadeOuCategoria={inst.categoria}
                      municipio={inst.municipio}
                      endereco={inst.endereco}
                      telefone={inst.telefone}
                      whatsapp={inst.whatsappSecretaria}
                      logoUrl={inst.logoUrl}
                      fotoUrl={inst.fotoUrl}
                      mostrarPrecoDesconto={false}
                      credenciadoId={inst.id}
                      onCompartilhar={() => compartilharCredenciado(inst.nome, inst.endereco, inst.telefone)}
                      onAvaliar={() => {
                        setCredenciadoSelecionado({ tipo: "instituicao", id: inst.id, nome: inst.nome });
                        setModalAvaliacaoOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Rodapé */}
      <footer className="py-8 px-4" style={{ backgroundColor: VITAL_COLORS.lightGray }}>
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <img 
              src={APP_LOGO} 
              alt="Vital" 
              className="h-12 object-contain"
            />
            <div className="text-center md:text-right">
              <p 
                className="font-medium mb-1" 
                style={{ color: VITAL_COLORS.darkGray }}
              >
                Sua Saúde Vital
              </p>
              <a 
                href="mailto:comercial@suasaudevital.com.br"
                className="text-sm hover:underline"
                style={{ color: VITAL_COLORS.turquoise }}
              >
                comercial@suasaudevital.com.br
              </a>
            </div>
          </div>
        </div>
      </footer>
      
      <Footer />

      {/* Modal de Avaliação */}
      {credenciadoSelecionado && (
        <ModalAvaliacao
          open={modalAvaliacaoOpen}
          onClose={() => {
            setModalAvaliacaoOpen(false);
            setCredenciadoSelecionado(null);
          }}
          tipoCredenciado={credenciadoSelecionado.tipo}
          credenciadoId={credenciadoSelecionado.id}
          nomeCredenciado={credenciadoSelecionado.nome}
        />
      )}
    </div>
  );
}
