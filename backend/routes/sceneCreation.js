// server.js
const WebSocket = require('ws');
const express = require('express');
const app = express();
const server = app.listen(8080);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    try {
      const prompt = message.toString();
      
      // Simulate AI Model processing
      ws.send(JSON.stringify({ type: 'status', step: 0 }));
      
      const aiResponse = await new Promise(resolve => setTimeout(() => {
        resolve({
          story: 'A dark crime unfolds in the city...',
          imagePrompt: 'noir-style dark alley with streetlight',
          position: { x: 35, y: 72 }
        });
      }, 2000));

      ws.send(JSON.stringify({ type: 'status', step: 1 }));
      ws.send(JSON.stringify({ type: 'story', data: aiResponse.story }));

      ws.send(JSON.stringify({ type: 'status', step: 2 }));
      
      // Parallel processing
      const [imageResult, positionResult] = await Promise.all([
        new Promise(resolve => setTimeout(() => 
          resolve({ imageUrl: 'https://example.com/generated-image.jpg' }), 3000)),
        new Promise(resolve => setTimeout(() => 
          resolve({ coordinates: aiResponse.position }), 2500))
      ]);

      ws.send(JSON.stringify({ type: 'image', data: imageResult }));
      ws.send(JSON.stringify({ type: 'position', data: positionResult }));
      
      ws.send(JSON.stringify({ type: 'status', step: 3 }));
      setTimeout(() => ws.close(), 1000);
    } catch (error) {
      console.error('Error:', error);
      ws.send(JSON.stringify({ type: 'error', data: 'Processing failed' }));
      ws.close();
    }
  });
});