/**
 * Voice Service for Children's Text-to-Speech
 * Uses Web Speech API with child-friendly voice and clear pronunciation
 */

class VoiceService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.isPlaying = false;
    this.currentUtterance = null;
    this.initVoices();
  }

  initVoices() {
    // Load available voices
    this.voices = this.synth.getVoices();
    
    // Fallback if voices not loaded
    if (this.voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.voices = this.synth.getVoices();
      };
    }
  }

  getChildFriendlyVoice() {
    // Try to find a young/cheerful voice
    const preferredVoices = [
      'Google UK English Female', // Cheerful female
      'Microsoft Zira Desktop',   // Clear English
      'Google US English',        // Clear US accent
      'Alex',                     // macOS default child-like voice
    ];

    for (let preferred of preferredVoices) {
      const found = this.voices.find(v => v.name.includes(preferred));
      if (found) return found;
    }

    // Fallback to first available female voice
    const female = this.voices.find(v => v.name.includes('Female') || v.name.includes('female'));
    if (female) return female;

    // Final fallback
    return this.voices[0] || null;
  }

  speak(text, options = {}) {
    // Cancel any ongoing speech
    if (this.isPlaying) {
      this.synth.cancel();
    }

    const voice = this.getChildFriendlyVoice();
    if (!voice) {
      console.warn('No voice available for speech synthesis');
      return;
    }

    this.currentUtterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance.voice = voice;
    this.currentUtterance.rate = options.rate || 0.9;      // Slightly slower for clarity
    this.currentUtterance.pitch = options.pitch || 1.2;    // Slightly higher pitch (more childlike)
    this.currentUtterance.volume = options.volume || 0.8;  // 80% volume
    this.currentUtterance.lang = 'en-US';

    this.currentUtterance.onstart = () => {
      this.isPlaying = true;
      if (options.onStart) options.onStart();
    };

    this.currentUtterance.onend = () => {
      this.isPlaying = false;
      if (options.onEnd) options.onEnd();
    };

    this.currentUtterance.onerror = (event) => {
      this.isPlaying = false;
      console.error('Speech synthesis error:', event.error);
      if (options.onError) options.onError(event.error);
    };

    this.synth.speak(this.currentUtterance);
  }

  stop() {
    this.synth.cancel();
    this.isPlaying = false;
  }

  // Pre-defined encouraging messages
  speakEncouragement(type = 'retry') {
    const messages = {
      perfect: "Yeahhhhh! Awesome! You got it!",
      excellent: "Yeahhhhh! Awesome! You got it!",
      great: "Yeahhhhh! Awesome! You got it!",
      close: "Almost there! Try once more!",
      retry: "You've got this! Try again!",
      milestone: "You're a superstar!",
      complete: "Awesome! You're done!"
    };

    const message = messages[type] || messages.retry;
    this.speak(message, {
      pitch: 1.3,  // Even higher for encouragement
      rate: 0.85,  // Clearer speech
      volume: 0.9  // Louder celebration
    });
  }
}

export default new VoiceService();
