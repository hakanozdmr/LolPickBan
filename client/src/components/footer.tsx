import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-800/50 py-3 mt-auto bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <p>LoL Turnuva Yönetim Sistemi</p>
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-[11px] text-gray-600 hover:text-gray-400 hover:bg-white/5 px-2"
                data-testid="footer-admin-login"
              >
                <Shield className="w-3 h-3 mr-1.5" />
                Admin
              </Button>
            </Link>
            <span className="text-gray-700">|</span>
            <p>&copy; 2024</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
