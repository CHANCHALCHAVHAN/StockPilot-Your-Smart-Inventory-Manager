import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(s => s.login);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      const role = useAuthStore.getState().user?.role;
      if (role === "Inventory Manager") {
        navigate("/dashboard");
      } else {
        navigate("/warehouse-dashboard");
      }
    } else {
      toast({ title: "Authentication Failed", description: result.error, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-sm bg-primary flex items-center justify-center red-glow">
            <Package className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="font-mono font-bold text-xl tracking-wider">
            CORE<span className="text-primary">INVENTORY</span>
          </h1>
          <p className="text-xs text-muted-foreground font-mono">INVENTORY CONTROL SYSTEM</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 border border-border rounded-sm p-6 bg-card">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-mono uppercase tracking-wider">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter email"
              className="font-mono"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-mono uppercase tracking-wider">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              className="font-mono"
              required
            />
          </div>
          <Button type="submit" className="w-full font-mono uppercase tracking-wider" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </Button>
          <div className="flex justify-between text-xs">
            <Link to="/forgot-password" className="text-muted-foreground hover:text-primary transition-colors font-mono">
              Forgot Password?
            </Link>
            <Link to="/signup" className="text-primary hover:text-primary/80 transition-colors font-mono">
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
