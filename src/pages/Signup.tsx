import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Signup = () => {
  const [loginId, setLoginId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const signup = useAuthStore(s => s.signup);
  const navigate = useNavigate();
  const { toast } = useToast();

  const validate = () => {
    const errs: string[] = [];
    if (password.length < 8) errs.push("Min 8 characters");
    if (!/[A-Z]/.test(password)) errs.push("Needs uppercase");
    if (!/[a-z]/.test(password)) errs.push("Needs lowercase");
    if (!/[0-9]/.test(password)) errs.push("Needs number");
    if (password !== confirmPassword) errs.push("Passwords don't match");
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const result = signup(loginId, email, password);
    if (result.success) {
      toast({ title: "Account Created", description: "You can now sign in." });
      navigate("/login");
    } else {
      toast({ title: "Signup Failed", description: result.error, variant: "destructive" });
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
            CREATE <span className="text-primary">ACCOUNT</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 border border-border rounded-sm p-6 bg-card">
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase tracking-wider">Login ID</Label>
            <Input value={loginId} onChange={e => setLoginId(e.target.value)} placeholder="Choose login ID" className="font-mono" required />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase tracking-wider">Email</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" className="font-mono" required />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase tracking-wider">Password</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="font-mono" required />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase tracking-wider">Confirm Password</Label>
            <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm password" className="font-mono" required />
          </div>
          {errors.length > 0 && (
            <div className="text-xs text-destructive font-mono space-y-1">
              {errors.map((e, i) => <p key={i}>⚠ {e}</p>)}
            </div>
          )}
          <Button type="submit" className="w-full font-mono uppercase tracking-wider">Sign Up</Button>
          <p className="text-center text-xs text-muted-foreground font-mono">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:text-primary/80">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
