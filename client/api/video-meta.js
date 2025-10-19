const fs = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  const { id } = req.query;
  const userAgent = req.headers['user-agent'] || '';

  // List of crawler user agents
  const crawlers = [
    'facebookexternalhit',
    'Facebot',
    'Twitterbot',
    'LinkedInBot',
    'WhatsApp',
    'Slackbot',
    'TelegramBot',
    'SkypeUriPreview',
    'Googlebot',
    'Bingbot',
  ];

  // Check if request is from a crawler
  const isCrawler = crawlers.some((crawler) =>
    userAgent.toLowerCase().includes(crawler.toLowerCase())
  );

  if (isCrawler) {
    // Fetch meta tags from backend
    try {
      // Use API_URL for serverless function (VITE_ vars are build-time only)
      const backendUrl =
        process.env.API_URL ||
        process.env.VITE_API_URL ||
        'https://mysoov-backend.vercel.app';
      const videoUrl = `${backendUrl}/video/${id}`;

      // Use native fetch (available in Node 18+) or fall back to https
      const response = await fetch(videoUrl);
      const html = await response.text();

      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(html);
    } catch (error) {
      console.error('Error fetching video meta:', error);
      res.status(500).send('Error loading video meta tags');
    }
  } else {
    // Serve the React app for regular users
    try {
      const indexPath = path.join(process.cwd(), 'dist', 'index.html');
      const indexHtml = fs.readFileSync(indexPath, 'utf-8');

      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(indexHtml);
    } catch (error) {
      console.error('Error serving index:', error);
      res.status(500).send('Error loading page');
    }
  }
};
