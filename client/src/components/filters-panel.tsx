import { Champion } from "@shared/schema";
import { Search, Map, TreePine, Star, Crosshair, Shield, UserX, Wand2, ShieldCheck, Sword, Zap, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FiltersPanelProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedRoles: string[];
  onRoleToggle: (role: string) => void;
  selectedClasses: string[];
  onClassToggle: (className: string) => void;
  onClearFilters: () => void;
  champions: Champion[];
  filteredChampions: Champion[];
}

const ROLES = [
  { id: 'Top', name: 'Top Lane', icon: Map },
  { id: 'Jungle', name: 'Jungle', icon: TreePine },
  { id: 'Mid', name: 'Mid Lane', icon: Star },
  { id: 'ADC', name: 'ADC', icon: Crosshair },
  { id: 'Support', name: 'Support', icon: Shield },
];

const CLASSES = [
  { id: 'Assassin', name: 'Assassin', icon: UserX },
  { id: 'Mage', name: 'Mage', icon: Wand2 },
  { id: 'Tank', name: 'Tank', icon: ShieldCheck },
  { id: 'Fighter', name: 'Fighter', icon: Sword },
  { id: 'Marksman', name: 'Marksman', icon: Zap },
  { id: 'Support', name: 'Support', icon: Heart },
];

export function FiltersPanel({
  searchTerm,
  onSearchChange,
  selectedRoles,
  onRoleToggle,
  selectedClasses,
  onClassToggle,
  onClearFilters,
  champions,
  filteredChampions,
}: FiltersPanelProps) {
  return (
    <div className="w-80 lol-bg-darker rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 lol-text-gold" data-testid="filters-title">
        Filters
      </h3>
      
      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium lol-text-gray mb-2">
          Search Champions
        </label>
        <div className="relative">
          <Input
            type="text"
            placeholder="Champion name..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="lol-bg-dark border-gray-600 pl-10 text-white placeholder-gray-400 focus:border-lol-accent"
            data-testid="search-input"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>
      </div>

      {/* Lane Filters */}
      <div className="mb-6">
        <label className="block text-sm font-medium lol-text-gray mb-3">
          Lane / Role
        </label>
        <div className="space-y-2">
          {ROLES.map((role) => {
            const IconComponent = role.icon;
            const isActive = selectedRoles.includes(role.id);
            
            return (
              <Button
                key={role.id}
                variant="ghost"
                onClick={() => onRoleToggle(role.id)}
                className={`w-full justify-start lol-bg-dark hover:bg-lol-blue/20 border transition-all duration-200 ${
                  isActive 
                    ? 'bg-lol-blue/20 border-lol-blue' 
                    : 'border-transparent hover:border-lol-blue'
                }`}
                data-testid={`role-filter-${role.id.toLowerCase()}`}
              >
                <IconComponent className="lol-text-accent mr-3 h-4 w-4" />
                <span className="text-white">{role.name}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Class Filters */}
      <div className="mb-6">
        <label className="block text-sm font-medium lol-text-gray mb-3">
          Champion Class
        </label>
        <div className="space-y-2">
          {CLASSES.map((champClass) => {
            const IconComponent = champClass.icon;
            const isActive = selectedClasses.includes(champClass.id);
            
            return (
              <Button
                key={champClass.id}
                variant="ghost"
                onClick={() => onClassToggle(champClass.id)}
                className={`w-full justify-start lol-bg-dark hover:bg-lol-red/20 border transition-all duration-200 ${
                  isActive 
                    ? 'bg-lol-red/20 border-lol-red' 
                    : 'border-transparent hover:border-lol-red'
                }`}
                data-testid={`class-filter-${champClass.id.toLowerCase()}`}
              >
                <IconComponent className="lol-text-red mr-3 h-4 w-4" />
                <span className="text-white">{champClass.name}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Clear Filters */}
      <Button
        onClick={onClearFilters}
        variant="secondary"
        className="w-full bg-gray-700 hover:bg-gray-600 text-white"
        data-testid="clear-filters-button"
      >
        Clear All Filters
      </Button>

      {/* Results Count */}
      <div className="mt-4 text-center text-sm lol-text-gray">
        Showing {filteredChampions.length} of {champions.length} champions
      </div>
    </div>
  );
}
