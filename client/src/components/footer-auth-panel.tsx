import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Shield, User, Copy, LogOut, Plus, Key } from "lucide-react";
import type { PlayerAccessCode } from "@shared/schema";

interface AdminSession {
  token: string;
  admin: { id: string; username: string };
}

export function FooterAuthPanel() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"admin" | "player">("player");
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => {
    const stored = localStorage.getItem("adminSession");
    return stored ? JSON.parse(stored) : null;
  });
  const [playerSession, setPlayerSession] = useState<string | null>(() => {
    return localStorage.getItem("playerSession");
  });

  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [playerCode, setPlayerCode] = useState("");

  const accessCodesQuery = useQuery<PlayerAccessCode[]>({
    queryKey: ["/api/auth/admin/access-codes"],
    enabled: !!adminSession,
    queryFn: async () => {
      const res = await fetch("/api/auth/admin/access-codes", {
        headers: { Authorization: `Bearer ${adminSession?.token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch codes");
      return res.json();
    },
  });

  const adminLoginMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/admin/login", data);
      return res.json();
    },
    onSuccess: (data: AdminSession) => {
      setAdminSession(data);
      localStorage.setItem("adminSession", JSON.stringify(data));
      setAdminUsername("");
      setAdminPassword("");
      toast({ title: "Giriş başarılı", description: `Hoş geldiniz, ${data.admin.username}` });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/admin/access-codes"] });
    },
    onError: () => {
      toast({ title: "Giriş başarısız", description: "Kullanıcı adı veya şifre hatalı", variant: "destructive" });
    },
  });

  const adminLogoutMutation = useMutation({
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

  const generateCodesMutation = useMutation({
    mutationFn: async (count: number) => {
      const res = await fetch("/api/auth/admin/access-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminSession?.token}`,
        },
        body: JSON.stringify({ count }),
      });
      if (!res.ok) throw new Error("Failed to generate codes");
      return res.json();
    },
    onSuccess: (codes: PlayerAccessCode[]) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/admin/access-codes"] });
      toast({ title: "Kodlar oluşturuldu", description: `${codes.length} yeni giriş kodu oluşturuldu` });
    },
    onError: () => {
      toast({ title: "Hata", description: "Kodlar oluşturulamadı", variant: "destructive" });
    },
  });

  const playerLoginMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest("POST", "/api/auth/player/login", { code });
      return res.json();
    },
    onSuccess: (data: { sessionId: string }) => {
      setPlayerSession(data.sessionId);
      localStorage.setItem("playerSession", data.sessionId);
      setPlayerCode("");
      toast({ title: "Giriş başarılı", description: "Hoş geldiniz!" });
    },
    onError: () => {
      toast({ title: "Giriş başarısız", description: "Geçersiz veya kullanılmış kod", variant: "destructive" });
    },
  });

  const handlePlayerLogout = () => {
    setPlayerSession(null);
    localStorage.removeItem("playerSession");
    toast({ title: "Çıkış yapıldı" });
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Kopyalandı", description: code });
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    adminLoginMutation.mutate({ username: adminUsername, password: adminPassword });
  };

  const handlePlayerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    playerLoginMutation.mutate(playerCode);
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 lol-bg-darker border-t border-gray-700 z-50">
      <div className="max-w-4xl mx-auto p-3">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "admin" | "player")}>
          <TabsList className="grid w-full grid-cols-2 lol-bg-dark">
            <TabsTrigger value="player" className="flex items-center gap-2 text-white data-[state=active]:lol-bg-gold data-[state=active]:text-black">
              <User className="w-4 h-4" />
              Oyuncu Girişi
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2 text-white data-[state=active]:lol-bg-gold data-[state=active]:text-black">
              <Shield className="w-4 h-4" />
              Admin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="player" className="mt-3">
            {playerSession ? (
              <div className="flex items-center justify-between p-3 lol-bg-dark rounded-lg">
                <div className="flex items-center gap-2 text-green-400">
                  <User className="w-5 h-5" />
                  <span>Giriş yapıldı</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePlayerLogout}
                  className="border-gray-600 text-white hover:text-white hover:lol-bg-dark"
                  data-testid="player-logout-button"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Çıkış
                </Button>
              </div>
            ) : (
              <form onSubmit={handlePlayerLogin} className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="player-code" className="text-sm text-gray-400">
                    Giriş Kodu
                  </Label>
                  <Input
                    id="player-code"
                    value={playerCode}
                    onChange={(e) => setPlayerCode(e.target.value.toUpperCase())}
                    placeholder="XXXXXXXX"
                    className="lol-bg-dark border-gray-600 text-white uppercase tracking-widest"
                    maxLength={8}
                    data-testid="player-code-input"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={playerLoginMutation.isPending || playerCode.length < 8}
                  className="self-end lol-bg-gold hover:lol-bg-accent text-black font-medium"
                  data-testid="player-login-button"
                >
                  <Key className="w-4 h-4 mr-2" />
                  {playerLoginMutation.isPending ? "Giriş..." : "Giriş Yap"}
                </Button>
              </form>
            )}
          </TabsContent>

          <TabsContent value="admin" className="mt-3">
            {adminSession ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 lol-bg-dark rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Shield className="w-5 h-5" />
                    <span>Admin: {adminSession.admin.username}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => generateCodesMutation.mutate(1)}
                      disabled={generateCodesMutation.isPending}
                      className="lol-bg-gold hover:lol-bg-accent text-black font-medium"
                      data-testid="generate-code-button"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      {generateCodesMutation.isPending ? "..." : "Kod Üret"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => adminLogoutMutation.mutate()}
                      className="border-gray-600 text-white hover:text-white hover:lol-bg-dark"
                      data-testid="admin-logout-button"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {accessCodesQuery.data && accessCodesQuery.data.length > 0 && (
                  <div className="lol-bg-dark rounded-lg p-3 max-h-32 overflow-y-auto">
                    <Label className="text-sm text-gray-400 mb-2 block">Üretilen Kodlar</Label>
                    <div className="space-y-1">
                      {accessCodesQuery.data.slice(0, 10).map((code) => (
                        <div
                          key={code.id}
                          className={`flex items-center justify-between p-2 rounded ${
                            code.used ? "bg-gray-800 opacity-50" : "bg-gray-700"
                          }`}
                          data-testid={`access-code-${code.id}`}
                        >
                          <span className={`font-mono tracking-widest ${code.used ? "line-through text-gray-500" : "text-white"}`}>
                            {code.code}
                          </span>
                          <div className="flex items-center gap-2">
                            {code.used && <span className="text-xs text-gray-500">Kullanıldı</span>}
                            {!code.used && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(code.code)}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                                data-testid={`copy-code-${code.id}`}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleAdminLogin} className="flex gap-3 items-end">
                <div className="flex-1">
                  <Label htmlFor="admin-username" className="text-sm text-gray-400">
                    Kullanıcı Adı
                  </Label>
                  <Input
                    id="admin-username"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="admin"
                    className="lol-bg-dark border-gray-600 text-white"
                    data-testid="admin-username-input"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="admin-password" className="text-sm text-gray-400">
                    Şifre
                  </Label>
                  <Input
                    id="admin-password"
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="lol-bg-dark border-gray-600 text-white"
                    data-testid="admin-password-input"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={adminLoginMutation.isPending || !adminUsername || !adminPassword}
                  className="lol-bg-gold hover:lol-bg-accent text-black font-medium"
                  data-testid="admin-login-button"
                >
                  {adminLoginMutation.isPending ? "Giriş..." : "Giriş"}
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </footer>
  );
}
