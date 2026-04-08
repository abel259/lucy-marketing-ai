export default async function handler(req, res) {
  const { shop, accessToken } = req.body;

  const response = await fetch(`https://${shop}/admin/api/2024-01/products.json?limit=10`, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  res.status(200).json(data.products);
}
