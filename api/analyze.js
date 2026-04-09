import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Extract hex colors from CSS/HTML source
function extractColorsFromSource(html) {
  const colors = new Set();

  // Match hex colors (3, 6, or 8 digit)
  const hexMatches = html.match(/#(?:[0-9a-fA-F]{3}){1,2}\b/g) || [];
  hexMatches.forEach(c => colors.add(c.toLowerCase()));

  // Match rgb/rgba colors and convert to hex
  const rgbMatches = html.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g) || [];
  rgbMatches.forEach(rgb => {
    const nums = rgb.match(/\d+/g);
    if (nums && nums.length >= 3) {
      const hex = '#' + [nums[0], nums[1], nums[2]].map(n => {
        const h = parseInt(n).toString(16);
        return h.length === 1 ? '0' + h : h;
      }).join('');
      colors.add(hex.toLowerCase());
    }
  });

  // Match CSS custom properties that look like colors
  const varMatches = html.match(/--[\w-]+:\s*#[0-9a-fA-F]{3,8}/g) || [];
  varMatches.forEach(v => {
    const hex = v.match(/#[0-9a-fA-F]{3,8}/);
    if (hex) colors.add(hex[0].toLowerCase());
  });

  // Match meta theme-color
  const themeColor = html.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i);
  if (themeColor) colors.add(themeColor[1].toLowerCase());

  // Filter out very common/generic colors
  const generic = new Set(['#fff', '#ffffff', '#000', '#000000', '#333', '#333333', '#666', '#666666', '#999', '#999999', '#ccc', '#cccccc', '#eee', '#eeeeee', '#f5f5f5', '#fafafa']);

  return [...colors].filter(c => !generic.has(c) && c.startsWith('#'));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  try {
    // Step 1: Fetch raw HTML (for CSS color extraction)
    let rawHtml = '';
    try {
      const htmlResponse = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LucyBot/1.0)' }
      });
      rawHtml = await htmlResponse.text();
    } catch(e) {
      console.log('Direct fetch failed:', e.message);
    }

    // Also fetch any linked stylesheets
    const cssLinks = rawHtml.match(/href=["']([^"']*\.css[^"']*)["']/g) || [];
    let allCss = rawHtml;
    for (const link of cssLinks.slice(0, 3)) { // limit to first 3 stylesheets
      try {
        const cssUrl = link.match(/href=["']([^"']+)["']/)[1];
        const fullUrl = cssUrl.startsWith('http') ? cssUrl : new URL(cssUrl, url).href;
        const cssResp = await fetch(fullUrl);
        const cssText = await cssResp.text();
        allCss += ' ' + cssText;
      } catch(e) {}
    }

    // Extract all colors from HTML + CSS
    const extractedColors = extractColorsFromSource(allCss);
    console.log('Extracted colors from CSS:', extractedColors);

    // Step 2: Get rendered text content via Jina for brand analysis
    let textContent = '';
    try {
      const jinaResponse = await fetch(`https://r.jina.ai/${url}`, {
        headers: { 'Accept': 'text/plain', 'X-Return-Format': 'text' }
      });
      textContent = await jinaResponse.text();
    } catch(e) {
      // Fallback to stripping HTML
      textContent = rawHtml.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                          .replace(/<[^>]*>/g, ' ')
                          .replace(/\s+/g, ' ').trim();
    }
    textContent = textContent.slice(0, 6000);

    // Step 3: Send to Claude with the REAL extracted colors
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Analyze this website and extract brand information.

Here are the ACTUAL hex colors found in the website's CSS and HTML source code:
${extractedColors.join(', ')}

From these real colors, pick the 5 most likely BRAND colors (primary color, secondary color, accent color, background color, and one more distinctive color). Ignore colors that are just standard grays or blacks used for text. Prioritize vibrant/distinctive colors that represent the brand identity.

Return ONLY valid JSON, no markdown fences, no extra text:

{
  "brandName": "the brand/company name",
  "description": "2-3 sentence brand description and positioning",
  "industry": "specific industry category",
  "targetAudience": "who their target customers are",
  "brandColors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "tone": "brand voice/tone",
  "products": ["list of products or services mentioned"],
  "campaignSuggestion": {
    "name": "suggested campaign name",
    "description": "what the campaign does",
    "estimatedOpenRate": "XX%",
    "projectedROI": "XXX%"
  }
}

IMPORTANT: The brandColors MUST be selected from the extracted colors list above. Do NOT make up colors. Pick from the real CSS colors.

Website URL: ${url}
Website content:
${textContent}`
      }]
    });

    let responseText = response.content[0].text.trim();
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const brandData = JSON.parse(responseText);

    // Fallback: if Claude returned no colors or made some up, use top extracted ones
    if (!brandData.brandColors || brandData.brandColors.length === 0) {
      brandData.brandColors = extractedColors.slice(0, 5);
    }

    // Extract logo from HTML
    let logoUrl = '';
    // Try og:image first (most reliable brand image)
    const ogImage = rawHtml.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
      || rawHtml.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    if (ogImage) {
      logoUrl = ogImage[1];
    } else {
      // Try apple-touch-icon
      const touchIcon = rawHtml.match(/<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i);
      if (touchIcon) {
        logoUrl = touchIcon[1];
      } else {
        // Try favicon with size > 32
        const icon = rawHtml.match(/<link[^>]*rel=["']icon["'][^>]*href=["']([^"']+)["'][^>]*sizes=["'](\d+)/i);
        if (icon && parseInt(icon[2]) >= 32) {
          logoUrl = icon[1];
        } else {
          // Fallback to Google's favicon service
          logoUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(url)}&sz=128`;
        }
      }
    }
    // Resolve relative URLs
    if (logoUrl && !logoUrl.startsWith('http') && !logoUrl.startsWith('data:')) {
      logoUrl = new URL(logoUrl, url).href;
    }
    brandData.logoUrl = logoUrl;

    res.status(200).json(brandData);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze website', details: error.message });
  }
}
