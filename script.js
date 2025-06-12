class DrumKit {
    constructor() {
        this.drumPads = document.querySelectorAll('.drum-pad');
        this.playPatternBtn = document.getElementById('playPattern');
        this.stopPatternBtn = document.getElementById('stopPattern');
        this.nextPatternBtn = document.getElementById('nextPattern');
        this.patternName = document.getElementById('patternName');
        this.patternNotation = document.getElementById('patternNotation');
        
        this.isPlaying = false;
        this.currentPatternIndex = 0;
        this.patternInterval = null;
        this.currentBeat = 0;
        
        this.patterns = [
            {
                name: "Basic Rock",
                notation: "K - S - K - S -",
                beats: ['kick', null, 'snare', null, 'kick', null, 'snare', null]
            },
            {
                name: "Four on Floor",
                notation: "K K K K",
                beats: ['kick', 'kick', 'kick', 'kick']
            },
            {
                name: "Backbeat",
                notation: "- S - S",
                beats: [null, 'snare', null, 'snare']
            },
            {
                name: "Hi-Hat Groove",
                notation: "H H H H",
                beats: ['hihat', 'hihat', 'hihat', 'hihat']
            }
        ];
        
        this.sounds = {
            kick: this.createSound(60, 0.1, 'sine'),
            snare: this.createNoiseSound(0.1),
            hihat: this.createNoiseSound(0.05),
            tom1: this.createSound(200, 0.2, 'sine'),
            tom2: this.createSound(150, 0.2, 'sine'),
            tom3: this.createSound(100, 0.2, 'sine'),
            crash: this.createNoiseSound(0.3),
            ride: this.createSound(800, 0.15, 'triangle')
        };
        
        this.init();
    }
    
    init() {
        // Add click listeners to drum pads
        this.drumPads.forEach(pad => {
            pad.addEventListener('click', () => {
                this.playSound(pad.dataset.sound);
                this.animatePad(pad);
            });
        });
        
        // Add keyboard listeners
        document.addEventListener('keydown', (e) => {
            const pad = document.querySelector(`[data-key="${e.keyCode}"]`);
            if (pad) {
                this.playSound(pad.dataset.sound);
                this.animatePad(pad);
            }
        });
        
        // Control button listeners
        this.playPatternBtn.addEventListener('click', () => this.playPattern());
        this.stopPatternBtn.addEventListener('click', () => this.stopPattern());
        this.nextPatternBtn.addEventListener('click', () => this.nextPattern());
        
        this.updatePatternDisplay();
    }
    
    createSound(frequency, duration, type = 'sine') {
        return () => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        };
    }
    
    createNoiseSound(duration) {
        return () => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const bufferSize = audioContext.sampleRate * duration;
            const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            const output = buffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            
            const whiteNoise = audioContext.createBufferSource();
            whiteNoise.buffer = buffer;
            
            const gainNode = audioContext.createGain();
            whiteNoise.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            whiteNoise.start(audioContext.currentTime);
        };
    }
    
    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }
    
    animatePad(pad) {
        pad.classList.add('active');
        setTimeout(() => {
            pad.classList.remove('active');
        }, 100);
    }
    
    playPattern() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.currentBeat = 0;
        const pattern = this.patterns[this.currentPatternIndex];
        
        this.patternInterval = setInterval(() => {
            const sound = pattern.beats[this.currentBeat];
            if (sound) {
                this.playSound(sound);
                const pad = document.querySelector(`[data-sound="${sound}"]`);
                if (pad) this.animatePad(pad);
            }
            
            this.currentBeat = (this.currentBeat + 1) % pattern.beats.length;
        }, 500); // 120 BPM
    }
    
    stopPattern() {
        this.isPlaying = false;
        if (this.patternInterval) {
            clearInterval(this.patternInterval);
            this.patternInterval = null;
        }
    }
    
    nextPattern() {
        this.stopPattern();
        this.currentPatternIndex = (this.currentPatternIndex + 1) % this.patterns.length;
        this.updatePatternDisplay();
    }
    
    updatePatternDisplay() {
        const pattern = this.patterns[this.currentPatternIndex];
        this.patternName.textContent = pattern.name;
        this.patternNotation.textContent = pattern.notation;
    }
}

// Initialize the drum kit when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new DrumKit();
});