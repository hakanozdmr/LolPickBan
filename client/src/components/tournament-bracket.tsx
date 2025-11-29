import { Tournament, Team, Match, DraftSession, Champion } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Users, Plus, Gamepad2, Shield, Sword, Eye, Check, Clock } from "lucide-react";
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

export function TournamentBracket({ tournament, teams, matches }: TournamentBracketProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [draftModalMatchId, setDraftModalMatchId] = useState<string | null>(null);
  const [startDraftMatch, setStartDraftMatch] = useState<Match | null>(null);

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
      // Generate matches for single elimination bracket
      const rounds = Math.ceil(Math.log2(teams.length));
      const matchPromises = [];

      // Shuffle teams randomly for fair matchups
      const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);

      // First round matches
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

  // Component to display draft results
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
      <div className="mt-3 pt-3 border-t border-gray-600">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs lol-text-gray">Draft Sonuçları:</div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDraftModalMatchId(matchId)}
            className="text-xs lol-text-blue hover:lol-bg-blue/20"
            data-testid={`view-draft-details-${matchId}`}
          >
            <Eye className="w-3 h-3 mr-1" />
            Detaylar
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Blue Team */}
          <div>
            <div className="lol-text-blue mb-1 font-semibold">{draftSession.blueTeamName}</div>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Sword className="w-3 h-3 lol-text-gold" />
                <span className="lol-text-gray">Picks:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {draftSession.blueTeamPicks.map((championId, index) => {
                  const champion = getChampionById(championId);
                  return champion ? (
                    <img
                      key={`blue-pick-${index}`}
                      src={champion.image}
                      alt={champion.name}
                      className="w-6 h-6 rounded border border-blue-500"
                      title={champion.name}
                    />
                  ) : null;
                })}
              </div>
              <div className="flex items-center gap-1 mt-2">
                <Shield className="w-3 h-3 lol-text-red" />
                <span className="lol-text-gray">Bans:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {draftSession.blueTeamBans.map((championId, index) => {
                  const champion = getChampionById(championId);
                  return champion ? (
                    <img
                      key={`blue-ban-${index}`}
                      src={champion.image}
                      alt={champion.name}
                      className="w-4 h-4 rounded border border-red-500 opacity-60"
                      title={`${champion.name} (Banned)`}
                    />
                  ) : null;
                })}
              </div>
            </div>
          </div>

          {/* Red Team */}
          <div>
            <div className="lol-text-red mb-1 font-semibold">{draftSession.redTeamName}</div>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Sword className="w-3 h-3 lol-text-gold" />
                <span className="lol-text-gray">Picks:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {draftSession.redTeamPicks.map((championId, index) => {
                  const champion = getChampionById(championId);
                  return champion ? (
                    <img
                      key={`red-pick-${index}`}
                      src={champion.image}
                      alt={champion.name}
                      className="w-6 h-6 rounded border border-red-500"
                      title={champion.name}
                    />
                  ) : null;
                })}
              </div>
              <div className="flex items-center gap-1 mt-2">
                <Shield className="w-3 h-3 lol-text-red" />
                <span className="lol-text-gray">Bans:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {draftSession.redTeamBans.map((championId, index) => {
                  const champion = getChampionById(championId);
                  return champion ? (
                    <img
                      key={`red-ban-${index}`}
                      src={champion.image}
                      alt={champion.name}
                      className="w-4 h-4 rounded border border-red-500 opacity-60"
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

  // Draft Details Modal Component
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
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto lol-bg-darker border-gray-700">
          <DialogTitle className="sr-only">Draft Detayları</DialogTitle>
          <div className="space-y-6">
            {/* Teams Overview */}
            <div className="grid grid-cols-2 gap-6">
              {/* Blue Team */}
              <div className="lol-bg-dark rounded-lg p-4">
                <h3 className="lol-text-blue text-lg font-semibold mb-4">
                  {draftSession.blueTeamName}
                </h3>
                
                {/* Picks */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sword className="w-4 h-4 lol-text-gold" />
                    <span className="font-medium text-white">Picks</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {draftSession.blueTeamPicks.map((championId, index) => {
                      const champion = getChampionById(championId);
                      return champion ? (
                        <div key={`blue-pick-${index}`} className="text-center">
                          <img
                            src={champion.image}
                            alt={champion.name}
                            className="w-16 h-16 rounded-lg border-2 border-blue-500 mb-1"
                          />
                          <div className="text-xs text-white font-medium">{champion.name}</div>
                          <div className="text-xs lol-text-gray">{champion.title}</div>
                        </div>
                      ) : (
                        <div key={`blue-pick-${index}`} className="w-16 h-16 rounded-lg border-2 border-gray-500 bg-gray-800"></div>
                      );
                    })}
                  </div>
                </div>

                {/* Bans */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 lol-text-red" />
                    <span className="font-medium text-white">Bans</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {draftSession.blueTeamBans.map((championId, index) => {
                      const champion = getChampionById(championId);
                      return champion ? (
                        <div key={`blue-ban-${index}`} className="text-center">
                          <img
                            src={champion.image}
                            alt={champion.name}
                            className="w-12 h-12 rounded-lg border-2 border-red-500 opacity-60 mb-1"
                          />
                          <div className="text-xs text-white">{champion.name}</div>
                        </div>
                      ) : (
                        <div key={`blue-ban-${index}`} className="w-12 h-12 rounded-lg border-2 border-gray-500 bg-gray-800 opacity-60"></div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Red Team */}
              <div className="lol-bg-dark rounded-lg p-4">
                <h3 className="lol-text-red text-lg font-semibold mb-4">
                  {draftSession.redTeamName}
                </h3>
                
                {/* Picks */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sword className="w-4 h-4 lol-text-gold" />
                    <span className="font-medium text-white">Picks</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {draftSession.redTeamPicks.map((championId, index) => {
                      const champion = getChampionById(championId);
                      return champion ? (
                        <div key={`red-pick-${index}`} className="text-center">
                          <img
                            src={champion.image}
                            alt={champion.name}
                            className="w-16 h-16 rounded-lg border-2 border-red-500 mb-1"
                          />
                          <div className="text-xs text-white font-medium">{champion.name}</div>
                          <div className="text-xs lol-text-gray">{champion.title}</div>
                        </div>
                      ) : (
                        <div key={`red-pick-${index}`} className="w-16 h-16 rounded-lg border-2 border-gray-500 bg-gray-800"></div>
                      );
                    })}
                  </div>
                </div>

                {/* Bans */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 lol-text-red" />
                    <span className="font-medium text-white">Bans</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {draftSession.redTeamBans.map((championId, index) => {
                      const champion = getChampionById(championId);
                      return champion ? (
                        <div key={`red-ban-${index}`} className="text-center">
                          <img
                            src={champion.image}
                            alt={champion.name}
                            className="w-12 h-12 rounded-lg border-2 border-red-500 opacity-60 mb-1"
                          />
                          <div className="text-xs text-white">{champion.name}</div>
                        </div>
                      ) : (
                        <div key={`red-ban-${index}`} className="w-12 h-12 rounded-lg border-2 border-gray-500 bg-gray-800 opacity-60"></div>
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

  const canGenerateBracket = teams.length === tournament.maxTeams && matches.length === 0;
  const canAddMoreTeams = teams.length < tournament.maxTeams;

  return (
    <div className="space-y-6">
      <Card className="lol-bg-darker border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="lol-text-gold">{tournament.name}</span>
            <Badge className={`${
              tournament.status === 'setup' ? 'bg-yellow-500/20 text-yellow-300' :
              tournament.status === 'in_progress' ? 'bg-green-500/20 text-green-300' :
              'bg-blue-500/20 text-blue-300'
            } border`}>
              {tournament.status === 'setup' ? 'Hazırlık' :
               tournament.status === 'in_progress' ? 'Devam Ediyor' : 'Tamamlandı'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tournament.description && (
            <p className="lol-text-gray mb-4">{tournament.description}</p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm lol-text-gray">
              <span>Format: {tournament.format === 'single_elimination' ? 'Eleme' : tournament.format}</span>
              <span>•</span>
              <span>{teams.length}/{tournament.maxTeams} Takım</span>
              {teams.length < tournament.maxTeams && matches.length === 0 && (
                <>
                  <span>•</span>
                  <span className="text-yellow-400">Bracket oluşturmak için {tournament.maxTeams - teams.length} takım daha gerekli</span>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {canAddMoreTeams && (
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddTeamModal(true)}
                  className="border-lol-gold lol-text-gold hover:lol-bg-gold hover:text-black"
                  data-testid="add-team-button"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Takım Ekle
                </Button>
              )}
              
              {canGenerateBracket && (
                <Button 
                  size="sm"
                  onClick={() => generateBracketMutation.mutate()}
                  disabled={generateBracketMutation.isPending}
                  className="lol-bg-gold hover:lol-bg-accent text-black"
                  data-testid="generate-bracket-button"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Bracket Oluştur
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teams List */}
      {teams.length > 0 && (
        <Card className="lol-bg-darker border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 lol-text-gold" />
              Takımlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {teams.map((team) => (
                <div 
                  key={team.id}
                  className="flex items-center gap-3 p-3 lol-bg-dark rounded-lg border border-gray-600"
                  data-testid={`team-item-${team.id}`}
                >
                  {team.logo ? (
                    <img 
                      src={team.logo} 
                      alt={team.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 lol-bg-gold rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-black">
                        {team.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="font-medium text-white">{team.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bracket Matches */}
      {matches.length > 0 && (
        <Card className="lol-bg-darker border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 lol-text-gold" />
              Turnuva Bracketi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Group matches by round */}
              {Array.from(new Set(matches.map(m => m.round))).sort().map(round => (
                <div key={round}>
                  <h4 className="font-semibold mb-3 lol-text-accent">
                    Round {round}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matches
                      .filter(match => match.round === round)
                      .sort((a, b) => a.position - b.position)
                      .map((match) => {
                        const team1 = getTeamById(match.team1Id);
                        const team2 = getTeamById(match.team2Id);
                        const winner = getTeamById(match.winnerId);
                        
                        return (
                          <div 
                            key={match.id}
                            className="lol-bg-dark rounded-lg border border-gray-600 p-4"
                            data-testid={`match-item-${match.id}`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="space-y-2 flex-1">
                                <div className={`flex items-center gap-2 ${
                                  winner?.id === team1?.id ? 'lol-text-gold font-semibold' : 'text-white'
                                }`}>
                                  <span>{team1?.name || 'TBD'}</span>
                                  {winner?.id === team1?.id && <span>👑</span>}
                                </div>
                                <div className="text-sm lol-text-gray">vs</div>
                                <div className={`flex items-center gap-2 ${
                                  winner?.id === team2?.id ? 'lol-text-gold font-semibold' : 'text-white'
                                }`}>
                                  <span>{team2?.name || 'TBD'}</span>
                                  {winner?.id === team2?.id && <span>👑</span>}
                                </div>
                              </div>
                              
                              <div className="flex flex-col gap-2">
                                <Badge className={`text-xs ${
                                  match.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                                  match.status === 'in_progress' ? 'bg-green-500/20 text-green-300' :
                                  'bg-blue-500/20 text-blue-300'
                                } border`}>
                                  {match.status === 'pending' ? 'Bekliyor' :
                                   match.status === 'in_progress' ? 'Devam Ediyor' : 'Tamamlandı'}
                                </Badge>
                                
                                {match.status === 'pending' && team1 && team2 && (
                                  <Button 
                                    size="sm"
                                    onClick={() => setStartDraftMatch(match)}
                                    className="lol-bg-gold hover:lol-bg-accent text-black text-xs"
                                    data-testid={`start-draft-${match.id}`}
                                  >
                                    <Play className="w-3 h-3 mr-1" />
                                    Draft Başlat
                                  </Button>
                                )}

                                {match.status === 'in_progress' && draftSession && draftSession.phase === 'waiting' && (
                                  <Button 
                                    size="sm"
                                    onClick={() => setLocation(`/draft-simulator?session=${draftSession.id}`)}
                                    className="lol-bg-gold hover:lol-bg-accent text-black text-xs"
                                    data-testid={`go-to-draft-${match.id}`}
                                  >
                                    <Play className="w-3 h-3 mr-1" />
                                    Draft'a Git
                                  </Button>
                                )}

                                {match.status === 'in_progress' && draftSession && draftSession.phase !== 'waiting' && draftSession.phase !== 'completed' && (
                                  <Button 
                                    size="sm"
                                    onClick={() => setLocation(`/draft-simulator?session=${draftSession.id}`)}
                                    className="bg-green-600 hover:bg-green-700 text-white text-xs"
                                    data-testid={`view-draft-${match.id}`}
                                  >
                                    <Eye className="w-3 h-3 mr-1" />
                                    Draft İzle
                                  </Button>
                                )}

                                {match.status === 'in_progress' && !match.winnerId && team1 && team2 && draftSession?.phase === 'completed' && (
                                  <div className="space-y-1">
                                    <div className="text-xs lol-text-gray mb-1">Kazanan:</div>
                                    <Button 
                                      size="sm"
                                      onClick={() => setWinnerMutation.mutate({ matchId: match.id, winnerId: team1.id })}
                                      disabled={setWinnerMutation.isPending}
                                      className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white"
                                      data-testid={`set-winner-team1-${match.id}`}
                                    >
                                      {team1.name}
                                    </Button>
                                    <Button 
                                      size="sm"
                                      onClick={() => setWinnerMutation.mutate({ matchId: match.id, winnerId: team2.id })}
                                      disabled={setWinnerMutation.isPending}
                                      className="w-full text-xs bg-red-600 hover:bg-red-700 text-white"
                                      data-testid={`set-winner-team2-${match.id}`}
                                    >
                                      {team2.name}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Show draft results for in_progress and completed matches */}
                            {(match.status === 'in_progress' || match.status === 'completed') && (
                              <DraftResults matchId={match.id} />
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <AddTeamModal
        isOpen={showAddTeamModal}
        onClose={() => setShowAddTeamModal(false)}
        onAddTeam={(data) => addTeamMutation.mutate(data)}
        isLoading={addTeamMutation.isPending}
      />

      {/* Draft Details Modal */}
      {draftModalMatchId && (
        <DraftDetailsModal
          matchId={draftModalMatchId}
          isOpen={!!draftModalMatchId}
          onClose={() => setDraftModalMatchId(null)}
        />
      )}

      {/* Start Draft Modal */}
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