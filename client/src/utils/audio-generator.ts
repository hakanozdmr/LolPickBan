// Audio generation utilities for League of Legends draft sounds

export class AudioGenerator {
  private static audioContext: AudioContext | null = null;

  private static getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Create EPIC League of Legends Worlds-style draft music
  static createDraftMusic(): AudioBuffer {
    const ctx = this.getAudioContext();
    const sampleRate = ctx.sampleRate;
    const duration = 45; // 45 seconds of epic music like Worlds
    const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      
      for (let i = 0; i < channelData.length; i++) {
        const time = i / sampleRate;
        
        // EPIC progression phases
        const phase1 = time < 8; // Intro build
        const phase2 = time >= 8 && time < 20; // First crescendo
        const phase3 = time >= 20 && time < 35; // Epic climax
        const phase4 = time >= 35; // Grand finale
        
        // Main heroic melody (Worlds-style anthem progression)
        // Key of D minor for epic feel
        const heroicMelody = (
          Math.sin(2 * Math.PI * 146.83 * time) * 0.3 + // D3
          Math.sin(2 * Math.PI * 164.81 * time) * 0.25 + // E3
          Math.sin(2 * Math.PI * 174.61 * time) * 0.28 + // F3
          Math.sin(2 * Math.PI * 196.00 * time) * 0.32 + // G3
          Math.sin(2 * Math.PI * 220.00 * time) * 0.3 + // A3
          Math.sin(2 * Math.PI * 233.08 * time) * 0.25 + // Bb3
          Math.sin(2 * Math.PI * 261.63 * time) * 0.35 // C4
        );
        
        // Epic orchestral strings (sweeping like Worlds music)
        const orchestralStrings = (
          Math.sin(2 * Math.PI * 293.66 * time) * 0.2 + // D4
          Math.sin(2 * Math.PI * 329.63 * time) * 0.18 + // E4
          Math.sin(2 * Math.PI * 349.23 * time) * 0.22 + // F4
          Math.sin(2 * Math.PI * 392.00 * time) * 0.25 + // G4
          Math.sin(2 * Math.PI * 440.00 * time) * 0.23 + // A4
          Math.sin(2 * Math.PI * 466.16 * time) * 0.18 + // Bb4
          Math.sin(2 * Math.PI * 523.25 * time) * 0.28 // C5
        );
        
        // MASSIVE bass foundation (like Worlds theme)
        const epicBass = (
          Math.sin(2 * Math.PI * 36.71 * time) * 0.4 + // D1
          Math.sin(2 * Math.PI * 43.65 * time) * 0.35 + // F1
          Math.sin(2 * Math.PI * 49.00 * time) * 0.38 + // G1
          Math.sin(2 * Math.PI * 73.42 * time) * 0.32 // D2
        );
        
        // Heroic brass section (triumphant like Worlds)
        const heroicBrass = (
          Math.sin(2 * Math.PI * 146.83 * time) * 0.25 + // D3
          Math.sin(2 * Math.PI * 196.00 * time) * 0.28 + // G3
          Math.sin(2 * Math.PI * 220.00 * time) * 0.3 + // A3
          Math.sin(2 * Math.PI * 293.66 * time) * 0.22 + // D4
          Math.sin(2 * Math.PI * 392.00 * time) * 0.26 // G4
        );
        
        // Epic percussion (like Worlds drums)
        const epicPercussion = (
          Math.sin(2 * Math.PI * 60 * time) * Math.exp(-((time % 4) * 2)) * 0.4 + // Timpani
          Math.sin(2 * Math.PI * 80 * time) * Math.exp(-((time % 3) * 3)) * 0.35 + // Bass drum
          Math.sin(2 * Math.PI * 120 * time) * Math.exp(-((time % 2) * 4)) * 0.3 // Snare
        );
        
        // Ethereal atmosphere (magical League feel)
        const magicalAtmosphere = (
          Math.sin(2 * Math.PI * 1046.50 * time) * 0.08 * Math.sin(2 * Math.PI * 0.3 * time) + // C6
          Math.sin(2 * Math.PI * 1174.66 * time) * 0.06 * Math.sin(2 * Math.PI * 0.2 * time) + // D6
          Math.sin(2 * Math.PI * 1318.51 * time) * 0.05 * Math.sin(2 * Math.PI * 0.4 * time) // E6
        );
        
        // Dynamic progression and intensity
        let intensity = 0.3;
        let melodyVolume = 0.2;
        let bassVolume = 0.3;
        let brassVolume = 0.15;
        let percussionVolume = 0.2;
        
        if (phase1) {
          // Building intro
          intensity = Math.min(0.6, time / 8);
          melodyVolume = intensity * 0.3;
          bassVolume = intensity * 0.4;
          brassVolume = intensity * 0.2;
          percussionVolume = intensity * 0.25;
        } else if (phase2) {
          // First epic crescendo
          intensity = 0.6 + ((time - 8) / 12) * 0.3;
          melodyVolume = intensity * 0.4;
          bassVolume = intensity * 0.5;
          brassVolume = intensity * 0.35;
          percussionVolume = intensity * 0.4;
        } else if (phase3) {
          // EPIC CLIMAX
          intensity = 0.9 + Math.sin(time * 0.5) * 0.1;
          melodyVolume = intensity * 0.5;
          bassVolume = intensity * 0.6;
          brassVolume = intensity * 0.5;
          percussionVolume = intensity * 0.5;
        } else if (phase4) {
          // Grand finale
          const fadeStart = time - 35;
          intensity = Math.max(0.1, 1.0 - (fadeStart / 10));
          melodyVolume = intensity * 0.6;
          bassVolume = intensity * 0.7;
          brassVolume = intensity * 0.6;
          percussionVolume = intensity * 0.3;
        }
        
        // Add tremolo for orchestral feel
        const tremolo = 1 + Math.sin(2 * Math.PI * 6 * time) * 0.1;
        
        // Harmonic richness (add overtones)
        const harmonics = (
          Math.sin(2 * Math.PI * 146.83 * 2 * time) * 0.1 +
          Math.sin(2 * Math.PI * 146.83 * 3 * time) * 0.05 +
          Math.sin(2 * Math.PI * 146.83 * 4 * time) * 0.03
        );
        
        // Combine all elements for EPIC Worlds-style music
        const combined = (
          heroicMelody * melodyVolume * tremolo +
          orchestralStrings * melodyVolume * 0.8 +
          epicBass * bassVolume +
          heroicBrass * brassVolume * tremolo +
          epicPercussion * percussionVolume +
          magicalAtmosphere * intensity +
          harmonics * intensity * 0.5
        );
        
        // Stereo panning for orchestral width
        const pan = channel === 0 ? 0.9 : 1.1;
        
        channelData[i] = combined * 0.35 * pan; // Master volume with stereo
      }
    }
    
