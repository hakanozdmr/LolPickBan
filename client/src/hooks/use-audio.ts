import { useRef, useCallback } from 'react';
import { AudioGenerator, GENERATED_SOUNDS } from '../utils/audio-generator';

export function useAudio() {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const draftMusicSource = useRef<AudioBufferSourceNode | null>(null);
  const youtubeAudioRef = useRef<HTMLAudioElement | null>(null);

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
    if (youtubeAudioRef.current) {
      youtubeAudioRef.current.pause();
    }
    
    // Create YouTube audio URL - this tries to get the audio from YouTube
    // Note: This may not work due to CORS, will fallback to generated music
    try {
      console.log('Attempting to play YouTube music...');
      
      // YouTube iframe embed approach (hidden)
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/SC8_QunSiOg?autoplay=1&controls=0&loop=1&playlist=SC8_QunSiOg&mute=0&start=0';
      iframe.style.position = 'fixed';
      iframe.style.top = '-200px';
      iframe.style.left = '-200px';
      iframe.style.width = '100px';
      iframe.style.height = '100px';
      iframe.style.opacity = '0';
      iframe.style.pointerEvents = 'none';
      iframe.allow = 'autoplay; encrypted-media';
      iframe.setAttribute('allowfullscreen', '');
      
      // Remove any existing iframe
      const existingIframe = document.getElementById('youtube-draft-music');
      if (existingIframe) {
        existingIframe.remove();
      }
      
      iframe.id = 'youtube-draft-music';
      document.body.appendChild(iframe);
      
      console.log('YouTube iframe created for draft music');
      
    } catch (error) {
      console.warn('YouTube music approach failed, using generated music:', error);
      
      // Fallback to our epic generated music
      if (GENERATED_SOUNDS.draftMusic) {
        try {
          draftMusicSource.current = AudioGenerator.playBuffer(GENERATED_SOUNDS.draftMusic, 0.4);
          
          if (draftMusicSource.current) {
            draftMusicSource.current.loop = true;
          }
        } catch (fallbackError) {
          console.warn('Could not play any draft music:', fallbackError);
        }
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