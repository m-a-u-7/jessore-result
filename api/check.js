
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const { roll, regno } = req.body;

  try {
    const response = await fetch('https://www.jessoreboard.gov.bd/resultjbs25/result.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0',
      },
      body: new URLSearchParams({ roll, regno }),
    });

    const html = await response.text();

    if (html.includes('Loading, please wait')) {
      return res.status(202).json({ status: 'redirecting', message: 'Please wait and try again.' });
    }

    const $ = cheerio.load(html);
    const name = $('td:contains("Name")').next().text().trim();
    const gpa = $('td:contains("GPA")').next().text().trim();
    const resultTable = $('table').eq(2).html();

    return res.json({ name, gpa, resultHtml: resultTable });

  } catch (e) {
    return res.status(500).json({ error: 'Result fetch failed', details: e.toString() });
  }
}
