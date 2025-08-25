import { DraftSession, Champion } from "@shared/schema";
import { Gamepad2 } from "lucide-react";
import { AudioControl } from "./audio-control";

interface DraftHeaderProps {
  draftSession: DraftSession;
  champions: Champion[];
  timer: number;
  selectedChampion: Champion | null;
  onVolumeChange?: (volume: number) => void;
}


export function DraftHeader({ draftSession, champions, timer, selectedChampion, onVolumeChange }: DraftHeaderProps) {
  const getChampionById = (id: string) => champions.find(c => c.id === id);
  
  // Function to get loading screen image URL
  const getLoadingScreenImage = (champion: Champion) => {
    const championName = champion.name.charAt(0).toUpperCase() + champion.name.slice(1);
    return `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${championName}_0.jpg`;
  };

  // Progress bar percentage - starts at 100% and decreases to 0%
  const progressPercentage = Math.max(0, Math.min(100, (timer / 30) * 100));
  
  // Determine active team color based on current turn  
  const isBlueTeamTurn = draftSession.currentTeam === 'blue';
  const progressBarColor = isBlueTeamTurn ? 'bg-lol-blue' : 'bg-lol-true-red';

  const renderPickSlots = (picks: string[], team: 'blue' | 'red') => {
    const slots = Array.from({ length: 5 }, (_, i) => {
      const champion = picks[i] ? getChampionById(picks[i]) : null;
      
      // Check if this slot is currently active for picking
      const isPickPhase = draftSession.phase === 'pick1' || draftSession.phase === 'pick2';
      const isCurrentTeamTurn = draftSession.currentTeam === team;
      const isActiveSlot = isPickPhase && isCurrentTeamTurn && !champion && i === picks.length;
      
      // Show selected champion as preview in active slot
      const previewChampion = (isActiveSlot && selectedChampion) ? selectedChampion : champion;
      
      return (
        <div
          key={i}
          className={`w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-32 lg:w-28 lg:h-36 xl:w-32 xl:h-40 rounded border-2 flex flex-col relative overflow-hidden transition-all duration-300 ${
            isActiveSlot 
              ? `border-lol-gold shadow-lg shadow-lol-gold/50 bg-lol-gold/10 animate-slow-pulse`
              : champion 
                ? `border-${team === 'blue' ? 'lol-blue' : 'lol-red'} shadow-xl` 
                : 'border-gray-600 bg-gray-700'
          }`}
          data-testid={`${team}-pick-slot-${i}`}
        >
          {previewChampion ? (
            <>
              <div className="flex-1 relative overflow-hidden">
                <img 
                  src={getLoadingScreenImage(previewChampion)} 
                  alt={previewChampion.name}
                  className={`w-full h-full object-cover object-top ${isActiveSlot && selectedChampion ? 'opacity-70' : ''}`}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80"></div>
                {isActiveSlot && selectedChampion && (
                  <div className="absolute inset-0 border-2 border-lol-gold animate-pulse"></div>
                )}
              </div>
              <div className="bg-black/90 text-center py-1 sm:py-2 px-1">
                <div className="text-white text-xs sm:text-sm font-bold truncate">
                  {previewChampion.name}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-gray-500 text-lg opacity-50">-</span>
            </div>
          )}
        </div>
      );
    });

    return <div className="flex justify-center gap-1 sm:gap-2 md:gap-3 lg:gap-4">{slots}</div>;
  };

  const renderBanSlots = (bans: string[], team: 'blue' | 'red') => {
    const slots = Array.from({ length: 5 }, (_, i) => {
      const champion = bans[i] ? getChampionById(bans[i]) : null;
      
      // Check if this ban slot is currently active
      const isBanPhase = draftSession.phase === 'ban1' || draftSession.phase === 'ban2';
      const isCurrentTeamTurn = draftSession.currentTeam === team;
      const isActiveBanSlot = isBanPhase && isCurrentTeamTurn && !champion && i === bans.length;
      
      // Check if this is an empty ban (banned but no champion)
      const isEmptyBan = i < bans.length && bans[i] === "EMPTY_BAN";
      
      // Show selected champion as preview in active ban slot
      const previewChampion = (isActiveBanSlot && selectedChampion) ? selectedChampion : champion;
      
      return (
        <div
          key={i}
          className={`w-10 h-10 rounded border flex items-center justify-center relative overflow-hidden transition-all duration-300 ${
            isActiveBanSlot
              ? 'bg-red-500/30 border-red-400 shadow-lg shadow-red-400/50 animate-slow-pulse'
              : champion 
                ? 'bg-red-800/50 border-red-500' 
                : 'bg-gray-800 border-gray-600'
          }`}
          data-testid={`${team}-ban-slot-${i}`}
        >
          {previewChampion ? (
            <>
              <img 
                src={previewChampion.image} 
                alt={previewChampion.name}
                className={`w-full h-full object-cover grayscale ${isActiveBanSlot && selectedChampion ? 'opacity-70' : ''}`}
              />
              <div className="absolute inset-0 bg-red-500/20"></div>
              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500 text-lg font-bold">✕</span>
              {isActiveBanSlot && selectedChampion && (
                <div className="absolute inset-0 border-2 border-red-400 animate-pulse"></div>
              )}
            </>
          ) : isEmptyBan ? (
            <>
              <div className="w-full h-full bg-red-800/50"></div>
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
      <div className={`w-full h-2 bg-gray-700 mb-4 flex ${isBlueTeamTurn ? 'justify-start' : 'justify-end'}`}>
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
