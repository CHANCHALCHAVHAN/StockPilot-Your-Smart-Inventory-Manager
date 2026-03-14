import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const [searchParams]          = useSearchParams();
  const token                   = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState<string[]>([]);
  const navigate                = useNavigate();
  const { toast }               = useToast();

  const validate = () => {
    const errs: string[] = [];
    if (password.length < 8)         errs.push("Min 8 characters");
    if (!/[A-Z]/.test(password))     errs.push("Needs uppercase letter");
    if (!/[a-z]/.test(password))     errs.push("Needs lowercase letter");
    if (!/[0-9]/.test(password))     errs.push("Needs a number");
    if (password !== confirm)        errs.push("Passwords don't match");
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res  = await fetch("http://localhost:5000/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "Password Updated", description: "You can now sign in with your new password." });
      navigate("/login");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Server error.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-3">
          <p className="font-mono text-sm text-destructive">Invalid or missing reset token.</p>
          <Link to="/forgot-password" className="text-primary text-xs font-mono hover:text-primary/80">
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-sm bg-primary flex items-center justify-center red-glow">
            <Package className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="font-mono font-bold text-xl tracking-wider">
            RESET <span className="text-primary">PASSWORD</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 border border-border rounded-sm p-6 bg-card">
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase tracking-wider">New Password</Label>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="New password"
              className="font-mono"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase tracking-wider">Confirm Password</Label>
            <Input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Confirm new password"
              className="font-mono"
              required
            />
          </div>
          {errors.length > 0 && (
            <div className="text-xs text-destructive font-mono space-y-1">
              {errors.map((err, i) => <p key={i}>⚠ {err}</p>)}
            </div>
          )}
          <Button type="submit" className="w-full font-mono uppercase tracking-wider" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
