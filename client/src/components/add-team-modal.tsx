import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";

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
      <DialogContent className="lol-bg-darker border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 lol-text-gold">
            <Users className="w-5 h-5" />
            Takım Ekle
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="team-name" className="text-sm font-medium">
              Takım Adı *
            </Label>
            <Input
              id="team-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Örn: Team SoloMid"
              className="lol-bg-dark border-gray-600 text-white"
              required
              data-testid="team-name-input"
            />
          </div>

          <div>
            <Label htmlFor="team-logo" className="text-sm font-medium">
              Logo URL (Opsiyonel)
            </Label>
            <Input
              id="team-logo"
              value={formData.logo}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              placeholder="https://example.com/logo.png"
              className="lol-bg-dark border-gray-600 text-white"
              data-testid="team-logo-input"
            />
          </div>

          {formData.logo && (
            <div className="flex items-center gap-3 p-3 lol-bg-dark rounded-lg border border-gray-600">
              <img 
                src={formData.logo} 
                alt="Team logo preview"
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="text-sm lol-text-gray">Logo Önizleme</span>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 border-gray-600 text-white hover:lol-bg-dark"
              data-testid="cancel-add-team-button"
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="flex-1 lol-bg-gold hover:lol-bg-accent text-black font-medium"
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