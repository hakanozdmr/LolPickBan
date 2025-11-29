import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Copy, Check, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TeamCodes {
  blueCode: { code: string; teamName: string | null };
  redCode: { code: string; teamName: string | null };
}

interface CreateTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTournament: (data: any) => Promise<TeamCodes | null>;
  isLoading: boolean;
}

export function CreateTournamentModal({ isOpen, onClose, onCreateTournament, isLoading }: CreateTournamentModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    format: "single_elimination",
    maxTeams: 8,
    blueTeamName: "",
    redTeamName: "",
  });
  const [teamCodes, setTeamCodes] = useState<TeamCodes | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    const codes = await onCreateTournament(formData);
    if (codes) {
      setTeamCodes(codes);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      format: "single_elimination",
      maxTeams: 8,
      blueTeamName: "",
      redTeamName: "",
    });
    setTeamCodes(null);
    setCopiedCode(null);
    onClose();
  };

  const copyToClipboard = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({ title: "Kopyalandı!", description: "Kod panoya kopyalandı." });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (teamCodes) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="lol-bg-darker border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 lol-text-gold">
              <Trophy className="w-5 h-5" />
              Turnuva Oluşturuldu!
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Aşağıdaki kodları takımlara gönderin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-blue-900/30 border border-blue-500 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-medium">
                  {teamCodes.blueCode.teamName || "Mavi Takım"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-blue-900/50 px-3 py-2 rounded font-mono text-lg tracking-widest text-white">
                  {teamCodes.blueCode.code}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(teamCodes.blueCode.code)}
                  className="text-blue-400 hover:text-blue-300"
                  data-testid="copy-blue-code"
                >
                  {copiedCode === teamCodes.blueCode.code ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="p-4 bg-red-900/30 border border-red-500 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-red-400" />
                <span className="text-red-400 font-medium">
                  {teamCodes.redCode.teamName || "Kırmızı Takım"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-red-900/50 px-3 py-2 rounded font-mono text-lg tracking-widest text-white">
                  {teamCodes.redCode.code}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(teamCodes.redCode.code)}
                  className="text-red-400 hover:text-red-300"
                  data-testid="copy-red-code"
                >
                  {copiedCode === teamCodes.redCode.code ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center">
              Bu kodları kaydedin! Takımlar bu kodları kullanarak bekleme odasına katılabilir.
            </p>

            <Button
              onClick={handleClose}
              className="w-full lol-bg-gold hover:lol-bg-accent text-black font-medium"
              data-testid="close-codes-modal"
            >
              Tamam
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
              rows={2}
              data-testid="tournament-description-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="blue-team-name" className="text-sm font-medium text-blue-400">
                Mavi Takım Adı
              </Label>
              <Input
                id="blue-team-name"
                value={formData.blueTeamName}
                onChange={(e) => setFormData({ ...formData, blueTeamName: e.target.value })}
                placeholder="Mavi Takım"
                className="lol-bg-dark border-blue-600/50 text-white"
                data-testid="blue-team-name-input"
              />
            </div>
            <div>
              <Label htmlFor="red-team-name" className="text-sm font-medium text-red-400">
                Kırmızı Takım Adı
              </Label>
              <Input
                id="red-team-name"
                value={formData.redTeamName}
                onChange={(e) => setFormData({ ...formData, redTeamName: e.target.value })}
                placeholder="Kırmızı Takım"
                className="lol-bg-dark border-red-600/50 text-white"
                data-testid="red-team-name-input"
              />
            </div>
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