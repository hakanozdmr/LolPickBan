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
    <div className="fixed bottom-0 left-0 right-0 lol-bg-darker border-t border-gray-700 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm lol-text-gray">
            Mevcut Durum: <span className="lol-text-accent font-semibold" data-testid="current-action">{currentAction}</span>
          </div>
          {!isWaiting && !isCompleted && (
            <div className="text-sm lol-text-gray">
              Sıra: <span className={`font-semibold ${draftSession.currentTeam === 'blue' ? 'text-blue-400' : 'text-red-400'}`} data-testid="current-team">
                {draftSession.currentTeam === 'blue' ? 'Mavi Takım' : 'Kırmızı Takım'}
              </span>
            </div>
          )}
          {userTeam && !isWaiting && !isCompleted && (
            <div className={`text-sm font-medium ${isUserTurn ? 'text-green-400' : 'text-yellow-400'}`}>
              {isUserTurn ? (
                <span className="flex items-center gap-1">
                  <Play className="w-3 h-3" />
                  Sıra sizde!
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Rakibin sırasını bekleyin
                </span>
              )}
            </div>
          )}
          {selectedChampion && (
            <div className="text-sm lol-text-gray">
              Seçili: <span className="lol-text-gold font-semibold" data-testid="selected-champion">
                {selectedChampion.name}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {isWaiting && isModerator && onStartDraft && (
            <Button
              onClick={onStartDraft}
              className="lol-bg-gold hover:lol-bg-accent text-black font-semibold"
              data-testid="start-draft-button"
            >
              <Play className="mr-2 h-4 w-4" />
              Draft Başlat
            </Button>
          )}
          
          {isWaiting && !isModerator && userTeam && (
            <div className="text-amber-400 text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 animate-pulse" />
              Moderatörün draft'ı başlatması bekleniyor...
            </div>
          )}
          
          {isBan && !isCompleted && (
            <Button
              onClick={onBanChampion}
              disabled={!selectedChampion || !canUserAct}
              className="bg-red-600 hover:bg-red-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="bg-lol-blue hover:bg-lol-blue/80 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
