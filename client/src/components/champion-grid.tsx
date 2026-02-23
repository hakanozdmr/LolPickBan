import { Champion } from "@shared/schema";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ChampionGridProps {
  champions: Champion[];
  selectedChampion: Champion | null;
  onChampionSelect: (champion: Champion) => void;
  bannedChampions: string[];
  pickedChampions: string[];
  fearlessBannedChampions?: string[];
  onChampionHover?: () => void;
}

export function ChampionGrid({ 
  champions, 
  selectedChampion, 
  onChampionSelect,
  bannedChampions,
  pickedChampions,
  fearlessBannedChampions = [],
  onChampionHover 
}: ChampionGridProps) {
  const getChampionStatus = (champion: Champion) => {
    if (fearlessBannedChampions.includes(champion.id)) return 'fearless';
    if (bannedChampions.includes(champion.id)) return 'banned';
    if (pickedChampions.includes(champion.id)) return 'picked';
    if (selectedChampion?.id === champion.id) return 'selected';
    return 'available';
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'banned':
        return 'champion-card-banned cursor-not-allowed';
      case 'picked':
        return 'champion-card-picked cursor-not-allowed';
      case 'fearless':
        return 'champion-card-banned cursor-not-allowed opacity-40';
      case 'selected':
        return 'champion-card-selected border-lol-gold scale-105';
      default:
        return 'border-transparent hover:border-lol-gold hover:scale-105 cursor-pointer';
    }
  };

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white" data-testid="champion-grid-title">
          Şampiyon Seçimi
        </h2>
        <div className="text-sm lol-text-gray" data-testid="champions-count">
          {champions.length} şampiyon
        </div>
      </div>

      <div className="grid grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3" data-testid="champion-grid">
        {champions.map((champion) => {
          const status = getChampionStatus(champion);
          const canSelect = status === 'available' || status === 'selected';
          
          return (
            <Tooltip key={champion.id}>
              <TooltipTrigger asChild>
                <div
                  onClick={() => canSelect && onChampionSelect(champion)}
                  onMouseEnter={() => canSelect && onChampionHover?.()}
                  className={`
                    group relative lol-bg-darker rounded-lg overflow-hidden border-2 
                    transition-all duration-200 ${getStatusClasses(status)}
                  `}
                  data-testid={`champion-card-${champion.id}`}
                >
                  <div className="aspect-square relative overflow-hidden">
                    <img 
                      src={champion.image} 
                      alt={champion.name}
                      className={`w-full h-full object-cover transition-transform duration-300 ${
                        canSelect ? 'group-hover:scale-110' : ''
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                    
                    {status === 'banned' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-red-500 text-3xl">🚫</span>
                      </div>
                    )}
                    {status === 'fearless' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <div className="text-center">
                          <span className="text-orange-400 text-2xl font-bold">F</span>
                          <div className="text-[8px] text-orange-300 mt-0.5">FEARLESS</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Champion name at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/90 p-2">
                    <div className="text-sm font-bold text-white text-center truncate" data-testid={`champion-name-${champion.id}`}>
                      {champion.name}
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="space-y-2">
                  <div className="font-bold text-lol-gold">{champion.name}</div>
                  <div className="text-sm text-gray-300 italic">{champion.title}</div>
                  
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="font-semibold text-lol-blue">Roller:</span>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {champion.roles.map((role) => (
                          <span 
                            key={role}
                            className="text-xs px-2 py-1 bg-lol-blue/80 rounded text-white"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <span className="font-semibold text-lol-red">Özellikler:</span>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {champion.classes.map((champClass) => (
                          <span 
                            key={champClass}
                            className="text-xs px-2 py-1 bg-lol-red/80 rounded text-white"
                          >
                            {champClass === 'Fighter' ? 'Savaşçı' :
                             champClass === 'Mage' ? 'Büyücü' :
                             champClass === 'Assassin' ? 'Suikastçı' :
                             champClass === 'Tank' ? 'Tank' :
                             champClass === 'Marksman' ? 'Nişancı' :
                             champClass === 'Support' ? 'Destek' :
                             champClass}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
