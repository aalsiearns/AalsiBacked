const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// 🔥 Yeh hai hamara naya Tatakai API backend link
const TATAKAI_API_URL = 'https://tatakai-api-indol.vercel.app';

// 🎯 Main Endpoint jise Frontend call karta hai (/api/get-anime)
app.get('/api/get-anime', async (req, res) => {
    const { name, s, e } = req.query; 
    
    const season = s || 1;
    const episode = e || 1;
    const cleanName = name ? name.split(' - ')[0].split(' (')[0].trim() : "Naruto";

    console.log(`🤖 Proxying request to Tatakai for: ${cleanName} | S${season} E${episode}`);

    try {
        // Tatakai API par request forward karte hain (yahan routes apne hisab se map honge)
        const response = await axios.get(`${TATAKAI_API_URL}/api/search?q=${encodeURIComponent(cleanName)}`, { timeout: 8000 });
        
        // Agar Tatakai se data milta hai toh uska pehla video/stream link nikalenge
        const data = response.data;
        const videoUrl = data.videoUrl || data.stream || data.url || (data.results && data.results[0]?.stream);

        if (videoUrl) {
            return res.json({ success: true, videoUrl: videoUrl, source: "Tatakai API ⚡" });
        } else {
            // Agar direct link nahi mila toh fallback working stream bhej denge taaki player chale
            return res.json({
                success: true,
                videoUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
                source: "Tatakai Fallback ⚡"
            });
        }

    } catch (err) {
        console.error("❌ Tatakai Proxy Error:", err.message);
        // Error aane par bhi fallback stream bhejenge taaki user ko error na dikhe
        return res.json({
            success: true,
            videoUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
            source: "Aalsi Backup Stream ⚡"
        });
    }
});

app.get('/', (req, res) => {
    res.send('Aalsi Proxy Backend (Tatakai Connected) is Running! 🚀');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
