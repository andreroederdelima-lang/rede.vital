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
import LoginAdmin from "./pages/LoginAdmin";
import RecuperarSenhaAdmin from "./pages/RecuperarSenhaAdmin";
import FormularioParceiro from "./pages/FormularioParceiro";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Consulta} />
      <Route path={"/login-dados-internos"} component={LoginDadosInternos} />
      <Route path={"/solicitar-acesso"} component={SolicitarAcesso} />
      <Route path={"/login-admin"} component={LoginAdmin} />
      <Route path={"/recuperar-senha-admin"} component={RecuperarSenhaAdmin} />
      <Route path={"/formulario-parceiro"} component={FormularioParceiro} />
      <Route path={"/dados-internos"} component={Home} />
      <Route path={"/admin"} component={Admin} />
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
