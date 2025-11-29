import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize chat session
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // System prompt for complaint handling
    const systemPrompt = `You are a helpful complaint management assistant. Your role is to:
1. Greet users warmly and ask about their complaint
2. Gather important details: location, date/time, description, severity, affected parties
3. Ask clarifying questions to understand the issue better
4. Be empathetic and professional
5. Summarize the complaint once all details are collected
6. When the user is ready, help classify the complaint into one of these departments:
   - Maintenance (plumbing, electrical, building repairs)
   - IT (computers, software, network issues)
   - HR (employee relations, workplace issues)
   - Admin (general administrative matters)
   - Security (safety concerns, access issues)
   - Facilities (cleaning, amenities, parking)

Keep responses concise and friendly. Don't ask more than 2 questions at once.`;

    // Build conversation context
    let conversationContext = systemPrompt + '\n\nConversation:\n';
    conversationHistory.forEach(msg => {
      conversationContext += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    });
    conversationContext += `User: ${message}\nAssistant:`;

    const result = await model.generateContent(conversationContext);
    const response = await result.response;
    const botReply = response.text();

    res.json({ 
      reply: botReply,
      conversationId: Date.now()
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Failed to process message', details: error.message });
  }
});

// Classify complaint and extract information
router.post('/classify', async (req, res) => {
  try {
    const { conversationHistory } = req.body;

    if (!conversationHistory || conversationHistory.length === 0) {
      return res.status(400).json({ error: 'Conversation history is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Build full conversation
    let conversation = conversationHistory.map(msg => 
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n');

    const classificationPrompt = `Based on this complaint conversation, extract and classify the information:

${conversation}

Provide a JSON response with:
1. department: one of [Maintenance, IT, HR, Admin, Security, Facilities]
2. summary: brief summary of the complaint (2-3 sentences)
3. location: where the issue occurred (if mentioned)
4. datetime: when it occurred (if mentioned)
5. severity: [Low, Medium, High, Critical]
6. details: key details about the complaint

Return ONLY valid JSON, no additional text.`;

    const result = await model.generateContent(classificationPrompt);
    const response = await result.response;
    let classification = response.text();

    // Clean up the response to extract JSON
    classification = classification.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
      const parsedClassification = JSON.parse(classification);
      res.json(parsedClassification);
    } catch (parseError) {
      // If JSON parsing fails, try to extract manually
      res.json({
        department: 'Admin',
        summary: 'Please review the complaint details.',
        location: 'Not specified',
        datetime: 'Not specified',
        severity: 'Medium',
        details: conversation,
        rawResponse: classification
      });
    }
  } catch (error) {
    console.error('Classification error:', error);
    res.status(500).json({ error: 'Failed to classify complaint', details: error.message });
  }
});

export default router;
