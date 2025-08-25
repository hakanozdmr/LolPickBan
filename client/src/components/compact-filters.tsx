import { Map, TreePine, Star, Crosshair, Shield, UserX, Wand2, ShieldCheck, Sword, Zap, Heart, Search } from "lucide-react";
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
  { id: 'Top', name: 'Üst Koridor', icon: Map },
  { id: 'Jungle', name: 'Orman', icon: TreePine },
  { id: 'Mid', name: 'Orta Koridor', icon: Star },
  { id: 'ADC', name: 'Alt Koridor', icon: Crosshair },
  { id: 'Support', name: 'Destek', icon: Shield },
];

const CLASSES = [
  { id: 'Assassin', name: 'Suikastçı', icon: UserX },
  { id: 'Mage', name: 'Büyücü', icon: Wand2 },
  { id: 'Tank', name: 'Tank', icon: ShieldCheck },
  { id: 'Fighter', name: 'Savaşçı', icon: Sword },
  { id: 'Marksman', name: 'Nişancı', icon: Zap },
  { id: 'Support', name: 'Destek', icon: Heart },
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
            const IconComponent = role.icon;
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
                <IconComponent className={`h-4 w-4 ${isActive ? 'lol-text-blue' : 'lol-text-accent'}`} />
              </Button>
            );
          })}
        </div>

        {/* Class Icons */}
        <div className="flex items-center gap-2">
          {CLASSES.map((champClass) => {
            const IconComponent = champClass.icon;
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
                <IconComponent className={`h-4 w-4 ${isActive ? 'lol-text-red' : 'lol-text-accent'}`} />
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}