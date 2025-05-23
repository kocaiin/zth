import { moodMusic } from './musicData.js';
import { state, initAudioContext, cleanupAudio, updatePlayButton, formatTime } from './audioState.js';
import { showError, showLoading, hideLoading, updateSongInfo, updateNovelContent } from './uiUtils.js';
import { initComments } from './comments.js';

// Get music based on mood
async function getMusic(mood, songIndex = 0) {
    try {
        // Don't start new loading if we're already loading or transitioning
        if (state.isLoading || state.isTransitioning) return;
        
        // Set transitioning state
        state.isTransitioning = true;
        
        // Update state
        state.mood = mood;
        state.songIndex = songIndex;
        const songs = moodMusic[mood];
        if (!songs || songs.length === 0) {
            throw new Error('No songs available for this mood');
        }
        
        state.song = songs[songIndex];
        
        // Check if this is a GIF-only entry
        const isGifEntry = !!state.song.gifs && !state.song.file;
        
        // Only initialize audio if not a GIF-only entry
        if (!isGifEntry) {
            // Initialize audio context
            initAudioContext();
            
            // Show loading state
            showLoading();
            
            // Clean up previous audio
            cleanupAudio();
            
            // Create new audio element
            state.audio = new Audio();
            
            // Set up audio event listeners
            state.audio.addEventListener('canplaythrough', () => {
                hideLoading();
                state.audio.play().catch(error => {
                    console.error('Error playing audio:', error);
                    if (error.name !== 'NotAllowedError') {
                        showError('Error playing audio. Please try again.');
                    }
                });
                state.isPlaying = true;
                state.hasError = false;
                state.isTransitioning = false;
                const musicContainer = document.getElementById('music-container');
                if (musicContainer) musicContainer.classList.add('playing');
                updatePlayButton();
            });
            
            state.audio.addEventListener('error', (e) => {
                console.error('Audio error:', e);
                if (e.target.error && e.target.error.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
                    hideLoading();
                    showError('Error loading audio file. Please try again.');
                    state.isPlaying = false;
                    state.hasError = true;
                    state.isTransitioning = false;
                    updatePlayButton();
                }
            });
            
            state.audio.addEventListener('timeupdate', () => {
                if (state.isPlaying && !state.hasError) {
                    const errorMessage = document.getElementById('error-message');
                    if (errorMessage) errorMessage.classList.add('hidden');
                }
                
                const progressBar = document.getElementById('progress-bar');
                const currentTime = document.querySelector('.current-time');
                
                if (progressBar && state.audio.duration) {
                    const progress = (state.audio.currentTime / state.audio.duration) * 100;
                    progressBar.style.width = `${progress}%`;
                }
                
                if (currentTime) {
                    currentTime.textContent = formatTime(state.audio.currentTime);
                }
            });
            
            state.audio.addEventListener('ended', () => {
                state.isPlaying = false;
                state.hasError = false;
                state.isTransitioning = false;
                const musicContainer = document.getElementById('music-container');
                if (musicContainer) musicContainer.classList.remove('playing');
                updatePlayButton();
            });
            
            state.audio.addEventListener('loadedmetadata', () => {
                const duration = formatTime(state.audio.duration);
                const songDuration = document.getElementById('song-duration');
                if (songDuration) songDuration.textContent = duration;
            });
            
            // Set source and load audio
            state.audio.src = state.song.file;
            state.audio.load();
        } else {
            // Handle GIF-only entries
            hideLoading();
            state.isTransitioning = false;
            
            // Hide the music player for GIF-only entries
            const musicContainer = document.getElementById('music-container');
            if (musicContainer) musicContainer.classList.add('hidden');
        }
        
        // Update UI for all entry types
        if (!isGifEntry) {
            updateSongInfo(state.song);
            const musicContainer = document.getElementById('music-container');
            if (musicContainer) musicContainer.classList.remove('hidden');
        }
        
        // Always update novel content
        updateNovelContent(state.song, mood);
        
    } catch (error) {
        console.error('Error in getMusic:', error);
        showError(error.message || 'An error occurred. Please try again.');
        cleanupAudio();
        state.isTransitioning = false;
    }
}

// Add navigation functions
function nextSong() {
    if (!state.mood) return;
    const songs = moodMusic[state.mood];
    const nextIndex = (state.songIndex + 1) % songs.length;
    getMusic(state.mood, nextIndex);
}

function previousSong() {
    if (!state.mood) return;
    const songs = moodMusic[state.mood];
    const prevIndex = (state.songIndex - 1 + songs.length) % songs.length;
    getMusic(state.mood, prevIndex);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize mood buttons
    const moodButtons = document.querySelectorAll('.mood-btn');
    moodButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mood = button.dataset.mood;
            if (mood) {
                getMusic(mood);
            }
        });
    });

    // Initialize music controls
    const playButton = document.querySelector('.play-btn');
    const prevButton = document.querySelector('.prev-btn');
    const nextButton = document.querySelector('.next-btn');
    
    if (playButton) {
        playButton.addEventListener('click', () => {
            if (!state.audio || state.isTransitioning) return;
            
            if (state.isPlaying) {
                state.audio.pause();
                state.isPlaying = false;
            } else {
                state.audio.play().catch(error => {
                    console.error('Error playing audio:', error);
                    if (error.name !== 'NotAllowedError') {
                        showError('Error playing audio. Please try again.');
                    }
                });
                state.isPlaying = true;
            }
            
            const musicContainer = document.getElementById('music-container');
            if (musicContainer) musicContainer.classList.toggle('playing');
            updatePlayButton();
        });
    }

    if (prevButton) {
        prevButton.addEventListener('click', previousSong);
    }

    if (nextButton) {
        nextButton.addEventListener('click', nextSong);
    }
    
    // Enable seeking by clicking on the progress bar
    const progressBarContainer = document.getElementById('progress-bar-container');
    const progressBar = document.getElementById('progress-bar');
    if (progressBarContainer && progressBar) {
        progressBarContainer.addEventListener('click', (e) => {
            if (!state.audio || !state.audio.duration) return;
            const rect = progressBarContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percent = Math.max(0, Math.min(1, x / rect.width));
            state.audio.currentTime = percent * state.audio.duration;
        });
    }

    // Add error handling for audio context
    window.addEventListener('click', () => {
        if (state.audioContext && state.audioContext.state === 'suspended') {
            state.audioContext.resume();
        }
    });

    // Initialize comments
    initComments();

    // Initialize pet animation
    const pet = document.getElementById('cute-pet');
    if (pet) {
        pet.addEventListener('click', () => {
            pet.classList.add('clicked');
            setTimeout(() => {
                pet.classList.remove('clicked');
            }, 600);
        });
    }
}); 