const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');

console.log('🚀 Initializing server...');

const app = express();
app.use(cors());
console.log('✅ CORS middleware enabled');

const server = app.listen(5000, () => {
  console.log('🌐 HTTP Server running on port 5000');
});

const wss = new WebSocket.Server({ server });
console.log('📡 WebSocket Server initialized');

wss.on('connection', (ws) => {
  console.log('🔌 New client connected');
  
  // Track connection state
  let isConnectionActive = true;

  // Handle connection close
  ws.on('close', (code, reason) => {
    console.log(`🔒 Connection closed - Code: ${code}, Reason: ${reason}`);
    isConnectionActive = false;
  });

  // Handle connection errors
  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
    isConnectionActive = false;
  });

  ws.on('message', async (message) => {
    console.log('📥 Received message:', message.toString());
    
    try {
      // Check connection before processing
      if (!isConnectionActive) {
        console.log('⚠️ Connection already closed, stopping processing');
        return;
      }

      const prompt = message.toString();
      console.log('🎯 Processing prompt:', prompt);
      
      // Safe send wrapper
      const safeSend = (data) => {
        if (isConnectionActive && ws.readyState === WebSocket.OPEN) {
          console.log('📤 Sending data:', data);
          ws.send(JSON.stringify(data));
        } else {
          console.log('⚠️ Cannot send - connection not active or ready');
        }
      };

      // Initial status
      console.log('🎬 Starting processing sequence');
      safeSend({ type: 'status', step: 0 });

      // AI Response simulation
      console.log('🤖 Simulating AI response...');
      const aiResponse = await new Promise(resolve => setTimeout(() => {
        console.log('✨ AI response generated');
        resolve({
          story: 'A dark crime unfolds in the city...',
          imagePrompt: 'noir-style dark alley with streetlight',
          position: { x: 35, y: 72 }
        });
      }, 2000));

      safeSend({ type: 'status', step: 1 });
      console.log('📖 Sending story data');
      safeSend({ type: 'story', data: aiResponse.story });
      safeSend({ type: 'status', step: 2 });

      // Parallel processing with connection checking
      console.log('🔄 Starting parallel processing');
      const results = await Promise.all([
        new Promise((resolve, reject) => {
          if (!isConnectionActive) {
            console.log('⚠️ Connection closed during image processing');
            reject(new Error('Connection closed'));
          }
          console.log('🖼️ Processing image...');
          setTimeout(() => resolve({
            imageUrl: 'https://i.ibb.co/hJFXCsB7/bg-invo.png'
          }), 3000);
        }),
        new Promise((resolve, reject) => {
          if (!isConnectionActive) {
            console.log('⚠️ Connection closed during position processing');
            reject(new Error('Connection closed'));
          }
          console.log('📍 Processing position...');
          setTimeout(() => resolve({
            coordinates: aiResponse.position
          }), 2500);
        })
      ]).catch(error => {
        console.error('❌ Parallel processing error:', error);
        if (isConnectionActive) {
          safeSend({ type: 'error', data: 'Parallel processing failed' });
        }
        throw error;
      });

      if (results) {
        console.log('✅ Parallel processing complete');
        const [imageResult, positionResult] = results;
        safeSend({ type: 'image', data: imageResult });
        safeSend({ type: 'position', data: positionResult });
        safeSend({ type: 'status', step: 3 });
      }

      // Graceful shutdown
      if (isConnectionActive) {
        console.log('👋 Initiating graceful shutdown');
        setTimeout(() => {
          safeSend({ type: 'status', step: 4, data: 'Processing complete' });
          ws.close(1000, 'Processing complete');
          console.log('✅ Processing complete, connection closed');
        }, 1000);
      }

    } catch (error) {
      console.error('❌ Processing error:', error);
      if (isConnectionActive && ws.readyState === WebSocket.OPEN) {
        safeSend({
          type: 'error',
          data: 'Processing failed: ' + error.message
        });
        ws.close(1011, 'Processing failed');
        console.log('🚫 Connection closed due to error');
      }
    }
  });
});

// Log websocket server events
wss.on('listening', () => {
  console.log('👂 WebSocket Server is listening for connections');
});

wss.on('error', (error) => {
  console.error('❌ WebSocket Server error:', error);
});

process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, closing server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});