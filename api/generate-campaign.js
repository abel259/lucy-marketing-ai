import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  const { brandData, products } = req.body;

  const productList = products?.length
    ? products.map(p => `- ${p.title}: ${p.body_html?.replace(/<[^>]*>/g, '').slice(0, 100)} (${p.variants?.[0]?.price || 'N/A'})`).join('\n')
    : 'No specific products available';

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `You are Lucy, an AI marketing strategist. Based on this brand and product data, generate the NEXT email marketing campaign they should run. Don't ask questions — just deliver the campaign.

Brand: ${brandData?.brandName || 'Unknown'}
Industry: ${brandData?.industry || 'Unknown'}
Target Audience: ${brandData?.targetAudience || 'Unknown'}
Description: ${brandData?.description || 'Unknown'}

Products:
${productList}

Return a JSON object with this EXACT structure (no other text, just JSON):
{
  "campaignName": "catchy campaign name",
  "objective": "what this campaign achieves",
  "targetSegment": "who to send this to",
  "emailSequence": [
    {
      "day": 1,
      "subject": "email subject line",
      "previewText": "preview text",
      "bodyOutline": "2-3 sentence outline of email content",
      "cta": "call to action button text"
    }
  ],
  "timing": "when to send (day of week, time)",
  "estimatedOpenRate": "XX%",
  "estimatedClickRate": "XX%",
  "projectedROI": "XXX%",
  "featuredProducts": ["product names to feature"],
  "summary": "A 2-3 sentence conversational summary of the campaign that Lucy would say to the user, starting with 'Based on your products, here\\'s your next campaign...'"
}

Generate a 3-5 email sequence. Make it specific to their actual products. Be opinionated and actionable.`
    }]
  });

  try {
    const campaign = JSON.parse(response.content[0].text);
    res.status(200).json(campaign);
  } catch {
    res.status(200).json({ summary: response.content[0].text });
  }
}
