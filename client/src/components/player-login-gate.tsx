import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Key, Gamepad2 } from "lucide-react";
import { Footer } from "./footer";

interface PlayerLoginGateProps {
  children: React.ReactNode;
}

export function PlayerLoginGate({ children }: PlayerLoginGateProps) {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem("playerSession");
    if (session) {
      setIsLoggedIn(true);
    }
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (accessCode: string) => {
      const res = await apiRequest("POST", "/api/auth/player/login", { code: accessCode });
      return res.json();
    },
    onSuccess: (data: { sessionId: string }) => {
      localStorage.setItem("playerSession", data.sessionId);
      setIsLoggedIn(true);
      toast({ title: "Giriş başarılı", description: "Hoş geldiniz!" });
    },
    onError: () => {
      toast({ title: "Giriş başarısız", description: "Geçersiz veya kullanılmış kod", variant: "destructive" });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(code);
  };

  if (isLoggedIn) {
    return <>{children}</>;
  }

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
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="access-code" className="text-white">Giriş Kodu</Label>
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
                  Admin tarafından verilen 8 karakterlik kodu giriniz
                </p>
              </div>
              <Button
                type="submit"
                disabled={loginMutation.isPending || code.length < 8}
                className="w-full lol-bg-gold hover:lol-bg-accent text-black font-medium"
                data-testid="player-login-button"
              >
                <Key className="w-4 h-4 mr-2" />
                {loginMutation.isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
