import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { LogIn, Trophy, Users, Shield } from "lucide-react";
import { Footer } from "./footer";
import { useLocation } from "wouter";

interface PlayerLoginGateProps {
  children: React.ReactNode;
}

interface TeamLoginResponse {
  teamCodeId: string;
  tournamentId: string;
  tournamentName: string;
  teamColor: string;
  teamName: string | null;
  isReady: boolean;
}

interface ModeratorLoginResponse {
  token: string;
  moderator: { id: string; username: string };
  message: string;
}

export function PlayerLoginGate({ children }: PlayerLoginGateProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginType, setLoginType] = useState<"moderator" | "team">("moderator");

  useEffect(() => {
    const moderatorSession = localStorage.getItem("moderatorSession");
    const teamSession = localStorage.getItem("teamSession");
    if (moderatorSession || teamSession) {
      setIsLoggedIn(true);
    }
  }, []);

  const moderatorLoginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/moderator/login", credentials);
      return res.json();
    },
    onSuccess: (data: ModeratorLoginResponse) => {
      localStorage.setItem("moderatorSession", JSON.stringify({
        token: data.token,
        moderator: data.moderator
      }));
      setIsLoggedIn(true);
      toast({ title: "Giriş başarılı", description: `Hoş geldiniz, ${data.moderator.username}!` });
    },
    onError: () => {
      toast({ title: "Giriş başarısız", description: "Geçersiz kullanıcı adı veya şifre", variant: "destructive" });
    },
  });

  const teamLoginMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest("POST", "/api/auth/team/login", { code });
      return res.json();
    },
    onSuccess: (data: TeamLoginResponse) => {
      localStorage.setItem("teamSession", JSON.stringify(data));
      setIsLoggedIn(true);
      toast({ 
        title: "Takım girişi başarılı", 
        description: `${data.teamColor === "blue" ? "Mavi" : "Kırmızı"} takım olarak giriş yaptınız!` 
      });
      setLocation(`/team-lobby/${data.tournamentId}`);
    },
    onError: () => {
      toast({ title: "Giriş başarısız", description: "Geçersiz takım kodu", variant: "destructive" });
    },
  });

  const handleModeratorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    moderatorLoginMutation.mutate({ username, password });
  };

  const handleTeamLogin = (e: React.FormEvent) => {
    e.preventDefault();
    teamLoginMutation.mutate(teamCode);
  };

  if (isLoggedIn) {
    return <>{children}</>;
  }

  const isPending = moderatorLoginMutation.isPending || teamLoginMutation.isPending;

  return (
    <div className="min-h-screen lol-bg-dark flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-md lol-bg-darker border-gray-700">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Trophy className="w-16 h-16 lol-text-gold" />
            </div>
            <CardTitle className="text-2xl lol-text-gold">LoL Turnuva Sistemi</CardTitle>
            <CardDescription className="text-gray-400">
              {loginType === "moderator" 
                ? "Moderatör hesabınızla giriş yapın"
                : "Takım kodunuzla giriş yapın"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={loginType} onValueChange={(v) => setLoginType(v as "moderator" | "team")} className="mb-4">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                <TabsTrigger 
                  value="moderator" 
                  className="data-[state=active]:bg-amber-600 data-[state=active]:text-black"
                  data-testid="tab-moderator"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Moderatör
                </TabsTrigger>
                <TabsTrigger 
                  value="team" 
                  className="data-[state=active]:bg-amber-600 data-[state=active]:text-black"
                  data-testid="tab-team"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Takım
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {loginType === "moderator" ? (
              <form onSubmit={handleModeratorLogin} className="space-y-4">
                <div>
                  <Label htmlFor="username" className="text-white">
                    Kullanıcı Adı
                  </Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Kullanıcı adınız"
                    className="lol-bg-dark border-gray-600 text-white mt-2"
                    data-testid="moderator-username-input"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-white">
                    Şifre
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Şifreniz"
                    className="lol-bg-dark border-gray-600 text-white mt-2"
                    data-testid="moderator-password-input"
                  />
                </div>
                <p className="text-xs text-gray-400 text-center">
                  Moderatör hesabınızla giriş yapın
                </p>
                <Button
                  type="submit"
                  disabled={isPending || !username || !password}
                  className="w-full lol-bg-gold hover:lol-bg-accent text-black font-medium"
                  data-testid="moderator-login-button"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  {moderatorLoginMutation.isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleTeamLogin} className="space-y-4">
                <div>
                  <Label htmlFor="team-code" className="text-white">
                    Takım Kodu
                  </Label>
                  <Input
                    id="team-code"
                    value={teamCode}
                    onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                    placeholder="XXXXXXXX"
                    className="lol-bg-dark border-gray-600 text-white uppercase tracking-widest text-center text-lg mt-2"
                    maxLength={8}
                    data-testid="team-code-input"
                  />
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    Turnuva için verilen 8 karakterlik takım kodunuzu giriniz
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={isPending || teamCode.length < 8}
                  className="w-full lol-bg-gold hover:lol-bg-accent text-black font-medium"
                  data-testid="team-login-button"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  {teamLoginMutation.isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}