import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  try {
    // Step 1: Get rendered text content via Jina
    const jinaResponse = await fetch(`https://r.jina.ai/${url}`, {
      headers: { 'Accept': 'text/plain', 'X-Return-Format': 'text' }
    });
    let textContent = await jinaResponse.text();
    if (!textContent || textContent.length < 100) {
      const directResponse = await fetch(url);
      const html = await directResponse.text();
      textContent = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                       .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                       .replace(/<[^>]*>/g, ' ')
                       .replace(/\s+/g, ' ').trim();
    }
    textContent = textContent.slice(0, 6000);

    // Step 2: Get screenshot of the website as base64
    const screenshotUrl = `https://image.thum.io/get/width/1280/crop/800/noanimate/${url}`;
    const screenshotResponse = await fetch(screenshotUrl);
    const screenshotBuffer = await screenshotResponse.arrayBuffer();
    const screenshotBase64 = Buffer.from(screenshotBuffer).toString('base64');
    const screenshotMediaType = 'image/png';

    // Step 3: Use Claude Vision to extract colors from the screenshot
    const colorResponse = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: screenshotMediaType,
              data: screenshotBase64
            }
          },
          {
            type: 'text',
            text: `Look at this website screenshot. Extract the 5 most prominent BRAND colors used in the design (header, buttons, accents, backgrounds, text). Return ONLY a JSON array of 5 hex color codes, nothing else. Example: ["#1a1a2e","#16213e","#0f3460","#e94560","#533483"]. Focus on the actual colors you see — the primary brand color, secondary color, accent color, background color, and text color.`
          }
        ]
      }]
    });

    let colorsText = colorResponse.content[0].text.trim();
    colorsText = colorsText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let brandColors;
    try {
      brandColors = JSON.parse(colorsText);
    } catch {
      brandColors = ['#00d4aa', '#1a1a2e', '#ffffff', '#333333', '#0066ff'];
    }

    // Step 4: Use Claude to analyze the text content for brand info
    const brandResponse = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Analyze this website content and extract brand information. Return ONLY valid JSON, no markdown fences:

{
  "brandName": "the brand/company name",
  "description": "2-3 sentence brand description and positioning",
  "industry": "specific industry category",
  "targetAudience": "who their target customers are",
  "tone": "brand voice/tone",
  "products": ["list of specific products or services mentioned on the site"],
  "campaignSuggestion": {
    "name": "suggested campaign name",
    "description": "what the campaign does",
    "estimatedOpenRate": "XX%",
    "projectedROI": "XXX%"
  }
}

Website URL: ${url}
Website content:
${textContent}`
      }]
    });

    let brandText = brandResponse.content[0].text.trim();
    brandText = brandText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const brandData = JSON.parse(brandText);

    // Merge the vision-extracted colors with the text-extracted brand data
    brandData.brandColors = brandColors;

    res.status(200).json(brandData);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze website', details: error.message });
  }
}
