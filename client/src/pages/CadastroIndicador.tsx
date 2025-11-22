import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { APP_LOGO } from "@/const";
import { Loader2 } from "lucide-react";

/**
 * Página pública de auto-cadastro para promotores e vendedores
 * Não requer aprovação admin, PIX obrigatório, sem senha
 */
export default function CadastroIndicador() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    pix: "",
    fotoUrl: "",
  });

  const login = trpc.indicacoes.loginSemSenha.useMutation({
    onSuccess: () => {
      toast.success("Cadastro realizado com sucesso! Você já pode começar a indicar.");
      setLocation("/indicacoes");
    },
    onError: (error: any) => {
      toast.error(`Erro ao fazer login: ${error.message}`);
    },
  });

  const cadastrar = trpc.indicacoes.cadastroPublico.useMutation({
    onSuccess: () => {
      // Login automático após cadastro
      login.mutate({ email: formData.email });
    },
    onError: (error: any) => {
      toast.error(`Erro ao cadastrar: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email é obrigatório");
      return;
    }
    if (!formData.telefone.trim()) {
      toast.error("Telefone é obrigatório");
      return;
    }
    if (!formData.pix.trim()) {
      toast.error("PIX é obrigatório para receber comissões");
      return;
    }

    cadastrar.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.98_0.01_165)] to-[oklch(0.95_0.02_165)]">
      {/* Header */}
      <header className="bg-white border-b-4 border-[#1e9d9f] shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={APP_LOGO} alt="Vital" className="h-20" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#1e9d9f]">
                  Cadastro de Indicador
                </h1>
                <p className="text-sm text-gray-600">
                  Seja um parceiro Vital e ganhe comissões
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Cadastre-se como Indicador</CardTitle>
              <CardDescription>
                Preencha os dados abaixo para começar a indicar clientes e ganhar comissões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome */}
                <div className="space-y-2">
                  <Label htmlFor="nome">
                    Nome Completo <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                {/* Telefone */}
                <div className="space-y-2">
                  <Label htmlFor="telefone">
                    Telefone/WhatsApp <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(47) 99999-9999"
                    required
                  />
                </div>

                {/* CPF */}
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF (opcional)</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                  />
                </div>

                {/* PIX */}
                <div className="space-y-2">
                  <Label htmlFor="pix">
                    Chave PIX <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="pix"
                    value={formData.pix}
                    onChange={(e) => setFormData({ ...formData, pix: e.target.value })}
                    placeholder="CPF, email, telefone ou chave aleatória"
                    required
                  />
                  <p className="text-sm text-gray-600">
                    Obrigatório para receber suas comissões
                  </p>
                </div>

                {/* Foto */}
                <div className="space-y-2">
                  <Label htmlFor="fotoUrl">URL da Foto (opcional)</Label>
                  <Input
                    id="fotoUrl"
                    value={formData.fotoUrl}
                    onChange={(e) => setFormData({ ...formData, fotoUrl: e.target.value })}
                    placeholder="https://exemplo.com/sua-foto.jpg"
                  />
                  <p className="text-sm text-gray-600">
                    Sua foto aparecerá no dashboard de gamificação
                  </p>
                </div>

                {/* Botões */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={cadastrar.isPending}
                    className="flex-1 bg-[#1e9d9f] hover:bg-[#178a8c]"
                  >
                    {cadastrar.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cadastrando...
                      </>
                    ) : (
                      "Cadastrar e Começar"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/")}
                  >
                    Voltar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Informações Adicionais */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">💡 Como funciona?</h2>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✅ Cadastre-se gratuitamente</li>
              <li>✅ Receba seu link personalizado de indicação</li>
              <li>✅ Compartilhe com seus contatos</li>
              <li>✅ Acompanhe suas indicações em tempo real</li>
              <li>✅ Receba comissões via PIX quando a venda for fechada</li>
            </ul>
          </div>      </div>
      </main>
    </div>
  );
}
