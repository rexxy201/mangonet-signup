import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSubmissions, useAdminAuth, usePaystackKey, usePaystackSecretKey, useLogo, useFavicon, useSeoImage, useInstallationCost, useSignupNote } from "@/lib/storage";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Submission } from "@/lib/storage";
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Download,
  Eye,
  Wifi,
  MapPin,
  Key,
  LogOut,
  Save,
  Upload,
  Trash2,
  Image,
  Settings,
  Lock,
  UserPlus,
  Trash2 as TrashIcon,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocation } from "wouter";

export default function Admin() {
  const { submissions, updateStatus } = useSubmissions();
  const { isAuthenticated, isLoading, logout, isAdmin } = useAdminAuth();
  const [, setLocation] = useLocation();
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const stats = [
    { label: "Total Applications", value: submissions.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pending Payment", value: submissions.filter(s => s.status === 'pending').length, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Paid", value: submissions.filter(s => s.status === 'paid').length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Approved", value: submissions.filter(s => s.status === 'approved').length, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    { label: "Rejected", value: submissions.filter(s => s.status === 'rejected').length, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
  ];

  const handleLogout = () => {
    logout();
    setLocation("/admin/login");
  };

  const handleExportCSV = () => {
    if (submissions.length === 0) return;
    const headers = ["ID","First Name","Last Name","Email","Phone","NIN","Address","City","State","Zip Code","Plan","WiFi SSID","WiFi Password","Installation Date","Notes","Status","Payment Ref","Submitted At"];
    const escapeCSV = (val: string | null | undefined) => {
      if (val == null) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };
    const rows = submissions.map(s => [
      s.id, s.firstName, s.lastName, s.email, s.phone, s.nin, s.address, s.city, s.state,
      s.zipCode, s.plan, s.wifiSsid, s.wifiPassword, s.installationDate, s.notes,
      s.status, s.paymentRef, s.submittedAt
    ].map(escapeCSV).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `mangonet-submissions-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 container py-8 px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-2">Manage customer applications, technical details, and documents.</p>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => setShowSettings(true)} data-testid="button-settings">
                <Settings className="mr-2 h-4 w-4" /> Settings
              </Button>
            )}
             <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={submissions.length === 0} data-testid="button-export-csv">
                <Download className="mr-2 h-4 w-4" /> Export CSV
             </Button>
             <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                <LogOut className="mr-2 h-4 w-4" /> Logout
             </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-sm border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
            <div>
              <CardTitle className="text-xl">Service Applications</CardTitle>
              <CardDescription>Review technical configurations and verified documents.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <div className="text-center py-20 text-gray-400 border-2 border-dashed rounded-xl">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No applications waiting for review</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[120px]">Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Plan & Network</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((sub) => (
                      <TableRow key={sub.id} className="group transition-colors">
                        <TableCell className="whitespace-nowrap font-medium text-gray-500">
                          {format(new Date(sub.submittedAt), "MMM d, HH:mm")}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900">{sub.firstName} {sub.lastName}</span>
                            <span className="text-xs text-gray-500">{sub.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant="secondary" className="w-fit text-[10px] uppercase font-bold tracking-wider">
                              {sub.plan}
                            </Badge>
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <Wifi className="h-3 w-3" /> 
                              <span className="font-mono">{sub.wifiSsid}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusSelect submission={sub} onUpdate={updateStatus} isAdmin={isAdmin} />
                        </TableCell>
                        <TableCell className="text-right">
                          <ApplicationDetails sub={sub} onUpdateStatus={updateStatus} isAdmin={isAdmin} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Key Settings Modal */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Configuration</DialogTitle>
              <DialogDescription>
                Manage API keys, team access, and system settings here.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-6">
              <LogoSettings />
              <div className="border-t pt-4">
                <FaviconSettings />
              </div>
              <div className="border-t pt-4">
                <SeoImageSettings />
              </div>
              <div className="border-t pt-4">
                <InstallationCostSettings />
              </div>
              <div className="border-t pt-4">
                <SignupNoteSettings />
              </div>
              <div className="border-t pt-4">
                <PasswordSettings />
              </div>
              <div className="border-t pt-4">
                <KeySettings />
              </div>
              <div className="border-t pt-4">
                <TeamManagement />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

function LogoSettings() {
  const { logo, saveLogo, removeLogo } = useLogo();
  const [isSaved, setIsSaved] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      alert("Logo must be under 500KB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      saveLogo(reader.result as string);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium leading-none">Site Logo</label>
      <div className="flex items-center gap-4">
        <div data-testid="logo-preview" className="h-16 w-16 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden bg-gray-50">
          {logo ? (
            <img src={logo} alt="Logo" className="h-full w-full object-contain p-1" data-testid="img-logo" />
          ) : (
            <Image className="h-6 w-6 text-gray-300" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="cursor-pointer" data-testid="button-upload-logo">
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} data-testid="input-logo-file" />
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              <Upload className="h-3.5 w-3.5" />
              {logo ? "Change logo" : "Upload logo"}
            </span>
          </label>
          {logo && (
            <button onClick={removeLogo} data-testid="button-remove-logo" className="inline-flex items-center gap-1.5 text-sm font-medium text-destructive hover:underline text-left">
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          )}
        </div>
        {isSaved && <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />}
      </div>
      <p className="text-[10px] text-muted-foreground">PNG or JPG, max 500KB. Shown in the site header.</p>
    </div>
  );
}

function FaviconSettings() {
  const { favicon, saveFavicon, removeFavicon } = useFavicon();
  const [isSaved, setIsSaved] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      alert("Favicon must be under 500KB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      saveFavicon(reader.result as string);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium leading-none">Browser Tab Icon (Favicon)</label>
      <div className="flex items-center gap-4">
        <div data-testid="favicon-preview" className="h-12 w-12 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden bg-gray-50">
          {favicon ? (
            <img src={favicon} alt="Favicon" className="h-full w-full object-contain p-1" data-testid="img-favicon" />
          ) : (
            <Image className="h-5 w-5 text-gray-300" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="cursor-pointer" data-testid="button-upload-favicon">
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} data-testid="input-favicon-file" />
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              <Upload className="h-3.5 w-3.5" />
              {favicon ? "Change favicon" : "Upload favicon"}
            </span>
          </label>
          {favicon && (
            <button onClick={removeFavicon} data-testid="button-remove-favicon" className="inline-flex items-center gap-1.5 text-sm font-medium text-destructive hover:underline text-left">
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          )}
        </div>
        {isSaved && <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />}
      </div>
      <p className="text-[10px] text-muted-foreground">Small icon shown in the browser tab. PNG recommended, max 500KB.</p>
    </div>
  );
}

function SeoImageSettings() {
  const { seoImage, saveSeoImage, removeSeoImage } = useSeoImage();
  const [isSaved, setIsSaved] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      alert("SEO image must be under 500KB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      saveSeoImage(reader.result as string);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium leading-none">SEO / Sharing Image</label>
      <div className="flex items-center gap-4">
        <div data-testid="seo-image-preview" className="h-16 w-24 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden bg-gray-50">
          {seoImage ? (
            <img src={seoImage} alt="SEO Image" className="h-full w-full object-contain p-1" data-testid="img-seo" />
          ) : (
            <Image className="h-6 w-6 text-gray-300" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="cursor-pointer" data-testid="button-upload-seo">
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} data-testid="input-seo-file" />
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              <Upload className="h-3.5 w-3.5" />
              {seoImage ? "Change image" : "Upload image"}
            </span>
          </label>
          {seoImage && (
            <button onClick={removeSeoImage} data-testid="button-remove-seo" className="inline-flex items-center gap-1.5 text-sm font-medium text-destructive hover:underline text-left">
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          )}
        </div>
        {isSaved && <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />}
      </div>
      <p className="text-[10px] text-muted-foreground">Image shown when the site is shared on social media (WhatsApp, Twitter, etc.). Max 500KB.</p>
    </div>
  );
}

function PasswordSettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setErrorMsg("New passwords do not match");
      setStatus("error");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      setStatus("error");
      return;
    }
    setStatus("saving");
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.message || "Failed to change password");
        setStatus("error");
        return;
      }
      setStatus("success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setErrorMsg("Something went wrong");
      setStatus("error");
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium leading-none flex items-center gap-1.5">
        <Lock className="h-3.5 w-3.5" /> Change Password
      </label>
      <div className="space-y-2">
        <Input
          type="password"
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => { setCurrentPassword(e.target.value); setStatus("idle"); }}
          data-testid="input-current-password"
        />
        <Input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => { setNewPassword(e.target.value); setStatus("idle"); }}
          data-testid="input-new-password"
        />
        <Input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => { setConfirmPassword(e.target.value); setStatus("idle"); }}
          data-testid="input-confirm-password"
        />
      </div>
      {status === "error" && <p className="text-xs text-destructive font-medium" data-testid="text-password-error">{errorMsg}</p>}
      {status === "success" && <p className="text-xs text-green-600 font-medium" data-testid="text-password-success">Password changed successfully</p>}
      <Button
        onClick={handleChangePassword}
        size="sm"
        disabled={status === "saving" || !currentPassword || !newPassword || !confirmPassword}
        data-testid="button-change-password"
      >
        {status === "saving" ? "Saving..." : "Update Password"}
      </Button>
    </div>
  );
}

function KeySettings() {
  const { key: publicKey, saveKey: savePublicKey } = usePaystackKey();
  const { key: secretKey, saveKey: saveSecretKey } = usePaystackSecretKey();
  const [publicInput, setPublicInput] = useState(publicKey);
  const [secretInput, setSecretInput] = useState(secretKey);
  const [publicSaved, setPublicSaved] = useState(false);
  const [secretSaved, setSecretSaved] = useState(false);

  useEffect(() => {
    setPublicInput(publicKey);
  }, [publicKey]);

  useEffect(() => {
    setSecretInput(secretKey);
  }, [secretKey]);

  const handleSavePublic = () => {
    savePublicKey(publicInput);
    setPublicSaved(true);
    setTimeout(() => setPublicSaved(false), 2000);
  };

  const handleSaveSecret = () => {
    saveSecretKey(secretInput);
    setSecretSaved(true);
    setTimeout(() => setSecretSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Paystack Public Key</label>
        <div className="flex gap-2">
          <Input 
            value={publicInput} 
            onChange={(e) => setPublicInput(e.target.value)}
            placeholder="pk_test_..." 
            type="password"
          />
          <Button onClick={handleSavePublic} size="icon">
            {publicSaved ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Save className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Used to initialize payment on the frontend.
        </p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Paystack Secret Key</label>
        <div className="flex gap-2">
          <Input 
            value={secretInput} 
            onChange={(e) => setSecretInput(e.target.value)}
            placeholder="sk_test_..." 
            type="password"
          />
          <Button onClick={handleSaveSecret} size="icon">
            {secretSaved ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Save className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Used to verify payments on the server. Keep this private.
        </p>
      </div>
    </div>
  );
}

function InstallationCostSettings() {
  const { rawValue, saveCost } = useInstallationCost();
  const [costInput, setCostInput] = useState(rawValue);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setCostInput(rawValue);
  }, [rawValue]);

  const handleSave = () => {
    const num = parseInt(costInput);
    if (isNaN(num) || num <= 0) return;
    saveCost(costInput);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none">Installation Cost (NGN)</label>
      <div className="flex gap-2">
        <Input
          type="number"
          value={costInput}
          onChange={(e) => setCostInput(e.target.value)}
          placeholder="100000"
          min="0"
          data-testid="input-installation-cost"
        />
        <Button onClick={handleSave} size="icon" data-testid="button-save-cost">
          {saved ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Save className="h-4 w-4" />}
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground">
        Amount charged to customers during signup (in Naira). Currently: ₦{parseInt(rawValue || "100000").toLocaleString()}
      </p>
    </div>
  );
}

function SignupNoteSettings() {
  const { note, saveNote } = useSignupNote();
  const [noteInput, setNoteInput] = useState(note);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setNoteInput(note);
  }, [note]);

  const handleSave = () => {
    saveNote(noteInput);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none">Signup Note</label>
      <div className="flex gap-2 items-start">
        <textarea
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={noteInput}
          onChange={(e) => setNoteInput(e.target.value)}
          placeholder="Note displayed below the signup button..."
          data-testid="input-signup-note"
        />
        <Button onClick={handleSave} size="icon" className="shrink-0" data-testid="button-save-note">
          {saved ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Save className="h-4 w-4" />}
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground">
        This note is displayed below the signup button on the signup page. Leave empty to hide it.
      </p>
    </div>
  );
}

function TeamManagement() {
  const [users, setUsers] = useState<{ id: string; username: string; role: string }[]>([]);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("standard");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data);
    } catch {}
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    if (!newUsername || !newPassword) {
      setError("Username and password are required");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername, password: newPassword, role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to add user");
        setLoading(false);
        return;
      }
      setNewUsername("");
      setNewPassword("");
      setNewRole("standard");
      await fetchUsers();
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      await fetchUsers();
    } catch {}
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium leading-none flex items-center gap-2">
        <UserPlus className="h-4 w-4" /> Team Members
      </label>
      <p className="text-[10px] text-muted-foreground">
        Add team members who can access the admin dashboard. They log in with their username and password.
      </p>
      {users.length > 0 && (
        <div className="space-y-2">
          {users.map(user => (
            <div key={user.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{user.username}</span>
                <Badge variant="outline" className={`text-[10px] ${user.role === "admin" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                  {user.role === "admin" ? "Admin" : "Standard"}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                onClick={() => handleDeleteUser(user.id)}
                data-testid={`button-delete-user-${user.id}`}
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <div className="space-y-2">
        <Input
          placeholder="Username"
          value={newUsername}
          onChange={(e) => { setNewUsername(e.target.value); setError(""); }}
          data-testid="input-new-username"
        />
        <Input
          type="password"
          placeholder="Password"
          value={newPassword}
          onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
          data-testid="input-new-user-password"
        />
        <Select value={newRole} onValueChange={setNewRole}>
          <SelectTrigger className="h-9 text-sm" data-testid="select-new-user-role">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin (Full Access)</SelectItem>
            <SelectItem value="standard">Standard (View Only)</SelectItem>
          </SelectContent>
        </Select>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button onClick={handleAddUser} size="sm" disabled={loading} className="w-full" data-testid="button-add-team-member">
          <UserPlus className="mr-2 h-3.5 w-3.5" />
          {loading ? "Adding..." : "Add Team Member"}
        </Button>
      </div>
    </div>
  );
}

function ApplicationDetails({ sub, onUpdateStatus, isAdmin = true }: { sub: Submission; onUpdateStatus: (id: string, status: string) => void; isAdmin?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b">
          <div className="flex items-center justify-between pr-8">
            <div>
              <DialogTitle className="text-2xl font-bold">Application Details</DialogTitle>
              <DialogDescription>Full technical and personal profile for {sub.firstName} {sub.lastName}</DialogDescription>
            </div>
            <Badge className="capitalize px-3 py-1">{sub.status}</Badge>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-6">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Column 1: Personal & Location */}
            <div className="space-y-6">
              <section>
                <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Customer Info</h4>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <DetailRow label="Phone" value={sub.phone} />
                  <DetailRow label="NIN" value={sub.nin} />
                  <DetailRow label="Email" value={sub.email} />
                </div>
              </section>

              <section>
                <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Installation Address
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-900 font-medium leading-relaxed">
                    {sub.address}<br />
                    {sub.city}, {sub.state} {sub.zipCode}
                  </p>
                </div>
              </section>

              <section>
                <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                   Documents Provided
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { label: "Passport Photo", data: sub.passportPhoto },
                    { label: "Government ID", data: sub.govtId },
                    { label: "Proof of Address", data: sub.proofOfAddress },
                  ].map((doc) => (
                    <div key={doc.label} className="p-3 bg-white border rounded">
                      <p className="text-[10px] text-gray-500 mb-2">{doc.label}</p>
                      {doc.data ? (
                        doc.data.startsWith("data:image") ? (
                          <a href={doc.data} target="_blank" rel="noopener noreferrer">
                            <img src={doc.data} alt={doc.label} className="max-h-32 rounded border object-contain w-full" />
                          </a>
                        ) : (
                          <a href={doc.data} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 underline">
                            View Document
                          </a>
                        )
                      ) : (
                        <Badge variant="outline" className="text-[10px]">Not uploaded</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Column 2: Technical & Installation */}
            <div className="space-y-6">
              <section>
                <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Technical Config</h4>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <DetailRow label="Plan" value={sub.plan} />
                  <DetailRow label="SSID" value={sub.wifiSsid} />
                  <DetailRow label="WiFi Pass" value={sub.wifiPassword} />
                </div>
              </section>

              <section>
                <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Installation Window</h4>
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-lg">
                  <p className="text-sm text-orange-900 font-bold mb-1">Requested Date:</p>
                  <p className="text-lg font-black text-primary">
                    {format(new Date(sub.installationDate), "EEEE, MMMM do")}
                  </p>
                </div>
              </section>

              {sub.notes && (
                <section>
                  <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Notes</h4>
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg italic text-sm text-blue-900">
                    "{sub.notes}"
                  </div>
                </section>
              )}
            </div>
          </div>
        </ScrollArea>
        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
          {isAdmin && (
            <Button onClick={() => { onUpdateStatus(sub.id, "approved"); setOpen(false); }}>Approve & Dispatch</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-500 font-medium">{label}</span>
      <span className="text-gray-900 font-bold">{value}</span>
    </div>
  );
}

function StatusSelect({ submission, onUpdate, isAdmin = true }: { submission: Submission; onUpdate: (id: string, status: string) => void; isAdmin?: boolean }) {
  if (!isAdmin) {
    return (
      <Badge className={`text-xs font-bold ${
        submission.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
        submission.status === 'approved' ? 'bg-green-100 text-green-700' :
        submission.status === 'rejected' ? 'bg-red-100 text-red-700' :
        'bg-yellow-100 text-yellow-700'
      }`}>
        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
      </Badge>
    );
  }
  return (
    <Select
      defaultValue={submission.status}
      onValueChange={(val) => onUpdate(submission.id, val as Submission["status"])}
    >
      <SelectTrigger className={`w-[110px] h-8 text-xs font-bold transition-all ${
        submission.status === 'paid' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
        submission.status === 'approved' ? 'bg-green-100 text-green-700 border-green-300' :
        submission.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-300' :
        'bg-yellow-100 text-yellow-700 border-yellow-300'
      }`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="paid">Paid</SelectItem>
        <SelectItem value="approved">Approved</SelectItem>
        <SelectItem value="rejected">Rejected</SelectItem>
      </SelectContent>
    </Select>
  );
}
