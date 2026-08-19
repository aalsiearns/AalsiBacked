const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio'); // 🤖 हमारा वेब स्क्रैपर टूल

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// 🤖 एडवांस्ड ऑटोमैटिक स्क्रैपर (Dynamic Episode Fetcher)
async function autoScrapeEpisode(animeName, season, episode, language) {
    try {
        console.log(`🤖 Bot starting search for: ${animeName} | Season: ${season} | Episode: ${episode} | Lang: ${language}`);
        
        // एक डमी चेक: अगर कोई Doraemon का 500 से ऊपर का एपिसोड मांगे, तो हम अलग टेस्टिंग वीडियो देंगे
        if (animeName.toLowerCase().includes('doraemon') && episode > 500) {
             return "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4";
        }

        // डिफ़ॉल्ट रूप से ये एक वर्किंग टेस्टिंग वीडियो रिटर्न करेगा (बाद में हम इसमें असली चीरियो लॉजिक डालेंगे)
        return "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

    } catch (error) {
        console.error("❌ Scraper failed:", error.message);
        return null;
    }
}

app.get('/api/get-anime', async (req, res) => {
    // अब बैकएंड नाम के साथ सीज़न (s) और एपिसोड (e) भी ले रहा है!
    const { name, lang, s, e } = req.query; 
    
    const season = s || 1;
    const episode = e || 1;
    const requestedLang = lang || 'hindi';

    if (!name) {
        return res.status(400).json({ error: "Bhai, anime ka naam dena zaroori hai!" });
    }

    try {
        // सीधा अपने बॉट को काम पर लगाओ
        const scrapedVideoUrl = await autoScrapeEpisode(name, season, episode, requestedLang);

        if (scrapedVideoUrl) {
            return res.json({
                success: true,
                language: requestedLang,
                source: `Auto-Scraper 🤖 (S${season} E${episode})`, // वेबसाइट पर तुम्हें यही लिखा दिखेगा!
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