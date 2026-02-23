import { useState } from "react";
import { Tournament } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Calendar, Settings, Trash2, Swords, Crown, Clock, ChevronRight, Sparkles, Shield } from "lucide-react";
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

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'setup': return {
      text: 'Hazırlık',
      dotColor: 'text-amber-400',
      bgClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      icon: Clock,
    };
    case 'in_progress': return {
      text: 'Devam Ediyor',
      dotColor: 'text-emerald-400',
      bgClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      icon: Swords,
    };
    case 'completed': return {
      text: 'Tamamlandı',
      dotColor: 'text-sky-400',
      bgClass: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
      icon: Crown,
    };
    default: return {
      text: status,
      dotColor: 'text-gray-400',
      bgClass: 'bg-gray-500/10 text-gray-300 border-gray-500/30',
      icon: Shield,
    };
  }
};

const getFormatText = (format: string) => {
  switch (format) {
    case 'single_elimination': return 'Tek Eleme';
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
      <div className="rounded-xl border border-gray-700/50 bg-gradient-to-b from-gray-800/50 to-gray-900/50 p-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gray-800 border border-gray-600/50 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="font-semibold text-gray-300 mb-2">Henüz Turnuva Yok</h3>
          <p className="text-sm text-gray-500 max-w-[200px] mx-auto">
            İlk turnuvanızı oluşturmak için yukarıdaki butonu kullanın
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium uppercase tracking-wider text-gray-400">
          Turnuvalar
        </h2>
        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
          {tournaments.length}
        </span>
      </div>

      {tournaments.map((tournament) => {
        const isSelected = selectedTournament?.id === tournament.id;
        const statusConfig = getStatusConfig(tournament.status);
        const StatusIcon = statusConfig.icon;

        return (
          <div
            key={tournament.id}
            className={`
              group relative rounded-xl cursor-pointer tournament-card-hover overflow-hidden
              ${isSelected
                ? 'gold-shimmer-border bg-gradient-to-br from-[hsl(45,30%,12%)] to-[hsl(205,20%,10%)]'
                : 'border border-gray-700/50 bg-gradient-to-br from-gray-800/40 to-gray-900/60 hover:border-gray-600/70'
              }
            `}
            onClick={() => onSelectTournament(tournament)}
            data-testid={`tournament-item-${tournament.id}`}
          >
            <div className={`absolute inset-0 opacity-0 transition-opacity duration-300 ${isSelected ? '' : 'group-hover:opacity-100'}`}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent" />
            </div>

            <div className="relative p-4">
              <div className="flex items-start gap-3">
                <div className={`
                  flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center mt-0.5
                  ${isSelected
                    ? 'bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30'
                    : 'bg-gray-700/40 border border-gray-600/30 group-hover:border-gray-500/50'
                  }
                `}>
                  <Trophy className={`w-5 h-5 ${isSelected ? 'text-amber-400' : 'text-gray-400 group-hover:text-gray-300'}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold truncate text-sm ${isSelected ? 'lol-gradient-text' : 'text-gray-200 group-hover:text-white'}`}>
                      {tournament.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 h-5 font-medium border ${statusConfig.bgClass}`}
                      data-testid={`tournament-status-${tournament.id}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1 inline-block ${statusConfig.dotColor} ${tournament.status === 'in_progress' ? 'status-dot-pulse' : ''}`}
                        style={{ backgroundColor: 'currentColor' }}
                      />
                      {statusConfig.text}
                    </Badge>
                    <span className="text-[10px] text-gray-500">
                      {getFormatText(tournament.format)}
                    </span>
                  </div>
                </div>

                <ChevronRight className={`w-4 h-4 flex-shrink-0 mt-1 transition-all duration-200 ${isSelected ? 'text-amber-400 translate-x-0' : 'text-gray-600 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
              </div>

              {tournament.description && (
                <p className="text-xs text-gray-500 mt-2 ml-[52px] line-clamp-1">
                  {tournament.description}
                </p>
              )}

              <div className="flex items-center gap-4 mt-3 ml-[52px]">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  <Users className="w-3 h-3" />
                  <span>{tournament.maxTeams} Takım</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>{format(new Date(tournament.createdAt), 'dd.MM.yyyy')}</span>
                </div>
              </div>

              {isSelected && (
                <div className="mt-4 ml-[52px] flex items-center gap-2">
                  <Button
                    size="sm"
                    className="flex-1 h-8 text-xs bg-gradient-to-r from-amber-600/80 to-amber-700/80 hover:from-amber-500/90 hover:to-amber-600/90 text-white border-0 shadow-lg shadow-amber-900/20"
                    data-testid={`tournament-settings-${tournament.id}`}
                  >
                    <Settings className="w-3.5 h-3.5 mr-1.5" />
                    Ayarlar
                  </Button>
                  {onDeleteTournament && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs border-red-500/30 text-red-400/80 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50 px-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(tournament);
                      }}
                      data-testid={`tournament-delete-${tournament.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-gray-900 border-gray-700 shadow-2xl">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <AlertDialogTitle className="text-white text-center">Turnuvayı Sil</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400 text-center">
              <span className="font-semibold text-white">{deleteTarget?.name}</span> turnuvasını silmek istediğinize emin misiniz? Bu işlem geri alınamaz. Turnuvaya ait tüm takımlar, maçlar ve bracket verileri silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 sm:gap-2">
            <AlertDialogCancel className="flex-1 bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white">
              İptal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="flex-1 bg-red-600 text-white hover:bg-red-700 border-0"
            >
              Turnuvayı Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
