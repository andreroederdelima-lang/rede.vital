import { APP_LOGO } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Printer, QrCode, Share2 } from "lucide-react";
import { toast } from "sonner";

export default function QRCodes() {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/qrcode-whatsapp-vendas.png';
    link.download = 'QRCode-WhatsApp-Vital-Vendas.png';
    link.click();
    toast.success("QR Code baixado com sucesso!");
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>QR Code - WhatsApp Vital</title>
          <style>
            @page { size: A4; margin: 2cm; }
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              text-align: center;
            }
            .logo { max-width: 200px; margin-bottom: 30px; }
            .qrcode { max-width: 400px; margin: 20px 0; border: 4px solid #1e9d9f; border-radius: 12px; }
            h1 { color: #1e9d9f; font-size: 28pt; margin: 20px 0; }
            p { font-size: 14pt; color: #666; margin: 10px 0; }
            .footer { margin-top: 40px; font-size: 10pt; color: #999; }
          </style>
        </head>
        <body>
          <img src="${APP_LOGO}" alt="Vital Logo" class="logo" />
          <h1>Fale com Nossos Especialistas</h1>
          <p>Escaneie o QR Code para entrar em contato via WhatsApp</p>
          <img src="/qrcode-whatsapp-vendas.png" alt="QR Code WhatsApp" class="qrcode" />
          <p style="font-weight: bold; color: #1e9d9f; font-size: 16pt;">Vem ser VITAL!</p>
          <div class="footer">
            <p>© 2025 Sua Saúde Vital - Todos os direitos reservados</p>
            <p>Vale do Itajaí - Santa Catarina</p>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/qrcode-whatsapp-vendas.png`;
    if (navigator.share) {
      navigator.share({
        title: 'QR Code - WhatsApp Vital',
        text: 'Escaneie para falar com nossos especialistas!',
        url: url,
      }).catch(() => {
        // Fallback: copiar link
        navigator.clipboard.writeText(url);
        toast.success("Link do QR Code copiado!");
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link do QR Code copiado!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background">
      <div className="container py-12">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <img src={APP_LOGO} alt="Vital Logo" className="h-24 w-auto mb-6" />
          <h1 className="text-4xl font-bold text-primary mb-2">QR Codes para Promotores</h1>
          <p className="text-muted-foreground max-w-2xl">
            Baixe e imprima os QR Codes para facilitar o contato dos clientes com nossa equipe de vendas
          </p>
        </div>

        {/* QR Code Principal */}
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <QrCode className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-2xl">WhatsApp - Time de Vendas</CardTitle>
              <CardDescription>
                QR Code para contato direto com nossos especialistas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* QR Code Image */}
              <div className="flex justify-center">
                <div className="bg-white p-6 rounded-lg border-4 border-primary shadow-lg">
                  <img
                    src="/qrcode-whatsapp-vendas.png"
                    alt="QR Code WhatsApp Vendas"
                    className="w-64 h-64"
                  />
                </div>
              </div>

              {/* Informações */}
              <div className="bg-primary/5 p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Ao escanear, o cliente será direcionado para o WhatsApp com a mensagem:
                </p>
                <p className="font-medium text-primary">
                  "Olá! Gostaria de conhecer os planos Vital."
                </p>
              </div>

              {/* Botões de Ação */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button onClick={handleDownload} className="w-full" size="lg">
                  <Download className="h-5 w-5 mr-2" />
                  Baixar PNG
                </Button>
                <Button onClick={handlePrint} variant="outline" className="w-full" size="lg">
                  <Printer className="h-5 w-5 mr-2" />
                  Imprimir
                </Button>
                <Button onClick={handleShare} variant="outline" className="w-full" size="lg">
                  <Share2 className="h-5 w-5 mr-2" />
                  Compartilhar
                </Button>
              </div>

              {/* Dicas de Uso */}
              <div className="border-t pt-6 space-y-3">
                <h3 className="font-semibold text-lg">💡 Dicas de Uso:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Imprima em papel de qualidade para melhor leitura do QR Code</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Coloque em locais visíveis durante eventos e apresentações</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Compartilhe digitalmente em redes sociais e grupos de WhatsApp</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Adicione ao seu material de divulgação (cartões, folders, banners)</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botão Voltar */}
        <div className="flex justify-center mt-8">
          <Button variant="ghost" onClick={() => window.history.back()}>
            ← Voltar
          </Button>
        </div>
      </div>
    </div>
  );
}
