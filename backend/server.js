const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const OpenAI = require('openai');
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

1. IMAGE_PROMPT: 
   - Single line vivid description for 360° medieval panorama
   - MUST use EXACTLY ONE of these image names: ${imagesData.map(img => img.name).join(', ')}
   - Format: "IMAGE_PROMPT: [EXACT_IMAGE_NAME_HERE] description..."

2. STORY_SCENE: 
   - Single line mysterious murder setup with Michel and Jenna
   - Format: "STORY_SCENE: [story content here]"

3. MODELS_JSON: 
   - JSON array of 3-5 model entries using ONLY THESE MODELS: ${modelNames.join(', ')}
   - Format:
     [
       {
         "modelPath": "EXACT_MODEL_NAME_FROM_LIST",
         "position": {"x": number, "y": 0, "z": number},
         "rotation": {"x": 0, "y": number, "z": 0},
         "scale": {"x": 1, "y": 1, "z": 1},
         "instanceCount": 1
       }
     ]
   - NO MARKDOWN, ONLY PLAIN JSON

Input: ${userPrompt}
`.trim();

const validateModelSelection = (selectedModels) => {
  return selectedModels.every(model => 
    modelNames.includes(model.modelPath)
  );
};

console.log('🚀 Initializing server...');

//const client = new OpenAI({
 // baseURL: 'https://0x4706c29fe823f14921fddb5ca172356d6ec95fb0.gaia.domains/v1',
  //apiKey: process.env.OPENAI_API_KEY
//});

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
      const userPrompt = message.toString();
      console.log('📥 Received prompt:', userPrompt);

      // Generate expansion prompt
      // Original OpenAI chat completion code
      // const expansionResponse = await client.chat.completions.create({
      //   model: "Llama-3.2-3B-Instruct",
      //   messages: [
      //     { 
      //       role: "system", 
      //       content: "You are a game content generator. Respond ONLY with the 3 sections in the exact specified format." 
      //     },
      //     { role: "user", content: getExpansionPrompt(userPrompt) }
      //   ],
      //   temperature: 0.5,
      //   max_tokens: 500
      // });
      safeSend({ type: 'status', step: 0 });
      const expansionResponse = await (async () => {
        const { Client } = await import("@gradio/client");

      
        const model =  await Client.connect("yuntian-deng/ChatGPT");
        const result = await model.predict("/predict", {
            inputs : [["You are a game content generator. Respond ONLY with the 3 sections in the exact specified format."+ getExpansionPrompt(userPrompt), null]], // Undefined parameter in 'Chatbot' component
            top_p : 0.9, // 'Top-p' Slider (range: 0 - 1.0)
            temperature:0.1, // 'Temperature' Slider (range: 0 - 1.0)
            chat_counter: 3,
        chatbot: [["Hello!",null]],  // 'Max History Tokens' Slider (range: 0 - 8192)
          
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
    
    console.log("Image Prompt:", imagePrompt);
    console.log(" Story Scene:", storyScene);
    console.log(" Models JSON:", modelsJson);
      if (!imagePrompt || !storyScene || !modelsJson) {
        throw new Error('Invalid response format from AI');
      }

      // Parse and validate models
      let models;
      try {
        models = JSON.parse(modelsJson);
        if (!Array.isArray(models)) throw new Error('Models must be an array');
        if (!validateModelSelection(models)) throw new Error('Invalid model selection');
      } catch (e) {
        throw new Error(`Invalid models JSON: ${e.message}`);
      }

      // Find matching image
      

      
      safeSend({ type: 'status', step: 2 });
      safeSend({ type: 'status', step: 3 });
      // Send responses
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
    console.log('🔒 Connection closed');
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