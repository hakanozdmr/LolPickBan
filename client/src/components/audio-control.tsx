import { useState, useCallback } from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface AudioControlProps {
  onVolumeChange?: (volume: number) => void;
  initialVolume?: number;
}

export function AudioControl({ onVolumeChange, initialVolume = 50 }: AudioControlProps) {
  const [volume, setVolume] = useState(initialVolume);
  const [isMuted, setIsMuted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleVolumeChange = useCallback((newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(vol);
    
    if (vol === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
    
    onVolumeChange?.(vol);
  }, [isMuted, onVolumeChange]);

  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    if (newMuted) {
      onVolumeChange?.(0);
    } else {
      onVolumeChange?.(volume);
    }
  }, [isMuted, volume, onVolumeChange]);

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <VolumeX className="w-4 h-4" />;
    } else if (volume < 50) {
      return <Volume1 className="w-4 h-4" />;
    } else {
      return <Volume2 className="w-4 h-4" />;
    }
  };

  const displayVolume = isMuted ? 0 : volume;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-amber-400 hover:bg-white/5 transition-colors"
          data-testid="audio-control-button"
        >
          {getVolumeIcon()}
          <span className="ml-1 text-xs font-medium">{Math.round(displayVolume)}%</span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-64 bg-gray-900 border-gray-700/50 shadow-2xl" 
        align="end"
        data-testid="audio-control-panel"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-gray-400">Ses Seviyesi</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="text-gray-400 hover:text-amber-400 hover:bg-white/5"
              data-testid="mute-toggle-button"
            >
              {getVolumeIcon()}
            </Button>
          </div>
          
          <div className="space-y-2">
            <Slider
              value={[displayVolume]}
              onValueChange={handleVolumeChange}
              max={100}
              min={0}
              step={5}
              className="w-full"
              disabled={isMuted}
              data-testid="volume-slider"
            />
            
            <div className="flex justify-between text-[10px] text-gray-600">
              <span>0%</span>
              <span className="text-amber-400 font-medium">{Math.round(displayVolume)}%</span>
              <span>100%</span>
            </div>
          </div>
          
          <div className="text-[10px] text-gray-600 text-center">
            Draft müziği ve ses efektleri
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}