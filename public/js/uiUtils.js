import { state } from './audioState.js';

// Show error message
export function showError(message = 'Error loading song. Please try again.') {
    // Don't show error if we're transitioning or playing successfully
    if (state.isTransitioning || (state.isPlaying && !state.hasError)) return;
    
    const errorMessage = document.getElementById('error-message');
    const loadingIndicator = document.getElementById('loading-indicator');
    if (errorMessage) {
        errorMessage.querySelector('span').textContent = message;
        errorMessage.classList.remove('hidden');
        // Auto-hide error message after 3 seconds
        setTimeout(() => {
            errorMessage.classList.add('hidden');
        }, 3000);
    }
    if (loadingIndicator) loadingIndicator.classList.add('hidden');
    state.hasError = true;
}

// Show loading state
export function showLoading() {
    state.isLoading = true;
    state.hasError = false;
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessage = document.getElementById('error-message');
    if (loadingIndicator) loadingIndicator.classList.remove('hidden');
    if (errorMessage) errorMessage.classList.add('hidden');
}

// Hide loading state
export function hideLoading() {
    state.isLoading = false;
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) loadingIndicator.classList.add('hidden');
}

// Update UI with song info
export function updateSongInfo(song) {
    const songTitle = document.getElementById('song-title');
    const artistName = document.getElementById('artist-name');
    const songDuration = document.getElementById('song-duration');
    const musicContainer = document.getElementById('music-container');
    
    if (songTitle) songTitle.textContent = song.title;
    if (artistName) artistName.textContent = song.artist;
    if (songDuration) songDuration.textContent = song.duration;
    if (musicContainer) musicContainer.classList.remove('hidden');
}

// Update novel content
export function updateNovelContent(song, mood) {
    const novelContainer = document.getElementById('novel-container');
    const novelContent = document.querySelector('#novel-content p');
    
    // Clear previous content
    if (novelContent) {
        novelContent.textContent = '';
    }
    
    // Check if song contains novel text
    if (song.novel && novelContent) {
        novelContent.textContent = song.novel;
    }
    
    // Check if song contains GIFs
    if (song.gifs && Array.isArray(song.gifs) && novelContent) {
        if (mood === 'tired' || mood === 'happy' || mood === 'sad'|| mood === 'stressed') {
            // Remove previous gif containers if any
            novelContent.innerHTML = song.novel ? song.novel : '';
            // Chunk GIFs into groups of 3
            for (let i = 0; i < song.gifs.length; i += 3) {
                const gifContainer = document.createElement('div');
                gifContainer.className = 'gif-container';
                const chunk = song.gifs.slice(i, i + 3);
                chunk.forEach(gifPath => {
                    const img = document.createElement('img');
                    img.src = gifPath;
                    img.className = 'emoji-gif';
                    img.alt = 'Mood GIF';
                    gifContainer.appendChild(img);
                });
                novelContent.appendChild(gifContainer);
            }
        } else {
            // For other moods, keep the original behavior
            song.gifs.forEach(gifPath => {
                const img = document.createElement('img');
                img.src = gifPath;
                img.className = 'w-full my-2 rounded-lg';
                img.alt = 'Mood GIF';
                novelContent.appendChild(img);
            });
        }
    }
    
    // Update novel titles based on mood
    const titles = document.querySelectorAll('#novel-container h2');
    titles.forEach(title => {
        title.classList.add('hidden');
        title.style.display = 'none';
    });
    
    const titleMap = {
        happy: { index: 0, text: '夸克资源&gallery' },
        sad: { index: 1, text: 'lyrics&小说' },
        tired: { index: 2, text: '蛋' },
        stressed: { index: 3, text: 'X' }
    };
    
    const titleInfo = titleMap[mood];
    if (titleInfo && titles[titleInfo.index]) {
        titles[titleInfo.index].textContent = titleInfo.text;
        titles[titleInfo.index].classList.remove('hidden');
        titles[titleInfo.index].style.display = 'block';
    }
    
    if (novelContainer) {
        novelContainer.classList.remove('hidden');
        // Add/remove special class for tired or happy mood (no scrollbar)
        if (mood === 'tired' || mood === 'happy'|| mood === 'sad'|| mood === 'stressed') {
            novelContainer.classList.add('tired-mood');
        } else {
            novelContainer.classList.remove('tired-mood');
        }
        
        // Update grid layout based on visible title
        const gridContainer = novelContainer.querySelector('.grid');
        if (gridContainer) {
            gridContainer.style.gridTemplateColumns = '1fr';
        }
    }
}