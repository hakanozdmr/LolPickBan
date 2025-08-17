// Audio generation utilities for League of Legends draft sounds

export class AudioGenerator {
  private static audioContext: AudioContext | null = null;

  private static getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Create epic draft start music (similar to LoL champion select)
  static createDraftMusic(): AudioBuffer {
    const ctx = this.getAudioContext();
    const sampleRate = ctx.sampleRate;
    const duration = 10; // 10 seconds loop
    const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      
      for (let i = 0; i < channelData.length; i++) {
        const time = i / sampleRate;
        
        // Epic orchestral-style draft music
        const bass = Math.sin(2 * Math.PI * 55 * time) * 0.3; // Bass line (A1)
        const harmony = Math.sin(2 * Math.PI * 110 * time) * 0.2; // Harmony (A2)
        const melody = Math.sin(2 * Math.PI * 220 * time) * 0.15; // Main melody (A3)
        const strings = Math.sin(2 * Math.PI * 330 * time) * 0.1; // String section
        
        // Add some reverb-like effect with delay
        const delay = Math.sin(2 * Math.PI * 220 * (time - 0.1)) * 0.05;
        
        // Combine all layers with epic feel
        channelData[i] = (bass + harmony + melody + strings + delay) * 0.6;
      }
    }
    
    return buffer;
  }

  // Champion pick sound (deep, satisfying "lock-in" sound)
  static createPickSound(): AudioBuffer {
    const ctx = this.getAudioContext();
    const sampleRate = ctx.sampleRate;
    const duration = 0.8;
    const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < channelData.length; i++) {
      const time = i / sampleRate;
      
      // Deep, satisfying pick sound
      const base = Math.sin(2 * Math.PI * 80 * time); // Low frequency
      const click = Math.sin(2 * Math.PI * 1200 * time) * Math.exp(-time * 15); // Click attack
      const resonance = Math.sin(2 * Math.PI * 160 * time) * Math.exp(-time * 3); // Resonance
      
      // Envelope for satisfying feel
      const envelope = Math.exp(-time * 2);
      
      channelData[i] = (base * 0.6 + click * 0.3 + resonance * 0.4) * envelope * 0.7;
    }
    
    return buffer;
  }

  // Champion ban sound (harsh, decisive)
  static createBanSound(): AudioBuffer {
    const ctx = this.getAudioContext();
    const sampleRate = ctx.sampleRate;
    const duration = 0.6;
    const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < channelData.length; i++) {
      const time = i / sampleRate;
      
      // Harsh, decisive ban sound
      const strike = Math.sin(2 * Math.PI * 150 * time) * Math.exp(-time * 8); // Strike sound
      const clash = Math.sin(2 * Math.PI * 300 * time) * Math.exp(-time * 12); // Metallic clash
      const rumble = Math.sin(2 * Math.PI * 60 * time) * Math.exp(-time * 4); // Low rumble
      
      // Add some noise for harshness
      const noise = (Math.random() - 0.5) * 0.1 * Math.exp(-time * 10);
      
      channelData[i] = (strike * 0.5 + clash * 0.3 + rumble * 0.4 + noise) * 0.8;
    }
    
    return buffer;
  }

  // Champion hover sound (subtle preview)
  static createHoverSound(): AudioBuffer {
    const ctx = this.getAudioContext();
    const sampleRate = ctx.sampleRate;
    const duration = 0.3;
    const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < channelData.length; i++) {
      const time = i / sampleRate;
      
      // Subtle hover sound
      const tone = Math.sin(2 * Math.PI * 400 * time); // Pleasant tone
      const envelope = Math.exp(-time * 8) * (1 - Math.exp(-time * 30)); // Quick attack, fast decay
      
      channelData[i] = tone * envelope * 0.3;
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