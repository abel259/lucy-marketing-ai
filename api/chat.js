import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, brandContext } = req.body;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: `You are Lucy, an AI marketing assistant. You help businesses create and execute marketing campaigns. Here is the brand context for this user's business:

Brand: ${brandContext?.brandName || 'Unknown'}
Industry: ${brandContext?.industry || 'Unknown'}
Target Audience: ${brandContext?.targetAudience || 'Unknown'}
Description: ${brandContext?.description || 'Unknown'}

Always give specific, actionable marketing advice tailored to their brand. Be concise but thorough. When suggesting campaigns, include subject lines, target segments, timing, and estimated metrics.`,
      messages: [
        { role: 'user', content: message }
      ],
    });

    res.status(200).json({
      reply: response.content[0].text
    });
  } catch (error) {
    console.error('Claude API error:', error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
}
