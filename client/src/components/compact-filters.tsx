import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CompactFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedRoles: string[];
  onRoleToggle: (role: string) => void;
  selectedClasses: string[];
  onClassToggle: (className: string) => void;
  onClearFilters: () => void;
}

const ROLES = [
  { 
    id: 'Top', 
    name: 'Üst Koridor', 
    iconUrl: 'https://static.wikia.nocookie.net/leagueoflegends/images/e/ef/Top_icon.png/revision/latest/smart/width/40/height/30?cb=20181117143602'
  },
  { 
    id: 'Jungle', 
    name: 'Orman', 
    iconUrl: 'https://static.wikia.nocookie.net/leagueoflegends/images/1/1b/Jungle_icon.png/revision/latest/smart/width/40/height/30?cb=20181117143559'
  },
  { 
    id: 'Mid', 
    name: 'Orta Koridor', 
    iconUrl: 'https://static.wikia.nocookie.net/leagueoflegends/images/9/98/Middle_icon.png/revision/latest/smart/width/40/height/30?cb=20181117143644'
  },
  { 
    id: 'ADC', 
    name: 'Alt Koridor', 
    iconUrl: 'https://static.wikia.nocookie.net/leagueoflegends/images/9/97/Bottom_icon.png/revision/latest/smart/width/40/height/30?cb=20181117143632'
  },
  { 
    id: 'Support', 
    name: 'Destek', 
    iconUrl: 'https://static.wikia.nocookie.net/leagueoflegends/images/e/e0/Support_icon.png/revision/latest/smart/width/40/height/30?cb=20181117143601'
  },
];

const CLASSES = [
  { 
    id: 'Assassin', 
    name: 'Suikastçı', 
    iconUrl: 'https://static.wikia.nocookie.net/leagueoflegends/images/2/28/Slayer_icon.png/revision/latest/smart/width/40/height/30?cb=20181117143556'
  },
  { 
    id: 'Mage', 
    name: 'Büyücü', 
    iconUrl: 'https://static.wikia.nocookie.net/leagueoflegends/images/2/28/Mage_icon.png/revision/latest/smart/width/40/height/30?cb=20181117143555'
  },
  { 
    id: 'Tank', 
    name: 'Tank', 
    iconUrl: 'https://static.wikia.nocookie.net/leagueoflegends/images/5/5a/Tank_icon.png/revision/latest/smart/width/40/height/30?cb=20181117143558'
  },
  { 
    id: 'Fighter', 
    name: 'Savaşçı', 
    iconUrl: 'https://static.wikia.nocookie.net/leagueoflegends/images/8/8f/Fighter_icon.png/revision/latest/smart/width/40/height/30?cb=20181117143554'
  },
  { 
    id: 'Marksman', 
    name: 'Nişancı', 
    iconUrl: 'https://static.wikia.nocookie.net/leagueoflegends/images/7/7f/Marksman_icon.png/revision/latest/smart/width/40/height/30?cb=20181117143555'
  },
  { 
    id: 'Support', 
    name: 'Destek', 
    iconUrl: 'https://static.wikia.nocookie.net/leagueoflegends/images/e/e0/Support_icon.png/revision/latest/smart/width/40/height/30?cb=20181117143601'
  },
];

export function CompactFilters({
  searchTerm,
  onSearchChange,
  selectedRoles,
  onRoleToggle,
  selectedClasses,
  onClassToggle,
  onClearFilters,
}: CompactFiltersProps) {
  return (
    <div className="space-y-4 mb-6 flex flex-col items-center">
      {/* Search */}
      <div className="flex items-center gap-4 justify-center">
        <div className="relative max-w-md">
          <Input
            type="text"
            placeholder="Şampiyon ara..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="lol-bg-dark border-gray-600 pl-10 text-white placeholder-gray-400 focus:border-lol-accent w-80"
            data-testid="search-input"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>
        
        {(selectedRoles.length > 0 || selectedClasses.length > 0) && (
          <Button
            onClick={onClearFilters}
            variant="secondary"
            size="sm"
            className="bg-gray-700 hover:bg-gray-600 text-white"
            data-testid="clear-filters-button"
          >
            Filtreleri Temizle
          </Button>
        )}
      </div>

      {/* Role and Class Filters */}
      <div className="flex flex-wrap items-center justify-center gap-6">
        {/* Role Icons */}
        <div className="flex items-center gap-2">
          {ROLES.map((role) => {
            const isActive = selectedRoles.includes(role.id);
            
            return (
              <Button
                key={role.id}
                variant="ghost"
                size="sm"
                onClick={() => onRoleToggle(role.id)}
                className={`p-2 lol-bg-dark hover:bg-lol-blue/20 border transition-all duration-200 ${
                  isActive 
                    ? 'bg-lol-blue/20 border-lol-blue' 
                    : 'border-transparent hover:border-lol-blue'
                }`}
                data-testid={`role-filter-${role.id.toLowerCase()}`}
                title={role.name}
              >
                <img 
                  src={role.iconUrl} 
                  alt={role.name}
                  className={`h-4 w-4 ${isActive ? 'brightness-125' : 'brightness-90'}`} 
                />
              </Button>
            );
          })}
        </div>

        {/* Class Icons */}
        <div className="flex items-center gap-2">
          {CLASSES.map((champClass) => {
            const isActive = selectedClasses.includes(champClass.id);
            
            return (
              <Button
                key={champClass.id}
                variant="ghost"
                size="sm"
                onClick={() => onClassToggle(champClass.id)}
                className={`p-2 lol-bg-dark hover:bg-lol-red/20 border transition-all duration-200 ${
                  isActive 
                    ? 'bg-lol-red/20 border-lol-red' 
                    : 'border-transparent hover:border-lol-red'
                }`}
                data-testid={`class-filter-${champClass.id.toLowerCase()}`}
                title={champClass.name}
              >
                <img 
                  src={champClass.iconUrl} 
                  alt={champClass.name}
                  className={`h-4 w-4 ${isActive ? 'brightness-125' : 'brightness-90'}`} 
                />
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}