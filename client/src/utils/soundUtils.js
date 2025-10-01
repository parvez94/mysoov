// Sound utility for playing notification sounds
class SoundManager {
  constructor() {
    this.sounds = {};
    this.isEnabled = true;
    this.volume = 0.5;
    this.audioContext = null;
    this.isAudioContextReady = false;

    // Load sound preferences from localStorage
    this.loadPreferences();

    // Initialize audio context on first user interaction
    this.initializeAudioContext();

    // Preload sounds
    this.preloadSounds();
  }

  loadPreferences() {
    const savedPrefs = localStorage.getItem('soundPreferences');
    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs);
      this.isEnabled = prefs.isEnabled !== false; // Default to true
      this.volume = prefs.volume || 0.5;
    }
  }

  savePreferences() {
    localStorage.setItem(
      'soundPreferences',
      JSON.stringify({
        isEnabled: this.isEnabled,
        volume: this.volume,
      })
    );
  }

  initializeAudioContext() {
    // Initialize audio context on first user interaction
    const initAudio = () => {
      if (!this.audioContext) {
        try {
          this.audioContext = new (window.AudioContext ||
            window.webkitAudioContext)();

          // Resume audio context if it's suspended (required by some browsers)
          if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
              this.isAudioContextReady = true;
              console.log('Audio context resumed and ready');
            });
          } else {
            this.isAudioContextReady = true;
            console.log('Audio context initialized and ready');
          }
        } catch (error) {
          console.warn('Failed to initialize audio context:', error);
        }
      }

      // Remove event listeners after first initialization
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };

    // Add event listeners for user interaction
    document.addEventListener('click', initAudio);
    document.addEventListener('keydown', initAudio);
    document.addEventListener('touchstart', initAudio);
  }

  preloadSounds() {
    // Create notification sound using Web Audio API (simple beep)
    this.createNotificationSound();
    this.createMessageSound();
  }

  createNotificationSound() {
    // Create a pleasant notification sound
    this.sounds.notification = () => {
      if (!this.isEnabled || !this.isAudioContextReady || !this.audioContext) {
        console.log('Notification sound skipped:', {
          enabled: this.isEnabled,
          contextReady: this.isAudioContextReady,
          hasContext: !!this.audioContext,
        });
        return;
      }

      try {
        // Resume context if suspended
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Create a pleasant two-tone notification sound
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(
          600,
          this.audioContext.currentTime + 0.1
        );

        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(
          this.volume * 0.3,
          this.audioContext.currentTime + 0.01
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          this.audioContext.currentTime + 0.3
        );

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);

        console.log('Notification sound played successfully');
      } catch (error) {
        console.warn('Error playing notification sound:', error);
      }
    };
  }

  createMessageSound() {
    // Create a different sound for messages
    this.sounds.message = () => {
      if (!this.isEnabled || !this.isAudioContextReady || !this.audioContext) {
        console.log('Message sound skipped:', {
          enabled: this.isEnabled,
          contextReady: this.isAudioContextReady,
          hasContext: !!this.audioContext,
        });
        return;
      }

      try {
        // Resume context if suspended
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Create a softer, single-tone message sound
        oscillator.frequency.setValueAtTime(500, this.audioContext.currentTime);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(
          this.volume * 0.2,
          this.audioContext.currentTime + 0.01
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          this.audioContext.currentTime + 0.2
        );

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);

        console.log('Message sound played successfully');
      } catch (error) {
        console.warn('Error playing message sound:', error);
      }
    };
  }

  playNotificationSound() {
    try {
      if (this.sounds.notification) {
        this.sounds.notification();
      }
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }

  playMessageSound() {
    try {
      if (this.sounds.message) {
        this.sounds.message();
      }
    } catch (error) {
      console.warn('Could not play message sound:', error);
    }
  }

  setEnabled(enabled) {
    this.isEnabled = enabled;
    this.savePreferences();

    // Initialize audio context when enabling sound
    if (enabled && !this.isAudioContextReady) {
      this.initializeAudioContextNow();
    }
  }

  initializeAudioContextNow() {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();

        // Resume audio context if it's suspended
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume().then(() => {
            this.isAudioContextReady = true;
            console.log('Audio context resumed and ready (manual init)');
          });
        } else {
          this.isAudioContextReady = true;
          console.log('Audio context initialized and ready (manual init)');
        }
      } catch (error) {
        console.warn('Failed to initialize audio context manually:', error);
      }
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
    this.savePreferences();
  }

  getEnabled() {
    return this.isEnabled;
  }

  getVolume() {
    return this.volume;
  }
}

// Create a global instance
export const soundManager = new SoundManager();

// Convenience functions
export const playNotificationSound = () => soundManager.playNotificationSound();
export const playMessageSound = () => soundManager.playMessageSound();
export const setSoundEnabled = (enabled) => soundManager.setEnabled(enabled);
export const setSoundVolume = (volume) => soundManager.setVolume(volume);
export const getSoundEnabled = () => soundManager.getEnabled();
export const getSoundVolume = () => soundManager.getVolume();
