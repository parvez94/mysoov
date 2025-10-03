import express from 'express';
import { verifyToken } from '../utils/verifyToken.js';
const router = express.Router();

// Store active SSE connections
const sseConnections = new Map();

// SSE endpoint for notifications
router.get('/notifications', verifyToken, (req, res) => {
  const userId = req.user.id;

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': req.headers.origin || '*',
    'Access-Control-Allow-Credentials': 'true',
  });

  // Send initial connection message
  res.write(
    `data: ${JSON.stringify({
      type: 'connected',
      message: 'SSE connected',
    })}\n\n`
  );

  // Store connection
  if (!sseConnections.has(userId)) {
    sseConnections.set(userId, new Set());
  }
  sseConnections.get(userId).add(res);

  // Handle client disconnect
  req.on('close', () => {
    if (sseConnections.has(userId)) {
      sseConnections.get(userId).delete(res);
      if (sseConnections.get(userId).size === 0) {
        sseConnections.delete(userId);
      }
    }
  });

  // Keep connection alive with heartbeat
  const heartbeat = setInterval(() => {
    try {
      res.write(
        `data: ${JSON.stringify({
          type: 'heartbeat',
          timestamp: Date.now(),
        })}\n\n`
      );
    } catch (error) {
      clearInterval(heartbeat);
      if (sseConnections.has(userId)) {
        sseConnections.get(userId).delete(res);
        if (sseConnections.get(userId).size === 0) {
          sseConnections.delete(userId);
        }
      }
    }
  }, 30000); // Send heartbeat every 30 seconds

  req.on('close', () => {
    clearInterval(heartbeat);
  });
});

// SSE endpoint for messages
router.get('/messages', verifyToken, (req, res) => {
  const userId = req.user.id;

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': req.headers.origin || '*',
    'Access-Control-Allow-Credentials': 'true',
  });

  // Send initial connection message
  res.write(
    `data: ${JSON.stringify({
      type: 'connected',
      message: 'Messages SSE connected',
    })}\n\n`
  );

  // Store connection with a different key for messages
  const messageKey = `messages_${userId}`;
  if (!sseConnections.has(messageKey)) {
    sseConnections.set(messageKey, new Set());
  }
  sseConnections.get(messageKey).add(res);

  // Handle client disconnect
  req.on('close', () => {
    if (sseConnections.has(messageKey)) {
      sseConnections.get(messageKey).delete(res);
      if (sseConnections.get(messageKey).size === 0) {
        sseConnections.delete(messageKey);
      }
    }
  });

  // Keep connection alive with heartbeat
  const heartbeat = setInterval(() => {
    try {
      res.write(
        `data: ${JSON.stringify({
          type: 'heartbeat',
          timestamp: Date.now(),
        })}\n\n`
      );
    } catch (error) {
      clearInterval(heartbeat);
      if (sseConnections.has(messageKey)) {
        sseConnections.get(messageKey).delete(res);
        if (sseConnections.get(messageKey).size === 0) {
          sseConnections.delete(messageKey);
        }
      }
    }
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
  });
});

// Function to send notification via SSE
const sendNotificationSSE = (userId, notification) => {
  if (sseConnections.has(userId)) {
    const connections = sseConnections.get(userId);
    const data = JSON.stringify({
      type: 'notification',
      data: notification,
    });

    connections.forEach((res) => {
      try {
        res.write(`data: ${data}\n\n`);
      } catch (error) {
        connections.delete(res);
      }
    });

    // Clean up empty connections
    if (connections.size === 0) {
      sseConnections.delete(userId);
    }
  }
};

// Function to send message via SSE
const sendMessageSSE = (userId, message) => {
  const messageKey = `messages_${userId}`;
  if (sseConnections.has(messageKey)) {
    const connections = sseConnections.get(messageKey);
    const data = JSON.stringify({
      type: 'message',
      data: message,
    });

    connections.forEach((res) => {
      try {
        res.write(`data: ${data}\n\n`);
      } catch (error) {
        connections.delete(res);
      }
    });

    // Clean up empty connections
    if (connections.size === 0) {
      sseConnections.delete(messageKey);
    }
  }
};

// Export functions for use in other controllers
export {
  router as default,
  sendNotificationSSE,
  sendMessageSSE,
  sseConnections,
};
