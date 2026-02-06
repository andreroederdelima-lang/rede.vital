import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { MapPin, Phone, MessageCircle, Share2, DollarSign, Percent } from "lucide-react";
import { formatWhatsAppLink, abrirComoChegar } from "@/lib/utils";
import { VITAL_COLORS } from "@shared/colors";

interface CredenciadoListItemProps {
  tipo: "medico" | "instituicao";
  tipoServico?: "servicos_saude" | "outros_servicos"; // Apenas para instituições
  nome: string;
  especialidadeOuCategoria: string;
  areaAtuacao?: string | null; // Área de atuação principal (apenas médicos)
  municipio: string;
  endereco: string;
  telefone?: string | null;
  whatsapp?: string | null;
  whatsappParceria?: string | null; // WhatsApp do responsável pela parceria
  logoUrl?: string | null;
  fotoUrl?: string | null;
  precoConsulta?: string | null;
  valorParticular?: string | null;
  valorAssinanteVital?: string | null;
  descontoPercentual?: number;
  descontoGeral?: number | null; // Desconto geral para produtos variados (óticas, farmácias)
  mostrarPrecoDesconto?: boolean; // true para Dados Internos, false para público
  onCompartilhar?: () => void;
  onEnviarLink?: () => void;
  onEditar?: () => void;
  onAvaliar?: () => void;
  credenciadoId?: number;
  procedimentos?: Array<{ id: number; nome: string; valorParticular?: string | null; valorAssinanteVital?: string | null }>;
}

