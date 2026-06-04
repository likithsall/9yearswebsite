const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection Setup
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected successfully to MongoDB'))
  .catch(err => console.error('❌ MongoDB database connection error:', err));

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
    const cards = await GreetingCard.find().sort({ date: -1 });
    res.status(200).json(cards);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve greeting cards' });
  }
});

// 2. 🔄 UPDATED: Save a new anniversary card
app.post('/api/cards', async (req, res) => {
  try {
    const { recipientName, senderName, message } = req.body;
    
    // Validate that all three required fields are filled out
    if (!recipientName || !senderName || !message) {
      return res.status(400).json({ error: 'To, From, and message fields are mandatory.' });
    }
    
    const newCard = new GreetingCard({ recipientName, senderName, message });
    await newCard.save();
    
    res.status(201).json(newCard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save your card to database' });
  }
});

// Serve frontend static assets cleanly
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running dynamically on http://localhost:${PORT}`);
});