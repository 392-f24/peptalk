// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Your Vite frontend URL
  credentials: true
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/peptalk')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// MongoDB Schemas
const entrySchema = new mongoose.Schema({
  userId: String,
  name: String,
  date: Date,
  emoji: String,
  summary: String,
  transcript: String
});

const recapSchema = new mongoose.Schema({
  userId: String,
  recapName: String,
  month: Date,
  moodSummary: Object,
  summary: String,
  favoriteDay: {
    date: Date,
    description: String
  },
  totalEntries: Number
});

const Entry = mongoose.model('Entry', entrySchema);
const Recap = mongoose.model('Recap', recapSchema);

// Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { userId, name } = req.body;
    // In a real app, you'd want to store user data
    res.status(200).json({ message: 'User authenticated', userId, name });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Entry routes
app.get('/api/entry/entry-data', async (req, res) => {
  try {
    const { userId } = req.query;
    const entries = await Entry.find({ userId });
    res.json({ entries });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/entry/create-entry', async (req, res) => {
  try {
    const { userId, name, date, emoji, summary, transcript } = req.body;
    const newEntry = new Entry({
      userId,
      name,
      date,
      emoji,
      summary,
      transcript
    });
    await newEntry.save();
    res.status(201).json({ newEntry });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/entry/update-entry', async (req, res) => {
  try {
    const { userId, entryId, updatedTranscript } = req.body;
    const entry = await Entry.findOneAndUpdate(
      { _id: entryId, userId },
      { transcript: updatedTranscript },
      { new: true }
    );
    res.json({ entry });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/entry/delete-entry', async (req, res) => {
  try {
    const { userId, entryId } = req.query;
    await Entry.findOneAndDelete({ _id: entryId, userId });
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Recap routes
app.get('/api/recap/recap-data', async (req, res) => {
  try {
    const { userId } = req.query;
    const recaps = await Recap.find({ userId });
    res.json({ recaps });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/recap/create-recap', async (req, res) => {
  try {
    const { userId, recapName, month, moodSummary, summary, favoriteDay, totalEntries } = req.body;
    const newRecap = new Recap({
      userId,
      recapName,
      month,
      moodSummary,
      summary,
      favoriteDay,
      totalEntries
    });
    await newRecap.save();
    res.status(201).json({ newRecap });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/recap/delete-recap', async (req, res) => {
  try {
    const { userId, recapId } = req.query;
    await Recap.findOneAndDelete({ _id: recapId, userId });
    res.json({ message: 'Recap deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate recap endpoint (using mock data for now)
app.post('/api/recap/generate-recap', async (req, res) => {
  try {
    const { monthEntries, recapMonth } = req.body;
    
    // Mock recap generation (in a real app, this would use OpenAI or similar)
    const recap = {
      recapName: `Recap for ${new Date(recapMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}`,
      month: recapMonth,
      moodSummary: {
        "😊": 5,
        "😔": 2,
        "😡": 1
      },
      summary: "This month showed overall positive emotions with some challenges.",
      favoriteDay: {
        date: new Date(),
        description: "Had a particularly good day with multiple achievements."
      },
      totalEntries: monthEntries.length
    };
    
    res.json({ recap });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

const PORT = process.env.PORT || 3007;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});