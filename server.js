const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.post("/api/result", async (req, res) => {
    const { roll, reg } = req.body;
    if (!roll || !reg) return res.status(400).send("Roll and Registration required");

    try {
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.goto("https://www.jessoreboard.gov.bd/resultjbs25/result.php", { waitUntil: 'networkidle2' });

        await page.type("input[name='roll']", roll);
        await page.type("input[name='regno']", reg);
        await Promise.all([
            page.click("input[type='submit']"),
            page.waitForNavigation({ waitUntil: 'networkidle2' })
        ]);

        const content = await page.content();
        await browser.close();
        res.send(content);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching result");
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));