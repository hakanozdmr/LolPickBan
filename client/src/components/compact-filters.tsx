import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import topIcon from "../assets/icons/top.png";
import jungleIcon from "../assets/icons/jungle.png";
import midIcon from "../assets/icons/mid.png";
import adcIcon from "../assets/icons/adc.png";
import supportIcon from "../assets/icons/support.png";
import assassinIcon from "../assets/icons/assassin.png";
import mageIcon from "../assets/icons/mage.png";
import tankIcon from "../assets/icons/tank.png";
import fighterIcon from "../assets/icons/fighter.png";
import marksmanIcon from "../assets/icons/marksman.png";
import supportClassIcon from "../assets/icons/support-class.png";

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
    iconUrl: topIcon
  },
  { 
    id: 'Jungle', 
    name: 'Orman', 
    iconUrl: jungleIcon
  },
  { 
    id: 'Mid', 
    name: 'Orta Koridor', 
    iconUrl: midIcon
  },
  { 
    id: 'ADC', 
    name: 'Alt Koridor', 
    iconUrl: adcIcon
  },
  { 
    id: 'Support', 
    name: 'Destek', 
    iconUrl: supportIcon
  },
];

const CLASSES = [
  { 
    id: 'Assassin', 
    name: 'Suikastçı', 
    iconUrl: assassinIcon
  },
  { 
    id: 'Mage', 
    name: 'Büyücü', 
    iconUrl: mageIcon
  },
  { 
    id: 'Tank', 
    name: 'Tank', 
    iconUrl: tankIcon
  },
  { 
    id: 'Fighter', 
    name: 'Savaşçı', 
    iconUrl: fighterIcon
  },
  { 
    id: 'Marksman', 
    name: 'Nişancı', 
    iconUrl: marksmanIcon
  },
  { 
    id: 'Support', 
    name: 'Destek', 
    iconUrl: supportClassIcon
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
      <div className="flex items-center gap-4 justify-center">
        <div className="relative max-w-md">
          <Input
            type="text"
            placeholder="Şampiyon ara..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-gray-800/50 border-gray-700/50 rounded-lg pl-10 text-white placeholder-gray-500 focus:border-amber-500/50 focus:ring-amber-500/20 w-80"
            data-testid="search-input"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
        </div>
        
        {(selectedRoles.length > 0 || selectedClasses.length > 0) && (
          <Button
            onClick={onClearFilters}
            variant="secondary"
            size="sm"
            className="bg-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-700 border border-gray-700/50 text-xs"
            data-testid="clear-filters-button"
          >
            Filtreleri Temizle
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 py-4">
        <div className="flex items-center gap-3">
          {ROLES.map((role) => {
            const isActive = selectedRoles.includes(role.id);
            
            return (
              <Button
                key={role.id}
                variant="ghost"
                size="sm"
                onClick={() => onRoleToggle(role.id)}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-500/10 border border-blue-500/40 shadow-sm shadow-blue-500/10' 
                    : 'bg-gray-800/40 border border-gray-700/30 hover:border-blue-500/30 hover:bg-blue-500/5'
                }`}
                data-testid={`role-filter-${role.id.toLowerCase()}`}
                title={role.name}
              >
                <img 
                  src={role.iconUrl} 
                  alt={role.name}
                  className={`h-6 w-6 ${isActive ? 'brightness-125' : 'brightness-90'}`} 
                />
              </Button>
            );
          })}
        </div>

        <div className="w-px h-8 bg-gray-700/40" />

        <div className="flex items-center gap-3">
          {CLASSES.map((champClass) => {
            const isActive = selectedClasses.includes(champClass.id);
            
            return (
              <Button
                key={champClass.id}
                variant="ghost"
                size="sm"
                onClick={() => onClassToggle(champClass.id)}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-amber-500/10 border border-amber-500/40 shadow-sm shadow-amber-500/10' 
                    : 'bg-gray-800/40 border border-gray-700/30 hover:border-amber-500/30 hover:bg-amber-500/5'
                }`}
                data-testid={`class-filter-${champClass.id.toLowerCase()}`}
                title={champClass.name}
              >
                <img 
                  src={champClass.iconUrl} 
                  alt={champClass.name}
                  className={`h-6 w-6 ${isActive ? 'brightness-125' : 'brightness-90'}`} 
                />
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}