    return buffer;
  }

  // Authentic LoL champion pick sound (metallic "lock-in" with confirmation tone)
  static createPickSound(): AudioBuffer {
    const ctx = this.getAudioContext();
    const sampleRate = ctx.sampleRate;
    const duration = 1.2;
    const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < channelData.length; i++) {
      const time = i / sampleRate;
      
      // LoL-style pick sound elements
      // Initial "click" attack (0-0.1s) 
      const metalClick = Math.sin(2 * Math.PI * 2400 * time) * Math.exp(-time * 50) * (time < 0.1 ? 1 : 0);
      
      // Lock mechanism sound (0.05-0.3s)
      const lockMechanism = Math.sin(2 * Math.PI * 150 * time) * Math.exp(-(time - 0.05) * 8) * 
                           (time > 0.05 && time < 0.3 ? 1 : 0);
      
      // Confirmation tone (0.2-0.8s) - heroic and satisfying
      const confirmTone1 = Math.sin(2 * Math.PI * 523.25 * time) * Math.exp(-(time - 0.2) * 3) * // C5
                           (time > 0.2 && time < 0.8 ? 1 : 0);
      const confirmTone2 = Math.sin(2 * Math.PI * 659.25 * time) * Math.exp(-(time - 0.25) * 3) * // E5
                           (time > 0.25 && time < 0.85 ? 1 : 0);
      
      // Deep resonance for authority (0.1-1.0s)
      const deepResonance = Math.sin(2 * Math.PI * 80 * time) * Math.exp(-(time - 0.1) * 2) *
                           (time > 0.1 && time < 1.0 ? 1 : 0);
      
      // Subtle reverb tail
      const reverb = (confirmTone1 + confirmTone2) * 0.3 * Math.exp(-(time - 0.4) * 1.5) *
                     (time > 0.4 ? 1 : 0);
      
      // Combine all elements with LoL-style mixing
      channelData[i] = (
        metalClick * 0.4 +
        lockMechanism * 0.3 +
        confirmTone1 * 0.5 +
        confirmTone2 * 0.4 +
        deepResonance * 0.3 +
        reverb
      ) * 0.8;
    }
    
    return buffer;
  }

  // Authentic LoL champion ban sound (definitive "slam" with dark tones)
  static createBanSound(): AudioBuffer {
    const ctx = this.getAudioContext();
    const sampleRate = ctx.sampleRate;
    const duration = 1.0;
    const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < channelData.length; i++) {
      const time = i / sampleRate;
      
      // LoL-style ban sound elements
      // Heavy "slam" attack (0-0.15s)
      const slam = Math.sin(2 * Math.PI * 60 * time) * Math.exp(-time * 12) * (time < 0.15 ? 1 : 0);
      
      // Sharp metallic clash (0.05-0.2s)
      const metalClash = Math.sin(2 * Math.PI * 1800 * time) * Math.exp(-time * 25) *
                         (time > 0.05 && time < 0.2 ? 1 : 0);
      
      // Dark ominous tone (0.1-0.6s) - minor chord for finality
      const darkTone1 = Math.sin(2 * Math.PI * 138.59 * time) * Math.exp(-(time - 0.1) * 4) * // C#3
                         (time > 0.1 && time < 0.6 ? 1 : 0);
      const darkTone2 = Math.sin(2 * Math.PI * 164.81 * time) * Math.exp(-(time - 0.15) * 4) * // E3
                         (time > 0.15 && time < 0.65 ? 1 : 0);
      const darkTone3 = Math.sin(2 * Math.PI * 196.00 * time) * Math.exp(-(time - 0.2) * 4) * // G3
                         (time > 0.2 && time < 0.7 ? 1 : 0);
      
      // Deep rumbling bass (0-0.8s)
      const rumble = Math.sin(2 * Math.PI * 35 * time) * Math.exp(-time * 2) * (time < 0.8 ? 1 : 0);
      
      // Harsh noise burst for impact (0-0.1s)
      const noiseComponent = (Math.random() - 0.5) * 0.2 * Math.exp(-time * 30) * (time < 0.1 ? 1 : 0);
      
      // Forboding echo/reverb
      const echo = (darkTone1 + darkTone2 + darkTone3) * 0.25 * Math.exp(-(time - 0.3) * 2) *
                   (time > 0.3 ? 1 : 0);
      
      // Combine all elements with LoL-style authority
      channelData[i] = (
        slam * 0.6 +
        metalClash * 0.4 +
        darkTone1 * 0.3 +
        darkTone2 * 0.25 +
        darkTone3 * 0.2 +
        rumble * 0.4 +
        noiseComponent +
        echo
      ) * 0.9;
    }
    
    return buffer;
  }

  // Authentic LoL champion hover sound (subtle magical preview)
  static createHoverSound(): AudioBuffer {
    const ctx = this.getAudioContext();
    const sampleRate = ctx.sampleRate;
    const duration = 0.4;
    const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < channelData.length; i++) {
      const time = i / sampleRate;
      
      // LoL-style magical hover sound
      // Soft magical chime (0-0.3s)
      const chime1 = Math.sin(2 * Math.PI * 880 * time) * Math.exp(-time * 8) * (time < 0.3 ? 1 : 0); // A5
      const chime2 = Math.sin(2 * Math.PI * 1108.7 * time) * Math.exp(-(time - 0.05) * 8) * // C#6
                     (time > 0.05 && time < 0.35 ? 1 : 0);
      
      // Gentle magical sparkle overlay
      const sparkle = Math.sin(2 * Math.PI * 1760 * time) * Math.exp(-time * 15) * 0.3 * (time < 0.2 ? 1 : 0);
      
      // Soft magical resonance
      const resonance = Math.sin(2 * Math.PI * 440 * time) * Math.exp(-time * 5) * 0.4;
      
      // Very subtle mystical undertone
      const mystical = Math.sin(2 * Math.PI * 220 * time) * Math.exp(-time * 6) * 0.2;
      
      // Quick attack and gentle decay for smoothness
      const envelope = (1 - Math.exp(-time * 50)) * Math.exp(-time * 7);
      
      // Combine all elements for LoL-style magical hover
      channelData[i] = (
        chime1 * 0.6 +
        chime2 * 0.5 +
        sparkle +
        resonance +
        mystical
      ) * envelope * 0.35;
    }
    
    return buffer;
  }

  // Play generated audio buffer
  static playBuffer(buffer: AudioBuffer, volume: number = 0.5) {
    const ctx = this.getAudioContext();
    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    
    source.buffer = buffer;
    gainNode.gain.value = volume;
    
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    source.start(0);
    return source;
  }
}

// Pre-generate all sounds for better performance
export const GENERATED_SOUNDS = {
  draftMusic: null as AudioBuffer | null,
  pickSound: null as AudioBuffer | null,
  banSound: null as AudioBuffer | null,
  hoverSound: null as AudioBuffer | null,
};

// Initialize sounds when module loads
if (typeof window !== 'undefined') {
  try {
    GENERATED_SOUNDS.draftMusic = AudioGenerator.createDraftMusic();
    GENERATED_SOUNDS.pickSound = AudioGenerator.createPickSound();
    GENERATED_SOUNDS.banSound = AudioGenerator.createBanSound();
    GENERATED_SOUNDS.hoverSound = AudioGenerator.createHoverSound();
  } catch (error) {
    console.warn('Could not generate audio:', error);
  }
}