import { Tournament, Team, Match } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Users, Plus, Gamepad2 } from "lucide-react";
import { useState } from "react";
import { AddTeamModal } from "@/components/add-team-modal";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TournamentBracketProps {
  tournament: Tournament;
  teams: Team[];
  matches: Match[];
}

export function TournamentBracket({ tournament, teams, matches }: TournamentBracketProps) {
  const { toast } = useToast();
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);

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

  const startDraftMutation = useMutation({
    mutationFn: async (matchId: string) => {
      const response = await fetch(`/api/matches/${matchId}/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to start draft');
      return response.json();
    },
    onSuccess: (draftSession) => {
      toast({
        title: "Draft Başlatıldı",
        description: "Maç için draft oturumu başlatıldı.",
      });
      // Navigate to draft page with the session
      window.location.href = `/draft-simulator?sessionId=${draftSession.id}`;
    },
  });

  const setWinnerMutation = useMutation({
    mutationFn: async ({ matchId, winnerId }: { matchId: string; winnerId: string }) => {
      const response = await fetch(`/api/matches/${matchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          winnerId,
          status: 'completed',
          completedAt: new Date().toISOString()
        }),
      });
      if (!response.ok) throw new Error('Failed to set winner');
      return response.json();
    },
    onSuccess: (updatedMatch) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments', tournament.id, 'matches'] });
      const winner = getTeamById(updatedMatch.winnerId);
      toast({
        title: "Kazanan Belirlendi",
        description: `${winner?.name} maçı kazandı!`,
      });
    },
  });

  const getTeamById = (id: string | null) => {
    if (!id) return null;
    return teams.find(team => team.id === id);
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
                                    onClick={() => startDraftMutation.mutate(match.id)}
                                    disabled={startDraftMutation.isPending}
                                    className="lol-bg-gold hover:lol-bg-accent text-black text-xs"
                                    data-testid={`start-draft-${match.id}`}
                                  >
                                    <Play className="w-3 h-3 mr-1" />
                                    Draft Başlat
                                  </Button>
                                )}

                                {match.status === 'in_progress' && !match.winnerId && team1 && team2 && (
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
    </div>
  );
}