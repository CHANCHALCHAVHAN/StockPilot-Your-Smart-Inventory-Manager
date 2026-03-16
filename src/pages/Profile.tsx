import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { UserCircle } from "lucide-react";

const Profile = () => {
  const { user, updateProfile, changePassword, logout } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");

  const handleSaveProfile = () => {
    updateProfile({ name, email });
    setEditing(false);
    toast({ title: "Profile Updated" });
  };

  const handleChangePassword = () => {
    if (changePassword(oldPass, newPass)) {
      toast({ title: "Password Changed" });
      setOldPass("");
      setNewPass("");
    } else {
      toast({ title: "Failed", description: "Current password is incorrect.", variant: "destructive" });
    }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  if (!user) return null;

  return (
    <div className="max-w-lg space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm font-mono uppercase tracking-wider flex items-center gap-2">
            <UserCircle className="h-4 w-4 text-primary" /> User Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs font-mono uppercase">Name</Label>
            {editing ? (
              <Input value={name} onChange={e => setName(e.target.value)} className="font-mono" />
            ) : (
              <p className="text-sm font-mono p-2 rounded-sm bg-muted">{user.name}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-mono uppercase">Email</Label>
            {editing ? (
              <Input value={email} onChange={e => setEmail(e.target.value)} className="font-mono" />
            ) : (
              <p className="text-sm font-mono p-2 rounded-sm bg-muted">{user.email}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-mono uppercase">Role</Label>
            <p className="text-sm font-mono p-2 rounded-sm bg-muted">{user.role}</p>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button onClick={handleSaveProfile} className="font-mono text-xs uppercase">Save</Button>
                <Button variant="outline" onClick={() => setEditing(false)} className="font-mono text-xs">Cancel</Button>
              </>
            ) : (
              <Button onClick={() => setEditing(true)} className="font-mono text-xs uppercase">Edit Profile</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm font-mono uppercase tracking-wider">Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs font-mono uppercase">Current Password</Label>
            <Input type="password" value={oldPass} onChange={e => setOldPass(e.target.value)} className="font-mono" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-mono uppercase">New Password</Label>
            <Input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className="font-mono" />
          </div>
          <Button onClick={handleChangePassword} className="font-mono text-xs uppercase">Update Password</Button>
        </CardContent>
      </Card>

      <Button variant="destructive" onClick={handleLogout} className="font-mono text-xs uppercase tracking-wider w-full">
        Logout
      </Button>
    </div>
  );
};

export default Profile;
