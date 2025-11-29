import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Trophy, Swords, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function NavigationHeader() {
  const [location] = useLocation();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem("playerSession");
    localStorage.removeItem("teamSession");
    toast({ title: "Çıkış yapıldı" });
    window.location.href = "/";
  };

  return (
    <nav className="lol-bg-darker border-b border-gray-700 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold lol-text-gold">LoL Draft Simulator</h1>
          
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button 
                variant={location === "/" ? "default" : "ghost"}
                size="sm"
                className={location === "/" ? 
                  "lol-bg-gold text-black hover:lol-bg-accent" : 
                  "text-white hover:lol-bg-dark"
                }
                data-testid="nav-draft-simulator"
              >
                <Swords className="w-4 h-4 mr-2" />
                Draft Simulator
              </Button>
            </Link>
            
            <Link href="/tournaments">
              <Button 
                variant={location === "/tournaments" ? "default" : "ghost"}
                size="sm"
                className={location === "/tournaments" ? 
                  "lol-bg-gold text-black hover:lol-bg-accent" : 
                  "text-white hover:lol-bg-dark"
                }
                data-testid="nav-tournaments"
              >
                <Trophy className="w-4 h-4 mr-2" />
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