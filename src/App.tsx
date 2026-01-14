import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Companies from "./pages/Companies";
import NewCompany from "./pages/NewCompany";
import Proposals from "./pages/Proposals";
import NewProposal from "./pages/NewProposal";
import Contracts from "./pages/Contracts";
import Plans from "./pages/Plans";
import Contacts from "./pages/Contacts";
import Team from "./pages/Team";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/empresas" element={<Companies />} />
            <Route path="/empresas/nova" element={<NewCompany />} />
            <Route path="/propostas" element={<Proposals />} />
            <Route path="/propostas/nova" element={<NewProposal />} />
            <Route path="/contratos" element={<Contracts />} />
            <Route path="/planos" element={<Plans />} />
            <Route path="/contatos" element={<Contacts />} />
            <Route path="/equipe" element={<Team />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;