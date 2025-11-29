import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Check, Clock, Users, Loader2, Shield, Gamepad2 } from "lucide-react";
import { Footer } from "@/components/footer";

interface TeamSession {
  teamCodeId: string;
  tournamentId: string;
  tournamentName: string;
  teamColor: string;
  teamName: string | null;
  isReady: boolean;
}

interface ReadyStatus {
  blueTeam: {
    teamName: string | null;
    isReady: boolean;
    joinedAt: string | null;
  } | null;
  redTeam: {
    teamName: string | null;
    isReady: boolean;
    joinedAt: string | null;
  } | null;
  bothReady: boolean;
}

export default function TeamLobby() {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [teamSession, setTeamSession] = useState<TeamSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("teamSession");
    if (stored) {
      const session = JSON.parse(stored) as TeamSession;
      setTeamSession(session);
      setIsReady(session.isReady);
    } else {
      setLocation("/");
    }
  }, [setLocation]);

  const { data: readyStatus, isLoading } = useQuery<ReadyStatus>({
    queryKey: ['/api/tournaments', tournamentId, 'ready-status'],
    refetchInterval: 2000,
    enabled: !!tournamentId,
  });

  const markReadyMutation = useMutation({
    mutationFn: async () => {
      if (!teamSession) throw new Error("No team session");
      const res = await apiRequest("POST", `/api/team-codes/${teamSession.teamCodeId}/ready`);
      return res.json();
    },
    onSuccess: (data: { teamCode: any, bothTeamsReady: boolean }) => {
      setIsReady(true);
      const updated = { ...teamSession!, isReady: true };
      localStorage.setItem("teamSession", JSON.stringify(updated));
      setTeamSession(updated);
      
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments', tournamentId, 'ready-status'] });
      
      toast({ 
        title: "Hazır!", 
        description: "Takımınız hazır olarak işaretlendi." 
      });
    },
    onError: () => {
      toast({ 
        title: "Hata", 
        description: "Hazır durumu güncellenemedi.", 
        variant: "destructive" 
      });
    },
  });

  useEffect(() => {
    if (readyStatus?.bothReady) {
      toast({
        title: "Tüm takımlar hazır!",
        description: "Draft ekranına yönlendiriliyorsunuz...",
      });
      setTimeout(() => {
        setLocation(`/draft-simulator?tournament=${tournamentId}&team=${teamSession?.teamColor}`);
      }, 2000);
    }
  }, [readyStatus?.bothReady, tournamentId, teamSession?.teamColor, setLocation, toast]);

  const handleLogout = () => {
    localStorage.removeItem("teamSession");
    setLocation("/");
  };

  if (!teamSession || isLoading) {
    return (
      <div className="min-h-screen lol-bg-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin lol-text-gold" />
      </div>
    );
  }

  const isBlueTeam = teamSession.teamColor === "blue";

  return (
    <div className="min-h-screen lol-bg-dark flex flex-col">
      <div className="lol-bg-darker border-b border-gray-700 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 lol-text-gold" />
            <span className="text-xl font-bold lol-text-gold">LoL Draft Simulator</span>
          </div>
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="text-gray-400 hover:text-white"
            data-testid="team-logout-button"
          >
            Çıkış
          </Button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold lol-text-gold mb-2">{teamSession.tournamentName}</h1>
            <p className="text-gray-400">Draft Bekleme Odası</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className={`border-2 ${isBlueTeam ? "border-blue-500 bg-blue-900/20" : "border-gray-700 lol-bg-darker"}`}>
              <CardHeader className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 ${
                  readyStatus?.blueTeam?.isReady ? "bg-green-500" : "bg-blue-500"
                }`}>
                  {readyStatus?.blueTeam?.isReady ? (
                    <Check className="w-8 h-8 text-white" />
                  ) : (
                    <Users className="w-8 h-8 text-white" />
                  )}
                </div>
                <CardTitle className="text-blue-400">
                  {readyStatus?.blueTeam?.teamName || "Mavi Takım"}
                </CardTitle>
                <CardDescription className={readyStatus?.blueTeam?.isReady ? "text-green-400" : "text-gray-400"}>
                  {readyStatus?.blueTeam?.isReady ? "Hazır" : "Bekleniyor..."}
                </CardDescription>
              </CardHeader>
              {isBlueTeam && (
                <CardContent>
                  <div className="text-center text-sm text-blue-300 mb-2">
                    <Shield className="w-4 h-4 inline mr-1" />
                    Bu sizin takımınız
                  </div>
                </CardContent>
              )}
            </Card>

            <Card className={`border-2 ${!isBlueTeam ? "border-red-500 bg-red-900/20" : "border-gray-700 lol-bg-darker"}`}>
              <CardHeader className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 ${
                  readyStatus?.redTeam?.isReady ? "bg-green-500" : "bg-red-500"
                }`}>
                  {readyStatus?.redTeam?.isReady ? (
                    <Check className="w-8 h-8 text-white" />
                  ) : (
                    <Users className="w-8 h-8 text-white" />
                  )}
                </div>
                <CardTitle className="text-red-400">
                  {readyStatus?.redTeam?.teamName || "Kırmızı Takım"}
                </CardTitle>
                <CardDescription className={readyStatus?.redTeam?.isReady ? "text-green-400" : "text-gray-400"}>
                  {readyStatus?.redTeam?.isReady ? "Hazır" : "Bekleniyor..."}
                </CardDescription>
              </CardHeader>
              {!isBlueTeam && (
                <CardContent>
                  <div className="text-center text-sm text-red-300 mb-2">
                    <Shield className="w-4 h-4 inline mr-1" />
                    Bu sizin takımınız
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          <Card className="lol-bg-darker border-gray-700">
            <CardContent className="pt-6">
              <div className="text-center">
                {isReady ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-green-400">
                      <Check className="w-6 h-6" />
                      <span className="text-lg font-medium">Hazır olarak işaretlediniz</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <Clock className="w-5 h-5 animate-pulse" />
                      <span>Diğer takım bekleniyor...</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-400 mb-4">
                      Hazır olduğunuzda aşağıdaki butona tıklayın. Her iki takım da hazır olduğunda draft otomatik olarak başlayacaktır.
                    </p>
                    <Button
                      onClick={() => markReadyMutation.mutate()}
                      disabled={markReadyMutation.isPending}
                      className="lol-bg-gold hover:lol-bg-accent text-black font-bold px-8 py-3 text-lg"
                      data-testid="ready-button"
                    >
                      {markReadyMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          İşleniyor...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5 mr-2" />
                          Hazırım
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {readyStatus?.bothReady && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 bg-green-900/50 text-green-400 px-6 py-3 rounded-lg border border-green-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-medium">Tüm takımlar hazır! Draft başlatılıyor...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
