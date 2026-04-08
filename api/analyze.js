import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  try {
    // Fetch the website HTML
    const siteResponse = await fetch(url);
    const html = await siteResponse.text();

    // Extract just text content (strip HTML tags), limit to 4000 chars
    const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 4000);

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Analyze this website content and extract brand information. Return ONLY valid JSON with this exact structure, no other text:
{
  "brandName": "the brand/company name",
  "description": "2-3 sentence brand description and positioning",
  "industry": "industry category",
  "targetAudience": "who their target customers are",
  "brandColors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "tone": "brand voice/tone description",
  "campaignSuggestion": {
    "name": "suggested first campaign name",
    "description": "what the campaign would do",
    "estimatedOpenRate": "XX%",
    "projectedROI": "XXX%"
  }
}

Website content: ${textContent}`
        }
      ],
    });

    const brandData = JSON.parse(response.content[0].text);
    res.status(200).json(brandData);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze website' });
  }
}
