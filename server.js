const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 3001; // Choose any available port

app.use(cors());
app.use(express.json());

const NAMESTONE_API_URL = 'https://crashing-market-brief.functions.on-fleek.app';
const NAMESTONE_API_KEY = process.env.NAMESTONE_API_KEY || '';

app.get('/api/get-names', async (req, res) => {
  try {
    const { domain, name, address } = req.query;
    const response = await axios.get(`${NAMESTONE_API_URL}/get-names`, {
      params: { domain, name, address },
      headers: { 'Authorization': NAMESTONE_API_KEY }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying request:', error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});

app.listen(port, () => {
  console.log(`Proxy server running on http://localhost:${port}`);
});