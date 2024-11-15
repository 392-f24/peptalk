import monthRecap from "../models/MonthRecap.js";
import axios from "axios";

export const recapData = async (req, res) => {
    const userId = req.body.userId 
    try { 
        const recaps = await monthRecap.find({userId: userId})
        if (recaps.length===0) {
            return res.status(404).json({success: false, message: "No recaps found"})
        }
        return res.status(200).json({success: true, recaps})
    } catch (error) {
        return res.status(500).json({success: false, message: error.message})
    }
}

export const createRecap = async (req, res) => {
    const userId = req.body.userId;
    const {
        recapName,
        month,
        highs,
        lows,
        moodSummary,
        summary,
        favoriteDay,
        totalEntries
    } = req.body;

    try {
        const newRecap = await monthRecap.create({
            userId: userId,
            recapName: recapName,
            month: month,
            highs: highs,
            lows: lows,
            moodSummary: moodSummary,
            summary: summary,
            favoriteDay: favoriteDay,
            totalEntries: totalEntries
        });

        return res.status(201).json({ success: true, newRecap });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


export const deleteRecap = async (req, res) => {
    const userId = req.body.userId 
    const { recapId } = req.body 
    try {
        const recap = await monthRecap.findOneAndDelete({_id: recapId, userId: userId })
        if (!recap) {
            return res.status(404).json({success: false, message: "Recap not found"})
        }
        return res.status(200).json({success: true, message: "Recap deleted succesfully"})
    } catch (error) {
        return res.status(500).json({success: false, message: error.message})
    }
}

export const generateRecap = async (req, res) => {
    const apiKey = process.env.OPENAI_API_KEY;
  
    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'OpenAI API key not configured' });
    }
  
    const { monthEntries, month } = req.body;
  
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'user',
              content: `You are a helpful assistant. Your task is to process journal entry data and return a structured JSON object based on the provided schema. 
  
  Here is the array of journal entry objects:
  ${JSON.stringify(monthEntries)}
  
  This array contains journal entries for the month of ${month}. Your task is to create a monthly recap in the context of an emotional journal app. 
  
  ### Instructions:
  1. **ONLY** return the JSON object. Do not include any additional text, explanations, or comments. 
  2. The JSON should strictly match this schema:
     {
        "recapName": "string",
        "month": "Date",
        "highs": [
            { "title": "string", "description": "string" }
        ],
        "lows": [
            { "title": "string", "description": "string" }
        ],
        "moodSummary": { "😊": number, "😔": number },
        "summary": "string",
        "favoriteDay": { "date": "Date", "description": "string" },
        "totalEntries": number
     }
  3. Ensure all fields in the JSON object are valid and formatted properly.
  4. If you encounter any missing or ambiguous data in the input, make reasonable assumptions but adhere to the schema.
  
  ### Example Output:
  {
    "recapName": "Your Monthly Reflection",
    "month": "2024-11-01T00:00:00.000Z",
    "highs": [
        { "title": "Great Morning Walk", "description": "A peaceful walk with family." }
    ],
    "lows": [
        { "title": "Stressful Deadline", "description": "Intense project submission." }
    ],
    "moodSummary": { "😊": 5, "😔": 2 },
    "summary": "November was a mix of joyful and challenging moments.",
    "favoriteDay": { "date": "2024-11-05T00:00:00.000Z", "description": "Had a fun outing." },
    "totalEntries": 10
  }
  
  Return only the JSON object as shown above.`,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      const content = response.data.choices?.[0]?.message?.content;
  
      if (!content) {
        throw new Error('No valid response from OpenAI');
      }
  
      let recapData;
      try {
        recapData = JSON.parse(content);
      } catch (parseError) {
        throw new Error('Failed to parse OpenAI response into JSON');
      }
  
      return res.status(200).json({ success: true, recap: recapData });
    } catch (error) {
      console.error('Error details:', error.response?.data || error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  };