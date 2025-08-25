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
      <div className="flex flex-wrap items-center justify-center gap-8 py-4">
        {/* Role Icons */}
        <div className="flex items-center gap-4">
          {ROLES.map((role) => {
            const isActive = selectedRoles.includes(role.id);
            
            return (
              <Button
                key={role.id}
                variant="ghost"
                size="sm"
                onClick={() => onRoleToggle(role.id)}
                className={`p-3 lol-bg-dark hover:bg-lol-blue/20 border transition-all duration-200 ${
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
                  className={`h-6 w-6 ${isActive ? 'brightness-125' : 'brightness-90'}`} 
                />
              </Button>
            );
          })}
        </div>

        {/* Class Icons */}
        <div className="flex items-center gap-4">
          {CLASSES.map((champClass) => {
            const isActive = selectedClasses.includes(champClass.id);
            
            return (
              <Button
                key={champClass.id}
                variant="ghost"
                size="sm"
                onClick={() => onClassToggle(champClass.id)}
                className={`p-3 lol-bg-dark hover:bg-lol-red/20 border transition-all duration-200 ${
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