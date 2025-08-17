// Audio generation utilities for League of Legends draft sounds

export class AudioGenerator {
  private static audioContext: AudioContext | null = null;

  private static getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Create authentic LoL draft music (champion select theme)
  static createDraftMusic(): AudioBuffer {
    const ctx = this.getAudioContext();
    const sampleRate = ctx.sampleRate;
    const duration = 15; // 15 seconds loop like LoL
    const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      
      for (let i = 0; i < channelData.length; i++) {
        const time = i / sampleRate;
        
        // LoL-style epic orchestral progression
        // Main heroic melody line (similar to champion select theme)
        const melody1 = Math.sin(2 * Math.PI * 146.83 * time) * 0.25; // D3
        const melody2 = Math.sin(2 * Math.PI * 174.61 * time) * 0.2;  // F3
        const melody3 = Math.sin(2 * Math.PI * 196.00 * time) * 0.22; // G3
        const melody4 = Math.sin(2 * Math.PI * 220.00 * time) * 0.18; // A3
        
        // Epic bass foundation
        const bass = Math.sin(2 * Math.PI * 73.42 * time) * 0.35; // D2
        const subBass = Math.sin(2 * Math.PI * 36.71 * time) * 0.2; // D1
        
        // Orchestral strings harmony
        const strings1 = Math.sin(2 * Math.PI * 293.66 * time) * 0.15; // D4
        const strings2 = Math.sin(2 * Math.PI * 349.23 * time) * 0.12; // F4
        const strings3 = Math.sin(2 * Math.PI * 392.00 * time) * 0.1;  // G4
        
        // Heroic brass section
        const brass1 = Math.sin(2 * Math.PI * 146.83 * 2 * time) * 0.18; // D4
        const brass2 = Math.sin(2 * Math.PI * 196.00 * 2 * time) * 0.15; // G4
        
        // Epic timpani-like percussion
        const timpani = Math.sin(2 * Math.PI * 60 * time) * Math.exp(-((time % 2) * 8)) * 0.3;
        
        // Cinematic reverb and atmosphere
        const atmosphere = Math.sin(2 * Math.PI * 440 * time) * 0.05 * Math.sin(2 * Math.PI * 0.1 * time);
        
        // Dynamic progression (builds up over time)
        const progression = Math.min(1, time / 3); // Build up over 3 seconds
        
        // Combine all elements with LoL-style epic feel
        const combined = (
          (melody1 + melody2 + melody3 + melody4) * progression +
          (bass + subBass) * 0.8 +
          (strings1 + strings2 + strings3) * progression * 0.7 +
          (brass1 + brass2) * progression * 0.6 +
          timpani * 0.5 +
          atmosphere
        );
        
        channelData[i] = combined * 0.4; // Master volume
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