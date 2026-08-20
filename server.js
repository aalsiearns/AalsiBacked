const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// 🔥 Tera Vercel par deployed Renime API link
const RENIME_API_URL = process.env.RENIME_API_URL || 'https://aalsiapi.vercel.app/api';

// 🤖 Real Dynamic Renime Scraper Logic
async function autoScrapeEpisode(animeName, season, episode, language) {
    try {
        console.log(`🤖 Fetching: ${animeName} | S${season} E${episode} | Lang: ${language}`);
        
        // 1. Renime API se anime search karo
        const searchRes = await axios.get(`${RENIME_API_URL}/search?q=${encodeURIComponent(animeName)}`);
        const searchData = searchRes.data;
        const results = searchData.results || searchData.data || searchData;

        if (!Array.isArray(results) || results.length === 0) {
            console.log("❌ Search mein anime nahi mila.");
            return null;
        }

        // Pehla matching anime ID/Slug uthao
        const animeId = results[0].id || results[0].slug || results[0].animeId;

        // 2. Us anime ke episodes list mangwao
        const episodesRes = await axios.get(`${RENIME_API_URL}/episodes?id=${encodeURIComponent(animeId)}`);
        const epData = episodesRes.data;
        const episodes = epData.episodes || epData.data || epData;

        if (!Array.isArray(episodes) || episodes.length === 0) {
            console.log("❌ Episodes list nahi mili.");
            return null;
        }

        // Target episode dhoondo
        let targetEpisode = episodes.find(ep => (ep.number == episode || ep.episode_number == episode));
        if (!targetEpisode && episodes[episode - 1]) {
            targetEpisode = episodes[episode - 1];
        }

        if (!targetEpisode) {
            console.log(`❌ Episode ${episode} nahi mila.`);
            return null;
        }

        const episodeId = targetEpisode.id || targetEpisode.episodeId;

        // 3. Episode ka streaming embed link fetch karo
        const embedRes = await axios.get(`${RENIME_API_URL}/embed?id=${encodeURIComponent(episodeId)}`);
        const embedData = embedRes.data;
        const videoUrl = embedData.embedUrl || embedData.url || embedData.videoUrl || embedData.stream;

        return videoUrl || null;

    } catch (error) {
        console.error("❌ Renime API Error:", error.message);
        return null;
    }
}

// 🎯 Main Endpoint jo tera Frontend Call Karta Hai
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
            return res.json({ 
                success: false, 
                error: "Episode link abhi uplabdh nahi hai ya fetch nahi ho paya." 
            });
        }

    } catch (error) {
        console.error("Internal Server Error:", error);
        res.status(500).json({ success: false, error: "Server mein koi gadbad hui." });
    }
});

// Root route (Check karne ke liye ki backend live hai ya nahi)
app.get('/', (req, res) => {
    res.send('Aalsi Anime Backend is Running Successfully! 🚀');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
