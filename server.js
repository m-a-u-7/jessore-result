const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const qs = require('qs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/api', async (req, res) => {
  const { roll, regno } = req.body;

  try {
    const response = await axios.post(
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
      }
    );

    res.send(response.data);
  } catch (error) {
    res.status(500).send('Error fetching result: ' + error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
