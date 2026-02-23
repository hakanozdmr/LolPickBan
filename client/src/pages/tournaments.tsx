import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Tournament, Team, Match } from "@shared/schema";
import { TournamentList } from "@/components/tournament-list";
import { TournamentBracket } from "@/components/tournament-bracket";
import { CreateTournamentModal } from "@/components/create-tournament-modal";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Plus, Trophy, Swords, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Tournaments() {
  const { toast } = useToast();
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const isAdmin = !!localStorage.getItem("adminSession");
  const isModerator = !!localStorage.getItem("moderatorSession");
  const canCreateTournament = isAdmin || isModerator;

  const { data: tournaments = [], isLoading: tournamentsLoading } = useQuery<Tournament[]>({
    queryKey: ['/api/tournaments'],
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ['/api/tournaments', selectedTournament?.id, 'teams'],
    enabled: !!selectedTournament,
  });

  const { data: matches = [] } = useQuery<Match[]>({
    queryKey: ['/api/tournaments', selectedTournament?.id, 'matches'],
    enabled: !!selectedTournament,
  });

  const handleCreateTournament = async (tournamentData: any): Promise<void> => {
    try {
      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tournamentData.name,
          description: tournamentData.description,
          format: tournamentData.format,
          maxTeams: tournamentData.maxTeams,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to create tournament');
      const tournament: Tournament = await response.json();

      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
      setSelectedTournament(tournament);
      
      toast({
        title: "Turnuva Oluşturuldu",
        description: `${tournament.name} başarıyla oluşturuldu.`,
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Turnuva oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTournament = async (tournamentId: string) => {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete tournament');

      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
      
      if (selectedTournament?.id === tournamentId) {
        setSelectedTournament(null);
      }
      
      toast({
        title: "Turnuva Silindi",
        description: "Turnuva başarıyla silindi.",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Turnuva silinirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const [isCreating, setIsCreating] = useState(false);
  
  const wrappedCreateTournament = async (data: any) => {
    setIsCreating(true);
    try {
      await handleCreateTournament(data);
    } finally {
      setIsCreating(false);
    }
  };

  if (tournamentsLoading) {
    return (
      <div className="min-h-screen lol-bg-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
          <span className="text-gray-400 text-sm">Turnuvalar yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lol-bg-dark text-white font-inter flex flex-col">
      <div className="relative overflow-hidden border-b border-gray-700/50">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/10 via-transparent to-amber-900/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(180,130,50,0.08),transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/20 flex items-center justify-center">
                <Swords className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold lol-gradient-text" data-testid="tournaments-title">
                  Turnuva Yönetimi
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">{tournaments.length} turnuva kayıtlı</p>
              </div>
            </div>
            {canCreateTournament && (
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-medium shadow-lg shadow-amber-900/20 border-0 h-9 px-4 text-sm"
                data-testid="create-tournament-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Yeni Turnuva
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-4">
              <TournamentList 
                tournaments={tournaments}
                selectedTournament={selectedTournament}
                onSelectTournament={setSelectedTournament}
                onDeleteTournament={canCreateTournament ? handleDeleteTournament : undefined}
              />
            </div>

            <div className="col-span-12 lg:col-span-8">
              {selectedTournament ? (
                <TournamentBracket 
                  tournament={selectedTournament}
                  teams={teams}
                  matches={matches}
                />
              ) : (
                <div className="rounded-xl border border-gray-700/30 bg-gradient-to-b from-gray-800/30 to-gray-900/50 p-12 text-center">
                  <div className="max-w-sm mx-auto">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Trophy className="w-10 h-10 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">Turnuva Seçin</h3>
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                      {canCreateTournament 
                        ? "Bracket görünümü için sol taraftan bir turnuva seçin veya yeni bir turnuva oluşturun" 
                        : "Görüntülemek için sol taraftan bir turnuva seçin"}
                    </p>
                    {canCreateTournament && (
                      <Button 
                        onClick={() => setShowCreateModal(true)}
                        variant="outline"
                        className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50 hover:text-amber-300"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Yeni Turnuva Oluştur
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CreateTournamentModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateTournament={wrappedCreateTournament}
        isLoading={isCreating}
      />

      <Footer />
    </div>
  );
}
