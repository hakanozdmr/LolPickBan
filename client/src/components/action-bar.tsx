import { DraftSession, Champion } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Check, Ban, SkipForward } from "lucide-react";

interface ActionBarProps {
  draftSession: DraftSession;
  selectedChampion: Champion | null;
  onPickChampion: () => void;
  onBanChampion: () => void;
  onSkipTurn: () => void;
}

const PHASE_ACTIONS: Record<string, string> = {
  ban1: "Ban Champion",
  pick1: "Pick Champion",
  ban2: "Ban Champion", 
  pick2: "Pick Champion",
  pick3: "Pick Champion",
};

export function ActionBar({ 
  draftSession, 
  selectedChampion, 
  onPickChampion, 
  onBanChampion, 
  onSkipTurn 
}: ActionBarProps) {
  const currentAction = PHASE_ACTIONS[draftSession.phase] || "Select Action";
  const isPick = draftSession.phase.includes('pick');
  const isBan = draftSession.phase.includes('ban');

  return (
    <div className="fixed bottom-0 left-0 right-0 lol-bg-darker border-t border-gray-700 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm lol-text-gray">
            Current Action: <span className="lol-text-accent font-semibold" data-testid="current-action">{currentAction}</span>
          </div>
          <div className="text-sm lol-text-gray">
            Turn: <span className="text-white font-semibold" data-testid="current-team">
              {draftSession.currentTeam === 'blue' ? 'Blue Team' : 'Red Team'}
            </span>
          </div>
          {selectedChampion && (
            <div className="text-sm lol-text-gray">
              Selected: <span className="lol-text-gold font-semibold" data-testid="selected-champion">
                {selectedChampion.name}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={onSkipTurn}
            variant="secondary"
            className="bg-gray-600 hover:bg-gray-500 text-white"
            data-testid="skip-turn-button"
          >
            <SkipForward className="mr-2 h-4 w-4" />
            Skip Turn
          </Button>
          
          {isBan && (
            <Button
              onClick={onBanChampion}
              disabled={!selectedChampion}
              className="bg-red-600 hover:bg-red-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="ban-champion-button"
            >
              <Ban className="mr-2 h-4 w-4" />
              Ban Champion
            </Button>
          )}
          
          {isPick && (
            <Button
              onClick={onPickChampion}
              disabled={!selectedChampion}
              className="bg-lol-blue hover:bg-lol-blue/80 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="pick-champion-button"
            >
              <Check className="mr-2 h-4 w-4" />
              Confirm Pick
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
