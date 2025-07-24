const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'SSC Result Checker API',
        description: 'This is the backend API server for checking SSC results from Jessore Board',
        endpoints: {
            'POST /api/check-result': 'Check SSC result by roll and registration number'
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Main API endpoint for checking results
app.post('/api/check-result', async (req, res) => {
    try {
        const { roll, regno } = req.body;
        
        if (!roll || !regno) {
            return res.status(400).json({
                success: false,
                error: 'Both roll and regno are required'
            });
        }

        console.log(`Checking result for roll: ${roll}, regno: ${regno}`);

        // Create axios instance with session-like behavior
        const axiosInstance = axios.create({
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 14; TrebleDroid vanilla Build/AP2A.240905.003) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.7151.72 Safari/537.36',
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });

        // First, visit the main page to get cookies
        const mainUrl = 'https://www.jessoreboard.gov.bd/resultjbs25/';
        console.log('Getting initial cookies...');
        await axiosInstance.get(mainUrl);

        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 2000));

        // API details
        const apiUrl = 'https://www.jessoreboard.gov.bd/resultjbs25/result.php';
        const formData = new URLSearchParams({
            roll: roll,
            regno: regno
        });

        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest',
            'Origin': 'https://www.jessoreboard.gov.bd',
            'Referer': 'https://www.jessoreboard.gov.bd/resultjbs25/'
        };

        console.log('Making API call...');
        let response = await axiosInstance.post(apiUrl, formData.toString(), { headers });

        // If we get a loading page, wait and try again
        if (response.data.includes('Loading')) {
            console.log('Got loading page, waiting 3 seconds and trying again...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            response = await axiosInstance.post(apiUrl, formData.toString(), { headers });
        }

        if (response.status !== 200) {
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch result from server'
            });
        }

        // Check if result found
        if (response.data.includes('No result found') || response.data.length < 100) {
            return res.status(404).json({
                success: false,
                error: 'No result found for the provided roll and registration number'
            });
        }

        // Parse the HTML response using Cheerio
        const $ = cheerio.load(response.data);
        const resultData = {};

        // Extract basic info using regex (more reliable for this specific format)
        const nameMatch = response.data.match(/<td class="name">(.*?)<\/td>/s);
        if (nameMatch) {
            resultData.name = nameMatch[1].trim();
        }

        const rollMatch = response.data.match(/<td class="roll">(.*?)<\/td>/s);
        if (rollMatch) {
            resultData.roll = rollMatch[1].trim();
        }

        const regMatch = response.data.match(/<td class="reg">(.*?)<\/td>/s);
        if (regMatch) {
            resultData.registration = regMatch[1].trim();
        }

        // Extract subjects and grades
        const subjects = [];
        $('tr').each((index, element) => {
            const subjectCell = $(element).find('td.subname');
            if (subjectCell.length > 0) {
                const subjectName = subjectCell.text().trim();
                const cells = $(element).find('td');
                if (cells.length >= 2) {
                    // Get marks (second to last cell) and grade (last cell)
                    const marks = $(cells[cells.length - 2]).text().trim();
                    const grade = $(cells[cells.length - 1]).text().trim();
                    subjects.push({
                        subject: subjectName,
                        marks: marks,
                        grade: grade
                    });
                }
            }
        });

        resultData.subjects = subjects;

        // Extract overall GPA if available
        const gpaMatch = response.data.match(/GPA.*?(\d+\.\d+)/);
        if (gpaMatch) {
            resultData.gpa = gpaMatch[1];
        }

        console.log('Result parsed successfully');

        // Return the parsed result
        res.json({
            success: true,
            data: resultData,
            raw_html: response.data // Include raw HTML for debugging
        });

    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({
            success: false,
            error: `Server error: ${error.message}`
        });
    }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`API endpoint: http://localhost:${PORT}/api/check-result`);
});

