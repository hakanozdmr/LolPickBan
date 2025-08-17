import { useRef, useCallback } from 'react';
import { AudioGenerator, GENERATED_SOUNDS } from '../utils/audio-generator';

export function useAudio(globalVolume: number = 50, preferYouTube: boolean = true) {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const draftMusicSource = useRef<AudioBufferSourceNode | null>(null);
  const youtubeAudioRef = useRef<HTMLAudioElement | null>(null);
  const volumeMultiplier = globalVolume / 100;

  const playGeneratedSound = useCallback((buffer: AudioBuffer | null, volume: number = 0.5) => {
    if (!buffer) return;
    try {
      const adjustedVolume = volume * volumeMultiplier;
      AudioGenerator.playBuffer(buffer, adjustedVolume);
    } catch (error) {
      console.warn('Could not play generated sound:', error);
    }
  }, [volumeMultiplier]);

  const playSound = useCallback((soundName: string, volume: number = 0.5) => {
    try {
      if (!audioRefs.current[soundName]) {
        audioRefs.current[soundName] = new Audio(`/sounds/${soundName}.mp3`);
      }
      
      const audio = audioRefs.current[soundName];
      audio.volume = volume * volumeMultiplier;
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
  }, [playGeneratedSound, volumeMultiplier]);

  const playDraftMusic = useCallback(() => {
    // Stop any existing draft music
    if (draftMusicSource.current) {
      draftMusicSource.current.stop();
    }
    if (youtubeAudioRef.current) {
      youtubeAudioRef.current.pause();
    }
    
    // Remove any existing iframe
    const existingIframe = document.getElementById('youtube-draft-music');
    if (existingIframe) {
      existingIframe.remove();
    }
    
    // Primary approach: Use our controllable generated music
    if (GENERATED_SOUNDS.draftMusic) {
      try {
        const adjustedVolume = 0.4 * volumeMultiplier;
        draftMusicSource.current = AudioGenerator.playBuffer(GENERATED_SOUNDS.draftMusic, adjustedVolume);
        
        if (draftMusicSource.current) {
          draftMusicSource.current.loop = true;
        }
        
        console.log(`Epic draft music playing at ${Math.round(volumeMultiplier * 100)}% volume`);
        
        // Optional: Add YouTube music as background if user prefers it and volume is not zero
        if (preferYouTube && volumeMultiplier > 0) {
          try {
            const shouldMute = volumeMultiplier < 0.1;
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/SC8_QunSiOg?autoplay=1&controls=0&loop=1&playlist=SC8_QunSiOg&mute=${shouldMute ? 1 : 0}&start=0&volume=20`;
            iframe.style.position = 'fixed';
            iframe.style.top = '-200px';
            iframe.style.left = '-200px';
            iframe.style.width = '100px';
            iframe.style.height = '100px';
            iframe.style.opacity = '0';
            iframe.style.pointerEvents = 'none';
            iframe.allow = 'autoplay; encrypted-media';
            iframe.setAttribute('allowfullscreen', '');
            iframe.id = 'youtube-draft-music';
            
            document.body.appendChild(iframe);
            console.log('YouTube background music added');
          } catch (youtubeError) {
            console.log('YouTube background music not available:', youtubeError);
          }
        }
        
      } catch (error) {
        console.warn('Could not play draft music:', error);
      }
    }
  }, [volumeMultiplier]);

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

  const stopDraftMusic = useCallback(() => {
    if (draftMusicSource.current) {
      draftMusicSource.current.stop();
    }
    if (youtubeAudioRef.current) {
      youtubeAudioRef.current.pause();
    }
    
    // Remove YouTube iframe
    const iframe = document.getElementById('youtube-draft-music');
    if (iframe) {
      iframe.remove();
    }
  }, []);

  return {
    playDraftMusic,
    stopDraftMusic,
    playPickSound,
    playBanSound,
    playHoverSound,
    stopAllSounds,
    playSound
  };
}