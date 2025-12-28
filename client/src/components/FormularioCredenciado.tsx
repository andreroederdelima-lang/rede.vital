import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { VITAL_COLORS, MUNICIPIOS_VALE_ITAJAI } from "@shared/colors";
import { Upload, X } from "lucide-react";
import ProcedimentosManager, { Procedimento } from "@/components/ProcedimentosManager";

interface FormularioCredenciadoProps {
  tipo: "medico" | "instituicao";
  modoEdicao?: boolean; // true para atualização, false para novo cadastro
  dadosIniciais?: any;
  onSubmit: (dados: any) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export function FormularioCredenciado({
  tipo,
  modoEdicao = false,
  dadosIniciais,
  onSubmit,
  onCancel,
  loading = false,
}: FormularioCredenciadoProps) {
  const [formData, setFormData] = useState({
    nome: dadosIniciais?.nome || "",
    especialidade: dadosIniciais?.especialidade || dadosIniciais?.categoria || "",
    numeroRegistroConselho: dadosIniciais?.numeroRegistroConselho || "",
    tipoAtendimento: dadosIniciais?.tipoAtendimento || "presencial",
    municipio: dadosIniciais?.municipio || "",
    endereco: dadosIniciais?.endereco || "",
    telefone: dadosIniciais?.telefone || "",
    whatsapp: dadosIniciais?.whatsapp || dadosIniciais?.whatsappSecretaria || "",
    logoFile: null as File | null,
    fotoFile: null as File | null,
    contatoParceria: dadosIniciais?.contatoParceria || "",
    whatsappParceria: dadosIniciais?.whatsappParceria || "",
    observacoes: dadosIniciais?.observacoes || "",
    aceitouTermos: false,
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(dadosIniciais?.logoUrl || null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(dadosIniciais?.fotoUrl || null);
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: "logoFile" | "fotoFile", file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (field === "logoFile") {
          setLogoPreview(reader.result as string);
        } else {
          setFotoPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    } else {
      if (field === "logoFile") {
        setLogoPreview(dadosIniciais?.logoUrl || null);
      } else {
        setFotoPreview(dadosIniciais?.fotoUrl || null);
      }
    }
    handleChange(field, file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, procedimentos });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dados Básicos */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg" style={{ color: VITAL_COLORS.turquoise }}>
          Dados Básicos
        </h3>

        {/* Nome */}
        <div>
          <Label htmlFor="nome" className="required">
            Nome {tipo === "medico" ? "do Médico" : "da Instituição"}
          </Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => handleChange("nome", e.target.value)}
            placeholder={tipo === "medico" ? "Dr. João Silva" : "Clínica Saúde Total"}
            required
            style={{ borderColor: VITAL_COLORS.turquoise }}
          />
        </div>

        {/* Especialidade/Categoria */}
        <div>
          <Label htmlFor="especialidade" className="required">
            {tipo === "medico" ? "Especialidade" : "Categoria"}
          </Label>
          <Input
            id="especialidade"
            value={formData.especialidade}
            onChange={(e) => handleChange("especialidade", e.target.value)}
            placeholder={tipo === "medico" ? "Cardiologia" : "Clínica Médica"}
            required
            style={{ borderColor: VITAL_COLORS.turquoise }}
          />
        </div>

        {/* Número de Registro no Conselho (apenas médicos) */}
        {tipo === "medico" && (
          <div>
            <Label htmlFor="numeroRegistroConselho">
              Número de Registro no Conselho (CRM, CRO, etc)
            </Label>
            <Input
              id="numeroRegistroConselho"
              value={formData.numeroRegistroConselho}
              onChange={(e) => handleChange("numeroRegistroConselho", e.target.value)}
              placeholder="CRM 12345/SC"
              style={{ borderColor: VITAL_COLORS.turquoise }}
            />
          </div>
        )}

        {/* Tipo de Atendimento */}
        <div>
          <Label htmlFor="tipoAtendimento" className="required">
            Tipo de Atendimento
          </Label>
          <Select
            value={formData.tipoAtendimento}
            onValueChange={(value) => handleChange("tipoAtendimento", value)}
          >
            <SelectTrigger style={{ borderColor: VITAL_COLORS.turquoise }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="presencial">Presencial</SelectItem>
              <SelectItem value="telemedicina">Online</SelectItem>
              <SelectItem value="ambos">Presencial e Online</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Localização */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg" style={{ color: VITAL_COLORS.turquoise }}>
          Localização
        </h3>

        {/* Município */}
        <div>
          <Label htmlFor="municipio" className="required">
            Município
          </Label>
          <Select
            value={formData.municipio}
            onValueChange={(value) => handleChange("municipio", value)}
          >
            <SelectTrigger style={{ borderColor: VITAL_COLORS.turquoise }}>
              <SelectValue placeholder="Selecione o município" />
            </SelectTrigger>
            <SelectContent>
              {MUNICIPIOS_VALE_ITAJAI.map((mun) => (
                <SelectItem key={mun} value={mun}>
                  {mun}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Endereço */}
        <div>
          <Label htmlFor="endereco" className="required">
            Endereço Completo
          </Label>
          <Input
            id="endereco"
            value={formData.endereco}
            onChange={(e) => handleChange("endereco", e.target.value)}
            placeholder="Rua, número, bairro"
            required
            style={{ borderColor: VITAL_COLORS.turquoise }}
          />
        </div>
      </div>

      {/* Contato */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg" style={{ color: VITAL_COLORS.turquoise }}>
          Contato
        </h3>

        {/* Telefone Fixo */}
        <div>
          <Label htmlFor="telefone">Telefone Fixo</Label>
          <Input
            id="telefone"
            value={formData.telefone}
            onChange={(e) => handleChange("telefone", e.target.value)}
            placeholder="(47) 3333-4444"
            style={{ borderColor: VITAL_COLORS.turquoise }}
          />
        </div>

        {/* WhatsApp Comercial/Agendamento */}
        <div>
          <Label htmlFor="whatsapp" className="required">
            WhatsApp Comercial/Agendamento
          </Label>
          <Input
            id="whatsapp"
            value={formData.whatsapp}
            onChange={(e) => handleChange("whatsapp", e.target.value)}
            placeholder="(47) 99999-9999"
            required
            style={{ borderColor: VITAL_COLORS.turquoise }}
          />
          <p className="text-xs mt-1" style={{ color: VITAL_COLORS.mediumGray }}>
            Este número será exibido publicamente para clientes entrarem em contato
          </p>
        </div>
      </div>

      {/* Imagens */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg" style={{ color: VITAL_COLORS.turquoise }}>
          Imagens
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Logo */}
          <div>
            <Label htmlFor="logoFile">Logo {tipo === "medico" ? "do Estabelecimento" : ""}</Label>
            <div className="mt-2">
              {logoPreview ? (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Preview Logo"
                    className="w-full h-32 object-cover rounded-lg border"
                    style={{ borderColor: VITAL_COLORS.turquoise }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => handleFileChange("logoFile", null)}
                  >
                    <X size={14} />
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="logoFile"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
                  style={{ borderColor: VITAL_COLORS.turquoise }}
                >
                  <Upload size={24} style={{ color: VITAL_COLORS.turquoise }} />
                  <span className="mt-2 text-sm" style={{ color: VITAL_COLORS.mediumGray }}>
                    Clique para enviar
                  </span>
                </label>
              )}
              <input
                id="logoFile"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange("logoFile", e.target.files?.[0] || null)}
              />
            </div>
          </div>

          {/* Foto */}
          <div>
            <Label htmlFor="fotoFile">
              Foto {tipo === "medico" ? "do Médico" : "do Estabelecimento"}
            </Label>
            <div className="mt-2">
              {fotoPreview ? (
                <div className="relative">
                  <img
                    src={fotoPreview}
                    alt="Preview Foto"
                    className="w-full h-32 object-cover rounded-lg border"
                    style={{ borderColor: VITAL_COLORS.turquoise }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => handleFileChange("fotoFile", null)}
                  >
                    <X size={14} />
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="fotoFile"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
                  style={{ borderColor: VITAL_COLORS.turquoise }}
                >
                  <Upload size={24} style={{ color: VITAL_COLORS.turquoise }} />
                  <span className="mt-2 text-sm" style={{ color: VITAL_COLORS.mediumGray }}>
                    Clique para enviar
                  </span>
                </label>
              )}
              <input
                id="fotoFile"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange("fotoFile", e.target.files?.[0] || null)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dados Internos (apenas modo edição/atualização) */}
      {modoEdicao && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg" style={{ color: VITAL_COLORS.turquoise }}>
            Dados Internos (não serão exibidos publicamente)
          </h3>

          {/* Contato do Responsável pela Parceria */}
          <div>
            <Label htmlFor="contatoParceria">Nome do Responsável pela Parceria</Label>
            <Input
              id="contatoParceria"
              value={formData.contatoParceria}
              onChange={(e) => handleChange("contatoParceria", e.target.value)}
              placeholder="Maria Silva"
              style={{ borderColor: VITAL_COLORS.turquoise }}
            />
          </div>

          {/* WhatsApp do Responsável pela Parceria */}
          <div>
            <Label htmlFor="whatsappParceria">WhatsApp do Responsável pela Parceria</Label>
            <Input
              id="whatsappParceria"
              value={formData.whatsappParceria}
              onChange={(e) => handleChange("whatsappParceria", e.target.value)}
              placeholder="(47) 99999-9999"
              style={{ borderColor: VITAL_COLORS.turquoise }}
            />
          </div>

          {/* Procedimentos/Serviços (apenas para instituições) */}
          {tipo === "instituicao" && (
            <div className="col-span-2">
              <ProcedimentosManager
                procedimentos={procedimentos}
                onChange={setProcedimentos}
              />
            </div>
          )}

          {/* Observações */}
          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleChange("observacoes", e.target.value)}
              placeholder="Informações adicionais sobre a parceria..."
              rows={4}
              style={{ borderColor: VITAL_COLORS.turquoise }}
            />
          </div>
        </div>
      )}

      {/* Opt-in */}
      {!modoEdicao && (
        <div className="flex items-start gap-2">
          <Checkbox
            id="aceitouTermos"
            checked={formData.aceitouTermos}
            onCheckedChange={(checked) => handleChange("aceitouTermos", checked)}
            required
          />
          <Label htmlFor="aceitouTermos" className="text-sm cursor-pointer">
            Aceito que meus dados sejam utilizados para divulgação na plataforma Sua Saúde Vital
          </Label>
        </div>
      )}

      {/* Botões */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={loading || (!modoEdicao && !formData.aceitouTermos)}
          className="flex-1"
          style={{
            backgroundColor: VITAL_COLORS.turquoise,
            color: VITAL_COLORS.white,
          }}
        >
          {loading ? "Enviando..." : modoEdicao ? "Atualizar Dados" : "Enviar Sugestão"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            style={{
              borderColor: VITAL_COLORS.turquoise,
              color: VITAL_COLORS.turquoise,
            }}
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
