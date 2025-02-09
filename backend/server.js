/**
 * @fileoverview Server implementation for a murder mystery game with WebSocket endpoints and Gaia AI integration
 * 
 * The server uses Gaia's node implementation for AI responses through the following function:
 * 
 * @example
 * async function callOpenAI() {
 *   try {
 *     const response = await client.chat.completions.create({
 *       model: "Meta-Llama-3-8B-Instruct-Q5_K_M", 
 *       messages: [
 *         { role: "system", content: "You are a strategic reasoner." },
 *         { role: "user", content: "What is the purpose of life?" }
 *       ],
 *       temperature: 0.7,
 *       max_tokens: 500
 *     });
 *     console.log(response.choices[0].message.content);
 *   } catch (error) {
 *     console.error('Error:', error);
 *   }
 * }
 * Because of my hardware capabilities tit is not used for hosting but done locally 
 * This is used in three main WebSocket endpoints:
 * - /world-creation: Generates game world content including image prompts, story scenes and 3D model placement
 * - /chat: Handles character dialogue using different personality prompts
 * - /killer: Validates killer accusations and provides success/failure responses
 * 
 * @requires ws
 * @requires express
 * @requires cors
 * @requires dotenv  
 * @requires openai
 * @requires fs
 * @requires path
 */
const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');
dotenv.config();
const fs = require('fs');
const path = require('path');

// Load and parse models data correctly
const modelsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'models.json'), 'utf-8'));
const modelNames = modelsData.flatMap(obj => Object.keys(obj));
console.log('📦 Loaded models:', modelNames);

// Load images data
const imagesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'images.json'), 'utf-8'));
console.log('🖼️ Loaded images:', imagesData.length);

const getExpansionPrompt = (userPrompt) => `
As a professional game designer, expand this prompt into three EXACT sections. Follow these rules STRICTLY:
${userPrompt}
1. IMAGE_PROMPT: 
   - Single line vivid description for 360° medieval panorama
   - MUST use EXACTLY ONE of these image names: ${imagesData.map(img => img.name).join(', ')}
   - Format: "IMAGE_PROMPT: [EXACT_IMAGE_NAME_HERE] description..."

2. STORY_SCENE: 
   - Single line mysterious murder setup with Michel and Jenna are suspects and i have to investigate it  it should be long and create a mystery about the place
   - Format: "STORY_SCENE: [story content here] "

3. MODELS_JSON: 
   - JSON array of  models entries  atleast 15 models to fill a 100*100 plane of game  proper scaling and sizing and rotation of models and the no two models should collide and the roads are default flying on the sky that rotated some degree make it fall to ground  and add paths using ONLY THESE MODELS: ${modelNames.join(', ')}
   - Format:
     [
       {
         "modelPath": "EXACT_MODEL_NAME_FROM_LIST",
         "position": {"x": number, "y": 0, "z": number},
         "rotation": {"x": 0, "y": 0, "z": 0},
         "scale": {"x": 1, "y": 1, "z": 1},
         "instanceCount": 1
       }
     ]
   - NO MARKDOWN, ONLY PLAIN JSON

Input: 
`.trim();
const client = new OpenAI({
  baseURL: 'https://YOUR-NODE-ID.us.gaianet.network/v1',
  apiKey: 'YOUR_API_KEY_GOES_HERE'
});
const getCharacterPrompt = (characterId, message) => {
  const basePrompt = "You are a character in a murder mystery game. ";
  
  const characterPrompts = {
    michel: `${basePrompt}You are Michel, one of the suspects. Act defensive but not obviously guilty. Always subtly hint at Jenna's suspicious behavior without being too obvious. Remember:
    - Maintain your innocence while being slightly nervous
    - Point out inconsistencies in Jenna's alibi
    - Share seemingly innocent details that cast doubt on Jenna
    - Never directly accuse anyone
    - Stay calm but occasionally show signs of stress
    - If asked about specific evidence, deflect or provide vague answers
    
    Player message: ${message}`,
    
    jenna: `${basePrompt}You are Jenna, one of the suspects. Act defensive but not obviously guilty. Always subtly hint at Michel's suspicious behavior without being too obvious. Remember:
    - Maintain your innocence while being slightly nervous
    - Point out inconsistencies in Michel's alibi
    - Share seemingly innocent details that cast doubt on Michel
    - Never directly accuse anyone
    - Stay calm but occasionally show signs of stress
    - If asked about specific evidence, deflect or provide vague answers
    
    Player message: ${message}`,
    
    nexus: `${basePrompt}You are NEXUS-7, an AI Protocol Specialist. Provide analytical insights about the case while remaining neutral. Remember:
    - Analyze evidence objectively
    - Point out logical inconsistencies in both suspects' stories
    - Share relevant technical or forensic details
    - Maintain a professional, AI-like demeanor
    - Never directly accuse either suspect
    
    Player message: ${message}`,
    
    shadow: `${basePrompt}You are SHADOW, a street informant. Share underground information while maintaining mystery. Remember:
    - Speak in cryptic but informative ways
    - Hint at secrets both suspects might be hiding
    - Share rumors and whispered conversations
    - Never directly accuse either suspect
    - Maintain an air of knowing more than you reveal
    
    Player message: ${message}`,
    
    cipher: `${basePrompt}You are CIPHER, the Security Chief. Provide security-focused insights while remaining professional. Remember:
    - Focus on security footage, access logs, and physical evidence
    - Point out suspicious patterns in both suspects' movements
    - Share relevant security protocols that were broken
    - Never directly accuse either suspect
    - Maintain a formal, security-professional tone
    
    Player message: ${message}`
  };

  return characterPrompts[characterId] || characterPrompts.nexus;
};

