import { MessageCircle } from "lucide-react";

export default function FloatingWhatsApp() {
  const whatsappNumber = "5547933853726";
  const message = encodeURIComponent("Olá! Quero conhecer as assinaturas Vital");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#20BA5A] transition-all hover:scale-110 animate-pulse"
      aria-label="Contato via WhatsApp"
    >
      <MessageCircle className="h-8 w-8" />
    </a>
  );
}
