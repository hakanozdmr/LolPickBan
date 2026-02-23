import { useState } from "react";
import { Tournament } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Calendar, Settings, Trash2 } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TournamentListProps {
  tournaments: Tournament[];
  selectedTournament: Tournament | null;
  onSelectTournament: (tournament: Tournament) => void;
  onDeleteTournament?: (tournamentId: string) => void;
}

const formatStatusText = (status: string) => {
  switch (status) {
    case 'setup': return 'Hazırlık';
    case 'in_progress': return 'Devam Ediyor';
    case 'completed': return 'Tamamlandı';
    default: return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'setup': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
    case 'in_progress': return 'bg-green-500/20 text-green-300 border-green-500/50';
    case 'completed': return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
    default: return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
  }
};

const getFormatText = (format: string) => {
  switch (format) {
    case 'single_elimination': return 'Eleme';
    case 'double_elimination': return 'Çifte Eleme';
    case 'round_robin': return 'Lig Usulü';
    default: return format;
  }
};

export function TournamentList({ tournaments, selectedTournament, onSelectTournament, onDeleteTournament }: TournamentListProps) {
  const [deleteTarget, setDeleteTarget] = useState<Tournament | null>(null);

  const handleDelete = () => {
    if (deleteTarget && onDeleteTournament) {
      onDeleteTournament(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  if (tournaments.length === 0) {
    return (
      <div className="lol-bg-darker rounded-lg border border-gray-700 p-6">
        <div className="text-center">
          <Trophy className="w-12 h-12 lol-text-gray mx-auto mb-3" />
          <h3 className="font-semibold mb-2">Henüz Turnuva Yok</h3>
          <p className="text-sm lol-text-gray">
            İlk turnuvanızı oluşturmak için yukarıdaki butonu kullanın
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mb-4">Turnuvalar</h2>
      
      {tournaments.map((tournament) => (
        <div
          key={tournament.id}
          className={`lol-bg-darker rounded-lg border cursor-pointer transition-all duration-200 ${
            selectedTournament?.id === tournament.id
              ? 'border-lol-gold shadow-lg shadow-lol-gold/20'
              : 'border-gray-700 hover:border-gray-600'
          }`}
          onClick={() => onSelectTournament(tournament)}
          data-testid={`tournament-item-${tournament.id}`}
        >
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-white truncate flex-1 mr-2">
                {tournament.name}
              </h3>
              <Badge 
                className={`text-xs ${getStatusColor(tournament.status)} border`}
                data-testid={`tournament-status-${tournament.id}`}
              >
                {formatStatusText(tournament.status)}
              </Badge>
            </div>

            {tournament.description && (
              <p className="text-sm lol-text-gray mb-3 line-clamp-2">
                {tournament.description}
              </p>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm lol-text-gray">
                <Trophy className="w-4 h-4" />
                <span>{getFormatText(tournament.format)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm lol-text-gray">
                <Users className="w-4 h-4" />
                <span>Maksimum {tournament.maxTeams} takım</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm lol-text-gray">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(tournament.createdAt), 'dd.MM.yyyy')}</span>
              </div>
            </div>

            {selectedTournament?.id === tournament.id && (
              <div className="mt-3 pt-3 border-t border-gray-600 space-y-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="w-full border-lol-gold lol-text-gold hover:lol-bg-gold hover:text-black"
                  data-testid={`tournament-settings-${tournament.id}`}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Turnuva Ayarları
                </Button>
                {onDeleteTournament && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full border-red-500/50 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(tournament);
                    }}
                    data-testid={`tournament-delete-${tournament.id}`}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Turnuvayı Sil
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="lol-bg-darker border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Turnuvayı Sil</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              <span className="font-semibold text-white">{deleteTarget?.name}</span> turnuvasını silmek istediğinize emin misiniz? Bu işlem geri alınamaz. Turnuvaya ait tüm takımlar, maçlar ve bracket verileri silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
              İptal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}