import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Key, Gamepad2, Users, Shield } from "lucide-react";
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

export function PlayerLoginGate({ children }: PlayerLoginGateProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [code, setCode] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginType, setLoginType] = useState<"moderator" | "team">("moderator");

  useEffect(() => {
    const session = localStorage.getItem("playerSession");
    const teamSession = localStorage.getItem("teamSession");
    if (session || teamSession) {
      setIsLoggedIn(true);
    }
  }, []);

  const moderatorLoginMutation = useMutation({
    mutationFn: async (accessCode: string) => {
      const res = await apiRequest("POST", "/api/auth/player/login", { code: accessCode });
      return res.json();
    },
    onSuccess: (data: { sessionId: string }) => {
      localStorage.setItem("playerSession", data.sessionId);
      setIsLoggedIn(true);
      toast({ title: "Giriş başarılı", description: "Moderatör olarak giriş yaptınız!" });
    },
    onError: () => {
      toast({ title: "Giriş başarısız", description: "Geçersiz veya kullanılmış kod", variant: "destructive" });
    },
  });

  const teamLoginMutation = useMutation({
    mutationFn: async (accessCode: string) => {
      const res = await apiRequest("POST", "/api/auth/team/login", { code: accessCode });
      return res.json();
    },
    onSuccess: (data: TeamLoginResponse) => {
      localStorage.setItem("teamSession", JSON.stringify(data));
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginType === "moderator") {
      moderatorLoginMutation.mutate(code);
    } else {
      teamLoginMutation.mutate(code);
    }
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
              <Gamepad2 className="w-16 h-16 lol-text-gold" />
            </div>
            <CardTitle className="text-2xl lol-text-gold">LoL Draft Simulator</CardTitle>
            <CardDescription className="text-gray-400">
              Turnuvaya katılmak için giriş kodunuzu girin
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

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="access-code" className="text-white">
                  {loginType === "moderator" ? "Moderatör Kodu" : "Takım Kodu"}
                </Label>
                <Input
                  id="access-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="XXXXXXXX"
                  className="lol-bg-dark border-gray-600 text-white uppercase tracking-widest text-center text-lg mt-2"
                  maxLength={8}
                  data-testid="player-code-input"
                />
                <p className="text-xs text-gray-400 mt-2 text-center">
                  {loginType === "moderator" 
                    ? "Admin tarafından verilen 8 karakterlik moderatör kodunu giriniz"
                    : "Turnuva için verilen 8 karakterlik takım kodunuzu giriniz"
                  }
                </p>
              </div>
              <Button
                type="submit"
                disabled={isPending || code.length < 8}
                className="w-full lol-bg-gold hover:lol-bg-accent text-black font-medium"
                data-testid="player-login-button"
              >
                <Key className="w-4 h-4 mr-2" />
                {isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
