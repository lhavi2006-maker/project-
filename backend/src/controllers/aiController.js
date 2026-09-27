const { GoogleGenAI } = require('@google/genai');

// The API key is read from process.env.GEMINI_API_KEY, which comes from your .env file
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// @route POST /api/ai/generate-faq (private)
const generateFAQ = async (req, res, next) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      res.status(400);
      throw new Error('Please provide a topic');
    }

    const prompt = `You are an assistant that writes FAQ entries for a support knowledge base.
Based on the topic "${topic}", generate ONE frequently asked question, a clear and concise answer (2-4 sentences), and a short category name (1-3 words).
Respond ONLY with valid JSON, no markdown formatting, no extra text, in exactly this shape:
{"question": "...", "answer": "...", "category": "..."}`;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const rawText = response.text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(rawText);

    res.json({
      topic,
      generatedQuestion: parsed.question,
      generatedAnswer: parsed.answer,
      generatedCategory: parsed.category,
      generatedAt: new Date(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateFAQ };
