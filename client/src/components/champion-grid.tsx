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
        return 'grayscale cursor-not-allowed opacity-60';
      case 'picked':
        return 'grayscale cursor-not-allowed opacity-40';
      case 'fearless':
        return 'grayscale cursor-not-allowed opacity-40';
      case 'selected':
        return 'border-amber-500/60 bg-amber-500/5 shadow-lg shadow-amber-500/10 scale-105';
      default:
        return 'border-transparent hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-900/10 hover:scale-105 cursor-pointer';
    }
  };

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-4">
        <h2 className="lol-gradient-text text-base font-semibold" data-testid="champion-grid-title">
          Şampiyon Seçimi
        </h2>
        <span className="bg-gray-800 text-gray-500 text-xs px-2 py-0.5 rounded-full" data-testid="champions-count">
          {champions.length} şampiyon
        </span>
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
                    group relative bg-gray-800/50 border border-gray-700/30 rounded-lg overflow-hidden 
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
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    
                    {status === 'banned' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-red-900/20">
                        <div className="text-red-500 font-bold text-lg">✕</div>
                      </div>
                    )}
                    {status === 'fearless' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <div className="text-center">
                          <span className="text-orange-400 text-xl font-bold drop-shadow-[0_0_6px_rgba(251,146,60,0.4)]">F</span>
                          <div className="text-[7px] uppercase tracking-widest text-orange-300/80 mt-0.5">Fearless</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 via-gray-900/90 to-transparent px-1.5 py-1.5">
                    <div className="text-[11px] font-medium text-white text-center truncate" data-testid={`champion-name-${champion.id}`}>
                      {champion.name}
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs bg-gray-900 border border-gray-700/50 shadow-2xl">
                <div className="space-y-2">
                  <div className="font-bold text-amber-400">{champion.name}</div>
                  <div className="text-xs text-gray-400 italic">{champion.title}</div>
                  
                  <div className="space-y-1.5">
                    <div className="text-xs">
                      <span className="font-semibold text-blue-400">Roller:</span>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {champion.roles.map((role) => (
                          <span 
                            key={role}
                            className="text-[10px] px-1.5 py-0.5 bg-blue-500/15 border border-blue-500/30 rounded text-blue-300"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-xs">
                      <span className="font-semibold text-amber-400">Özellikler:</span>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {champion.classes.map((champClass) => (
                          <span 
                            key={champClass}
                            className="text-[10px] px-1.5 py-0.5 bg-amber-500/15 border border-amber-500/30 rounded text-amber-300"
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
