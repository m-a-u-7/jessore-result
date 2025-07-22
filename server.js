const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/result", async (req, res) => {
    const { roll, regno } = req.body;
    if (!roll || !regno) return res.status(400).json({ error: "Missing roll or regno" });

    try {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.goto("https://www.jessoreboard.gov.bd/resultjbs25/", { waitUntil: "networkidle2" });

        // Fill up roll and reg
        await page.type("input[name=roll]", roll);
        await page.type("input[name=regno]", regno);

        await Promise.all([
            page.click("input[type=submit]"),
            page.waitForNavigation({ waitUntil: "networkidle2" }),
        ]);

        const resultHTML = await page.content();
        await browser.close();

        res.send(resultHTML);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Puppeteer error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
