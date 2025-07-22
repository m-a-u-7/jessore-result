
import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { roll, regno } = req.body;

  try {
    const response = await axios.post("https://www.jessoreboard.gov.bd/resultjbs25/result.php",
      new URLSearchParams({ roll, regno }), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0",
          "Referer": "https://www.jessoreboard.gov.bd/resultjbs25/"
        }
      });

    const $ = cheerio.load(response.data);
    const tableHtml = $("table").html();

    res.status(200).json({ success: true, html: tableHtml || "Result not found." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching result" });
  }
}
