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
// [REMOVIDO] Imports de indicações removidos
// import Indicacoes from "./pages/Indicacoes";
// import CadastroIndicador from "./pages/CadastroIndicador";
// etc...
import GaleriaLogos from "./pages/GaleriaLogos";
import TermosDeUso from "./pages/TermosDeUso";
// [REMOVIDO] import MateriaisDivulgacao from "./pages/MateriaisDivulgacao";
// [DESATIVADO] import AdminMateriais from "./pages/AdminMateriais";
import AdminNotificacoes from "./pages/AdminNotificacoes";
// [REMOVIDO] Imports de indicações removidos
// import BoasVindasIndicadores from "./pages/BoasVindasIndicadores";
// import IndicacoesEstatisticas from "./pages/IndicacoesEstatisticas";
// import IndicacoesComissoes from "./pages/IndicacoesComissoes";
import GaleriaParceiros from "./pages/GaleriaParceiros";
import AdminAvaliacoes from "./pages/AdminAvaliacoes";
import SugerirParceiro from "./pages/SugerirParceiro";
import FormularioParceiro from "./pages/FormularioParceiro";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Consulta} />
      <Route path={"/login-dados-internos"} component={LoginDadosInternos} />
      <Route path={"/solicitar-acesso"} component={SolicitarAcesso} />
      <Route path="/recuperar-senha-dados-internos" component={RecuperarSenhaDadosInternos} />
      {/* [REMOVIDO] Rotas de indicações removidas */}
      {/* <Route path="/indicacoes" component={Indicacoes} /> */}
      {/* <Route path="/indicacoes/estatisticas" component={IndicacoesEstatisticas} /> */}
      {/* <Route path="/indicacoes/comissoes" component={IndicacoesComissoes} /> */}
      {/* <Route path="/cadastro-indicador" component={CadastroIndicador} /> */}
      {/* <Route path="/boas-vindas-indicadores" component={BoasVindasIndicadores} /> */}
      {/* <Route path="/login-indicador" component={LoginIndicador} /> */}
      {/* <Route path="/esqueci-senha" component={EsqueciSenha} /> */}
      {/* <Route path="/recuperar-senha" component={RecuperarSenha} /> */}
      {/* [REMOVIDO] <Route path="/qr-codes" component={QRCodes} /> */}
      <Route path={"/dados-internos"} component={Home} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/galeria-logos"} component={GaleriaLogos} />
      <Route path={"/admin/avaliacoes"} component={AdminAvaliacoes} />
      <Route path={"/sugerir-parceiro"} component={SugerirParceiro} />
      <Route path={"/galeria-parceiros"} component={GaleriaParceiros} />
      <Route path={"/termos-de-uso"} component={TermosDeUso} />
      {/* [REMOVIDO] <Route path={"/materiais-divulgacao"} component={MateriaisDivulgacao} /> */}
       {/* [DESATIVADO] <Route path={"admin/materiais"} component={AdminMateriais} /> */}
      <Route path={"admin/notificacoes"} component={AdminNotificacoes} />
      <Route path={"/parceiros"} component={Parceiros} />
      <Route path={"/formulario-parceiro"} component={FormularioParceiro} />
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
