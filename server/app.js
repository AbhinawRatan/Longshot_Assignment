const express = require('express');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();
const fetch = require('node-fetch');

const app = express();
const port = 8000;
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { text } = req.body;
  console.log('Received request:', req.body);

  try {
    const response = await fetch('https://api-v2.longshot.ai/custom/api/generate/instruct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LONGSHOT_API_KEY}`
      },
      body: JSON.stringify({ text })
    });

    console.log('Request sent to LongShot AI');

    const data = await response.json();
    console.log('Received response from LongShot AI:', data);

    if (data.status === "success") {
      res.status(200).json(data.copies[0].content);
      console.log('Response sent back to client.');
    } else {
      res.status(500).json({ message: data.message || 'Error generating response' });
      console.error('Error response:', data);
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/api/save-chat', (req, res) => {
  const chatHistory = req.body;
  fs.writeFile('chatHistory.json', JSON.stringify(chatHistory, null, 2), err => {
    if (err) {
      console.error('Error saving chat history:', err);
      return res.status(500).send('Error saving chat history');
    }
    res.send('Chat history saved successfully');
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
