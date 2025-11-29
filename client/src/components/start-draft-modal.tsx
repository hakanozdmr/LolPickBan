import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Copy, Check, Users, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface TeamCodes {
  blueCode: { code: string; teamName: string | null };
  redCode: { code: string; teamName: string | null };
}

interface StartDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentId: string;
  matchId: string;
  team1Name?: string;
  team2Name?: string;
  onDraftStarted: (draftSessionId: string) => void;
}

export function StartDraftModal({ 
  isOpen, 
  onClose, 
  tournamentId,
  matchId, 
  team1Name, 
  team2Name,
  onDraftStarted 
}: StartDraftModalProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<'loading' | 'names' | 'codes'>('loading');
  const [formData, setFormData] = useState({
    blueTeamName: team1Name || "",
    redTeamName: team2Name || "",
  });
  const [teamCodes, setTeamCodes] = useState<TeamCodes | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [draftSessionId, setDraftSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('loading');
      setTeamCodes(null);
      setDraftSessionId(null);
      fetchExistingCodes();
    }
  }, [isOpen, tournamentId, matchId]);

  const fetchExistingCodes = async () => {
    setStep('loading');
    try {
      const response = await fetch(`/api/matches/${matchId}/team-codes`);
      if (response.ok) {
        const codes = await response.json();
        if (codes && codes.length >= 2) {
          const blueCode = codes.find((c: any) => c.teamColor === 'blue');
          const redCode = codes.find((c: any) => c.teamColor === 'red');
          if (blueCode && redCode) {
            setTeamCodes({
              blueCode: { code: blueCode.code, teamName: blueCode.teamName },
              redCode: { code: redCode.code, teamName: redCode.teamName },
            });
            setStep('codes');
            
            const draftResponse = await fetch(`/api/matches/${matchId}/draft`);
            if (draftResponse.ok) {
              const draftData = await draftResponse.json();
              setDraftSessionId(draftData.id);
            }
            return;
          }
        }
      }
      setStep('names');
    } catch (error) {
      setStep('names');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const codesResponse = await fetch(`/api/tournaments/${tournamentId}/team-codes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blueTeamName: formData.blueTeamName || undefined,
          redTeamName: formData.redTeamName || undefined,
          matchId: matchId,
        }),
      });

      if (!codesResponse.ok) throw new Error('Failed to create team codes');
      const codes = await codesResponse.json();

      setTeamCodes({
        blueCode: { code: codes.blueCode.code, teamName: codes.blueCode.teamName },
        redCode: { code: codes.redCode.code, teamName: codes.redCode.teamName },
      });
      setStep('codes');
    } catch (error) {
      toast({
        title: "Hata",
        description: "Takım kodları oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToDraft = async () => {
    setIsLoading(true);
    try {
      if (draftSessionId) {
        setLocation(`/draft-simulator?session=${draftSessionId}`);
        handleClose();
        return;
      }
      
      const response = await fetch(`/api/matches/${matchId}/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blueTeamName: teamCodes?.blueCode.teamName || formData.blueTeamName || 'Mavi Takım',
          redTeamName: teamCodes?.redCode.teamName || formData.redTeamName || 'Kırmızı Takım',
        }),
      });
      
      if (!response.ok) throw new Error('Failed to start draft');
      const draftSession = await response.json();
      
      toast({
        title: "Draft Oluşturuldu",
        description: "Draft sayfasına yönlendiriliyorsunuz...",
      });
      
      setLocation(`/draft-simulator?session=${draftSession.id}`);
      handleClose();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Draft başlatılırken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('loading');
    setFormData({
      blueTeamName: team1Name || "",
      redTeamName: team2Name || "",
    });
    setTeamCodes(null);
    setCopiedCode(null);
    setDraftSessionId(null);
    onClose();
  };

  const copyToClipboard = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({ title: "Kopyalandı!", description: "Kod panoya kopyalandı." });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (step === 'loading') {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="lol-bg-darker border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 lol-text-gold">
              <Loader2 className="w-5 h-5 animate-spin" />
              Yükleniyor
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-lol-gold" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (step === 'codes' && teamCodes) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="lol-bg-darker border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 lol-text-gold">
              <Users className="w-5 h-5" />
              Takım Kodları
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Aşağıdaki kodları takımlara gönderin. Takımlar bu kodlarla bekleme odasına katılabilir.
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

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-gray-600 hover:text-white hover:lol-bg-dark text-[#000000]"
                data-testid="close-codes-modal"
              >
                Kapat
              </Button>
              <Button
                onClick={handleGoToDraft}
                disabled={isLoading}
                className="flex-1 lol-bg-gold hover:lol-bg-accent text-black font-medium"
                data-testid="go-to-draft-button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Yönlendiriliyor...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Draft'a Git
                  </>
                )}
              </Button>
            </div>
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
            <Play className="w-5 h-5" />
            Draft Başlat
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Takım adlarını girin ve takım kodlarını oluşturun.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 border-gray-600 hover:text-white hover:lol-bg-dark text-[#000000]"
              data-testid="cancel-draft-button"
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 lol-bg-gold hover:lol-bg-accent text-black font-medium"
              data-testid="generate-codes-button"
            >
              {isLoading ? "Oluşturuluyor..." : "Kodları Oluştur"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
