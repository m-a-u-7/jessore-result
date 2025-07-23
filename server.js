const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios').default;
const qs = require('qs');
const cors = require('cors');
const tough = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/api', async (req, res) => {
  const { roll, regno } = req.body;

  try {
    const jar = new tough.CookieJar();
    const client = wrapper(axios.create({ jar }));

    const postResponse = await client.post(
      'https://www.jessoreboard.gov.bd/resultjbs25/result.php',
      qs.stringify({ roll, regno }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0',
          'X-Requested-With': 'XMLHttpRequest',
          'Origin': 'https://www.jessoreboard.gov.bd',
          'Referer': 'https://www.jessoreboard.gov.bd/resultjbs25/',
        },
        maxRedirects: 5,
      }
    );

    res.send(postResponse.data);
  } catch (error) {
    res.status(500).send('Error fetching result: ' + error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
