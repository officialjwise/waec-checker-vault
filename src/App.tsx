
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Buy from "./pages/Buy";
import BuyType from "./pages/BuyType";
import Retrieve from "./pages/Retrieve";
import RetrieveVerify from "./pages/RetrieveVerify";
import Success from "./pages/Success";
import PaymentFailed from "./pages/PaymentFailed";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import Orders from "./pages/admin/Orders";
import Summary from "./pages/admin/Summary";
import Logs from "./pages/admin/Logs";
import Settings from "./pages/admin/Settings";
import UploadCheckers from "./pages/admin/UploadCheckers";
import AdminLayout from "./components/AdminLayout";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('admin_authenticated') === 'true';
  const hasToken = localStorage.getItem('admin_token');
  
  // Check if user has both authentication flag and valid token
  if (!isAuthenticated || !hasToken) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return <>{children}</>;
};

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
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="upload-checkers" element={<UploadCheckers />} />
            <Route path="orders" element={<Orders />} />
            <Route path="summary" element={<Summary />} />
            <Route path="logs" element={<Logs />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
