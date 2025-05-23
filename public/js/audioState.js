// Track current state
export const state = {
    mood: null,
    songIndex: 0,
    song: null,
    isPlaying: false,
    audio: null,
    audioContext: null,
    isLoading: false,
    hasError: false,
    isTransitioning: false
};

// Initialize audio context
export function initAudioContext() {
    if (!state.audioContext) {
        state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Format time in MM:SS format
export function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Clean up current audio
export function cleanupAudio() {
    if (state.audio) {
        state.audio.pause();
        state.audio.currentTime = 0;
        state.audio.src = '';
        state.audio = null;
    }
    state.isPlaying = false;
    state.hasError = false;
    updatePlayButton();
}

// Update play button state
export function updatePlayButton() {
    const playButton = document.querySelector('.play-btn');
    if (!playButton) return;
    
    if (state.isPlaying) {
        playButton.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        playButton.innerHTML = '<i class="fas fa-play"></i>';
    }
} 