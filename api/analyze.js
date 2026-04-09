export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL required' });
  }

  // Step 1: Try to get page text via Jina Reader
  let pageText = '';
  try {
    const jinaRes = await fetch('https://r.jina.ai/' + url, {
      headers: { 'Accept': 'text/plain' },
      signal: AbortSignal.timeout(8000)
    });
    if (jinaRes.ok) {
      pageText = await jinaRes.text();
      pageText = pageText.substring(0, 4000);
    }
  } catch (e) {
    console.log('Jina failed, continuing without page text:', e.message);
  }

  // Step 2: Send to Claude - it knows most websites already
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY is not set!');
    return res.status(500).json({
      error: 'API key not configured',
      brandName: 'Unknown',
      description: 'API key not configured. Please set ANTHROPIC_API_KEY.',
      industry: 'Unknown',
      targetAudience: 'General',
      tone: 'Professional',
      brandColors: ['#6c5ce7', '#00b894', '#0984e3', '#fd79a8', '#fdcb6e'],
      products: [],
      logoUrl: null
    });
  }

  try {
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Visit or analyze the website at ${url} and tell me about this brand.

Here is some text content from the website (may be partial or empty):
${pageText || '(no text extracted)'}

Return ONLY a raw JSON object with these exact fields, no markdown fences, no explanation:
{
  "brandName": "company name",
  "description": "2-3 sentence description of what this company does",
  "industry": "specific industry like Cryptocurrency Mining Hardware, Fashion Retail, etc",
  "targetAudience": "specific target audience",
  "tone": "brand voice tone",
  "brandColors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "products": ["product1", "product2", "product3"]
}

IMPORTANT for brandColors: You must identify the ACTUAL brand colors used on this website. Look at the content and determine what colors the site actually uses for backgrounds, buttons, accents, and text. Return 5 hex color codes that represent the real brand palette. Do NOT guess generic colors - identify the specific colors this brand uses.

Return ONLY the JSON. Nothing else.`
        }]
      })
    });

    if (!claudeRes.ok) {
      const errText = await claudeRes.text();
      console.error('Claude API error status:', claudeRes.status, errText);
      throw new Error('Claude API returned ' + claudeRes.status);
    }

    const claudeData = await claudeRes.json();
    const rawText = claudeData.content[0].text.trim();
    console.log('Claude raw response:', rawText.substring(0, 200));

    // Parse JSON - handle markdown fences if Claude adds them
    let cleanJson = rawText;
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    const parsed = JSON.parse(cleanJson);

    // Build result with fallbacks
    const result = {
      brandName: parsed.brandName || 'Unknown',
      description: parsed.description || '',
      industry: parsed.industry || 'Unknown',
      targetAudience: parsed.targetAudience || 'General',
      tone: parsed.tone || 'Professional',
      brandColors: Array.isArray(parsed.brandColors) && parsed.brandColors.length >= 3
        ? parsed.brandColors.slice(0, 5)
        : ['#000000', '#ffffff', '#00C896', '#1A1A1A', '#FF4D4D'],
      products: Array.isArray(parsed.products) ? parsed.products : [],
      logoUrl: null
    };

    // Get favicon
    try {
      const hostname = new URL(url).hostname;
      result.logoUrl = 'https://www.google.com/s2/favicons?domain=' + hostname + '&sz=128';
    } catch (e) {}

    console.log('Returning brand data for:', result.brandName);
    return res.status(200).json(result);

  } catch (error) {
    console.error('Analyze endpoint error:', error.message, error.stack);
    return res.status(500).json({
      error: error.message,
      brandName: url ? new URL(url).hostname.replace('www.', '') : 'Unknown',
      description: 'Analysis failed: ' + error.message,
      industry: 'Unknown',
      targetAudience: 'General',
      tone: 'Professional',
      brandColors: ['#000000', '#ffffff', '#00C896', '#1A1A1A', '#FF4D4D'],
      products: [],
      logoUrl: null
    });
  }
}
