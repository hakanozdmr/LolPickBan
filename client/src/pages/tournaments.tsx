import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Tournament, Team, Match } from "@shared/schema";
import { NavigationHeader } from "@/components/navigation-header";
import { TournamentList } from "@/components/tournament-list";
import { TournamentBracket } from "@/components/tournament-bracket";
import { CreateTournamentModal } from "@/components/create-tournament-modal";
import { TokenManagementModal } from "@/components/token-management-modal";
import { Button } from "@/components/ui/button";
import { Plus, Trophy, LogOut, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function Tournaments() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

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

  // Show loading or redirect if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen lol-bg-dark flex items-center justify-center">
        <div className="text-white text-xl">Giriş kontrol ediliyor...</div>
      </div>
    );
  }

  if (tournamentsLoading) {
    return (
      <div className="min-h-screen lol-bg-dark flex items-center justify-center">
        <div className="text-white text-xl">Turnuvalar yükleniyor...</div>
      </div>
    );
  }

  const isAdmin = user.role === 'admin';

  return (
    <div className="min-h-screen lol-bg-dark text-white font-inter">
      <NavigationHeader />
      
      <div className="lol-bg-darker border-b border-gray-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-yellow-400">Turnuvalar</h1>
            <p className="text-gray-400">
              Hoşgeldin, {user.username} ({user.role === 'admin' ? 'Admin' : 'Kullanıcı'})
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-black font-semibold"
                  data-testid="button-create-tournament"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Turnuva Oluştur
                </Button>
                {selectedTournament && (
                  <Button
                    onClick={() => setShowTokenModal(true)}
                    variant="outline"
                    className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/10"
                    data-testid="button-manage-tokens"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Token Yönetimi
                  </Button>
                )}
              </>
            )}
            <Button
              onClick={logout}
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-700"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış
            </Button>
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
              <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-8 text-center">
                <Trophy className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Turnuva Seçin</h3>
                <p className="text-gray-400 mb-4">
                  Bracket görünümü için sol taraftan bir turnuva seçin
                </p>
                {isAdmin && (
                  <Button 
                    onClick={() => setShowCreateModal(true)}
                    variant="outline"
                    className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
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

      {selectedTournament && (
        <TokenManagementModal
          isOpen={showTokenModal}
          onClose={() => setShowTokenModal(false)}
          tournament={selectedTournament}
        />
      )}
    </div>
  );
}