const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/result', async (req, res) => {
  const { roll, regno } = req.body;
  try {
    const response = await axios.post(
      'https://www.jessoreboard.gov.bd/resultjbs25/result.php',
      new URLSearchParams({ roll, regno }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0',
          'Referer': 'https://www.jessoreboard.gov.bd/resultjbs25/',
          'X-Requested-With': 'XMLHttpRequest'
        }
      }
    );

    const html = response.data;
    const $ = cheerio.load(html);
    const rows = [];
    $('table tr').each((i, el) => {
      const tds = $(el).find('td');
      const row = [];
      tds.each((j, td) => row.push($(td).text().trim()));
      if (row.length) rows.push(row);
    });

    res.json({ result: rows });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error fetching result' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});
