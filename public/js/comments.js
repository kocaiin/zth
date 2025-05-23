// Handle adding and displaying comments
export function initComments() {
    const commentInput = document.getElementById('comment-input');
    const addCommentBtn = document.getElementById('add-comment-btn');
    const commentsContainer = document.getElementById('comments-container');

    // Fetch and display comments from the server
    const loadComments = async () => {
        try {
            const response = await fetch('/api/comments');
            const comments = await response.json();
            commentsContainer.innerHTML = '';
            comments.forEach(({ comment, timestamp }) => {
                const commentElement = document.createElement('div');
                commentElement.className = 'p-4 bg-gray-700 rounded-lg';
                commentElement.innerHTML = `<p>${comment}</p><small class="text-gray-400">${new Date(timestamp).toLocaleString()}</small>`;
                commentsContainer.appendChild(commentElement);
            });
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    };

    // Add a new comment to the server
    const saveComment = async (comment) => {
        try {
            await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comment })
            });
            loadComments();
        } catch (error) {
            console.error('Error saving comment:', error);
        }
    };

    // Add comment button click event
    addCommentBtn.addEventListener('click', () => {
        const comment = commentInput.value.trim();
        if (comment) {
            saveComment(comment);
            commentInput.value = '';
        }
    });

    // Initial load of comments
    loadComments();
} 