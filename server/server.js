require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY, 
});

// Endpoint to call Anthropics' complete API
app.post('/get_summary', async (req, res) => {
  try {
    const {webContent, prompt} = req.body;

    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      temperature: 0,
      system: "You are a google chrome browser extension. You will be given all the text content of a given website. Return a structured summary of the text content in HTML with beautiful css that can be rendered in a chrome extension.",
      messages: [
        { 
          "role": "assistant", 
          "content": `Here is the context content of the website: ${webContent}`
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": prompt
            }
          ]
        }
      ],
    });

    const response = msg.content[0].text

    console.log('msg: ', msg);
    console.log('response: ', response);

    res.json({
      status: 200,
      result: response
    })
  } catch (error) {
    console.error('Error calling Anthropics API:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error communicating with Anthropics API' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
