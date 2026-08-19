const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// 🔥 100% Secure HTTPS Test Links (इन्हें क्रोम ब्लॉक नहीं करेगा)
const animeDB = {
    "Naruto Shippūden": {
        hindi: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",  // Test M3U8 Video
        english: "https://www.w3schools.com/html/mov_bbb.mp4",     // Test MP4 Video
        japanese: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
    },
    "Jujutsu Kaisen": {
        hindi: "https://www.w3schools.com/html/mov_bbb.mp4",
        english: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
    },
    "Doraemon": {
        hindi: "https://www.w3schools.com/html/mov_bbb.mp4"
    }
};

app.get('/', (req, res) => {
    res.send('Aalsi Anime Backend is Live! 🚀');
});

// 🔥 API Endpoint
app.get('/api/get-anime', async (req, res) => {
    const searchQuery = req.query.name; 
    const requestedLang = req.query.lang || 'hindi'; // डिफ़ॉल्ट हिंदी

    if (!searchQuery) {
        return res.status(400).json({ error: "Name is required" });
    }

    try {
        console.log(`Request aayi hai: ${searchQuery} in ${requestedLang.toUpperCase()}`);

        // अगर DB में उस भाषा का लिंक है
        if (animeDB[searchQuery] && animeDB[searchQuery][requestedLang]) {
            return res.json({
                success: true,
                language: requestedLang,
                source: "Aalsi DB",
                videoUrl: animeDB[searchQuery][requestedLang]
            });
        }

        // अगर लिंक नहीं है, तो Fallback वीडियो दे दो
        res.json({
            success: true,
            language: "fallback",
            source: "Fallback Scraper",
            videoUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});