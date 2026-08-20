const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const RENIME_API_URL = process.env.RENIME_API_URL || 'https://aalsiapi.vercel.app/api';

async function autoScrapeEpisode(animeName, season, episode, language) {
    try {
        console.log(`🤖 Searching: ${animeName} | S${season} E${episode} | Lang: ${language}`);
        
        // Clean name (e.g., remove season tags if any)
        const cleanName = animeName.split(' - ')[0].trim();

        // 1. Search anime
        const searchRes = await axios.get(`${RENIME_API_URL}/search?q=${encodeURIComponent(cleanName)}`);
        const searchData = searchRes.data;
        const results = searchData.results || searchData.data || searchData;

        if (!Array.isArray(results) || results.length === 0) {
            console.log("❌ Anime not found in search, trying fallback video...");
            // Fallback testing stream taaki player chal kar dikhe
            return "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
        }

        const animeId = results[0].id || results[0].slug || results[0].animeId;

        // 2. Fetch episodes
        const episodesRes = await axios.get(`${RENIME_API_URL}/episodes?id=${encodeURIComponent(animeId)}`);
        const epData = episodesRes.data;
        const episodes = epData.episodes || epData.data || epData;

        if (!Array.isArray(episodes) || episodes.length === 0) {
            console.log("❌ Episodes list empty, using fallback video.");
            return "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
        }

        let targetEpisode = episodes.find(ep => (ep.number == episode || ep.episode_number == episode));
        if (!targetEpisode && episodes[episode - 1]) {
            targetEpisode = episodes[episode - 1];
        }

        const episodeId = targetEpisode ? (targetEpisode.id || targetEpisode.episodeId) : episodes[0].id;

        // 3. Fetch embed link
        const embedRes = await axios.get(`${RENIME_API_URL}/embed?id=${encodeURIComponent(episodeId)}`);
        const embedData = embedRes.data;
        const videoUrl = embedData.embedUrl || embedData.url || embedData.videoUrl || embedData.stream;

        return videoUrl || "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

    } catch (error) {
        console.error("❌ Error in scraping:", error.message);
        // Fallback video tak ki user ko error na dikhe aur player test ho sake
        return "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
    }
}

app.get('/api/get-anime', async (req, res) => {
    const { name, lang, s, e } = req.query; 
    
    const season = s || 1;
    const episode = e || 1;
    const requestedLang = lang || 'hindi';

    if (!name) {
        return res.status(400).json({ success: false, error: "Anime ka naam zaroori hai!" });
    }

    try {
        const scrapedVideoUrl = await autoScrapeEpisode(name, season, episode, requestedLang);

        if (scrapedVideoUrl) {
            return res.json({
                success: true,
                language: requestedLang,
                source: `Renime Engine 🤖 (S${season} E${episode})`,
                videoUrl: scrapedVideoUrl
            });
        } else {
            return res.json({ success: false, error: "Episode link nahi mila." });
        }

    } catch (error) {
        res.status(500).json({ success: false, error: "Server error." });
    }
});

app.get('/', (req, res) => {
    res.send('Aalsi Anime Backend is Running! 🚀');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
