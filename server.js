const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/check-result', async (req, res) => {
  const { roll, regno } = req.body;
  const formData = new URLSearchParams();
  formData.append('roll', roll);
  formData.append('regno', regno);

  try {
    const response = await fetch('https://www.jessoreboard.gov.bd/resultjbs25/result.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: formData
    });
    const text = await response.text();
    res.send(text);
  } catch (error) {
    res.status(500).send('Error fetching result: ' + error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});