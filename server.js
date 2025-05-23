const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Path to the comments file
const commentsFilePath = path.join(__dirname, 'comments.json');

// Ensure the comments file exists
if (!fs.existsSync(commentsFilePath)) {
    fs.writeFileSync(commentsFilePath, JSON.stringify([]));
}

// API to get all comments
app.get('/api/comments', (req, res) => {
    const comments = JSON.parse(fs.readFileSync(commentsFilePath, 'utf-8'));
    res.json(comments);
});

// API to add a new comment
app.post('/api/comments', (req, res) => {
    const { comment } = req.body;
    if (!comment) {
        return res.status(400).json({ error: 'Comment is required' });
    }

    const comments = JSON.parse(fs.readFileSync(commentsFilePath, 'utf-8'));
    comments.push({ comment, timestamp: new Date().toISOString() });
    // Restrict to max ** comments (keep latest **)
    if (comments.length > 50) {
        comments.splice(0, comments.length - 50);
    }
    fs.writeFileSync(commentsFilePath, JSON.stringify(comments, null, 2));

    res.status(201).json({ message: 'Comment added successfully' });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});