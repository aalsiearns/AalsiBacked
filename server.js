const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const RENIME_API_URL = process.env.RENIME_API_URL || 'https://aalsiapi.vercel.app/api';

app.get('/api/get-anime', async (req, res) => {
    const { name, s, e } = req.query; 
    
    const season = s || 1;
    const episode = e || 1;
    const cleanName = name ? name.split(' - ')[0].split(' (')[0].trim() : "Naruto";

    console.log(`🤖 Request for: ${cleanName} | S${season} E${episode}`);

    try {
        // 1. Try searching on Renime API
        const searchRes = await axios.get(`${RENIME_API_URL}/search?q=${encodeURIComponent(cleanName)}`, { timeout: 5000 });
        const results = searchRes.data.results || searchRes.data.data || searchRes.data;

        if (Array.isArray(results) && results.length > 0) {
            const animeId = results[0].id || results[0].slug || results[0].animeId;

            // 2. Fetch episodes
            const epsRes = await axios.get(`${RENIME_API_URL}/episodes?id=${encodeURIComponent(animeId)}`, { timeout: 5000 });
            const episodes = epsRes.data.episodes || epsRes.data.data || epsRes.data;

            if (Array.isArray(episodes) && episodes.length > 0) {
                let targetEp = episodes.find(ep => (ep.number == episode || ep.episode_number == episode)) || episodes[episode - 1] || episodes[0];
                const epId = targetEp.id || targetEp.episodeId;

                // 3. Fetch Embed Link
                const embedRes = await axios.get(`${RENIME_API_URL}/embed?id=${encodeURIComponent(epId)}`, { timeout: 5000 });
                const videoUrl = embedRes.data.embedUrl || embedRes.data.url || embedRes.data.videoUrl || embedRes.data.stream;

                if (videoUrl) {
                    return res.json({ success: true, videoUrl: videoUrl, source: "Renime API 🤖" });
                }
            }
        }
    } catch (err) {
        console.log("⚠️ Scraper notice/fallback active:", err.message);
    }

    // 🛡️ Fallback Working Stream (Taaki player kabhi error na de)
    return res.json({
        success: true,
        videoUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        source: "Aalsi Fallback Stream ⚡"
    });
});

app.get('/', (req, res) => {
    res.send('Aalsi Anime Backend is Running! 🚀');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
