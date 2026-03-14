import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/authStore";
import { DashboardLayout } from "@/components/DashboardLayout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import WarehouseDashboard from "./pages/WarehouseDashboard";
import Products from "./pages/Products";
import OperationsPage from "./pages/OperationsPage";
import Adjustments from "./pages/Adjustments";
import MoveHistory from "./pages/MoveHistory";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && user?.role !== requiredRole) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login"           element={<Login />} />
          <Route path="/signup"          element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Inventory Manager routes */}
          <Route
            element={
              <ProtectedRoute requiredRole="Inventory Manager">
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard"          element={<Dashboard />} />
            <Route path="/products"           element={<Products />} />
            <Route path="/receipts"           element={<OperationsPage type="IN" />} />
            <Route path="/deliveries"         element={<OperationsPage type="OUT" />} />
            <Route path="/adjustments"        element={<Adjustments />} />
            <Route path="/history"            element={<MoveHistory />} />
            <Route path="/settings/warehouse" element={<Settings />} />
            <Route path="/settings/locations" element={<Settings />} />
            <Route path="/profile"            element={<Profile />} />
          </Route>

          {/* Warehouse Staff routes */}
          <Route
            element={
              <ProtectedRoute requiredRole="Warehouse Staff">
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/warehouse-dashboard" element={<WarehouseDashboard />} />
            <Route path="/receipts"            element={<OperationsPage type="IN" />} />
            <Route path="/deliveries"          element={<OperationsPage type="OUT" />} />
            <Route path="/history"             element={<MoveHistory />} />
            <Route path="/profile"             element={<Profile />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
