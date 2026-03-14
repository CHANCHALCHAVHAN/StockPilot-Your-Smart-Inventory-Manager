import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// In a real system this would be sent via email. Here we display it on screen.
let pendingOtp: { email: string; otp: string; expires: number } | null = null;

export function getPendingOtp() {
  return pendingOtp;
}

export function setPendingOtp(v: typeof pendingOtp) {
  pendingOtp = v;
}

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [otp, setOtp] = useState("");
  const { toast } = useToast();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setPendingOtp({ email: email.toLowerCase(), otp: code, expires: Date.now() + 5 * 60 * 1000 });
    setSent(true);
    // Show OTP on screen since there is no email service
    toast({
      title: "OTP Sent (Demo)",
      description: `Your OTP is: ${code}  (valid 5 min)`,
      duration: 30000,
    });
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const p = getPendingOtp();
    if (!p || p.email !== email.toLowerCase()) {
      toast({ title: "Error", description: "No OTP request found for this email.", variant: "destructive" });
      return;
    }
    if (Date.now() > p.expires) {
      toast({ title: "Expired", description: "OTP has expired. Please request a new one.", variant: "destructive" });
      setPendingOtp(null);
      setSent(false);
      return;
    }
    if (p.otp !== otp.trim()) {
      toast({ title: "Invalid OTP", description: "The code you entered is incorrect.", variant: "destructive" });
      return;
    }
    // OTP verified — navigate to reset page via query param
    window.location.href = `/reset-password?email=${encodeURIComponent(email)}`;
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
          <p className="text-xs text-muted-foreground font-mono text-center">
            {sent ? "Enter the OTP shown in the notification" : "Enter your email to receive an OTP"}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSend} className="space-y-4 border border-border rounded-sm p-6 bg-card">
            <div className="space-y-2">
              <Label className="text-xs font-mono uppercase tracking-wider">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="font-mono"
                required
              />
            </div>
            <Button type="submit" className="w-full font-mono uppercase tracking-wider">
              Send OTP
            </Button>
            <p className="text-center text-xs text-muted-foreground font-mono">
              <Link to="/login" className="text-primary hover:text-primary/80">Back to Sign In</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4 border border-border rounded-sm p-6 bg-card">
            <div className="space-y-2">
              <Label className="text-xs font-mono uppercase tracking-wider">OTP Code</Label>
              <Input
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="6-digit code"
                className="font-mono tracking-widest text-center text-lg"
                maxLength={6}
                required
              />
            </div>
            <Button type="submit" className="w-full font-mono uppercase tracking-wider">
              Verify OTP
            </Button>
            <p className="text-center text-xs text-muted-foreground font-mono">
              <button type="button" onClick={() => setSent(false)} className="text-primary hover:text-primary/80">
                Resend OTP
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
