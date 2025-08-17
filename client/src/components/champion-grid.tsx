import { Champion } from "@shared/schema";

interface ChampionGridProps {
  champions: Champion[];
  selectedChampion: Champion | null;
  onChampionSelect: (champion: Champion) => void;
  bannedChampions: string[];
  pickedChampions: string[];
}

export function ChampionGrid({ 
  champions, 
  selectedChampion, 
  onChampionSelect,
  bannedChampions,
  pickedChampions 
}: ChampionGridProps) {
  const getChampionStatus = (champion: Champion) => {
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
          Champion Select
        </h2>
        <div className="text-sm lol-text-gray" data-testid="champions-count">
          {champions.length} champions
        </div>
      </div>

      <div className="grid grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3" data-testid="champion-grid">
        {champions.map((champion) => {
          const status = getChampionStatus(champion);
          const canSelect = status === 'available' || status === 'selected';
          
          return (
            <div
              key={champion.id}
              onClick={() => canSelect && onChampionSelect(champion)}
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                
                {/* Ban overlay */}
                {status === 'banned' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-red-500 text-3xl">🚫</span>
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <div className="text-xs font-medium text-white truncate" data-testid={`champion-name-${champion.id}`}>
                    {champion.name}
                  </div>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {champion.roles.map((role) => (
                      <span 
                        key={role}
                        className="text-xs px-1 py-0.5 bg-lol-blue/80 rounded text-white"
                        data-testid={`champion-role-${champion.id}-${role.toLowerCase()}`}
                      >
                        {role}
                      </span>
                    ))}
                    {champion.classes.map((champClass) => (
                      <span 
                        key={champClass}
                        className="text-xs px-1 py-0.5 bg-lol-red/80 rounded text-white"
                        data-testid={`champion-class-${champion.id}-${champClass.toLowerCase()}`}
                      >
                        {champClass}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
