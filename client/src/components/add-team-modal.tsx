import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, ImageIcon } from "lucide-react";

interface AddTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTeam: (data: any) => void;
  isLoading: boolean;
}

export function AddTeamModal({ isOpen, onClose, onAddTeam, isLoading }: AddTeamModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    onAddTeam({
      name: formData.name.trim(),
      logo: formData.logo.trim() || null,
    });
  };

  const handleClose = () => {
    setFormData({
      name: "",
      logo: "",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 border-gray-700/50 text-white max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-5 pb-4">
          <DialogTitle className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 flex items-center justify-center">
              <Users className="w-4.5 h-4.5 text-amber-400" />
            </div>
            <span className="lol-gradient-text text-lg font-bold">Takım Ekle</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="team-name" className="text-xs uppercase tracking-wider text-gray-400">
              Takım Adı *
            </Label>
            <Input
              id="team-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Örn: Team SoloMid"
              className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50 h-10"
              required
              data-testid="team-name-input"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="team-logo" className="text-xs uppercase tracking-wider text-gray-400">
              Logo URL (Opsiyonel)
            </Label>
            <Input
              id="team-logo"
              value={formData.logo}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              placeholder="https://example.com/logo.png"
              className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50 h-10"
              data-testid="team-logo-input"
            />
          </div>

          {formData.logo && (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-700/30 bg-gradient-to-br from-gray-800/40 to-gray-900/60">
              <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img 
                  src={formData.logo} 
                  alt="Team logo preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = 'flex items-center justify-center w-full h-full';
                      fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </div>
              <div>
                <span className="text-xs text-gray-400">Logo Önizleme</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white"
              data-testid="cancel-add-team-button"
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-medium border-0 shadow-lg shadow-amber-900/20"
              data-testid="add-team-submit"
            >
              {isLoading ? "Ekleniyor..." : "Takım Ekle"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
