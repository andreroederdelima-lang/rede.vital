import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { APP_LOGO } from "@/const";

const VITAL_COLORS = {
  turquoise: "#2B9C9C",
  beige: "#D4C5A0",
  white: "#FFFFFF",
  darkGray: "#333333",
  mediumGray: "#666666",
  lightGray: "#F5F5F5",
};

type MaterialForm = {
  id?: number;
  tipo: "link" | "arquivo" | "audio" | "texto";
  categoria: string;
  titulo: string;
  descricao: string;
  conteudo: string;
  ordem: number;
};

type TemplateForm = {
  id?: number;
  nome: string;
  tipo: "cliente" | "parceiro" | "comercial";
  mensagem: string;
};

export default function AdminMateriais() {
  const [dialogMaterial, setDialogMaterial] = useState(false);
  const [dialogTemplate, setDialogTemplate] = useState(false);
  const [materialForm, setMaterialForm] = useState<MaterialForm>({
    tipo: "link",
    categoria: "",
    titulo: "",
    descricao: "",
    conteudo: "",
    ordem: 0,
  });
  const [templateForm, setTemplateForm] = useState<TemplateForm>({
    nome: "",
    tipo: "cliente",
    mensagem: "",
  });

  const utils = trpc.useUtils();
  const { data: materiais = [] } = trpc.materiais.listar.useQuery();
  const { data: templates = [] } = trpc.templatesWhatsapp.listar.useQuery();

  const criarMaterial = trpc.materiais.criar.useMutation({
    onSuccess: () => {
      toast.success("Material criado!");
      utils.materiais.listar.invalidate();
      setDialogMaterial(false);
      resetMaterialForm();
    },
  });

  const atualizarMaterial = trpc.materiais.atualizar.useMutation({
    onSuccess: () => {
      toast.success("Material atualizado!");
      utils.materiais.listar.invalidate();
      setDialogMaterial(false);
      resetMaterialForm();
    },
  });

  const deletarMaterial = trpc.materiais.deletar.useMutation({
    onSuccess: () => {
      toast.success("Material deletado!");
      utils.materiais.listar.invalidate();
    },
  });

  const criarTemplate = trpc.templatesWhatsapp.criar.useMutation({
    onSuccess: () => {
      toast.success("Template criado!");
      utils.templatesWhatsapp.listar.invalidate();
      setDialogTemplate(false);
      resetTemplateForm();
    },
  });

  const atualizarTemplate = trpc.templatesWhatsapp.atualizar.useMutation({
    onSuccess: () => {
      toast.success("Template atualizado!");
      utils.templatesWhatsapp.listar.invalidate();
      setDialogTemplate(false);
      resetTemplateForm();
    },
  });

  const deletarTemplate = trpc.templatesWhatsapp.deletar.useMutation({
    onSuccess: () => {
      toast.success("Template deletado!");
      utils.templatesWhatsapp.listar.invalidate();
    },
  });

  const resetMaterialForm = () => {
    setMaterialForm({
      tipo: "link",
      categoria: "",
      titulo: "",
      descricao: "",
      conteudo: "",
      ordem: 0,
    });
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      nome: "",
      tipo: "cliente",
      mensagem: "",
    });
  };

  const handleSaveMaterial = () => {
    if (materialForm.id) {
      atualizarMaterial.mutate(materialForm as any);
    } else {
      const { id, ...data } = materialForm;
      criarMaterial.mutate(data);
    }
  };

  const handleSaveTemplate = () => {
    if (templateForm.id) {
      atualizarTemplate.mutate(templateForm as any);
    } else {
      const { id, ...data } = templateForm;
      criarTemplate.mutate(data);
    }
  };

  const editarMaterial = (material: any) => {
    setMaterialForm(material);
    setDialogMaterial(true);
  };

  const editarTemplate = (template: any) => {
    setTemplateForm(template);
    setDialogTemplate(true);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: VITAL_COLORS.lightGray }}>
      {/* Header */}
      <header className="py-6" style={{ backgroundColor: VITAL_COLORS.white, borderBottom: `2px solid ${VITAL_COLORS.beige}` }}>
        <div className="container">
          <div className="flex items-center gap-4">
            <img src={APP_LOGO} alt="Logo" className="h-12" />
            <div>
              <h1 className="text-2xl font-bold" style={{ color: VITAL_COLORS.turquoise }}>
                Gerenciar Materiais de Divulgação
              </h1>
              <p className="text-sm" style={{ color: VITAL_COLORS.mediumGray }}>
                Administração de conteúdo para indicadores
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <Tabs defaultValue="materiais">
          <TabsList>
            <TabsTrigger value="materiais">Materiais</TabsTrigger>
            <TabsTrigger value="templates">Templates WhatsApp</TabsTrigger>
          </TabsList>

          <TabsContent value="materiais" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold" style={{ color: VITAL_COLORS.darkGray }}>
                Materiais de Divulgação
              </h2>
              <Button
                onClick={() => {
                  resetMaterialForm();
                  setDialogMaterial(true);
                }}
                style={{ backgroundColor: VITAL_COLORS.turquoise, color: VITAL_COLORS.white }}
              >
                <Plus size={16} className="mr-2" />
                Novo Material
              </Button>
            </div>

            <div className="grid gap-4">
              {materiais.map((material) => (
                <Card key={material.id} className="p-4" style={{ backgroundColor: VITAL_COLORS.white }}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: VITAL_COLORS.beige, color: VITAL_COLORS.darkGray }}>
                          {material.tipo}
                        </span>
                        <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: VITAL_COLORS.lightGray, color: VITAL_COLORS.mediumGray }}>
                          {material.categoria}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-1" style={{ color: VITAL_COLORS.darkGray }}>
                        {material.titulo}
                      </h3>
                      {material.descricao && (
                        <p className="text-sm mb-2" style={{ color: VITAL_COLORS.mediumGray }}>
                          {material.descricao}
                        </p>
                      )}
                      <p className="text-xs font-mono truncate" style={{ color: VITAL_COLORS.mediumGray }}>
                        {material.conteudo}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => editarMaterial(material)}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm("Deletar este material?")) {
                            deletarMaterial.mutate({ id: material.id });
                          }
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold" style={{ color: VITAL_COLORS.darkGray }}>
                Templates WhatsApp
              </h2>
              <Button
                onClick={() => {
                  resetTemplateForm();
                  setDialogTemplate(true);
                }}
                style={{ backgroundColor: VITAL_COLORS.turquoise, color: VITAL_COLORS.white }}
              >
                <Plus size={16} className="mr-2" />
                Novo Template
              </Button>
            </div>

            <div className="grid gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="p-4" style={{ backgroundColor: VITAL_COLORS.white }}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold" style={{ color: VITAL_COLORS.darkGray }}>
                          {template.nome}
                        </h3>
                        <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: VITAL_COLORS.beige, color: VITAL_COLORS.darkGray }}>
                          {template.tipo}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap" style={{ color: VITAL_COLORS.mediumGray }}>
                        {template.mensagem}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => editarTemplate(template)}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm("Deletar este template?")) {
                            deletarTemplate.mutate({ id: template.id });
                          }
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog Material */}
      <Dialog open={dialogMaterial} onOpenChange={setDialogMaterial}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{materialForm.id ? "Editar Material" : "Novo Material"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tipo</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={materialForm.tipo}
                  onChange={(e) => setMaterialForm({ ...materialForm, tipo: e.target.value as any })}
                >
                  <option value="link">Link</option>
                  <option value="arquivo">Arquivo</option>
                  <option value="audio">Áudio</option>
                  <option value="texto">Texto</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Categoria</label>
                <Input
                  placeholder="Ex: checkout, landing_page, pdf..."
                  value={materialForm.categoria}
                  onChange={(e) => setMaterialForm({ ...materialForm, categoria: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Título</label>
              <Input
                placeholder="Nome do material"
                value={materialForm.titulo}
                onChange={(e) => setMaterialForm({ ...materialForm, titulo: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descrição</label>
              <Input
                placeholder="Breve descrição (opcional)"
                value={materialForm.descricao}
                onChange={(e) => setMaterialForm({ ...materialForm, descricao: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {materialForm.tipo === "texto" ? "Texto" : "URL"}
              </label>
              <Textarea
                placeholder={materialForm.tipo === "texto" ? "Texto completo..." : "https://..."}
                value={materialForm.conteudo}
                onChange={(e) => setMaterialForm({ ...materialForm, conteudo: e.target.value })}
                rows={materialForm.tipo === "texto" ? 6 : 2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ordem</label>
              <Input
                type="number"
                value={materialForm.ordem}
                onChange={(e) => setMaterialForm({ ...materialForm, ordem: parseInt(e.target.value) || 0 })}
              />
            </div>

            <Button
              onClick={handleSaveMaterial}
              className="w-full"
              style={{ backgroundColor: VITAL_COLORS.turquoise, color: VITAL_COLORS.white }}
            >
              <Save size={16} className="mr-2" />
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Template */}
      <Dialog open={dialogTemplate} onOpenChange={setDialogTemplate}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{templateForm.id ? "Editar Template" : "Novo Template"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome</label>
              <Input
                placeholder="Nome do template"
                value={templateForm.nome}
                onChange={(e) => setTemplateForm({ ...templateForm, nome: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tipo</label>
              <select
                className="w-full p-2 border rounded-lg"
                value={templateForm.tipo}
                onChange={(e) => setTemplateForm({ ...templateForm, tipo: e.target.value as any })}
              >
                <option value="cliente">Cliente</option>
                <option value="parceiro">Parceiro</option>
                <option value="comercial">Comercial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mensagem</label>
              <Textarea
                placeholder="Texto da mensagem WhatsApp..."
                value={templateForm.mensagem}
                onChange={(e) => setTemplateForm({ ...templateForm, mensagem: e.target.value })}
                rows={8}
              />
            </div>

            <Button
              onClick={handleSaveTemplate}
              className="w-full"
              style={{ backgroundColor: VITAL_COLORS.turquoise, color: VITAL_COLORS.white }}
            >
              <Save size={16} className="mr-2" />
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
