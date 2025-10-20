const fs = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  const { id } = req.query;
  const userAgent = req.headers['user-agent'] || '';

  console.log('video-meta.js invoked for id:', id);
  console.log('User-Agent:', userAgent);

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

  console.log('Is crawler:', isCrawler);

  if (isCrawler) {
    // Fetch meta tags from backend
    try {
      // Use API_URL for serverless function (VITE_ vars are build-time only)
      const backendUrl =
        process.env.API_URL || 'https://mysoov-backend.vercel.app';
      const videoUrl = `${backendUrl}/video/${id}`;

      console.log('Fetching from backend:', videoUrl);

      // Use native fetch (available in Node 18+)
      const response = await fetch(videoUrl);

      console.log('Backend response status:', response.status);

      if (!response.ok) {
        throw new Error(
          `Backend returned ${response.status}: ${response.statusText}`
        );
      }

      const html = await response.text();
      console.log('Successfully fetched HTML, length:', html.length);

      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(html);
    } catch (error) {
      console.error('Error fetching video meta:', error.message);
      console.error('Stack:', error.stack);

      // Return a basic HTML page with error info
      const errorHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Error Loading Video</title>
  <meta property="og:title" content="Mysoov Video" />
  <meta property="og:description" content="Watch this video on Mysoov" />
  <meta property="og:type" content="video.other" />
</head>
<body>
  <p>Error loading video. Please try again later.</p>
  <!-- Debug: ${error.message} -->
</body>
</html>`;

      res.setHeader('Content-Type', 'text/html');
      res.status(500).send(errorHtml);
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
