import { Link } from "wouter";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-[#1a7b7b] to-[#c4a574] text-white py-8 mt-auto">
      <div className="container">
        <div className="text-center space-y-4">
          <div className="flex justify-center gap-6 text-sm">
            <Link href="/politica-privacidade">
              <a className="hover:underline transition-all">
                Política de Privacidade
              </a>
            </Link>
            <span className="text-white/50">|</span>
            <Link href="/termos-uso">
              <a className="hover:underline transition-all">
                Termos de Uso
              </a>
            </Link>
          </div>
          <div className="space-y-2">
            <p className="text-sm">
              © {currentYear} Vital Serviços Médicos Ltda.
            </p>
            <p className="text-sm">
              Todos os direitos reservados.
            </p>
            <p className="text-sm font-mono">
              CNPJ: 55.315.803/0001-27
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
