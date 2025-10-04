import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy } from "lucide-react";

interface CreateTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTournament: (data: any) => void;
  isLoading: boolean;
}

export function CreateTournamentModal({ isOpen, onClose, onCreateTournament, isLoading }: CreateTournamentModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    format: "single_elimination",
    maxTeams: 8,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    onCreateTournament(formData);
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      format: "single_elimination",
      maxTeams: 8,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="lol-bg-darker border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 lol-text-gold">
            <Trophy className="w-5 h-5" />
            Yeni Turnuva Oluştur
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="tournament-name" className="text-sm font-medium">
              Turnuva Adı *
            </Label>
            <Input
              id="tournament-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Örn: LoL Şampiyonası 2024"
              className="lol-bg-dark border-gray-600 text-white"
              required
              data-testid="tournament-name-input"
            />
          </div>

          <div>
            <Label htmlFor="tournament-description" className="text-sm font-medium">
              Açıklama
            </Label>
            <Textarea
              id="tournament-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Turnuva hakkında kısa açıklama..."
              className="lol-bg-dark border-gray-600 text-white resize-none"
              rows={3}
              data-testid="tournament-description-input"
            />
          </div>

          <div>
            <Label htmlFor="tournament-format" className="text-sm font-medium">
              Turnuva Formatı
            </Label>
            <Select 
              value={formData.format} 
              onValueChange={(value) => setFormData({ ...formData, format: value })}
            >
              <SelectTrigger className="lol-bg-dark border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="lol-bg-dark border-gray-600 text-white">
                <SelectItem value="single_elimination" className="text-white">Eleme</SelectItem>
                <SelectItem value="double_elimination" className="text-white">Çifte Eleme</SelectItem>
                <SelectItem value="round_robin" className="text-white">Lig Usulü</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="max-teams" className="text-sm font-medium">
              Maksimum Takım Sayısı
            </Label>
            <Select 
              value={formData.maxTeams.toString()} 
              onValueChange={(value) => setFormData({ ...formData, maxTeams: parseInt(value) })}
            >
              <SelectTrigger className="lol-bg-dark border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="lol-bg-dark border-gray-600 text-white">
                <SelectItem value="4" className="text-white">4 Takım</SelectItem>
                <SelectItem value="8" className="text-white">8 Takım</SelectItem>
                <SelectItem value="16" className="text-white">16 Takım</SelectItem>
                <SelectItem value="32" className="text-white">32 Takım</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 border-gray-600 hover:text-white hover:lol-bg-dark text-[#000000]"
              data-testid="cancel-tournament-button"
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="flex-1 lol-bg-gold hover:lol-bg-accent text-black font-medium"
              data-testid="create-tournament-submit"
            >
              {isLoading ? "Oluşturuluyor..." : "Turnuva Oluştur"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}