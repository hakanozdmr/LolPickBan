import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Key, LogOut, User } from "lucide-react";

interface PlayerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PlayerLoginModal({ isOpen, onClose }: PlayerLoginModalProps) {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [playerSession, setPlayerSession] = useState<string | null>(() => {
    return localStorage.getItem("playerSession");
  });

  const loginMutation = useMutation({
    mutationFn: async (accessCode: string) => {
      const res = await apiRequest("POST", "/api/auth/player/login", { code: accessCode });
      return res.json();
    },
    onSuccess: (data: { sessionId: string }) => {
      setPlayerSession(data.sessionId);
      localStorage.setItem("playerSession", data.sessionId);
      setCode("");
      toast({ title: "Giriş başarılı", description: "Hoş geldiniz!" });
      onClose();
    },
    onError: () => {
      toast({ title: "Giriş başarısız", description: "Geçersiz veya kullanılmış kod", variant: "destructive" });
    },
  });

  const handleLogout = () => {
    setPlayerSession(null);
    localStorage.removeItem("playerSession");
    toast({ title: "Çıkış yapıldı" });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(code);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="lol-bg-darker border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 lol-text-gold">
            <User className="w-5 h-5" />
            Oyuncu Girişi
          </DialogTitle>
        </DialogHeader>

        {playerSession ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 lol-bg-dark rounded-lg">
              <div className="flex items-center gap-2 text-green-400">
                <User className="w-5 h-5" />
                <span>Giriş yapıldı</span>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-gray-600 text-white hover:text-white hover:lol-bg-dark"
              data-testid="player-logout-button"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </Button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="player-code" className="text-white">
                Giriş Kodu
              </Label>
              <Input
                id="player-code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="XXXXXXXX"
                className="lol-bg-dark border-gray-600 text-white uppercase tracking-widest text-center text-lg"
                maxLength={8}
                data-testid="player-code-input"
              />
              <p className="text-xs text-gray-400 mt-2">
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
        )}
      </DialogContent>
    </Dialog>
  );
}
