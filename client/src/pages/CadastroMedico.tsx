import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { APP_LOGO } from "@/const";
import { maskTelefone, maskMoeda, unmaskMoeda, calcularDesconto } from "@/lib/masks";
import { MUNICIPIOS_VALE_ITAJAI } from "@shared/colors";

export default function CadastroMedico() {
  const [, params] = useRoute("/cadastro-medico/:token");
  const token = params?.token || "";
  
  const [formData, setFormData] = useState({
    nome: "",
    especialidade: "",
    numeroRegistroConselho: "",
    municipio: "",
    endereco: "",
    telefone: "",
    whatsapp: "",
    whatsappSecretaria: "",
    telefoneOrganizacao: "",
    email: "",
    tipoAtendimento: "presencial" as "presencial" | "telemedicina" | "ambos",
    valorParticular: "",
    valorAssinanteVital: "",
    observacoes: "",
    contatoParceria: "",
    whatsappParceria: "",
  });
  
  const [enviado, setEnviado] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  
  // Verificar validade do token
  const { data: tokenData, isLoading: loadingToken } = trpc.tokens.verificar.useQuery(
    { token },
    { enabled: !!token }
  );
  
  const enviarMutation = trpc.parceria.solicitar.useMutation({
    onSuccess: () => {
      setEnviado(true);
      toast.success("Cadastro enviado com sucesso!", {
        description: "Sua solicitação será analisada pela equipe Vital.",
      });
    },
    onError: (error) => {
      toast.error("Erro ao enviar cadastro", {
        description: error.message,
      });
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!aceitouTermos) {
      toast.error("Aceite obrigatório", {
        description: "Você precisa aceitar os Termos de Credenciamento para continuar.",
      });
      return;
    }
    
    // Validar campos obrigatórios
    if (!formData.nome || !formData.especialidade || !formData.municipio || !formData.endereco) {
      toast.error("Campos obrigatórios", {
        description: "Preencha nome, especialidade, município e endereço.",
      });
      return;
    }
    
    if (!formData.valorParticular || !formData.valorAssinanteVital) {
      toast.error("Valores obrigatórios", {
        description: "Preencha o valor particular e o valor para assinante Vital.",
      });
      return;
    }
    
    enviarMutation.mutate({
      tipoCredenciado: "medico",
      nomeResponsavel: formData.contatoParceria || formData.nome,
      nomeEstabelecimento: formData.nome,
      especialidade: formData.especialidade,
      numeroRegistroConselho: formData.numeroRegistroConselho,
      categoria: formData.especialidade,
      cidade: formData.municipio,
      endereco: formData.endereco,
      telefone: formData.telefone || formData.whatsapp || "",
      whatsappSecretaria: formData.whatsappSecretaria || formData.whatsapp || "",
      email: formData.email,
      tipoAtendimento: formData.tipoAtendimento,
      valorParticular: unmaskMoeda(formData.valorParticular),
      valorAssinanteVital: unmaskMoeda(formData.valorAssinanteVital),
      descontoPercentual: calcularDesconto(formData.valorParticular, formData.valorAssinanteVital),
      observacoes: formData.observacoes,
      contatoParceria: formData.contatoParceria,
      whatsappParceria: formData.whatsappParceria,
      tipoServico: "servicos_saude",
    });
  };
  
  if (loadingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!tokenData?.valido) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Link Inválido</CardTitle>
            <CardDescription>
              Este link de cadastro não é válido ou expirou.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Entre em contato com a equipe Vital para solicitar um novo link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (enviado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Cadastro Enviado!</CardTitle>
            <CardDescription>
              Sua solicitação de cadastro foi enviada com sucesso.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              A equipe Vital irá revisar suas informações e, após aprovação, você será incluído na plataforma.
            </p>
            <p className="text-sm font-medium text-primary">
              Bem-vindo à Rede Vital!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const descontoCalculado = calcularDesconto(formData.valorParticular, formData.valorAssinanteVital);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img src={APP_LOGO} alt="Vital" className="h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-primary mb-2">
            Cadastro de Médico
          </h1>
          <p className="text-muted-foreground">
            Preencha seus dados para fazer parte da Rede Vital
          </p>
        </div>
        
        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Médico</CardTitle>
            <CardDescription>
              Preencha todos os campos obrigatórios. Após envio, a equipe Vital irá revisar e aprovar seu cadastro.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Dr(a). Nome Completo"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="especialidade">Especialidade *</Label>
                  <Input
                    id="especialidade"
                    value={formData.especialidade}
                    onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
                    placeholder="Ex: Cardiologia"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="numeroRegistroConselho">Registro Conselho (CRM/CRO/etc)</Label>
                  <Input
                    id="numeroRegistroConselho"
                    value={formData.numeroRegistroConselho}
                    onChange={(e) => setFormData({ ...formData, numeroRegistroConselho: e.target.value })}
                    placeholder="Ex: CRM 12345"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="municipio">Município *</Label>
                  <Select value={formData.municipio} onValueChange={(value) => setFormData({ ...formData, municipio: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o município" />
                    </SelectTrigger>
                    <SelectContent>
                      {MUNICIPIOS_VALE_ITAJAI.map((mun: string) => (
                        <SelectItem key={mun} value={mun}>{mun}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="tipoAtendimento">Tipo de Atendimento</Label>
                  <Select value={formData.tipoAtendimento} onValueChange={(value: any) => setFormData({ ...formData, tipoAtendimento: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="telemedicina">Telemedicina</SelectItem>
                      <SelectItem value="ambos">Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="endereco">Endereço Completo *</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  placeholder="Rua, número, bairro"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: maskTelefone(e.target.value) })}
                    placeholder="(47) 3333-4444"
                  />
                </div>
                
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: maskTelefone(e.target.value) })}
                    placeholder="(47) 99999-8888"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="whatsappSecretaria">WhatsApp Comercial/Secretaria</Label>
                  <Input
                    id="whatsappSecretaria"
                    value={formData.whatsappSecretaria}
                    onChange={(e) => setFormData({ ...formData, whatsappSecretaria: maskTelefone(e.target.value) })}
                    placeholder="(47) 99999-7777"
                  />
                </div>
                
                <div>
                  <Label htmlFor="telefoneOrganizacao">Telefone Organização</Label>
                  <Input
                    id="telefoneOrganizacao"
                    value={formData.telefoneOrganizacao}
                    onChange={(e) => setFormData({ ...formData, telefoneOrganizacao: maskTelefone(e.target.value) })}
                    placeholder="(47) 3333-5555"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contato@exemplo.com"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valorParticular">Valor Particular *</Label>
                  <Input
                    id="valorParticular"
                    value={formData.valorParticular}
                    onChange={(e) => setFormData({ ...formData, valorParticular: maskMoeda(e.target.value) })}
                    placeholder="Ex: R$ 200,00"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="valorAssinanteVital">Valor Assinante Vital *</Label>
                  <Input
                    id="valorAssinanteVital"
                    value={formData.valorAssinanteVital}
                    onChange={(e) => setFormData({ ...formData, valorAssinanteVital: maskMoeda(e.target.value) })}
                    placeholder="Ex: R$ 150,00"
                    required
                  />
                </div>
              </div>
              
              {descontoCalculado > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700">
                    <strong>Desconto calculado:</strong> {descontoCalculado}% para assinantes Vital
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contatoParceria">Contato Responsável pela Parceria</Label>
                  <Input
                    id="contatoParceria"
                    value={formData.contatoParceria}
                    onChange={(e) => setFormData({ ...formData, contatoParceria: e.target.value })}
                    placeholder="Nome do responsável"
                  />
                </div>
                
                <div>
                  <Label htmlFor="whatsappParceria">WhatsApp Responsável Parceria</Label>
                  <Input
                    id="whatsappParceria"
                    value={formData.whatsappParceria}
                    onChange={(e) => setFormData({ ...formData, whatsappParceria: maskTelefone(e.target.value) })}
                    placeholder="(47) 99999-6666"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Informações adicionais, horários de atendimento, etc."
                  rows={4}
                />
              </div>
              
              {/* Checkbox de Aceite de Termos */}
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="termos"
                    checked={aceitouTermos}
                    onChange={(e) => setAceitouTermos(e.target.checked)}
                    className="mt-1 h-5 w-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                  />
                  <label htmlFor="termos" className="text-sm text-gray-700 cursor-pointer">
                    <span className="font-semibold text-teal-700">Li e aceito os Termos de Credenciamento e Uso dos Sistemas Vital.</span>
                    {" "}
                    <a 
                      href="/termos-de-uso" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-teal-600 underline hover:text-teal-700"
                    >
                      Ler termos completos
                    </a>
                  </label>
                </div>
                <p className="text-xs text-gray-600 ml-8">
                  Ao aceitar, você autoriza a divulgação pública de suas informações profissionais e se compromete a cumprir todas as regras estabelecidas.
                </p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={enviarMutation.isPending}
                >
                  {enviarMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Enviar Cadastro
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center text-sm text-muted-foreground mt-6">
          Dúvidas? Entre em contato: <a href="https://wa.me/5547933853726" className="text-primary hover:underline">+55 47 93385-3726</a>
        </p>
      </div>
    </div>
  );
}
