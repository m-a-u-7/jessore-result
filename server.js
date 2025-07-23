const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/result', async (req, res) => {
  const { roll, regno } = req.body;
  if (!roll || !regno) return res.status(400).json({ error: 'Missing roll or regno' });

  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto('https://www.jessoreboard.gov.bd/resultjbs25/', { waitUntil: 'networkidle2' });

    await page.type('input[name=roll]', roll);
    await page.type('input[name=regno]', regno);
    await Promise.all([
      page.click('input[type=submit]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);

    const content = await page.content();
    await browser.close();

    res.send(content);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
