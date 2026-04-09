export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });

  try {
    // Step 1: Get rendered page text via Jina Reader
    let pageText = '';
    try {
      const jinaResponse = await fetch(`https://r.jina.ai/${url}`, {
        headers: { 'Accept': 'text/plain' }
      });
      if (jinaResponse.ok) {
        pageText = await jinaResponse.text();
        // Trim to first 5000 chars to stay within Claude's sweet spot
        pageText = pageText.substring(0, 5000);
      }
    } catch (e) {
      console.error('Jina fetch failed:', e);
    }

    // Step 2: Try to fetch raw HTML for color extraction
    let rawHtml = '';
    try {
      const htmlResponse = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LucyBot/1.0)' }
      });
      if (htmlResponse.ok) {
        rawHtml = await htmlResponse.text();
      }
    } catch (e) {
      console.error('HTML fetch failed:', e);
    }

    // Step 3: Extract colors from raw HTML
    const hexColors = new Set();
    const hexRegex = /#([0-9a-fA-F]{6})\b/g;
    let match;
    while ((match = hexRegex.exec(rawHtml)) !== null) {
      hexColors.add('#' + match[1].toLowerCase());
    }

    // Filter out generic colors
    const genericColors = new Set([
      '#000000', '#ffffff', '#fff', '#333333', '#666666', '#999999',
      '#cccccc', '#eeeeee', '#f5f5f5', '#e5e5e5', '#d4d4d4',
      '#111111', '#222222', '#444444', '#555555', '#777777',
      '#888888', '#aaaaaa', '#bbbbbb', '#dddddd',
      '#f0f0f0', '#fafafa', '#f8f8f8', '#e0e0e0',
      '#1a1a1a', '#2d2d2d', '#3d3d3d', '#4a4a4a',
    ]);
    const filteredColors = [...hexColors].filter(c => !genericColors.has(c));

    // Step 4: Use Claude to analyze the website
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Analyze this website content and return a JSON object. The website URL is: ${url}

Website text content:
${pageText || '(Could not extract text)'}

Colors found in CSS: ${filteredColors.slice(0, 10).join(', ') || 'none found'}

Return ONLY valid JSON, no markdown, no code fences, no explanation. The JSON must have exactly these fields:
{
  "brandName": "the company/brand name",
  "description": "2-3 sentence description of what this company does, their products, and value proposition",
  "industry": "their specific industry (e.g. Cryptocurrency Mining Hardware, Fashion, SaaS, etc.)",
  "targetAudience": "their specific target audience (e.g. Crypto miners and enthusiasts, Small business owners, etc.)",
  "tone": "their brand voice tone (e.g. Professional, Casual, Bold, etc.)",
  "brandColors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "products": ["product 1 name", "product 2 name", "product 3 name"]
}

For brandColors: Use the CSS colors provided if they look like real brand colors. If not enough good colors were found, infer likely brand colors from the website content and industry. Always return exactly 5 hex colors.

For products: List the main products or services mentioned on the site.

IMPORTANT: Return ONLY the JSON object. No other text.`
        }]
      })
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('Claude API error:', errorText);
      throw new Error('Claude API failed');
    }

    const claudeData = await claudeResponse.json();
    const responseText = claudeData.content[0].text.trim();

    // Parse Claude's response - strip any accidental markdown fences
    let parsed;
    try {
      const cleanJson = responseText.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
      parsed = JSON.parse(cleanJson);
    } catch (e) {
      console.error('Failed to parse Claude response:', responseText);
      throw new Error('Failed to parse brand analysis');
    }

    // Ensure all fields exist with fallbacks
    const result = {
      brandName: parsed.brandName || new URL(url).hostname.replace('www.', ''),
      description: parsed.description || 'Could not extract description',
      industry: parsed.industry || 'Unknown',
      targetAudience: parsed.targetAudience || 'General',
      tone: parsed.tone || 'Professional',
      brandColors: (parsed.brandColors && parsed.brandColors.length >= 3)
        ? parsed.brandColors.slice(0, 5)
        : filteredColors.slice(0, 5).concat(['#6c5ce7', '#00b894', '#0984e3', '#fd79a8', '#fdcb6e']).slice(0, 5),
      products: parsed.products || [],
      logoUrl: null
    };

    // Try to get favicon/logo
    try {
      result.logoUrl = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128`;
    } catch (e) {}

    return res.status(200).json(result);

  } catch (error) {
    console.error('Analyze error:', error);
    return res.status(500).json({
      error: 'Analysis failed',
      brandName: new URL(url).hostname.replace('www.', ''),
      description: 'Could not analyze this website. Please fill in your brand details manually.',
      industry: 'Unknown',
      targetAudience: 'General',
      tone: 'Professional',
      brandColors: ['#6c5ce7', '#00b894', '#0984e3', '#fd79a8', '#fdcb6e'],
      products: []
    });
  }
}
