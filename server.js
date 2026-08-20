const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// 👇 Yahan tera Vercel wala real API link set kar diya hai!
const RENIME_API_URL = process.env.RENIME_API_URL || 'https://aalsiapi.vercel.app/api';

// 🤖 Real Renime API Integration Logic
async function autoScrapeEpisode(animeName, season, episode, language) {
    try {
        console.log(`🤖 Fetching for: ${animeName} | Season: ${season} | Episode: ${episode} | Lang: ${language}`);
        
        // 1. Renime API se anime search karo
        const searchRes = await axios.get(`${RENIME_API_URL}/search?q=${encodeURIComponent(animeName)}`);
        const results = searchRes.data.results || searchRes.data;
        
        if (!results || results.length === 0) {
            console.log("❌ Anime nahi mila search mein.");
            return null;
        }

        // Pehla relevant anime ka ID/Slug utha lo
        const animeId = results[0].id || results[0].slug;

        // 2. Us anime ke episodes fetch karo
        const episodesRes = await axios.get(`${RENIME_API_URL}/episodes?id=${animeId}`);
        const episodes = episodesRes.data.episodes || episodesRes.data;

        if (!episodes || episodes.length === 0) {
            console.log("❌ Episodes nahi mile.");
            return null;
        }

        // Requested episode number match karo
        const targetEpisode = episodes.find(ep => ep.number == episode) || episodes[episode - 1];

        if (!targetEpisode) {
            console.log(`❌ Episode ${episode} nahi mila.`);
            return null;
        }

        const episodeId = targetEpisode.id || targetEpisode.episodeId;

        // 3. Episode ka final embed/streaming link fetch karo
        const embedRes = await axios.get(`${RENIME_API_URL}/embed?id=${episodeId}`);
        const videoUrl = embedRes.data.embedUrl || embedRes.data.url || embedRes.data.videoUrl;

        return videoUrl;

    } catch (error) {
        console.error("❌ Renime API fetch failed:", error.message);
        return null;
    }
}

app.get('/api/get-anime', async (req, res) => {
    const { name, lang, s, e } = req.query; 
    
    const season = s || 1;
    const episode = e || 1;
    const requestedLang = lang || 'hindi';

    if (!name) {
        return res.status(400).json({ error: "Bhai, anime ka naam dena zaroori hai!" });
    }

    try {
        // Renime API ke through real video link mangwao
        const scrapedVideoUrl = await autoScrapeEpisode(name, season, episode, requestedLang);

        if (scrapedVideoUrl) {
            return res.json({
                success: true,
                language: requestedLang,
                source: `Renime API 🤖 (S${season} E${episode})`,
                videoUrl: scrapedVideoUrl
            });
        } else {
            return res.json({ success: false, error: "Bot ko ye episode nahi mila!" });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server mein gadbad hai" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
