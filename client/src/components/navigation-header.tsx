import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Trophy, Swords } from "lucide-react";

export function NavigationHeader() {
  const [location] = useLocation();

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
      </div>
    </nav>
  );
}