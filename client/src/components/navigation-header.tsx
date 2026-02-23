import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Trophy, LogOut, Home, Swords } from "lucide-react";
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
    <nav className="relative border-b border-gray-700/50 bg-gradient-to-r from-gray-900/80 via-gray-900 to-gray-900/80 backdrop-blur-sm px-6 py-2.5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(180,130,50,0.04),transparent_50%)]" />
      <div className="relative max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/15 to-amber-700/15 border border-amber-500/20 flex items-center justify-center group-hover:from-amber-500/25 group-hover:to-amber-700/25 transition-all">
                <Swords className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold lol-gradient-text leading-tight">LoL Turnuva</span>
                <span className="text-[9px] text-gray-500 uppercase tracking-[0.15em] leading-tight">Yönetim Sistemi</span>
              </div>
            </div>
          </Link>

          <div className="h-6 w-px bg-gray-700/50" />

          <div className="flex items-center gap-1">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 text-xs px-3 ${
                  location === "/" || location === "/tournaments"
                    ? "bg-white/5 text-amber-300 hover:bg-white/10"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                }`}
                data-testid="nav-tournaments"
              >
                <Home className="w-3.5 h-3.5 mr-1.5" />
                Turnuvalar
              </Button>
            </Link>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="h-8 text-xs px-3 text-gray-500 hover:text-gray-300 hover:bg-white/5"
          data-testid="nav-logout"
        >
          <LogOut className="w-3.5 h-3.5 mr-1.5" />
          Çıkış
        </Button>
      </div>
    </nav>
  );
}
