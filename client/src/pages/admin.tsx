import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { NavigationHeader } from "@/components/navigation-header";
import { Footer } from "@/components/footer";
import { Shield, Copy, LogOut, Plus, UserPlus, ArrowLeft, User } from "lucide-react";
import { Link } from "wouter";

interface AdminSession {
  token: string;
  admin: { id: string; username: string };
}

interface Moderator {
  id: string;
  username: string;
  createdAt: string;
}

export default function AdminPage() {
  const { toast } = useToast();
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => {
    const stored = localStorage.getItem("adminSession");
    return stored ? JSON.parse(stored) : null;
  });

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const [newModUsername, setNewModUsername] = useState("");
  const [newModPassword, setNewModPassword] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const moderatorsQuery = useQuery<Moderator[]>({
    queryKey: ["/api/auth/admin/moderators"],
    enabled: !!adminSession,
    queryFn: async () => {
      const res = await fetch("/api/auth/admin/moderators", {
        headers: { Authorization: `Bearer ${adminSession?.token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch moderators");
      return res.json();
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/admin/login", data);
      return res.json();
    },
    onSuccess: (data: AdminSession) => {
      setAdminSession(data);
      localStorage.setItem("adminSession", JSON.stringify(data));
      setUsername("");
      setPassword("");
      toast({ title: "Giriş başarılı", description: `Hoş geldiniz, ${data.admin.username}` });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/admin/moderators"] });
    },
    onError: () => {
      toast({ title: "Giriş başarısız", description: "Kullanıcı adı veya şifre hatalı", variant: "destructive" });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/admin/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${adminSession?.token}` },
      });
    },
    onSuccess: () => {
      setAdminSession(null);
      localStorage.removeItem("adminSession");
      toast({ title: "Çıkış yapıldı" });
    },
  });

  const createModeratorMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const res = await fetch("/api/auth/admin/moderators", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminSession?.token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create moderator");
      return res.json();
    },
    onSuccess: (moderator: Moderator) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/admin/moderators"] });
      toast({ 
        title: "Moderatör oluşturuldu", 
        description: `${moderator.username} hesabı başarıyla oluşturuldu` 
      });
      setNewModUsername("");
      setNewModPassword("");
      setIsCreateModalOpen(false);
    },
    onError: () => {
      toast({ title: "Hata", description: "Moderatör oluşturulamadı", variant: "destructive" });
    },
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Kopyalandı", description: label });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
  };

  const handleCreateModerator = (e: React.FormEvent) => {
    e.preventDefault();
    createModeratorMutation.mutate({ username: newModUsername, password: newModPassword });
  };

  return (
    <div className="min-h-screen lol-bg-dark flex flex-col">
      <NavigationHeader />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-gray-400 hover:text-white" data-testid="back-button">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri Dön
            </Button>
          </Link>
        </div>

        {adminSession ? (
          <div className="space-y-6">
            <Card className="lol-bg-darker border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 lol-text-gold">
                  <Shield className="w-5 h-5" />
                  Admin Paneli
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logoutMutation.mutate()}
                  className="border-gray-600 text-white hover:text-white hover:lol-bg-dark"
                  data-testid="admin-logout-button"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Çıkış Yap
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-6 p-4 lol-bg-dark rounded-lg">
                  <div className="flex items-center gap-2 text-green-400">
                    <Shield className="w-5 h-5" />
                    <span>Giriş yapıldı: {adminSession.admin.username}</span>
                  </div>
                  <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className="lol-bg-gold hover:lol-bg-accent text-black font-medium"
                        data-testid="create-moderator-button"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Yeni Moderatör Ekle
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="lol-bg-darker border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="lol-text-gold flex items-center gap-2">
                          <UserPlus className="w-5 h-5" />
                          Yeni Moderatör Oluştur
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateModerator} className="space-y-4 mt-4">
                        <div>
                          <Label htmlFor="mod-username" className="text-white">Kullanıcı Adı</Label>
                          <Input
                            id="mod-username"
                            value={newModUsername}
                            onChange={(e) => setNewModUsername(e.target.value)}
                            placeholder="moderator1"
                            className="lol-bg-dark border-gray-600 text-white mt-2"
                            data-testid="new-moderator-username"
                          />
                          <p className="text-xs text-gray-400 mt-1">En az 3 karakter</p>
                        </div>
                        <div>
                          <Label htmlFor="mod-password" className="text-white">Şifre</Label>
                          <Input
                            id="mod-password"
                            type="password"
                            value={newModPassword}
                            onChange={(e) => setNewModPassword(e.target.value)}
                            placeholder="••••••••"
                            className="lol-bg-dark border-gray-600 text-white mt-2"
                            data-testid="new-moderator-password"
                          />
                          <p className="text-xs text-gray-400 mt-1">En az 6 karakter</p>
                        </div>
                        <Button
                          type="submit"
                          disabled={createModeratorMutation.isPending || newModUsername.length < 3 || newModPassword.length < 6}
                          className="w-full lol-bg-gold hover:lol-bg-accent text-black font-medium"
                          data-testid="submit-create-moderator"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {createModeratorMutation.isPending ? "Oluşturuluyor..." : "Moderatör Oluştur"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Moderatörler
                  </h3>
                  
                  {moderatorsQuery.isLoading ? (
                    <p className="text-gray-400">Yükleniyor...</p>
                  ) : moderatorsQuery.data && moderatorsQuery.data.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {moderatorsQuery.data.map((mod) => (
                        <div
                          key={mod.id}
                          className="flex items-center justify-between p-3 rounded-lg lol-bg-dark"
                          data-testid={`moderator-${mod.id}`}
                        >
                          <div className="flex items-center gap-4">
                            <User className="w-5 h-5 text-amber-500" />
                            <span className="font-medium text-white">
                              {mod.username}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(mod.createdAt).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(mod.username, `Kullanıcı adı: ${mod.username}`)}
                            className="text-gray-400 hover:text-white"
                            data-testid={`copy-username-${mod.id}`}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Kopyala
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">Henüz moderatör eklenmemiş. Yukarıdaki butona tıklayarak yeni moderatör ekleyebilirsiniz.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="max-w-md mx-auto lol-bg-darker border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 lol-text-gold">
                <Shield className="w-5 h-5" />
                Admin Girişi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="username" className="text-white">Kullanıcı Adı</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="lol-bg-dark border-gray-600 text-white"
                    data-testid="admin-username-input"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-white">Şifre</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="lol-bg-dark border-gray-600 text-white"
                    data-testid="admin-password-input"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loginMutation.isPending || !username || !password}
                  className="w-full lol-bg-gold hover:lol-bg-accent text-black font-medium"
                  data-testid="admin-login-button"
                >
                  {loginMutation.isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
