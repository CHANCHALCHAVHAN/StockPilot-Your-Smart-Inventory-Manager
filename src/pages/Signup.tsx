import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore, type Role } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLES: Role[] = ["Inventory Manager", "Warehouse Staff"];

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const signup = useAuthStore(s => s.signup);
  const navigate = useNavigate();
  const { toast } = useToast();

  const validate = () => {
    const errs: string[] = [];
    if (password.length < 8)          errs.push("Min 8 characters");
    if (!/[A-Z]/.test(password))      errs.push("Needs uppercase letter");
    if (!/[a-z]/.test(password))      errs.push("Needs lowercase letter");
    if (!/[0-9]/.test(password))      errs.push("Needs a number");
    if (password !== confirmPassword)  errs.push("Passwords don't match");
    if (!role)                         errs.push("Please select a role");
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await signup(name, email, password, role as Role);
    setLoading(false);

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
            <Label className="text-xs font-mono uppercase tracking-wider">Name</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Full name"
              className="font-mono"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase tracking-wider">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email address"
              className="font-mono"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase tracking-wider">Role</Label>
            <Select onValueChange={(v) => setRole(v as Role)} value={role}>
              <SelectTrigger className="font-mono">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map(r => (
                  <SelectItem key={r} value={r} className="font-mono">{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase tracking-wider">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className="font-mono"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase tracking-wider">Confirm Password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="font-mono"
              required
            />
          </div>
          {errors.length > 0 && (
            <div className="text-xs text-destructive font-mono space-y-1">
              {errors.map((e, i) => <p key={i}>⚠ {e}</p>)}
            </div>
          )}
          <Button type="submit" className="w-full font-mono uppercase tracking-wider" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>
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
