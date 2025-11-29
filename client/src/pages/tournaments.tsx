import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Tournament, Team, Match } from "@shared/schema";
import { NavigationHeader } from "@/components/navigation-header";
import { TournamentList } from "@/components/tournament-list";
import { TournamentBracket } from "@/components/tournament-bracket";
import { CreateTournamentModal } from "@/components/create-tournament-modal";
import { Button } from "@/components/ui/button";
import { Plus, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Tournaments() {
  const { toast } = useToast();
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const isAdmin = !!localStorage.getItem("adminSession");

  // Fetch tournaments
  const { data: tournaments = [], isLoading: tournamentsLoading } = useQuery<Tournament[]>({
    queryKey: ['/api/tournaments'],
  });

  // Fetch teams for selected tournament
  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ['/api/tournaments', selectedTournament?.id, 'teams'],
    enabled: !!selectedTournament,
  });

  // Fetch matches for selected tournament
  const { data: matches = [] } = useQuery<Match[]>({
    queryKey: ['/api/tournaments', selectedTournament?.id, 'matches'],
    enabled: !!selectedTournament,
  });

  const createTournamentMutation = useMutation({
    mutationFn: async (tournamentData: any) => {
      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tournamentData),
      });
      if (!response.ok) throw new Error('Failed to create tournament');
      return response.json();
    },
    onSuccess: (tournament: Tournament) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
      setSelectedTournament(tournament);
      setShowCreateModal(false);
      toast({
        title: "Turnuva Oluşturuldu",
        description: `${tournament.name} başarıyla oluşturuldu.`,
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Turnuva oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  if (tournamentsLoading) {
    return (
      <div className="min-h-screen lol-bg-dark flex items-center justify-center">
        <div className="text-white text-xl">Turnuvalar yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lol-bg-dark text-white font-inter">
      <NavigationHeader />
      
      <div className="lol-bg-darker border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Trophy className="lol-text-gold text-xl" />
              <h1 className="text-2xl font-bold lol-text-gold" data-testid="tournaments-title">
                Turnuva Yönetimi
              </h1>
            </div>
{isAdmin && (
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="lol-bg-gold hover:lol-bg-accent text-black font-medium"
                data-testid="create-tournament-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Yeni Turnuva
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Tournament List Sidebar */}
          <div className="col-span-4">
            <TournamentList 
              tournaments={tournaments}
              selectedTournament={selectedTournament}
              onSelectTournament={setSelectedTournament}
            />
          </div>

          {/* Tournament Bracket View */}
          <div className="col-span-8">
            {selectedTournament ? (
              <TournamentBracket 
                tournament={selectedTournament}
                teams={teams}
                matches={matches}
              />
            ) : (
              <div className="lol-bg-darker rounded-lg border border-gray-700 p-8 text-center">
                <Trophy className="w-16 h-16 lol-text-gray mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Turnuva Seçin</h3>
                <p className="lol-text-gray mb-4">
                  {isAdmin 
                    ? "Bracket görünümü için sol taraftan bir turnuva seçin" 
                    : "Görüntülemek için sol taraftan bir turnuva seçin"}
                </p>
                {isAdmin && (
                  <Button 
                    onClick={() => setShowCreateModal(true)}
                    variant="outline"
                    className="border-lol-gold lol-text-gold hover:lol-bg-gold hover:text-black"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    İlk Turnuvanızı Oluşturun
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateTournamentModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateTournament={(data) => createTournamentMutation.mutate(data)}
        isLoading={createTournamentMutation.isPending}
      />
    </div>
  );
}