const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const RENIME_API_URL = process.env.RENIME_API_URL || 'https://aalsiapi.vercel.app/api';

// 1. Home / Search Anime from Renime API directly
app.get('/api/anime-search', async (req, res) => {
    try {
        const query = req.query.q || 'Naruto';
        const searchRes = await axios.get(`${RENIME_API_URL}/search?q=${encodeURIComponent(query)}`);
        res.json(searchRes.data);
    } catch (err) {
        res.status(500).json({ error: "Failed to search anime" });
    }
});

// 2. Episodes list from Renime API
app.get('/api/anime-episodes', async (req, res) => {
    try {
        const animeId = req.query.id;
        const epsRes = await axios.get(`${RENIME_API_URL}/episodes?id=${encodeURIComponent(animeId)}`);
        res.json(epsRes.data);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch episodes" });
    }
});

// 3. Original Video Stream/Embed Link Endpoint
app.get('/api/get-anime', async (req, res) => {
    const { id, episodeId } = req.query; // Ab hum direct ID bhej sakte hain
    try {
        const embedRes = await axios.get(`${RENIME_API_URL}/embed?id=${encodeURIComponent(episodeId)}`);
        const embedData = embedRes.data;
        const videoUrl = embedData.embedUrl || embedData.url || embedData.videoUrl || embedData.stream;

        if (videoUrl) {
            res.json({ success: true, videoUrl: videoUrl, source: "Renime Direct 🤖" });
        } else {
            res.json({ success: false, error: "Link nahi mila" });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

app.get('/', (req, res) => {
    res.send('Aalsi Anime Backend is Running! 🚀');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
