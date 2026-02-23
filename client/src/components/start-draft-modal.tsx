import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Copy, Check, Users, Loader2, Swords, Shield } from "lucide-react";
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
        <DialogContent className="bg-gray-900 border-gray-700/50 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              </div>
              <span className="lol-gradient-text text-lg font-bold">Yükleniyor</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/10 to-amber-700/10 border border-amber-500/20 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
              </div>
              <span className="text-xs text-gray-500">Veriler kontrol ediliyor...</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (step === 'codes' && teamCodes) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="bg-gray-900 border-gray-700/50 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 flex items-center justify-center">
                <Shield className="w-4 h-4 text-amber-400" />
              </div>
              <span className="lol-gradient-text text-lg font-bold">Takım Kodları</span>
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-xs mt-1">
              Aşağıdaki kodları takımlara gönderin. Takımlar bu kodlarla bekleme odasına katılabilir.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-1">
            <div className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-900/20 to-blue-950/30 p-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-blue-600" />
              <div className="flex items-center gap-2 mb-2.5 ml-2">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  {teamCodes.blueCode.teamName || "Mavi Takım"}
                </span>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <code className="flex-1 bg-gray-800/60 border border-gray-700/40 px-3 py-2.5 rounded-lg font-mono text-base tracking-[0.2em] text-white">
                  {teamCodes.blueCode.code}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(teamCodes.blueCode.code)}
                  className="h-10 w-10 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg"
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

            <div className="rounded-xl border border-red-500/20 bg-gradient-to-br from-red-900/20 to-red-950/30 p-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-400 to-red-600" />
              <div className="flex items-center gap-2 mb-2.5 ml-2">
                <Users className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-red-400">
                  {teamCodes.redCode.teamName || "Kırmızı Takım"}
                </span>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <code className="flex-1 bg-gray-800/60 border border-gray-700/40 px-3 py-2.5 rounded-lg font-mono text-base tracking-[0.2em] text-white">
                  {teamCodes.redCode.code}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(teamCodes.redCode.code)}
                  className="h-10 w-10 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
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

            <p className="text-[10px] text-gray-500 text-center py-1">
              Bu kodları kaydedin! Takımlar bu kodları kullanarak bekleme odasına katılabilir.
            </p>

            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white"
                data-testid="close-codes-modal"
              >
                Kapat
              </Button>
              <Button
                onClick={handleGoToDraft}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-medium border-0 shadow-lg shadow-amber-900/20"
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
      <DialogContent className="bg-gray-900 border-gray-700/50 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 flex items-center justify-center">
              <Swords className="w-4 h-4 text-amber-400" />
            </div>
            <span className="lol-gradient-text text-lg font-bold">Draft Başlat</span>
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-xs mt-1">
            Takım adlarını girin ve takım kodlarını oluşturun.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          <div className="space-y-1.5">
            <Label htmlFor="blue-team-name" className="text-xs uppercase tracking-wider text-blue-400 mb-1.5 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              Mavi Takım Adı
            </Label>
            <Input
              id="blue-team-name"
              value={formData.blueTeamName}
              onChange={(e) => setFormData({ ...formData, blueTeamName: e.target.value })}
              placeholder="Mavi Takım"
              className="bg-gray-800/50 border-blue-500/20 text-white placeholder:text-gray-600 focus:border-blue-400/50 focus:ring-blue-500/20"
              data-testid="blue-team-name-input"
            />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="red-team-name" className="text-xs uppercase tracking-wider text-red-400 mb-1.5 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              Kırmızı Takım Adı
            </Label>
            <Input
              id="red-team-name"
              value={formData.redTeamName}
              onChange={(e) => setFormData({ ...formData, redTeamName: e.target.value })}
              placeholder="Kırmızı Takım"
              className="bg-gray-800/50 border-red-500/20 text-white placeholder:text-gray-600 focus:border-red-400/50 focus:ring-red-500/20"
              data-testid="red-team-name-input"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white"
              data-testid="cancel-draft-button"
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-medium border-0 shadow-lg shadow-amber-900/20"
              data-testid="generate-codes-button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                "Kodları Oluştur"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