const validateModelSelection = (selectedModels) => {
  return selectedModels.every(model => 
    modelNames.includes(model.modelPath)
  );
};

console.log('🚀 Initializing server...');

const app = express();
app.use(cors());
console.log('✅ CORS middleware enabled');

// Create HTTP server
const server = app.listen(5000, () => {
  console.log('🌐 HTTP Server running on port 5000');
});

// Create WebSocket servers for different endpoints
const worldCreationWss = new WebSocket.Server({ noServer: true });
const chatWss = new WebSocket.Server({ noServer: true });
const killerWss = new WebSocket.Server({ noServer: true });

// Handle WebSocket upgrade requests
server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;

  if (pathname === '/world-creation') {
    worldCreationWss.handleUpgrade(request, socket, head, (ws) => {
      worldCreationWss.emit('connection', ws, request);
    });
  } else if (pathname === '/chat') {
    chatWss.handleUpgrade(request, socket, head, (ws) => {
      chatWss.emit('connection', ws, request);
    });
  
  }
  else if (pathname === '/killer') {
    killerWss.handleUpgrade(request, socket, head, (ws) => {
      killerWss.emit('connection', ws, request);
    });}
     else {
    socket.destroy();
  }
});

// World Creation WebSocket Handler
worldCreationWss.on('connection', (ws) => {
  console.log('🔌 New world creation client connected');
  let isConnectionActive = true;

  const safeSend = (data) => {
    if (isConnectionActive && ws.readyState === WebSocket.OPEN) {
      console.log('📤 Sending:', data.type);
      ws.send(JSON.stringify(data));
    }
  };

  const handleError = (error) => {
    console.error('❌ Error:', error.message);
    safeSend({ 
      type: 'error',
      data: `Error: ${error.message}`
    });
    if (isConnectionActive) {
      ws.close(1011, error.message);
      isConnectionActive = false;
    }
  };

  ws.on('message', async (message) => {
    try {
      const userMessage = message.toString();
      console.log('📥 Received world creation prompt:', userMessage);

      const expansionResponse = await (async () => {
        const { Client } = await import("@gradio/client");
        const model = await Client.connect("yuntian-deng/ChatGPT");
        const result = await model.predict("/predict", {
          inputs: [[
            "You are a game content generator. Respond ONLY with the 3 sections in the exact specified format." + 
            getExpansionPrompt(userMessage) + userMessage, 
            null
          ]],
          top_p: 0.9,
          temperature: 0.1,
          chat_counter: 3,
          chatbot: [["Hello!", null]]
        });
        return result.data[0][0][1];
      })();

      const responseContent = expansionResponse;
      console.log('📤 Expansion response:', responseContent);    
      safeSend({ type: 'status', step: 1 });
      
      const imagePromptMatch = responseContent.match(/IMAGE_PROMPT:\s*(.+?)\n/s);
      const storySceneMatch = responseContent.match(/STORY_SCENE:\s*(.+?)\n/s);
      const modelsJsonMatch = responseContent.match(/MODELS_JSON:\s*(\[.*?\])/s);
      
      const imagePrompt = imagePromptMatch ? imagePromptMatch[1].trim() : null;
      const storyScene = storySceneMatch ? storySceneMatch[1].trim() : null;
      const modelsJson = modelsJsonMatch ? modelsJsonMatch[1] : null;
      
      if (!imagePrompt || !storyScene || !modelsJson) {
        throw new Error('Invalid response format from AI');
      }

      let models;
      try {
        models = JSON.parse(modelsJson);
        if (!Array.isArray(models)) throw new Error('Models must be an array');
        
      } catch (e) {
        throw new Error(`Invalid models JSON: ${e.message}`);
      }

      safeSend({ type: 'status', step: 2 });
      safeSend({ type: 'status', step: 3 });
      
      safeSend({
        type: 'image',
        data: {
          description: imagePrompt,
          imageUrl: "https://cdn.jsdelivr.net/gh/sairammr/3d-models@main/skybox/sb8.jpg"
        }
      });

      safeSend({
        type: 'position',
        data: models
      });

      safeSend({
        type: 'story',
        data: storyScene
      });

      safeSend({ type: 'complete' });

    } catch (error) {
      handleError(error);
    }
  });

  ws.on('close', () => {
    console.log('🔒 World creation connection closed');
    isConnectionActive = false;
  });

  ws.on('error', (error) => {
    handleError(error);
  });
});