export function CredenciadoListItem({
  tipo,
  tipoServico,
  nome,
  especialidadeOuCategoria,
  areaAtuacao,
  municipio,
  endereco,
  telefone,
  whatsapp,
  whatsappParceria,
  logoUrl,
  fotoUrl,
  precoConsulta,
  valorParticular,
  valorAssinanteVital,
  descontoPercentual,
  descontoGeral,
  mostrarPrecoDesconto = false,
  onCompartilhar,
  onEnviarLink,
  onEditar,
  onAvaliar,
  credenciadoId,
  procedimentos: procedimentosProp,
}: CredenciadoListItemProps) {
  // Buscar procedimentos automaticamente se for instituição
  const { data: procedimentosData } = trpc.procedimentos.listar.useQuery(
    { instituicaoId: tipo === "instituicao" ? credenciadoId : undefined },
    { enabled: tipo === "instituicao" && !!credenciadoId }
  );
  
  const procedimentos = procedimentosProp || procedimentosData || [];
  
  // Determinar imagem padrão baseado no tipo e tipoServico
  const getPlaceholderImage = () => {
    if (tipo === "medico") return "https://files.manuscdn.com/user_upload_by_module/session_file/310519663205270242/lXCFckfTyatzkNKJ.jpg";
    
    // Para instituições, usar tipoServico se disponível
    if (tipo === "instituicao") {
      if (tipoServico === "servicos_saude") {
        return "https://files.manuscdn.com/user_upload_by_module/session_file/310519663205270242/LoAJubXNcYWkjSVq.jpg";
      } else if (tipoServico === "outros_servicos") {
        return "https://files.manuscdn.com/user_upload_by_module/session_file/310519663205270242/TxLobAvDTLVzQOTS.jpg";
      }
      
      // Fallback robusto: verificar categoria (para compatibilidade com dados antigos)
      const categoria = especialidadeOuCategoria.toLowerCase();
      const categoriasServicosSaude = [
        "fisio", "psico", "clínica", "clinica", "hospital", "laboratório", "laboratorio",
        "farmácia", "farmacia", "odonto", "nutrição", "nutricao", "fono", "exame",
        "saúde", "saude", "home care", "multiespecialidades", "médica", "medica"
      ];
      
      if (categoriasServicosSaude.some(termo => categoria.includes(termo))) {
        return "https://files.manuscdn.com/user_upload_by_module/session_file/310519663205270242/LoAJubXNcYWkjSVq.jpg";
      }
    }
    
    return "https://files.manuscdn.com/user_upload_by_module/session_file/310519663205270242/TxLobAvDTLVzQOTS.jpg";
  };

  // Nova lógica: FOTO como imagem principal (não logo)
  // Tratar strings vazias, null e undefined como inválidos
  const fotoValida = fotoUrl && typeof fotoUrl === 'string' && fotoUrl.trim() !== "" ? fotoUrl : null;
  const logoValida = logoUrl && typeof logoUrl === 'string' && logoUrl.trim() !== "" ? logoUrl : null;
  
  const imagemPrincipal = fotoValida || getPlaceholderImage();
  const logoParceiro = logoValida || "https://files.manuscdn.com/user_upload_by_module/session_file/310519663205270242/jIHRjGGFJKvMqDXo.png";
  const logoVital = "/logo-vital-vertical.jpeg";

  const telefoneExibir = whatsapp || telefone;

  return (
    <div
      className="flex items-start gap-4 p-4 rounded-lg border hover:shadow-md transition-shadow relative"
      style={{
        backgroundColor: VITAL_COLORS.white,
        borderColor: "#E5E5E5",
      }}
    >
      {/* Foto/Imagem Principal */}
      <div className="flex-shrink-0">
        <img
          src={imagemPrincipal}
          alt={nome}
          className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover"
          style={{
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            backgroundColor: VITAL_COLORS.lightGray,
          }}
        />
      </div>

      {/* Informações */}
      <div className="flex-1 min-w-0">
        {/* Linha 1: Nome e Especialidade/Categoria */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-base md:text-lg truncate"
              style={{ color: VITAL_COLORS.turquoise }}
            >
              {nome}
            </h3>
            <p
              className="text-sm md:text-base"
              style={{ color: VITAL_COLORS.darkGray }}
            >
              {especialidadeOuCategoria}
            </p>
            {areaAtuacao && tipo === "medico" && (
              <p
                className="text-xs md:text-sm italic mt-1"
                style={{ color: VITAL_COLORS.turquoise }}
              >
                {areaAtuacao}
              </p>
            )}
          </div>

          {/* Botões de ação (desktop) - posicionados no topo para não sobrepor logo */}
          <div className="hidden md:flex gap-2 flex-shrink-0 items-start">
            {onCompartilhar && (
              <Button
                size="sm"
                variant="outline"
                onClick={onCompartilhar}
                className="h-8 w-8 p-0"
                style={{
                  borderColor: VITAL_COLORS.turquoise,
                  color: VITAL_COLORS.turquoise,
                }}
                title="Compartilhar"
              >
                <Share2 size={14} />
              </Button>
            )}
            {onAvaliar && (
              <Button
                size="sm"
                variant="outline"
                onClick={onAvaliar}
                className="h-8 w-8 p-0"
                style={{
                  borderColor: VITAL_COLORS.gold,
                  color: VITAL_COLORS.gold,
                }}
                title="Avaliar"
              >
                Av
              </Button>
            )}
            {onEnviarLink && (
              <Button
                size="sm"
                variant="outline"
                onClick={onEnviarLink}
                className="h-8 px-3"
                style={{
                  borderColor: VITAL_COLORS.turquoise,
                  color: VITAL_COLORS.turquoise,
                }}
              >
                Enviar Link
              </Button>
            )}
            {onEditar && (
              <Button
                size="sm"
                variant="outline"
                onClick={onEditar}
                className="h-8 px-3"
                style={{
                  borderColor: VITAL_COLORS.turquoise,
                  color: VITAL_COLORS.turquoise,
                }}
              >
                Editar
              </Button>
            )}
          </div>
        </div>

        {/* Linha 2: Município + Endereço */}
        <div className="flex items-start gap-2 mb-2 text-sm">
          <MapPin size={14} className="flex-shrink-0 mt-0.5" style={{ color: VITAL_COLORS.mediumGray }} />
          <span style={{ color: VITAL_COLORS.mediumGray }}>
            {municipio} - {endereco}
          </span>
        </div>

        {/* Linha 3: Telefone + WhatsApp */}
        <div className="flex flex-wrap items-center gap-3 mb-2">
          {telefoneExibir && (
            <div className="flex items-center gap-2 text-sm">
              <Phone size={14} style={{ color: VITAL_COLORS.mediumGray }} />
              <span style={{ color: VITAL_COLORS.mediumGray }}>{telefoneExibir}</span>
            </div>
          )}

          {whatsapp && (
            <a
              href={formatWhatsAppLink(whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="sm"
                className="h-7 px-3 text-xs"
                style={{
                  backgroundColor: VITAL_COLORS.turquoise,
                  color: VITAL_COLORS.white,
                }}
              >
                <MessageCircle size={12} className="mr-1" />
                WhatsApp Comercial/Agendamento
              </Button>
            </a>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => abrirComoChegar(endereco, municipio)}
            className="h-7 px-3 text-xs"
            style={{
              borderColor: VITAL_COLORS.turquoise,
              color: VITAL_COLORS.turquoise,
            }}
          >
            <MapPin size={12} className="mr-1" />
            Como Chegar
          </Button>

          {whatsappParceria && mostrarPrecoDesconto && (
            <a
              href={formatWhatsAppLink(whatsappParceria)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-3 text-xs"
                style={{
                  borderColor: VITAL_COLORS.turquoise,
                  color: VITAL_COLORS.turquoise,
                }}
              >
                <MessageCircle size={12} className="mr-1" />
                Contato Responsável Parceria
              </Button>
            </a>
          )}
        </div>

        {/* Linha 4: Desconto Geral (para produtos variados) */}
        {tipo === "instituicao" && descontoGeral && descontoGeral > 0 && (
          <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: "#f0f9ff" }}>
            <div className="flex items-center gap-2">
              <Percent size={18} style={{ color: VITAL_COLORS.turquoise }} />
              <span className="text-sm font-semibold" style={{ color: VITAL_COLORS.turquoise }}>
                {descontoGeral}% de desconto para assinantes Vital
              </span>
            </div>
            <p className="text-xs mt-1" style={{ color: VITAL_COLORS.mediumGray }}>
              Desconto aplicado em todos os produtos/serviços
            </p>
          </div>
        )}

        {/* Linha 5: Procedimentos (apenas para instituições) */}
        {tipo === "instituicao" && procedimentos && procedimentos.length > 0 && (
          <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: "#f8f9fa" }}>
            <h4 className="text-sm font-semibold mb-2" style={{ color: VITAL_COLORS.turquoise }}>
              Procedimentos / Serviços Disponíveis:
            </h4>
            <div className="space-y-1">
              {procedimentos.map((proc) => (
                <div key={proc.id} className="flex justify-between items-center text-xs">
                  <span style={{ color: VITAL_COLORS.darkGray }}>{proc.nome}</span>
                  {mostrarPrecoDesconto && (
                    <div className="flex gap-2">
                      {proc.valorParticular && (
                        <span className="text-xs" style={{ color: VITAL_COLORS.mediumGray }}>
                          Particular: {proc.valorParticular}
                        </span>
                      )}
                      {proc.valorAssinanteVital && (
                        <span className="text-xs font-medium" style={{ color: VITAL_COLORS.turquoise }}>
                          Vital: {proc.valorAssinanteVital}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Linha 5: Valores e Desconto (apenas Dados Internos) */}
        {mostrarPrecoDesconto && (
          <div className="flex flex-wrap items-center gap-3 text-sm mt-2">
            {valorParticular && (
              <div className="flex items-center gap-1 px-2 py-1 rounded" style={{ backgroundColor: "#f0f9ff" }}>
                <DollarSign size={14} style={{ color: VITAL_COLORS.turquoise }} />
                <span style={{ color: VITAL_COLORS.darkGray }} className="font-medium">
                  Particular: {valorParticular}
                </span>
              </div>
            )}
            {valorAssinanteVital && (
              <div className="flex items-center gap-1 px-2 py-1 rounded" style={{ backgroundColor: "#f0fdf4" }}>
                <DollarSign size={14} style={{ color: "#16a34a" }} />
                <span style={{ color: VITAL_COLORS.darkGray }} className="font-medium">
                  Assinante Vital: {valorAssinanteVital}
                </span>
              </div>
            )}
            {valorParticular && valorAssinanteVital && (() => {
              // Calcular desconto automaticamente
              const valPart = parseFloat(valorParticular.replace(/[^0-9.,]/g, '').replace(',', '.'));
              const valVital = parseFloat(valorAssinanteVital.replace(/[^0-9.,]/g, '').replace(',', '.'));
              if (!isNaN(valPart) && !isNaN(valVital) && valPart > 0) {
                const desconto = Math.round(((valPart - valVital) / valPart) * 100);
                if (desconto > 0) {
                  return (
                    <Badge
                      className="px-2 py-0.5 text-xs"
                      style={{
                        backgroundColor: VITAL_COLORS.turquoise,
                        color: VITAL_COLORS.white,
                      }}
                    >
                      <Percent size={12} className="mr-1" />
                      {desconto}% desconto Vital
                    </Badge>
                  );
                }
              }
              return null;
            })()}
            {/* Fallback: mostrar precoConsulta e descontoPercentual se valores novos não existirem */}
            {!valorParticular && !valorAssinanteVital && precoConsulta && (
              <div className="flex items-center gap-1">
                <DollarSign size={14} style={{ color: VITAL_COLORS.darkGray }} />
                <span style={{ color: VITAL_COLORS.darkGray }}>{precoConsulta}</span>
              </div>
            )}
            {!valorParticular && !valorAssinanteVital && descontoPercentual !== undefined && descontoPercentual > 0 && (
              <Badge
                className="px-2 py-0.5 text-xs"
                style={{
                  backgroundColor: VITAL_COLORS.gold,
                  color: VITAL_COLORS.white,
                }}
              >
                <Percent size={12} className="mr-1" />
                {descontoPercentual}% desconto
              </Badge>
            )}
          </div>
        )}

        {/* Botões mobile + Logo Vital */}
        <div className="flex md:hidden gap-2 mt-3 items-center">
          {onCompartilhar && (
            <Button
              size="sm"
              variant="outline"
              onClick={onCompartilhar}
              className="flex-1 h-8 text-xs"
              style={{
                borderColor: VITAL_COLORS.turquoise,
                color: VITAL_COLORS.turquoise,
              }}
            >
              <Share2 size={12} className="mr-1" />
              Compartilhar
            </Button>
          )}
          {onEnviarLink && (
            <Button
              size="sm"
              variant="outline"
              onClick={onEnviarLink}
              className="flex-1 h-8 text-xs"
              style={{
                borderColor: VITAL_COLORS.turquoise,
                color: VITAL_COLORS.turquoise,
              }}
            >
              Enviar Link
            </Button>
          )}
          {onEditar && (
            <Button
              size="sm"
              variant="outline"
              onClick={onEditar}
              className="flex-1 h-8 text-xs"
              style={{
                borderColor: VITAL_COLORS.turquoise,
                color: VITAL_COLORS.turquoise,
              }}
            >
              Editar
            </Button>
          )}
          {onAvaliar && (
            <Button
              size="sm"
              variant="outline"
              onClick={onAvaliar}
              className="flex-1 h-8 text-xs"
              style={{
                borderColor: VITAL_COLORS.gold,
                color: VITAL_COLORS.gold,
              }}
            >
              Avaliar
            </Button>
          )}
          {/* Logo Vital ao lado dos botões (mobile only) */}
          <img
            src={logoVital}
            alt="Logo Vital"
            className="w-8 h-8 rounded-full object-cover bg-white border-2 flex-shrink-0"
            style={{
              borderColor: VITAL_COLORS.white,
              boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
            }}
          />
        </div>
      </div>

      {/* Logo do Parceiro - Canto Superior Direito do CARD (FORA da foto) */}
      <img
        src={logoParceiro}
        alt="Logo Parceiro"
        className="absolute top-2 right-2 w-10 h-10 md:w-12 md:h-12 rounded-full object-cover bg-white border-2"
        style={{
          borderColor: VITAL_COLORS.white,
          boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
        }}
      />
      
      {/* Logo Vital - Desktop: Canto Inferior Direito / Mobile: ao lado dos botões */}
      <img
        src={logoVital}
        alt="Logo Vital"
        className="hidden md:block absolute bottom-2 right-2 w-12 h-12 rounded-full object-cover bg-white border-2"
        style={{
          borderColor: VITAL_COLORS.white,
          boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
        }}
      />
    </div>
  );
}
