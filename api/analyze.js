import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  try {
    // Use Jina AI Reader to get rendered page content (free, no API key needed)
    const jinaResponse = await fetch(`https://r.jina.ai/${url}`, {
      headers: {
        'Accept': 'text/plain',
        'X-Return-Format': 'text'
      }
    });

    let textContent = await jinaResponse.text();

    // Fallback: if Jina fails, try direct fetch
    if (!textContent || textContent.length < 100) {
      const directResponse = await fetch(url);
      const html = await directResponse.text();
      textContent = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                       .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                       .replace(/<[^>]*>/g, ' ')
                       .replace(/\s+/g, ' ')
                       .trim();
    }

    // Limit to 6000 chars for Claude context
    textContent = textContent.slice(0, 6000);

    console.log('Extracted text length:', textContent.length);
    console.log('First 500 chars:', textContent.slice(0, 500));

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Analyze this website content and extract brand information. Return ONLY valid JSON with this exact structure, no markdown, no code fences, just the raw JSON object:

{
  "brandName": "the brand/company name",
  "description": "2-3 sentence brand description and positioning based on what you see",
  "industry": "specific industry category",
  "targetAudience": "who their target customers are based on the content",
  "brandColors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "tone": "brand voice/tone description",
  "products": ["list of products or services mentioned"],
  "campaignSuggestion": {
    "name": "suggested first campaign name",
    "description": "what the campaign would do",
    "estimatedOpenRate": "XX%",
    "projectedROI": "XXX%"
  }
}

For brandColors: Look for any hex color codes, brand-colored elements, or infer from the brand identity. If the site is about crypto/mining hardware, use techy greens/blues. Don't return generic purple/gray.

Website URL: ${url}
Website content:
${textContent}`
      }]
    });

    let responseText = response.content[0].text;

    // Strip markdown code fences if Claude adds them
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const brandData = JSON.parse(responseText);
    res.status(200).json(brandData);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze website',
      details: error.message
    });
  }
}