// Chat WebSocket Handler
chatWss.on('connection', (ws) => {
  console.log('🔌 New chat client connected');
  let isConnectionActive = true;

  const safeSend = (data) => {
    if (isConnectionActive && ws.readyState === WebSocket.OPEN) {
      console.log('📤 Sending:', data.type);
      ws.send(JSON.stringify(data));
    }
  };

  const handleError = (error) => {
    console.error('❌ Error:', error.message);
    safeSend({ 
      type: 'error',
      data: `Error: ${error.message}`
    });
    if (isConnectionActive) {
      ws.close(1011, error.message);
      isConnectionActive = false;
    }
  };

  ws.on('message', async (message) => {
    try {
      const [characterId, ...messageParts] = message.toString().split(' ');
      const chatMessage = messageParts.join(' ');
      
      console.log('📥 Received chat message for', characterId + ':', chatMessage);
      
      safeSend({ type: 'status', step: 0 });
      
      const { Client } = await import("@gradio/client");
      const model = await Client.connect("yuntian-deng/ChatGPT");
      const result = await model.predict("/predict", {
        inputs: [[getCharacterPrompt(characterId, chatMessage), null]],
        top_p: 0.9,
        temperature: 0.7,
        chat_counter: 3,
        chatbot: [["Hello!", null]]
      });

      const response = result.data[0][0][1];
      
      safeSend({ type: 'status', step: 1 });
      safeSend({
        type: 'story',
        data: response
      });
      safeSend({ type: 'status', step: 3 });

    } catch (error) {
      handleError(error);
    }
  });

  ws.on('close', () => {
    console.log('🔒 Chat connection closed');
    isConnectionActive = false;
  });

  ws.on('error', (error) => {
    handleError(error);
  });
});
killerWss.on('connection', (ws) => {
  console.log('🔌 New killer client connected');
  let isConnectionActive = true;

  const safeSend = (data) => {
    if (isConnectionActive && ws.readyState === WebSocket.OPEN) {
      console.log('📤 Sending:', data.type);
      ws.send(JSON.stringify(data));
    }
  };

  const handleError = (error) => {
    console.error('❌ Error:', error.message);
    safeSend({ 
      type: 'error',
      data: `Error: ${error.message}`
    });
    if (isConnectionActive) {
      ws.close(1011, error.message);
      isConnectionActive = false;
    }
  };

  ws.on('message', async (message) => {
    try {
      const killer = message.toString();
      console.log('📥 Received killer selection:', killer);

      // Simulate AI prompt to determine if the killer is correct
      const { Client } = await import("@gradio/client");
      const model = await Client.connect("yuntian-deng/ChatGPT");
      const result = await model.predict("/predict", {
        inputs: [[`Is ${killer} the killer? Answer only with 'yes' or 'no'.`, null]],
        top_p: 0.9,
        temperature: 0.1,
        chat_counter: 3,
        chatbot: [["Hello!", null]]
      });

      const response = result.data[0][0][1].trim().toLowerCase();
      console.log('📤 AI response:', response);

      if (response === 'yes') {
        safeSend({ type: 'result', data: 'success' });
      } else {
        safeSend({ type: 'result', data: 'failure' });
      }

    } catch (error) {
      handleError(error);
    }
  });

  ws.on('close', () => {
    console.log('🔒 Killer connection closed');
    isConnectionActive = false;
  });

  ws.on('error', (error) => {
    handleError(error);
  });
});
process.on('SIGTERM', () => {
  console.log('📴 Shutting down...');
  server.close(() => process.exit(0));
});