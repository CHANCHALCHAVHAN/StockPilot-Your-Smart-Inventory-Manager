import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res  = await fetch("http://localhost:5000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSent(true);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Server error.", variant: "destructive" });
    } finally {
      setLoading(false);
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
            FORGOT <span className="text-primary">PASSWORD</span>
          </h1>
        </div>

        <div className="border border-border rounded-sm p-6 bg-card space-y-4">
          {sent ? (
            <div className="space-y-4 text-center">
              <p className="text-sm font-mono text-muted-foreground">
                If that email is registered, a reset link has been sent. Check your inbox.
              </p>
              <Link to="/login" className="text-primary hover:text-primary/80 text-xs font-mono">
                ← Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-muted-foreground font-mono">
                Enter your email and we'll send you a password reset link.
              </p>
              <div className="space-y-2">
                <Label className="text-xs font-mono uppercase tracking-wider">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="font-mono"
                  required
                />
              </div>
              <Button type="submit" className="w-full font-mono uppercase tracking-wider" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
              <div className="text-center">
                <Link to="/login" className="text-xs text-primary hover:text-primary/80 font-mono">
                  ← Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
