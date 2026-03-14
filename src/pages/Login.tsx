import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const login = useAuthStore(s => s.login);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(loginId, password)) {
      navigate("/dashboard");
    } else {
      toast({ title: "Authentication Failed", description: "Invalid login ID or password.", variant: "destructive" });
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
            <Label htmlFor="loginId" className="text-xs font-mono uppercase tracking-wider">Login ID</Label>
            <Input id="loginId" value={loginId} onChange={e => setLoginId(e.target.value)} placeholder="Enter login ID" className="font-mono" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-mono uppercase tracking-wider">Password</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" className="font-mono" required />
          </div>
          <Button type="submit" className="w-full font-mono uppercase tracking-wider">Sign In</Button>
          <div className="flex justify-between text-xs">
            <button type="button" className="text-muted-foreground hover:text-primary transition-colors font-mono">Forgot Password?</button>
            <Link to="/signup" className="text-primary hover:text-primary/80 transition-colors font-mono">Sign Up</Link>
          </div>
        </form>

        <p className="text-center text-[10px] text-muted-foreground font-mono">
          Demo: admin / Admin123!
        </p>
      </div>
    </div>
  );
};

export default Login;
