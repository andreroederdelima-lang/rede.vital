import { useState } from "react";
import PainelVendedorLayout from "@/components/PainelVendedorLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  Link as LinkIcon, 
  FileText, 
  Mic, 
  MessageSquare, 
  ExternalLink,
  Download,
  Share2,
  Copy
} from "lucide-react";
import { toast } from "sonner";
import { APP_LOGO, APP_TITLE } from "@/const";

const VITAL_COLORS = {
  turquoise: "#2B9C9C",
  beige: "#D4C5A0",
  white: "#FFFFFF",
  darkGray: "#333333",
  mediumGray: "#666666",
  lightGray: "#F5F5F5",
};

export default function MateriaisDivulgacao() {
  const [numeroCliente, setNumeroCliente] = useState("");
  const [templateSelecionado, setTemplateSelecionado] = useState("");
  
  const { data: materiais = [], isLoading: loadingMateriais } = trpc.materiais.listar.useQuery();
  const { data: templates = [], isLoading: loadingTemplates } = trpc.templatesWhatsapp.listar.useQuery();

  // Agrupar materiais por categoria
  const links = materiais.filter(m => m.tipo === "link");
  const arquivos = materiais.filter(m => m.tipo === "arquivo");
  const audios = materiais.filter(m => m.tipo === "audio");
  const textos = materiais.filter(m => m.tipo === "texto");

  const copiarTexto = (texto: string) => {
    navigator.clipboard.writeText(texto);
    toast.success("Texto copiado!");
  };

  const abrirWhatsApp = () => {
    if (!numeroCliente) {
      toast.error("Digite o número do cliente");
      return;
    }
    
    const template = templates.find(t => t.id === parseInt(templateSelecionado));
    const mensagem = template ? template.mensagem : "";
    
    // Remover caracteres não numéricos
    const numero = numeroCliente.replace(/\D/g, "");
    
    // Adicionar código do país se não tiver
    const numeroCompleto = numero.startsWith("55") ? numero : `55${numero}`;
    
    const url = `https://wa.me/${numeroCompleto}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");
  };

  const compartilharMaterial = (titulo: string, conteudo: string) => {
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

  if (loadingMateriais || loadingTemplates) {
    return (
      <PainelVendedorLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando materiais...</p>
        </div>
      </PainelVendedorLayout>
    );
  }

  return (
    <PainelVendedorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Materiais de Divulgação</h1>
          <p className="text-muted-foreground mt-1">
            Recursos para promover as assinaturas Vital
          </p>
        </div>
        {/* Integração WhatsApp */}
        <Card className="p-6 mb-8" style={{ backgroundColor: VITAL_COLORS.white }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: VITAL_COLORS.turquoise }}>
            <MessageSquare className="inline mr-2" size={24} />
            Enviar via WhatsApp
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: VITAL_COLORS.darkGray }}>
                Número do Cliente
              </label>
              <Input
                placeholder="(00) 00000-0000"
                value={numeroCliente}
                onChange={(e) => setNumeroCliente(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: VITAL_COLORS.darkGray }}>
                Template de Mensagem
              </label>
              <select
                className="w-full p-2 border rounded-lg"
                value={templateSelecionado}
                onChange={(e) => setTemplateSelecionado(e.target.value)}
              >
                <option value="">Selecione um template</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button
            onClick={abrirWhatsApp}
            className="w-full"
            style={{ backgroundColor: VITAL_COLORS.turquoise, color: VITAL_COLORS.white }}
          >
            Abrir WhatsApp
          </Button>
        </Card>

        {/* Links Rápidos */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: VITAL_COLORS.turquoise }}>
            <LinkIcon className="inline mr-2" size={28} />
            Links Rápidos
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {links.map((link) => (
              <Card key={link.id} className="p-4" style={{ backgroundColor: VITAL_COLORS.white }}>
                <h3 className="font-semibold mb-2" style={{ color: VITAL_COLORS.darkGray }}>
                  {link.titulo}
                </h3>
                {link.descricao && (
                  <p className="text-sm mb-3" style={{ color: VITAL_COLORS.mediumGray }}>
                    {link.descricao}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => window.open(link.conteudo, "_blank")}
                    style={{ backgroundColor: VITAL_COLORS.turquoise, color: VITAL_COLORS.white }}
                  >
                    <ExternalLink size={14} className="mr-1" />
                    Abrir
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copiarTexto(link.conteudo || "")}
                  >
                    <Copy size={14} className="mr-1" />
                    Copiar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Arquivos (PDFs e Apresentações) */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: VITAL_COLORS.turquoise }}>
            <FileText className="inline mr-2" size={28} />
            Arquivos e Apresentações
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {arquivos.map((arquivo) => (
              <Card key={arquivo.id} className="p-4" style={{ backgroundColor: VITAL_COLORS.white }}>
                <h3 className="font-semibold mb-2" style={{ color: VITAL_COLORS.darkGray }}>
                  {arquivo.titulo}
                </h3>
                {arquivo.descricao && (
                  <p className="text-sm mb-3" style={{ color: VITAL_COLORS.mediumGray }}>
                    {arquivo.descricao}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => window.open(arquivo.conteudo, "_blank")}
                    style={{ backgroundColor: VITAL_COLORS.turquoise, color: VITAL_COLORS.white }}
                  >
                    <Download size={14} className="mr-1" />
                    Baixar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => compartilharMaterial(arquivo.titulo, arquivo.conteudo || "")}
                  >
                    <Share2 size={14} className="mr-1" />
                    Compartilhar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Áudios */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: VITAL_COLORS.turquoise }}>
            <Mic className="inline mr-2" size={28} />
            Áudios sobre Assinaturas
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {audios.map((audio) => (
              <Card key={audio.id} className="p-4" style={{ backgroundColor: VITAL_COLORS.white }}>
                <h3 className="font-semibold mb-2" style={{ color: VITAL_COLORS.darkGray }}>
                  {audio.titulo}
                </h3>
                {audio.descricao && (
                  <p className="text-sm mb-3" style={{ color: VITAL_COLORS.mediumGray }}>
                    {audio.descricao}
                  </p>
                )}
                <audio controls className="w-full mb-3">
                  <source src={audio.conteudo || ""} />
                </audio>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => compartilharMaterial(audio.titulo, audio.conteudo || "")}
                  className="w-full"
                >
                  <Share2 size={14} className="mr-1" />
                  Compartilhar
                </Button>
              </Card>
            ))}
          </div>
        </section>

        {/* Textos de Copy */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: VITAL_COLORS.turquoise }}>
            <MessageSquare className="inline mr-2" size={28} />
            Textos de Copy
          </h2>
          <div className="space-y-4">
            {textos.map((texto) => (
              <Card key={texto.id} className="p-4" style={{ backgroundColor: VITAL_COLORS.white }}>
                <h3 className="font-semibold mb-2" style={{ color: VITAL_COLORS.darkGray }}>
                  {texto.titulo}
                </h3>
                {texto.descricao && (
                  <p className="text-sm mb-3" style={{ color: VITAL_COLORS.mediumGray }}>
                    {texto.descricao}
                  </p>
                )}
                <div className="bg-gray-50 p-4 rounded-lg mb-3">
                  <p className="text-sm whitespace-pre-wrap" style={{ color: VITAL_COLORS.darkGray }}>
                    {texto.conteudo}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => copiarTexto(texto.conteudo || "")}
                  style={{ backgroundColor: VITAL_COLORS.turquoise, color: VITAL_COLORS.white }}
                >
                  <Copy size={14} className="mr-1" />
                  Copiar Texto
                </Button>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </PainelVendedorLayout>
  );
}
