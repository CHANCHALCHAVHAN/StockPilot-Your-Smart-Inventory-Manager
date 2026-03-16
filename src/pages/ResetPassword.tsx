import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getPendingOtp, setPendingOtp } from "./ForgotPassword";
import { useAuthStore } from "@/store/authStore";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const resetPasswordByEmail = useAuthStore(s => s.resetPasswordByEmail);

  const validate = () => {
    const errs: string[] = [];
    if (newPassword.length < 8)          errs.push("Min 8 characters");
    if (!/[A-Z]/.test(newPassword))      errs.push("Needs uppercase letter");
    if (!/[a-z]/.test(newPassword))      errs.push("Needs lowercase letter");
    if (!/[0-9]/.test(newPassword))      errs.push("Needs a number");
    if (newPassword !== confirmPassword)  errs.push("Passwords don't match");
    setErrors(errs);
    return errs.length === 0;
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Error", description: "Invalid reset link.", variant: "destructive" });
      return;
    }
    const p = getPendingOtp();
    if (!p || p.email !== email.toLowerCase()) {
      toast({ title: "Session Expired", description: "Please restart the password reset process.", variant: "destructive" });
      navigate("/forgot-password");
      return;
    }
    if (!validate()) return;

    const ok = resetPasswordByEmail(email, newPassword);
    if (!ok) {
      toast({ title: "Error", description: "Email not found in the system.", variant: "destructive" });
      return;
    }

    setPendingOtp(null);
    toast({ title: "Password Reset", description: "Your password has been updated. Please sign in." });
    navigate("/login");
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4">
          <p className="font-mono text-muted-foreground">Invalid reset link.</p>
          <Link to="/forgot-password" className="text-primary font-mono text-sm hover:text-primary/80">
            Request a new one
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
          <p className="text-xs text-muted-foreground font-mono">{email}</p>
        </div>

        <form onSubmit={handleReset} className="space-y-4 border border-border rounded-sm p-6 bg-card">
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase tracking-wider">New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="New password"
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
          <Button type="submit" className="w-full font-mono uppercase tracking-wider">
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
