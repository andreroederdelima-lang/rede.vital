import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { APP_LOGO, APP_TITLE } from "@/const";

export default function AtualizarDados() {
  const [, params] = useRoute("/atualizar-dados/:token");
  const token = params?.token || "";
  
  const [formData, setFormData] = useState({
    telefone: "",
    whatsapp: "",
    whatsappSecretaria: "",
    telefoneOrganizacao: "",
    fotoUrl: "",
    email: "",
    endereco: "",
    precoConsulta: "",
    valorParticular: "",
    valorAssinanteVital: "",
    descontoPercentual: 0,
    observacoes: "",
  });
  
  const [enviado, setEnviado] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  
  const { data: credenciado, isLoading } = trpc.atualizacao.obterPorToken.useQuery(token, {
    enabled: !!token,
  });
  
  const enviarMutation = trpc.atualizacao.enviar.useMutation({
    onSuccess: () => {
      setEnviado(true);
      toast.success("Dados enviados com sucesso!", {
        description: "Sua solicitação será analisada pela equipe Vital.",
      });
    },
    onError: (error) => {
      toast.error("Erro ao enviar dados", {
        description: error.message,
      });
    },
  });
  
  useEffect(() => {
    if (credenciado) {
      setFormData({
        telefone: credenciado.dados.telefone || "",
        whatsapp: (credenciado.dados as any).whatsapp || "",
        whatsappSecretaria: (credenciado.dados as any).whatsappSecretaria || "",
        telefoneOrganizacao: (credenciado.dados as any).telefoneOrganizacao || "",
        fotoUrl: (credenciado.dados as any).fotoUrl || "",
        email: (credenciado.dados as any).email || "",
        endereco: credenciado.dados.endereco || "",
        precoConsulta: (credenciado.dados as any).precoConsulta || "",
        valorParticular: (credenciado.dados as any).valorParticular || "",
        valorAssinanteVital: (credenciado.dados as any).valorAssinanteVital || "",
        descontoPercentual: credenciado.dados.descontoPercentual || 0,
        observacoes: (credenciado.dados as any).observacoes || "",
      });
    }
  }, [credenciado]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!aceitouTermos) {
      toast.error("Aceite obrigatório", {
        description: "Você precisa aceitar os Termos de Credenciamento para continuar.",
      });
      return;
    }
    
    enviarMutation.mutate({
      token,
      ...formData,
    });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!credenciado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Link Inválido</CardTitle>
            <CardDescription>
              Este link de atualização não é válido ou expirou.
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
            <CardTitle className="text-green-600">Dados Enviados!</CardTitle>
            <CardDescription>
              Sua solicitação de atualização foi enviada com sucesso.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              A equipe Vital irá revisar suas alterações e, após aprovação, seus dados serão atualizados na plataforma.
            </p>
            <p className="text-sm font-medium text-primary">
              Obrigado por manter seus dados atualizados!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img src={APP_LOGO} alt="Vital" className="h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-primary mb-2">
            Atualizar Dados
          </h1>
          <p className="text-muted-foreground">
            {credenciado.tipo === "medico" ? "Dr(a). " : ""}{credenciado.dados.nome}
          </p>
        </div>
        
        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Atualize suas Informações</CardTitle>
            <CardDescription>
              Preencha os campos abaixo com suas informações atualizadas. Após envio, a equipe Vital irá revisar e aprovar as alterações.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(47) 3333-4444"
                  />
                </div>
                
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="(47) 99999-8888"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="whatsappSecretaria">WhatsApp Secretaria</Label>
                  <Input
                    id="whatsappSecretaria"
                    value={formData.whatsappSecretaria}
                    onChange={(e) => setFormData({ ...formData, whatsappSecretaria: e.target.value })}
                    placeholder="(47) 99999-7777"
                  />
                </div>
                
                <div>
                  <Label htmlFor="telefoneOrganizacao">Telefone Contato Organização</Label>
                  <Input
                    id="telefoneOrganizacao"
                    value={formData.telefoneOrganizacao}
                    onChange={(e) => setFormData({ ...formData, telefoneOrganizacao: e.target.value })}
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
              
              <div>
                <Label htmlFor="fotoUrl">Foto do Médico/Serviço (URL)</Label>
                <Input
                  id="fotoUrl"
                  type="url"
                  value={formData.fotoUrl}
                  onChange={(e) => setFormData({ ...formData, fotoUrl: e.target.value })}
                  placeholder="https://exemplo.com/foto.jpg"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Cole o link da imagem hospedada (ex: Google Drive, Imgur, etc)
                </p>
              </div>
              
              <div>
                <Label htmlFor="endereco">Endereço Completo</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  placeholder="Rua, número, bairro, cidade"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valorParticular">Valor Particular</Label>
                  <Input
                    id="valorParticular"
                    value={formData.valorParticular}
                    onChange={(e) => setFormData({ ...formData, valorParticular: e.target.value })}
                    placeholder="Ex: R$ 200,00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="valorAssinanteVital">Valor Assinante Vital</Label>
                  <Input
                    id="valorAssinanteVital"
                    value={formData.valorAssinanteVital}
                    onChange={(e) => setFormData({ ...formData, valorAssinanteVital: e.target.value })}
                    placeholder="Ex: R$ 150,00"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="precoConsulta">Preço da Consulta/Serviço (legado)</Label>
                  <Input
                    id="precoConsulta"
                    value={formData.precoConsulta}
                    onChange={(e) => setFormData({ ...formData, precoConsulta: e.target.value })}
                    placeholder="Ex: R$ 150,00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="desconto">% Desconto Vital (legado)</Label>
                  <Input
                    id="desconto"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.descontoPercentual}
                    onChange={(e) => setFormData({ ...formData, descontoPercentual: parseInt(e.target.value) || 0 })}
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
                  Enviar Atualização
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
