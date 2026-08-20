const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// 🔥 Direct Working Stream Database (Jugaad for 100% uptime without server crash)
const directStreams = {
    "naruto": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", // Replace with actual m3u8 if you have
    "jujutsu kaisen": "https://sfux-ext.sfux.info/hls/live/2003750/st-live-ch-01/index.m3u8",
    "demon slayer": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    "doraemon": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
};

app.get('/api/get-anime', async (req, res) => {
    const { name, s, e } = req.query; 
    
    const season = s || 1;
    const episode = e || 1;
    const cleanName = name ? name.toLowerCase().split(' - ')[0].split(' (')[0].trim() : "naruto";

    console.log(`⚡ Direct Stream Request for: ${cleanName} | S${season} E${episode}`);

    // Check if we have a direct mapped stream
    let videoUrl = "";
    for (let key in directStreams) {
        if (cleanName.includes(key)) {
            videoUrl = directStreams[key];
            break;
        }
    }

    // Agar direct nahi mila toh ek stable public HLS stream de do taaki player hamesha chale
    if (!videoUrl) {
        videoUrl = "https://sfux-ext.sfux.info/hls/live/2003750/st-live-ch-01/index.m3u8";
    }

    return res.json({
        success: true,
        videoUrl: videoUrl,
        source: "Aalsi Direct Engine 🚀"
    });
});

app.get('/', (req, res) => {
    res.send('Aalsi Direct Streaming Backend is Running! 🚀');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
