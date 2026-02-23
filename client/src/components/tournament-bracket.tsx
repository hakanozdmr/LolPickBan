import { Tournament, Team, Match, DraftSession, Champion } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Play, Users, Plus, Gamepad2, Shield, Sword, Eye, Check, Clock, Flame, Crown, Swords, Trophy } from "lucide-react";
import { useState } from "react";
import { AddTeamModal } from "@/components/add-team-modal";
import { StartDraftModal } from "@/components/start-draft-modal";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

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

interface TournamentBracketProps {
  tournament: Tournament;
  teams: Team[];
  matches: Match[];
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'setup': return {
      text: 'Hazırlık',
      dotColor: 'text-amber-400',
      bgClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    };
    case 'pending': return {
      text: 'Bekliyor',
      dotColor: 'text-amber-400',
      bgClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    };
    case 'in_progress': return {
      text: 'Devam Ediyor',
      dotColor: 'text-emerald-400',
      bgClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    };
    case 'completed': return {
      text: 'Tamamlandı',
      dotColor: 'text-sky-400',
      bgClass: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    };
    default: return {
      text: status,
      dotColor: 'text-gray-400',
      bgClass: 'bg-gray-500/10 text-gray-300 border-gray-500/30',
    };
  }
};

export function TournamentBracket({ tournament, teams, matches }: TournamentBracketProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [draftModalMatchId, setDraftModalMatchId] = useState<string | null>(null);
  const [startDraftMatch, setStartDraftMatch] = useState<Match | null>(null);
  const [seriesFormat, setSeriesFormat] = useState<string>("bo1");
  const [fearlessMode, setFearlessMode] = useState(false);

  const { data: readyStatus } = useQuery<ReadyStatus>({
    queryKey: ['/api/tournaments', tournament.id, 'ready-status'],
    refetchInterval: 3000,
  });

  const { data: draftSession } = useQuery<DraftSession | null>({
    queryKey: ['/api/tournaments', tournament.id, 'draft'],
  });


  const addTeamMutation = useMutation({
    mutationFn: async (teamData: any) => {
      const response = await fetch(`/api/tournaments/${tournament.id}/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData),
      });
      if (!response.ok) throw new Error('Failed to add team');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments', tournament.id, 'teams'] });
      setShowAddTeamModal(false);
      toast({
        title: "Takım Eklendi",
        description: "Takım başarıyla turnuvaya eklendi.",
      });
    },
  });

  const generateBracketMutation = useMutation({
    mutationFn: async () => {
      const matchPromises = [];
      const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);

      for (let i = 0; i < shuffledTeams.length; i += 2) {
        if (shuffledTeams[i + 1]) {
          matchPromises.push(
            fetch(`/api/tournaments/${tournament.id}/matches`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                team1Id: shuffledTeams[i].id,
                team2Id: shuffledTeams[i + 1].id,
                round: 1,
                position: Math.floor(i / 2),
                status: 'pending',
                seriesFormat,
                fearlessMode,
              }),
            })
          );
        }
      }

      await Promise.all(matchPromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments', tournament.id, 'matches'] });
      toast({
        title: "Bracket Oluşturuldu",
        description: "Turnuva bracketi başarıyla oluşturuldu.",
      });
    },
  });


  const setWinnerMutation = useMutation({
    mutationFn: async ({ matchId, winnerId }: { matchId: string; winnerId: string }) => {
      const response = await fetch(`/api/matches/${matchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          winnerId,
          status: 'completed'
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Kazanan belirlenemedi');
      }
      return response.json();
    },
    onSuccess: (updatedMatch) => {
      queryClient.setQueryData(
        ['/api/tournaments', tournament.id, 'matches'],
        (oldMatches: Match[] | undefined) => {
          if (!oldMatches) return [updatedMatch];
          return oldMatches.map(m => m.id === updatedMatch.id ? updatedMatch : m);
        }
      );
      const winner = getTeamById(updatedMatch.winnerId);
      toast({
        title: "Kazanan Belirlendi",
        description: `${winner?.name} maçı kazandı!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Kazanan belirlenemedi",
        variant: "destructive",
      });
    },
  });

  const getTeamById = (id: string | null) => {
    if (!id) return null;
    return teams.find(team => team.id === id);
  };

  const gameWinnerMutation = useMutation({
    mutationFn: async ({ matchId, winnerId }: { matchId: string; winnerId: string }) => {
      const response = await fetch(`/api/matches/${matchId}/game-winner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winnerId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Oyun kazananı belirlenemedi');
      }
      return response.json();
    },
    onSuccess: (updatedMatch) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments', tournament.id, 'matches'] });
      const winner = getTeamById(updatedMatch.winnerId);
      if (updatedMatch.status === 'completed') {
        toast({
          title: "Seri Tamamlandı!",
          description: `${winner?.name} seriyi kazandı!`,
        });
      } else {
        toast({
          title: "Oyun Kazananı Belirlendi",
          description: `Skor: ${updatedMatch.team1Wins} - ${updatedMatch.team2Wins}`,
        });
      }
    },
  });

  const startNextGameDraftMutation = useMutation({
    mutationFn: async ({ matchId, gameNumber }: { matchId: string; gameNumber: number }) => {
      const response = await fetch(`/api/matches/${matchId}/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameNumber }),
      });
      if (!response.ok) throw new Error('Failed to start next game draft');
      return response.json();
    },
    onSuccess: (draftSession) => {
      setLocation(`/draft-simulator?session=${draftSession.id}`);
    },
  });

  const DraftResults = ({ matchId }: { matchId: string }) => {
    const { data: draftSession } = useQuery<DraftSession | null>({
      queryKey: ['/api/matches', matchId, 'draft'],
    });

    const { data: champions = [] } = useQuery<Champion[]>({
      queryKey: ['/api/champions'],
    });

    if (!draftSession || !champions.length) return null;

    const getChampionById = (id: string) => champions.find(c => c.id === id);

    return (
      <div className="mt-3 pt-3 border-t border-gray-700/50">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Draft Sonuçları</div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDraftModalMatchId(matchId)}
            className="text-xs text-sky-400 hover:text-sky-300 hover:bg-sky-500/10"
            data-testid={`view-draft-details-${matchId}`}
          >
            <Eye className="w-3 h-3 mr-1" />
            Detaylar
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-2.5">
            <div className="text-blue-400 mb-1.5 font-semibold text-[11px]">{draftSession.blueTeamName}</div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1">
                <Sword className="w-3 h-3 text-amber-400" />
                <span className="text-gray-500 text-[10px] uppercase tracking-wider">Picks</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {draftSession.blueTeamPicks.map((championId, index) => {
                  const champion = getChampionById(championId);
                  return champion ? (
                    <img
                      key={`blue-pick-${index}`}
                      src={champion.image}
                      alt={champion.name}
                      className="w-6 h-6 rounded border border-blue-500/50"
                      title={champion.name}
                    />
                  ) : null;
                })}
              </div>
              <div className="flex items-center gap-1 mt-1.5">
                <Shield className="w-3 h-3 text-red-400" />
                <span className="text-gray-500 text-[10px] uppercase tracking-wider">Bans</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {draftSession.blueTeamBans.map((championId, index) => {
                  const champion = getChampionById(championId);
                  return champion ? (
                    <img
                      key={`blue-ban-${index}`}
                      src={champion.image}
                      alt={champion.name}
                      className="w-4 h-4 rounded border border-red-500/40 opacity-50 grayscale"
                      title={`${champion.name} (Banned)`}
                    />
                  ) : null;
                })}
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-2.5">
            <div className="text-red-400 mb-1.5 font-semibold text-[11px]">{draftSession.redTeamName}</div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1">
                <Sword className="w-3 h-3 text-amber-400" />
                <span className="text-gray-500 text-[10px] uppercase tracking-wider">Picks</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {draftSession.redTeamPicks.map((championId, index) => {
                  const champion = getChampionById(championId);
                  return champion ? (
                    <img
                      key={`red-pick-${index}`}
                      src={champion.image}
                      alt={champion.name}
                      className="w-6 h-6 rounded border border-red-500/50"
                      title={champion.name}
                    />
                  ) : null;
                })}
              </div>
              <div className="flex items-center gap-1 mt-1.5">
                <Shield className="w-3 h-3 text-red-400" />
                <span className="text-gray-500 text-[10px] uppercase tracking-wider">Bans</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {draftSession.redTeamBans.map((championId, index) => {
                  const champion = getChampionById(championId);
                  return champion ? (
                    <img
                      key={`red-ban-${index}`}
                      src={champion.image}
                      alt={champion.name}
                      className="w-4 h-4 rounded border border-red-500/40 opacity-50 grayscale"
                      title={`${champion.name} (Banned)`}
                    />
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DraftDetailsModal = ({ matchId, isOpen, onClose }: { matchId: string; isOpen: boolean; onClose: () => void }) => {
    const { data: draftSession } = useQuery<DraftSession | null>({
      queryKey: ['/api/matches', matchId, 'draft'],
      enabled: isOpen,
    });

    const { data: champions = [] } = useQuery<Champion[]>({
      queryKey: ['/api/champions'],
      enabled: isOpen,
    });

    if (!draftSession || !champions.length) return null;

    const getChampionById = (id: string) => champions.find(c => c.id === id);
    const match = matches.find(m => m.id === matchId);
    const team1 = match ? getTeamById(match.team1Id) : null;
    const team2 = match ? getTeamById(match.team2Id) : null;

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700/50">
          <DialogTitle className="sr-only">Draft Detayları</DialogTitle>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-xl bg-gradient-to-b from-blue-500/10 to-gray-900/50 border border-blue-500/20 p-5">
                <h3 className="text-blue-400 text-lg font-semibold mb-4 flex items-center gap-2">
                  <div className="w-2 h-6 rounded-full bg-blue-500" />
                  {draftSession.blueTeamName}
                </h3>
                
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sword className="w-4 h-4 text-amber-400" />
                    <span className="font-medium text-gray-200 text-sm uppercase tracking-wider">Picks</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {draftSession.blueTeamPicks.map((championId, index) => {
                      const champion = getChampionById(championId);
                      return champion ? (
                        <div key={`blue-pick-${index}`} className="text-center group">
                          <div className="relative rounded-lg overflow-hidden border-2 border-blue-500/50 mb-1 transition-all group-hover:border-blue-400">
                            <img
                              src={champion.image}
                              alt={champion.name}
                              className="w-full aspect-square object-cover"
                            />
                          </div>
                          <div className="text-xs text-gray-200 font-medium truncate">{champion.name}</div>
                          <div className="text-[10px] text-gray-500 truncate">{champion.title}</div>
                        </div>
                      ) : (
                        <div key={`blue-pick-${index}`} className="aspect-square rounded-lg border-2 border-gray-700/50 bg-gray-800/50" />
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-red-400" />
                    <span className="font-medium text-gray-200 text-sm uppercase tracking-wider">Bans</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {draftSession.blueTeamBans.map((championId, index) => {
                      const champion = getChampionById(championId);
                      return champion ? (
                        <div key={`blue-ban-${index}`} className="text-center">
                          <div className="relative rounded-lg overflow-hidden border-2 border-red-500/30 mb-1 opacity-50 grayscale">
                            <img
                              src={champion.image}
                              alt={champion.name}
                              className="w-full aspect-square object-cover"
                            />
                          </div>
                          <div className="text-[10px] text-gray-400 truncate">{champion.name}</div>
                        </div>
                      ) : (
                        <div key={`blue-ban-${index}`} className="aspect-square rounded-lg border-2 border-gray-700/50 bg-gray-800/50 opacity-50" />
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-b from-red-500/10 to-gray-900/50 border border-red-500/20 p-5">
                <h3 className="text-red-400 text-lg font-semibold mb-4 flex items-center gap-2">
                  <div className="w-2 h-6 rounded-full bg-red-500" />
                  {draftSession.redTeamName}
                </h3>
                
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sword className="w-4 h-4 text-amber-400" />
                    <span className="font-medium text-gray-200 text-sm uppercase tracking-wider">Picks</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {draftSession.redTeamPicks.map((championId, index) => {
                      const champion = getChampionById(championId);
                      return champion ? (
                        <div key={`red-pick-${index}`} className="text-center group">
                          <div className="relative rounded-lg overflow-hidden border-2 border-red-500/50 mb-1 transition-all group-hover:border-red-400">
                            <img
                              src={champion.image}
                              alt={champion.name}
                              className="w-full aspect-square object-cover"
                            />
                          </div>
                          <div className="text-xs text-gray-200 font-medium truncate">{champion.name}</div>
                          <div className="text-[10px] text-gray-500 truncate">{champion.title}</div>
                        </div>
                      ) : (
                        <div key={`red-pick-${index}`} className="aspect-square rounded-lg border-2 border-gray-700/50 bg-gray-800/50" />
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-red-400" />
                    <span className="font-medium text-gray-200 text-sm uppercase tracking-wider">Bans</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {draftSession.redTeamBans.map((championId, index) => {
                      const champion = getChampionById(championId);
                      return champion ? (
                        <div key={`red-ban-${index}`} className="text-center">
                          <div className="relative rounded-lg overflow-hidden border-2 border-red-500/30 mb-1 opacity-50 grayscale">
                            <img
                              src={champion.image}
                              alt={champion.name}
                              className="w-full aspect-square object-cover"
                            />
                          </div>
                          <div className="text-[10px] text-gray-400 truncate">{champion.name}</div>
                        </div>
                      ) : (
                        <div key={`red-ban-${index}`} className="aspect-square rounded-lg border-2 border-gray-700/50 bg-gray-800/50 opacity-50" />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const MatchDraftControls = ({ match, team1, team2 }: { match: Match; team1: Team | null; team2: Team | null }) => {
    const isSeries = match.seriesFormat === 'bo3' || match.seriesFormat === 'bo5';

    const { data: allDrafts = [] } = useQuery<DraftSession[]>({
      queryKey: ['/api/matches', match.id, 'drafts'],
      enabled: match.status === 'in_progress',
    });

    const currentDraft = allDrafts.find(d => d.gameNumber === match.currentGame);
    const previousDraft = allDrafts.find(d => d.gameNumber === match.currentGame - 1);

    if (match.status !== 'in_progress' || !team1 || !team2) return null;

    if (isSeries) {
      const needsGameDraft = !currentDraft;
      const currentDraftCompleted = currentDraft?.phase === 'completed';
      const currentDraftOngoing = currentDraft && currentDraft.phase !== 'waiting' && currentDraft.phase !== 'completed';
      const currentDraftWaiting = currentDraft?.phase === 'waiting';

      return (
        <div className="space-y-1.5">
          {needsGameDraft && (
            <Button
              size="sm"
              onClick={() => startNextGameDraftMutation.mutate({ matchId: match.id, gameNumber: match.currentGame })}
              disabled={startNextGameDraftMutation.isPending}
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs shadow-lg shadow-amber-900/20"
            >
              <Play className="w-3 h-3 mr-1" />
              Oyun {match.currentGame} Draft
            </Button>
          )}

          {currentDraftWaiting && (
            <Button
              size="sm"
              onClick={() => setLocation(`/draft-simulator?session=${currentDraft.id}`)}
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs shadow-lg shadow-amber-900/20"
            >
              <Play className="w-3 h-3 mr-1" />
              Draft'a Git
            </Button>
          )}

          {currentDraftOngoing && (
            <Button
              size="sm"
              onClick={() => setLocation(`/draft-simulator?session=${currentDraft!.id}`)}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs shadow-lg shadow-emerald-900/20"
            >
              <Eye className="w-3 h-3 mr-1" />
              Draft İzle
            </Button>
          )}

          {currentDraftCompleted && !match.winnerId && (
            <div className="space-y-1.5">
              <div className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider font-medium">Oyun {match.currentGame} Kazananı</div>
              <Button
                size="sm"
                onClick={() => gameWinnerMutation.mutate({ matchId: match.id, winnerId: team1.id })}
                disabled={gameWinnerMutation.isPending}
                className="w-full text-xs bg-blue-600/80 hover:bg-blue-500 text-white border border-blue-500/30"
              >
                {team1.name}
              </Button>
              <Button
                size="sm"
                onClick={() => gameWinnerMutation.mutate({ matchId: match.id, winnerId: team2.id })}
                disabled={gameWinnerMutation.isPending}
                className="w-full text-xs bg-red-600/80 hover:bg-red-500 text-white border border-red-500/30"
              >
                {team2.name}
              </Button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-1.5">
        {draftSession && draftSession.phase === 'waiting' && (
          <Button
            size="sm"
            onClick={() => setLocation(`/draft-simulator?session=${draftSession.id}`)}
            className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs shadow-lg shadow-amber-900/20"
          >
            <Play className="w-3 h-3 mr-1" />
            Draft'a Git
          </Button>
        )}

        {draftSession && draftSession.phase !== 'waiting' && draftSession.phase !== 'completed' && (
          <Button
            size="sm"
            onClick={() => setLocation(`/draft-simulator?session=${draftSession.id}`)}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs shadow-lg shadow-emerald-900/20"
          >
            <Eye className="w-3 h-3 mr-1" />
            Draft İzle
          </Button>
        )}

        {!match.winnerId && draftSession?.phase === 'completed' && (
          <div className="space-y-1.5">
            <div className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider font-medium">Kazanan</div>
            <Button
              size="sm"
              onClick={() => setWinnerMutation.mutate({ matchId: match.id, winnerId: team1.id })}
              disabled={setWinnerMutation.isPending}
              className="w-full text-xs bg-blue-600/80 hover:bg-blue-500 text-white border border-blue-500/30"
            >
              {team1.name}
            </Button>
            <Button
              size="sm"
              onClick={() => setWinnerMutation.mutate({ matchId: match.id, winnerId: team2.id })}
              disabled={setWinnerMutation.isPending}
              className="w-full text-xs bg-red-600/80 hover:bg-red-500 text-white border border-red-500/30"
            >
              {team2.name}
            </Button>
          </div>
        )}
      </div>
    );
  };

  const MatchDraftResults = ({ matchId, match }: { matchId: string; match: Match }) => {
    const isSeries = match.seriesFormat === 'bo3' || match.seriesFormat === 'bo5';

    if (isSeries) {
      const { data: allDrafts = [] } = useQuery<DraftSession[]>({
        queryKey: ['/api/matches', matchId, 'drafts'],
      });

      if (allDrafts.length === 0) return null;

      return (
        <div className="mt-3 pt-3 border-t border-gray-700/40">
          <div className="text-[10px] text-gray-400 mb-2 uppercase tracking-wider font-medium">Oyun Draftları</div>
          <div className="space-y-1.5">
            {allDrafts
              .sort((a, b) => a.gameNumber - b.gameNumber)
              .map((draft) => (
                <div key={draft.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-800/40 border border-gray-700/30">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-200">Oyun {draft.gameNumber}</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 h-4 font-medium border ${
                        draft.phase === 'completed'
                          ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {draft.phase === 'completed' ? 'Tamamlandı' : 'Devam Ediyor'}
                    </Badge>
                    {draft.fearlessBannedChampions.length > 0 && (
                      <span className="text-[10px] text-orange-400 flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5" />
                        {draft.fearlessBannedChampions.length} ban
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDraftModalMatchId(matchId)}
                    className="text-xs text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 h-6 px-2"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Detaylar
                  </Button>
                </div>
              ))}
          </div>
        </div>
      );
    }

    return <DraftResults matchId={matchId} />;
  };

  const canGenerateBracket = teams.length === tournament.maxTeams && matches.length === 0;
  const canAddMoreTeams = teams.length < tournament.maxTeams;
  const tournamentStatus = getStatusConfig(tournament.status);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gray-700/30 bg-gradient-to-b from-gray-800/30 to-gray-900/50 overflow-hidden">
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="lol-gradient-text text-lg font-bold">{tournament.name}</h2>
                {tournament.description && (
                  <p className="text-xs text-gray-500 mt-0.5">{tournament.description}</p>
                )}
              </div>
            </div>
            <Badge
              variant="outline"
              className={`text-[10px] px-2 py-0.5 h-5 font-medium border ${tournamentStatus.bgClass}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${tournamentStatus.dotColor} ${tournament.status === 'in_progress' ? 'status-dot-pulse' : ''}`}
                style={{ backgroundColor: 'currentColor' }}
              />
              {tournamentStatus.text}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Swords className="w-3 h-3" />
                {tournament.format === 'single_elimination' ? 'Tek Eleme' : tournament.format}
              </span>
              <span className="text-gray-700">•</span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {teams.length}/{tournament.maxTeams} Takım
              </span>
              {teams.length < tournament.maxTeams && matches.length === 0 && (
                <>
                  <span className="text-gray-700">•</span>
                  <span className="text-amber-400/80 text-[11px]">
                    {tournament.maxTeams - teams.length} takım daha gerekli
                  </span>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {canAddMoreTeams && (
                <Button 
                  size="sm"
                  onClick={() => setShowAddTeamModal(true)}
                  className="h-8 text-xs bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 hover:text-white"
                  data-testid="add-team-button"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Takım Ekle
                </Button>
              )}
              
              {canGenerateBracket && (
                <Button 
                  size="sm"
                  onClick={() => generateBracketMutation.mutate()}
                  disabled={generateBracketMutation.isPending}
                  className="h-8 text-xs bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white border-0 shadow-lg shadow-amber-900/20"
                  data-testid="generate-bracket-button"
                >
                  <Play className="w-3.5 h-3.5 mr-1.5" />
                  Bracket Oluştur
                </Button>
              )}
            </div>
          </div>

          {canGenerateBracket && (
            <div className="mt-4 p-4 rounded-xl bg-gray-800/30 border border-gray-700/30">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
                Maç Ayarları
              </h4>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-gray-400">Seri Formatı:</Label>
                  <Select value={seriesFormat} onValueChange={setSeriesFormat}>
                    <SelectTrigger className="w-28 bg-gray-800/50 border-gray-700/50 text-gray-200 h-8 text-xs focus:ring-amber-500/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700/50">
                      <SelectItem value="bo1">BO1</SelectItem>
                      <SelectItem value="bo3">BO3</SelectItem>
                      <SelectItem value="bo5">BO5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {(seriesFormat === 'bo3' || seriesFormat === 'bo5') && (
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={fearlessMode} 
                      onCheckedChange={setFearlessMode}
                      className="data-[state=checked]:bg-orange-500"
                    />
                    <Label className="text-xs text-gray-400 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      Fearless Draft
                    </Label>
                    {fearlessMode && (
                      <span className="text-[10px] text-orange-400/80 ml-1">
                        (Seçilen şampiyonlar sonraki maçta seçilemez)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {teams.length > 0 && (
        <div className="rounded-xl border border-gray-700/30 bg-gradient-to-b from-gray-800/30 to-gray-900/50 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500/15 to-amber-700/15 border border-amber-500/20 flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Takımlar</h3>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {teams.map((team) => (
                <div 
                  key={team.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-800/30 border border-gray-700/30 hover:border-gray-600/50 transition-colors"
                  data-testid={`team-item-${team.id}`}
                >
                  {team.logo ? (
                    <img 
                      src={team.logo} 
                      alt={team.name}
                      className="w-8 h-8 rounded-lg object-cover border border-gray-700/50"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-700/30 border border-amber-500/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-amber-400">
                        {team.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="font-medium text-sm text-gray-200">{team.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {matches.length > 0 && (
        <div className="rounded-xl border border-gray-700/30 bg-gradient-to-b from-gray-800/30 to-gray-900/50 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500/15 to-amber-700/15 border border-amber-500/20 flex items-center justify-center">
                <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Turnuva Bracketi</h3>
            </div>
            <div className="space-y-5">
              {Array.from(new Set(matches.map(m => m.round))).sort().map(round => (
                <div key={round}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-amber-500/30 to-transparent" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400/80 px-2">
                      Round {round}
                    </h4>
                    <div className="h-px flex-1 bg-gradient-to-l from-amber-500/30 to-transparent" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {matches
                      .filter(match => match.round === round)
                      .sort((a, b) => a.position - b.position)
                      .map((match) => {
                        const team1 = getTeamById(match.team1Id);
                        const team2 = getTeamById(match.team2Id);
                        const winner = getTeamById(match.winnerId);
                        const isSeries = match.seriesFormat === 'bo3' || match.seriesFormat === 'bo5';
                        const matchStatus = getStatusConfig(match.status);
                        
                        return (
                          <div 
                            key={match.id}
                            className="rounded-xl border border-gray-700/30 bg-gradient-to-br from-gray-800/40 to-gray-900/60 p-4 transition-all hover:border-gray-600/40"
                            data-testid={`match-item-${match.id}`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="space-y-0.5 flex-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-1 h-5 rounded-full bg-blue-500/70" />
                                  <span className={`text-sm ${
                                    winner?.id === team1?.id ? 'text-amber-400 font-semibold' : 'text-gray-200'
                                  }`}>
                                    {team1?.name || 'TBD'}
                                  </span>
                                  {isSeries && <span className="text-xs text-gray-500 font-mono">({match.team1Wins})</span>}
                                  {winner?.id === team1?.id && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                                </div>

                                <div className="flex items-center gap-2 py-0.5 ml-1">
                                  <div className="h-px w-4 bg-gray-700/50" />
                                  <span className="text-[10px] text-gray-600 uppercase tracking-widest">vs</span>
                                  <div className="h-px w-4 bg-gray-700/50" />
                                </div>

                                <div className="flex items-center gap-2">
                                  <div className="w-1 h-5 rounded-full bg-red-500/70" />
                                  <span className={`text-sm ${
                                    winner?.id === team2?.id ? 'text-amber-400 font-semibold' : 'text-gray-200'
                                  }`}>
                                    {team2?.name || 'TBD'}
                                  </span>
                                  {isSeries && <span className="text-xs text-gray-500 font-mono">({match.team2Wins})</span>}
                                  {winner?.id === team2?.id && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                                </div>
                              </div>
                              
                              <div className="flex flex-col gap-1.5 items-end">
                                <div className="flex items-center gap-1 flex-wrap justify-end">
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] px-1.5 py-0 h-4 font-medium border ${matchStatus.bgClass}`}
                                  >
                                    <span
                                      className={`w-1 h-1 rounded-full mr-1 inline-block ${matchStatus.dotColor} ${match.status === 'in_progress' ? 'status-dot-pulse' : ''}`}
                                      style={{ backgroundColor: 'currentColor' }}
                                    />
                                    {matchStatus.text}
                                  </Badge>
                                  {isSeries && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-medium bg-purple-500/10 text-purple-300 border-purple-500/30">
                                      {match.seriesFormat.toUpperCase()}
                                    </Badge>
                                  )}
                                  {match.fearlessMode && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-medium bg-orange-500/10 text-orange-300 border-orange-500/30 flex items-center gap-0.5">
                                      <Flame className="w-2.5 h-2.5" />
                                      Fearless
                                    </Badge>
                                  )}
                                </div>

                                {isSeries && match.status === 'in_progress' && (
                                  <div className="text-[10px] text-gray-500">
                                    Oyun {match.currentGame} / {match.seriesFormat === 'bo5' ? '5' : '3'}
                                  </div>
                                )}
                                
                                {match.status === 'pending' && team1 && team2 && (
                                  <Button 
                                    size="sm"
                                    onClick={() => setStartDraftMatch(match)}
                                    className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs h-7 shadow-lg shadow-amber-900/20"
                                    data-testid={`start-draft-${match.id}`}
                                  >
                                    <Play className="w-3 h-3 mr-1" />
                                    Draft Başlat
                                  </Button>
                                )}

                                <MatchDraftControls match={match} team1={team1 || null} team2={team2 || null} />
                              </div>
                            </div>

                            {(match.status === 'in_progress' || match.status === 'completed') && (
                              <MatchDraftResults matchId={match.id} match={match} />
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <AddTeamModal
        isOpen={showAddTeamModal}
        onClose={() => setShowAddTeamModal(false)}
        onAddTeam={(data) => addTeamMutation.mutate(data)}
        isLoading={addTeamMutation.isPending}
      />

      {draftModalMatchId && (
        <DraftDetailsModal
          matchId={draftModalMatchId}
          isOpen={!!draftModalMatchId}
          onClose={() => setDraftModalMatchId(null)}
        />
      )}

      {startDraftMatch && (
        <StartDraftModal
          isOpen={!!startDraftMatch}
          onClose={() => setStartDraftMatch(null)}
          tournamentId={tournament.id}
          matchId={startDraftMatch.id}
          team1Name={getTeamById(startDraftMatch.team1Id)?.name}
          team2Name={getTeamById(startDraftMatch.team2Id)?.name}
          onDraftStarted={(draftSessionId) => {
            setStartDraftMatch(null);
            queryClient.invalidateQueries({ queryKey: ['/api/tournaments', tournament.id, 'matches'] });
            window.location.href = `/draft-simulator?sessionId=${draftSessionId}`;
          }}
        />
      )}
    </div>
  );
}