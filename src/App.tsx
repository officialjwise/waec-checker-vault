
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Buy from "./pages/Buy";
import BuyType from "./pages/BuyType";
import Retrieve from "./pages/Retrieve";
import RetrieveVerify from "./pages/RetrieveVerify";
import Success from "./pages/Success";
import PaymentFailed from "./pages/PaymentFailed";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/buy" element={<Buy />} />
          <Route path="/buy/:waecType" element={<BuyType />} />
          <Route path="/retrieve" element={<Retrieve />} />
          <Route path="/retrieve/verify" element={<RetrieveVerify />} />
          <Route path="/success" element={<Success />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
