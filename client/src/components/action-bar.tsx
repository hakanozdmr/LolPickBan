import { DraftSession, Champion } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Check, Ban, SkipForward } from "lucide-react";

interface ActionBarProps {
  draftSession: DraftSession;
  selectedChampion: Champion | null;
  onPickChampion: () => void;
  onBanChampion: () => void;
  onOpenStartModal: () => void;
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
  onOpenStartModal 
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
              Sıra: <span className="text-white font-semibold" data-testid="current-team">
                {draftSession.currentTeam === 'blue' ? 'Mavi Takım' : 'Kırmızı Takım'}
              </span>
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
          
          
          {isBan && !isCompleted && (
            <Button
              onClick={onBanChampion}
              disabled={!selectedChampion}
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
              disabled={!selectedChampion}
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
