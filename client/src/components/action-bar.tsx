import { DraftSession, Champion } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Check, Ban, SkipForward, Play, Clock } from "lucide-react";

interface ActionBarProps {
  draftSession: DraftSession;
  selectedChampion: Champion | null;
  onPickChampion: () => void;
  onBanChampion: () => void;
  onOpenStartModal: () => void;
  onStartDraft?: () => void;
  canUserAct?: boolean;
  isUserTurn?: boolean;
  userTeam?: string | null;
  isModerator?: boolean;
}

const PHASE_ACTIONS: Record<string, string> = {
  waiting: "Başlamayı Bekliyor",
  ban1: "Şampiyon Banla",
  pick1: "Şampiyon Seç",
  ban2: "Şampiyon Banla", 
  pick2: "Şampiyon Seç",
  completed: "Draft Tamamlandı",
};

export function ActionBar({ 
  draftSession, 
  selectedChampion, 
  onPickChampion, 
  onBanChampion, 
  onOpenStartModal,
  onStartDraft,
  canUserAct = true,
  isUserTurn,
  userTeam,
  isModerator = false
}: ActionBarProps) {
  const currentAction = PHASE_ACTIONS[draftSession.phase] || "Eylem Seç";
  const isPick = draftSession.phase.includes('pick');
  const isBan = draftSession.phase.includes('ban');
  const isWaiting = draftSession.phase === 'waiting';
  const isCompleted = draftSession.phase === 'completed';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-700/30 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-xs text-gray-500">
            Mevcut Durum: <span className="text-amber-400 font-medium" data-testid="current-action">{currentAction}</span>
          </div>
          {!isWaiting && !isCompleted && (
            <div className="text-xs text-gray-500 flex items-center gap-1.5">
              Sıra:
              <span className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${draftSession.currentTeam === 'blue' ? 'bg-blue-400' : 'bg-red-400'}`} />
                <span className={`font-semibold ${draftSession.currentTeam === 'blue' ? 'text-blue-400' : 'text-red-400'}`} data-testid="current-team">
                  {draftSession.currentTeam === 'blue' ? 'Mavi Takım' : 'Kırmızı Takım'}
                </span>
              </span>
            </div>
          )}
          {userTeam && !isWaiting && !isCompleted && (
            <>
              {isUserTurn ? (
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
                  <Play className="w-3 h-3" />
                  Sıra sizde!
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1">
                  <Clock className="w-3 h-3" />
                  Rakibin sırasını bekleyin
                </span>
              )}
            </>
          )}
          {selectedChampion && (
            <div className="text-xs text-gray-500 flex items-center gap-1.5">
              Seçili: <span className="text-amber-400 font-semibold border-b border-amber-500/30" data-testid="selected-champion">
                {selectedChampion.name}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {isWaiting && isModerator && onStartDraft && (
            <Button
              onClick={onStartDraft}
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold shadow-lg shadow-amber-900/20"
              data-testid="start-draft-button"
            >
              <Play className="mr-2 h-4 w-4" />
              Draft Başlat
            </Button>
          )}
          
          {isWaiting && !isModerator && userTeam && (
            <div className="flex items-center gap-2 text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2">
              <Clock className="w-4 h-4 animate-pulse" />
              Moderatörün draft'ı başlatması bekleniyor...
            </div>
          )}
          
          {isBan && !isCompleted && (
            <Button
              onClick={onBanChampion}
              disabled={!selectedChampion || !canUserAct}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="ban-champion-button"
            >
              <Ban className="mr-2 h-4 w-4" />
              Şampiyon Banla
            </Button>
          )}
          
          {isPick && !isCompleted && (
            <Button
              onClick={onPickChampion}
              disabled={!selectedChampion || !canUserAct}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="pick-champion-button"
            >
              <Check className="mr-2 h-4 w-4" />
              Şampiyon Seç
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
