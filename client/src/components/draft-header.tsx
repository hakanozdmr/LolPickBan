import { DraftSession, Champion } from "@shared/schema";
import { Gamepad2 } from "lucide-react";
import { AudioControl } from "./audio-control";

interface DraftHeaderProps {
  draftSession: DraftSession;
  champions: Champion[];
  timer: number;
  onVolumeChange?: (volume: number) => void;
}


export function DraftHeader({ draftSession, champions, timer, onVolumeChange }: DraftHeaderProps) {
  const getChampionById = (id: string) => champions.find(c => c.id === id);

  // Progress bar percentage (timer counts down from 30 to 0, so 100% to 0%)
  const progressPercentage = Math.max(0, Math.min(100, (timer / 30) * 100));
  
  // Determine active team color based on current turn
  const isBlueTeamTurn = draftSession.currentTeam === 'blue';
  const progressBarColor = isBlueTeamTurn ? 'bg-lol-blue' : 'bg-lol-red';

  const renderPickSlots = (picks: string[], team: 'blue' | 'red') => {
    const slots = Array.from({ length: 5 }, (_, i) => {
      const champion = picks[i] ? getChampionById(picks[i]) : null;
      return (
        <div
          key={i}
          className={`aspect-square rounded-lg flex items-center justify-center relative overflow-hidden border-2 ${
            champion 
              ? `border-${team === 'blue' ? 'lol-blue' : 'lol-red'}` 
              : 'border-dashed border-gray-600 bg-gray-800'
          }`}
          data-testid={`${team}-pick-slot-${i}`}
        >
          {champion ? (
            <>
              <img 
                src={champion.image} 
                alt={champion.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-xs p-1 text-center text-white">
                {champion.name}
              </div>
            </>
          ) : (
            <span className="text-gray-500 text-xl">+</span>
          )}
        </div>
      );
    });

    return <div className="grid grid-cols-5 gap-2">{slots}</div>;
  };

  const renderBanSlots = (bans: string[], team: 'blue' | 'red') => {
    const slots = Array.from({ length: 5 }, (_, i) => {
      const champion = bans[i] ? getChampionById(bans[i]) : null;
      return (
        <div
          key={i}
          className={`w-10 h-10 rounded border flex items-center justify-center relative overflow-hidden ${
            champion 
              ? 'bg-red-800/50 border-red-500' 
              : 'bg-gray-800 border-gray-600'
          }`}
          data-testid={`${team}-ban-slot-${i}`}
        >
          {champion ? (
            <>
              <img 
                src={champion.image} 
                alt={champion.name}
                className="w-full h-full object-cover grayscale"
              />
              <div className="absolute inset-0 bg-red-500/20"></div>
              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500 text-lg font-bold">✕</span>
            </>
          ) : (
            <span className="text-gray-500 text-xs">🚫</span>
          )}
        </div>
      );
    });

    return <div className="flex gap-1">{slots}</div>;
  };

  return (
    <div className="lol-bg-darker border-b border-gray-700 px-6 py-4">
      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-700 mb-4">
        <div 
          className={`h-full transition-all duration-1000 ease-linear ${progressBarColor}`}
          style={{ width: `${progressPercentage}%` }}
          data-testid="timer-progress-bar"
        ></div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Gamepad2 className="lol-text-gold text-xl" />
            <h1 className="text-xl font-bold lol-text-gold" data-testid="draft-title">
              Draft Simulator
            </h1>
            <AudioControl onVolumeChange={onVolumeChange} />
          </div>
          <div className="text-right">
            <div className="text-sm lol-text-gray">Game 1 of 3</div>
            <div className="text-lg font-semibold">Best of 3</div>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-8">
          {/* Blue Team */}
          <div className="flex-1">
            <div className="text-center mb-3">
              <h2 className="text-lg font-semibold lol-text-blue" data-testid="blue-team-title">
                MAVİ TAKIM
              </h2>
            </div>
            {renderPickSlots(draftSession.blueTeamPicks, 'blue')}
            
            <div className="mt-4">
              <h3 className="text-sm font-medium lol-text-gray mb-2">BANLAR</h3>
              {renderBanSlots(draftSession.blueTeamBans, 'blue')}
            </div>
          </div>

          {/* VS Indicator */}
          <div className="text-center px-4">
            <div className="text-3xl font-bold lol-text-gold" data-testid="vs-indicator">VS</div>
          </div>

          {/* Red Team */}
          <div className="flex-1">
            <div className="text-center mb-3">
              <h2 className="text-lg font-semibold lol-text-red" data-testid="red-team-title">
                KIRMIZI TAKIM
              </h2>
            </div>
            {renderPickSlots(draftSession.redTeamPicks, 'red')}
            
            <div className="mt-4">
              <h3 className="text-sm font-medium lol-text-gray mb-2">BANLAR</h3>
              {renderBanSlots(draftSession.redTeamBans, 'red')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
