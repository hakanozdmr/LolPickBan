import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="lol-bg-darker border-t border-gray-700 py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <p>LoL Draft Simulator - League of Legends Draft Deneyimi</p>
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-white hover:lol-bg-dark"
                data-testid="footer-admin-login"
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin Girişi
              </Button>
            </Link>
            <p>&copy; 2024 Tüm hakları saklıdır</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
