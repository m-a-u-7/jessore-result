const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

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
    res.status(200).send(text);
  } catch (error) {
    res.status(500).send('Error: ' + error.message);
  }
};
