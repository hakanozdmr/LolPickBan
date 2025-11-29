import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { NavigationHeader } from "@/components/navigation-header";
import { Footer } from "@/components/footer";
import { Shield, Copy, LogOut, Plus, Key, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import type { PlayerAccessCode } from "@shared/schema";

interface AdminSession {
  token: string;
  admin: { id: string; username: string };
}

export default function AdminPage() {
  const { toast } = useToast();
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => {
    const stored = localStorage.getItem("adminSession");
    return stored ? JSON.parse(stored) : null;
  });

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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
      queryClient.invalidateQueries({ queryKey: ["/api/auth/admin/access-codes"] });
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

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Kopyalandı", description: code });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
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
                  <Button
                    onClick={() => generateCodesMutation.mutate(1)}
                    disabled={generateCodesMutation.isPending}
                    className="lol-bg-gold hover:lol-bg-accent text-black font-medium"
                    data-testid="generate-code-button"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {generateCodesMutation.isPending ? "Oluşturuluyor..." : "Yeni Kod Üret"}
                  </Button>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Üretilen Giriş Kodları
                  </h3>
                  
                  {accessCodesQuery.isLoading ? (
                    <p className="text-gray-400">Yükleniyor...</p>
                  ) : accessCodesQuery.data && accessCodesQuery.data.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {accessCodesQuery.data.map((code) => (
                        <div
                          key={code.id}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            code.used ? "bg-gray-800 opacity-60" : "lol-bg-dark"
                          }`}
                          data-testid={`access-code-${code.id}`}
                        >
                          <div className="flex items-center gap-4">
                            <span className={`font-mono text-lg tracking-widest ${code.used ? "line-through text-gray-500" : "text-white"}`}>
                              {code.code}
                            </span>
                            {code.used && <span className="text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded">Kullanıldı</span>}
                            {!code.used && <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded">Aktif</span>}
                          </div>
                          {!code.used && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(code.code)}
                              className="text-gray-400 hover:text-white"
                              data-testid={`copy-code-${code.id}`}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Kopyala
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">Henüz kod üretilmemiş. Yukarıdaki butona tıklayarak yeni kod üretebilirsiniz.</p>
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
