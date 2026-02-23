import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Trophy, LogOut, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function NavigationHeader() {
  const [location] = useLocation();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem("playerSession");
    localStorage.removeItem("teamSession");
    localStorage.removeItem("moderatorSession");
    toast({ title: "Çıkış yapıldı" });
    window.location.href = "/";
  };

  return (
    <nav className="lol-bg-darker border-b border-gray-700 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group">
              <Trophy className="w-7 h-7 lol-text-gold group-hover:scale-110 transition-transform" />
              <div className="flex flex-col">
                <span className="text-lg font-bold lol-text-gold leading-tight">LoL Turnuva</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest leading-tight">Yönetim Sistemi</span>
              </div>
            </div>
          </Link>

          <div className="h-8 w-px bg-gray-700" />

          <div className="flex items-center gap-1">
            <Link href="/">
              <Button
                variant={location === "/" || location === "/tournaments" ? "default" : "ghost"}
                size="sm"
                className={location === "/" || location === "/tournaments" ?
                  "lol-bg-gold text-black hover:lol-bg-accent" :
                  "text-white hover:lol-bg-dark"
                }
                data-testid="nav-tournaments"
              >
                <Home className="w-4 h-4 mr-2" />
                Turnuvalar
              </Button>
            </Link>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-gray-400 hover:text-white hover:lol-bg-dark"
          data-testid="nav-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Çıkış Yap
        </Button>
      </div>
    </nav>
  );
}