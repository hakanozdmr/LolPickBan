import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Trophy, Swords, Shield, User } from "lucide-react";
import { PlayerLoginModal } from "./player-login-modal";

export function NavigationHeader() {
  const [location] = useLocation();
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const playerSession = localStorage.getItem("playerSession");

  return (
    <>
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

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPlayerModal(true)}
              className={playerSession ? "text-green-400 hover:text-green-300 hover:lol-bg-dark" : "text-white hover:lol-bg-dark"}
              data-testid="nav-player-login"
            >
              <User className="w-4 h-4 mr-2" />
              {playerSession ? "Giriş Yapıldı" : "Oyuncu Girişi"}
            </Button>
            
            <Link href="/admin">
              <Button 
                variant={location === "/admin" ? "default" : "ghost"}
                size="sm"
                className={location === "/admin" ? 
                  "lol-bg-gold text-black hover:lol-bg-accent" : 
                  "text-white hover:lol-bg-dark"
                }
                data-testid="nav-admin-login"
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin Girişi
              </Button>
            </Link>
          </div>
        </div>
      </nav>
      
      <PlayerLoginModal 
        isOpen={showPlayerModal} 
        onClose={() => setShowPlayerModal(false)} 
      />
    </>
  );
}