const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio'); // 🤖 हमारा असली स्क्रैपिंग टूल

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// 🔥 1. VIP Database (अपने टॉप 10 फेवरेट शोज़ के डायरेक्ट लिंक्स यहाँ रखो, जो कभी फेल न हों)
const vipDatabase = {
    "Naruto Shippūden": {
        hindi: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" // (यहाँ अपना असली लिंक डाल लेना)
    }
};

// 🔥 2. 🤖 ऑटोमैटिक स्क्रैपर बॉट (The Magic Tool)
// जब कोई ऐसा शो सर्च होगा जो VIP Database में नहीं है, तो यह बॉट इंटरनेट पर जाएगा
async function autoScrapeAnime(animeName, language) {
    try {
        console.log(`🤖 Bot is searching internet for: ${animeName} in ${language}...`);
        
        // *****************************************************************
        // 🛠️ SCRAPING LOGIC (यहाँ असली वेबसाइट को स्क्रैप करने का कोड आता है)
        // *****************************************************************
        
        // स्टेप 1: Axios से वेबसाइट के सर्च पेज पर जाना
        // const searchUrl = `https://hypothetical-hindi-anime-site.com/search?q=${encodeURIComponent(animeName)}`;
        // const response = await axios.get(searchUrl);
        
        // स्टेप 2: Cheerio से HTML पेज को पढ़ना
        // const $ = cheerio.load(response.data);
        
        // स्टेप 3: HTML टैग्स (जैसे <video> या <iframe>) में से लिंक निकालना
        // const videoLink = $('video source').attr('src') || $('iframe').attr('src');
        
        // *****************************************************************

        // चूँकि असली साइट्स (RareToons) हमें अभी ब्लॉक कर देंगी, 
        // इसलिए अभी के लिए हमारा बॉट ये 'सक्सेसफुल टेस्ट लिंक' ढूँढ कर लाएगा 
        // (भविष्य में तुम इसमें असली चीरियो (Cheerio) का लॉजिक डाल सकते हो!)
        
        return "https://www.w3schools.com/html/mov_bbb.mp4"; 

    } catch (error) {
        console.error("❌ Bot failed to scrape:", error.message);
        return null;
    }
}

// 🔥 3. मेन API (जो तुम्हारी वेबसाइट को रिस्पॉन्स देगी)
app.get('/api/get-anime', async (req, res) => {
    const searchQuery = req.query.name; 
    const requestedLang = req.query.lang || 'hindi';

    if (!searchQuery) {
        return res.status(400).json({ error: "Name is required" });
    }

    try {
        // स्टेप A: पहले चेक करो कि क्या ये शो VIP Database में है?
        if (vipDatabase[searchQuery] && vipDatabase[searchQuery][requestedLang]) {
            console.log("⚡ Found in VIP Database!");
            return res.json({
                success: true,
                language: requestedLang,
                source: "VIP Database 👑",
                videoUrl: vipDatabase[searchQuery][requestedLang]
            });
        }

        // स्टेप B: अगर DB में नहीं है, तो अपने 🤖 Bot को इंटरनेट पर भेज दो!
        const scrapedLink = await autoScrapeAnime(searchQuery, requestedLang);

        if (scrapedLink) {
            return res.json({
                success: true,
                language: requestedLang,
                source: "Auto-Scraper Bot 🤖", // यह तुम्हारी साइट पर हरे रंग में लिखा आएगा!
                videoUrl: scrapedLink
            });
        } else {
            return res.json({ success: false, error: "Bot ko link nahi mila! 😢" });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});