const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const isVercel = process.env.VERCEL === '1';

let mongoConnectionPromise;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Reuse MongoDB connection across invocations in serverless runtimes.
function connectToMongo() {
  if (!process.env.MONGO_URI) {
    return Promise.reject(new Error('MONGO_URI environment variable is not set'));
  }

  if (!mongoConnectionPromise) {
    mongoConnectionPromise = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    })
      .then(() => {
        console.log('Connected successfully to MongoDB');
        return mongoose.connection;
      })
      .catch((err) => {
        mongoConnectionPromise = null;
        console.error('MongoDB database connection error:', err);
        throw err;
      });
  }

  return mongoConnectionPromise;
}

connectToMongo().catch(() => {
  // Prevent startup crash so API routes can return proper errors if DB is unavailable.
});

// 🔄 UPDATED: Greeting Card Schema Definition
const cardSchema = new mongoose.Schema({
  recipientName: { type: String, required: true }, // "To" field
  senderName: { type: String, required: true },    // "From" field
  message: { type: String, required: true },       // The main note
  date: { type: Date, default: Date.now }
});

const GreetingCard = mongoose.model('GreetingCard', cardSchema);

// API Endpoints

// 1. Get all saved anniversary cards
app.get('/api/cards', async (req, res) => {
  try {
    await connectToMongo();
    const cards = await GreetingCard.find().sort({ date: -1 });
    res.status(200).json(cards);
  } catch (error) {
    console.error('GET /api/cards failed:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to retrieve greeting cards' });
  }
});

// 2. 🔄 UPDATED: Save a new anniversary card
app.post('/api/cards', async (req, res) => {
  try {
    await connectToMongo();
    const { recipientName, senderName, message } = req.body;
    
    // Validate that all three required fields are filled out
    if (!recipientName || !senderName || !message) {
      return res.status(400).json({ error: 'To, From, and message fields are mandatory.' });
    }
    
    const newCard = new GreetingCard({ recipientName, senderName, message });
    await newCard.save();
    
    res.status(201).json(newCard);
  } catch (error) {
    console.error('POST /api/cards failed:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to save your card to database' });
  }
});

// Serve frontend static assets cleanly
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (!isVercel) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;