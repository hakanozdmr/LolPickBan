import { useRef, useCallback } from 'react';
import { AudioGenerator, GENERATED_SOUNDS } from '../utils/audio-generator';

export function useAudio() {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const draftMusicSource = useRef<AudioBufferSourceNode | null>(null);

  const playGeneratedSound = useCallback((buffer: AudioBuffer | null, volume: number = 0.5) => {
    if (!buffer) return;
    try {
      AudioGenerator.playBuffer(buffer, volume);
    } catch (error) {
      console.warn('Could not play generated sound:', error);
    }
  }, []);

  const playSound = useCallback((soundName: string, volume: number = 0.5) => {
    try {
      if (!audioRefs.current[soundName]) {
        audioRefs.current[soundName] = new Audio(`/sounds/${soundName}.mp3`);
      }
      
      const audio = audioRefs.current[soundName];
      audio.volume = volume;
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Fallback to generated sounds if files don't exist
        switch (soundName) {
          case 'draft-music':
            playGeneratedSound(GENERATED_SOUNDS.draftMusic, volume);
            break;
          case 'champion-pick':
            playGeneratedSound(GENERATED_SOUNDS.pickSound, volume);
            break;
          case 'champion-ban':
            playGeneratedSound(GENERATED_SOUNDS.banSound, volume);
            break;
          case 'champion-hover':
            playGeneratedSound(GENERATED_SOUNDS.hoverSound, volume);
            break;
        }
      });
    } catch (error) {
      console.warn('Could not play sound:', soundName, error);
    }
  }, [playGeneratedSound]);

  const playDraftMusic = useCallback(() => {
    // Stop any existing draft music
    if (draftMusicSource.current) {
      draftMusicSource.current.stop();
    }
    
    // Play generated epic draft music
    if (GENERATED_SOUNDS.draftMusic) {
      try {
        draftMusicSource.current = AudioGenerator.playBuffer(GENERATED_SOUNDS.draftMusic, 0.4);
        
        // Loop the music
        if (draftMusicSource.current) {
          draftMusicSource.current.loop = true;
        }
      } catch (error) {
        console.warn('Could not play draft music:', error);
      }
    }
  }, []);

  const playPickSound = useCallback(() => {
    playGeneratedSound(GENERATED_SOUNDS.pickSound, 0.7);
  }, [playGeneratedSound]);

  const playBanSound = useCallback(() => {
    playGeneratedSound(GENERATED_SOUNDS.banSound, 0.8);
  }, [playGeneratedSound]);

  const playHoverSound = useCallback(() => {
    playGeneratedSound(GENERATED_SOUNDS.hoverSound, 0.4);
  }, [playGeneratedSound]);

  const stopAllSounds = useCallback(() => {
    // Stop traditional audio elements
    Object.values(audioRefs.current).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });

    // Stop draft music
    if (draftMusicSource.current) {
      draftMusicSource.current.stop();
      draftMusicSource.current = null;
    }
  }, []);

  return {
    playDraftMusic,
    playPickSound,
    playBanSound,
    playHoverSound,
    stopAllSounds,
    playSound
  };
}