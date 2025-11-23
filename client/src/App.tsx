import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Parceiros from "./pages/Parceiros";
import Consulta from "./pages/Consulta";
import AtualizarDados from "./pages/AtualizarDados";
import LoginDadosInternos from "./pages/LoginDadosInternos";
import SolicitarAcesso from "./pages/SolicitarAcesso";
import RecuperarSenhaDadosInternos from "./pages/RecuperarSenhaDadosInternos";
import Indicacoes from "./pages/Indicacoes";
import CadastroIndicador from "./pages/CadastroIndicador";
import LoginIndicador from "./pages/LoginIndicador";
import QRCodes from "./pages/QRCodes";
import EsqueciSenha from "./pages/EsqueciSenha";
import RecuperarSenha from "./pages/RecuperarSenha";
import GaleriaLogos from "./pages/GaleriaLogos";
import TermosDeUso from "./pages/TermosDeUso";
import MateriaisDivulgacao from "./pages/MateriaisDivulgacao";
import AdminMateriais from "./pages/AdminMateriais";
import AdminNotificacoes from "./pages/AdminNotificacoes";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Consulta} />
      <Route path={"/login-dados-internos"} component={LoginDadosInternos} />
      <Route path={"/solicitar-acesso"} component={SolicitarAcesso} />
      <Route path="/recuperar-senha-dados-internos" component={RecuperarSenhaDadosInternos} />
      <Route path="/indicacoes" component={Indicacoes} />
      <Route path="/cadastro-indicador" component={CadastroIndicador} />
      <Route path="/login-indicador" component={LoginIndicador} />
      <Route path="/esqueci-senha" component={EsqueciSenha} />
      <Route path="/recuperar-senha" component={RecuperarSenha} />
      <Route path="/qr-codes" component={QRCodes} />
      <Route path={"/dados-internos"} component={Home} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/galeria-logos"} component={GaleriaLogos} />
      <Route path={"/termos-de-uso"} component={TermosDeUso} />
      <Route path={"/materiais-divulgacao"} component={MateriaisDivulgacao} />
       <Route path={"admin/materiais"} component={AdminMateriais} />
      <Route path={"admin/notificacoes"} component={AdminNotificacoes} />
      <Route path={"/parceiros"} component={Parceiros} />
      <Route path={"/atualizar-dados/:token"} component={AtualizarDados} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
