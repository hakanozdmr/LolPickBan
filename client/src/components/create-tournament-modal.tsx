import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy } from "lucide-react";

interface CreateTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTournament: (data: any) => Promise<void>;
  isLoading: boolean;
}

export function CreateTournamentModal({ isOpen, onClose, onCreateTournament, isLoading }: CreateTournamentModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    format: "single_elimination",
    maxTeams: 8,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    await onCreateTournament(formData);
    handleClose();
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
      <DialogContent className="bg-gray-900 border-gray-700/50 text-white max-w-md shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 flex items-center justify-center">
              <Trophy className="w-4.5 h-4.5 text-amber-400" />
            </div>
            <span className="lol-gradient-text text-lg font-bold">Yeni Turnuva Oluştur</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          <div>
            <label htmlFor="tournament-name" className="text-xs uppercase tracking-wider text-gray-400 mb-1.5 block font-medium">
              Turnuva Adı *
            </label>
            <Input
              id="tournament-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Örn: LoL Şampiyonası 2024"
              className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:ring-amber-500 focus:border-amber-500"
              required
              data-testid="tournament-name-input"
            />
          </div>

          <div>
            <label htmlFor="tournament-description" className="text-xs uppercase tracking-wider text-gray-400 mb-1.5 block font-medium">
              Açıklama
            </label>
            <Textarea
              id="tournament-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Turnuva hakkında kısa açıklama..."
              className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:ring-amber-500 focus:border-amber-500 resize-none"
              rows={2}
              data-testid="tournament-description-input"
            />
          </div>

          <div>
            <label htmlFor="tournament-format" className="text-xs uppercase tracking-wider text-gray-400 mb-1.5 block font-medium">
              Turnuva Formatı
            </label>
            <Select 
              value={formData.format} 
              onValueChange={(value) => setFormData({ ...formData, format: value })}
            >
              <SelectTrigger className="bg-gray-800/50 border-gray-700/50 text-white focus:ring-amber-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700/50 text-white">
                <SelectItem value="single_elimination" className="text-white focus:bg-gray-800 focus:text-white">Eleme</SelectItem>
                <SelectItem value="double_elimination" className="text-white focus:bg-gray-800 focus:text-white">Çifte Eleme</SelectItem>
                <SelectItem value="round_robin" className="text-white focus:bg-gray-800 focus:text-white">Lig Usulü</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="max-teams" className="text-xs uppercase tracking-wider text-gray-400 mb-1.5 block font-medium">
              Maksimum Takım Sayısı
            </label>
            <Select 
              value={formData.maxTeams.toString()} 
              onValueChange={(value) => setFormData({ ...formData, maxTeams: parseInt(value) })}
            >
              <SelectTrigger className="bg-gray-800/50 border-gray-700/50 text-white focus:ring-amber-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700/50 text-white">
                <SelectItem value="4" className="text-white focus:bg-gray-800 focus:text-white">4 Takım</SelectItem>
                <SelectItem value="8" className="text-white focus:bg-gray-800 focus:text-white">8 Takım</SelectItem>
                <SelectItem value="16" className="text-white focus:bg-gray-800 focus:text-white">16 Takım</SelectItem>
                <SelectItem value="32" className="text-white focus:bg-gray-800 focus:text-white">32 Takım</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white"
              data-testid="cancel-tournament-button"
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-medium border-0 shadow-lg shadow-amber-900/20"
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
