const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const apiService = require('./services/apiService');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Get all tracks with their current stats and status
app.get('/api/tracks', async (req, res) => {
    try {
        const tracks = await apiService.getTrackStats();
        res.json(tracks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tracks' });
    }
});

// Manual audit trigger for a track
app.post('/api/tracks/:id/audit', async (req, res) => {
    const { id } = req.params;
    try {
        const auditResult = await apiService.auditTrack(id);
        res.json(auditResult);
    } catch (error) {
        res.status(500).json({ error: 'Failed to perform audit' });
    }
});

// Generate dispute draft
app.post('/api/tracks/:id/dispute', async (req, res) => {

    const { id } = req.params;
    try {
        const draft = await apiService.generateDisputeDraft(id);
        res.json(draft);
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate dispute draft' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
