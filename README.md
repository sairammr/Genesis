# The Genesis

**An AI-powered world-building game where you create your own world, interact with in-game characters, and earn tradable NFTs.**

## Technologies Used

- **GaiaNet**: AI model execution for world generation
- **Privy**: Web3 authentication for secure player login
- **Phaser**: Game engine for 2D game mechanics
- **Blockchain**: NFT rewards and trading
- **Three.js**: 3D rendering for dynamic skyboxes

## Setup Guide

### 1. GaiaNet Setup
- Follow the [GaiaNet Quick Start Guide](https://docs.gaianet.ai/getting-started/quick-start/) to set up GaiaNode
- Ensure the GaiaNet server is running to handle AI model executions

### 2. Frontend Setup
1. Install dependencies:
```bash
bun install
```

2. Initialize the project:
```bash
bun init
```

3. Run the frontend app:
```bash
bun run dev
```

### 3. Backend Setup
1. Navigate to the backend folder:
```bash
cd backend
```

2. Start the backend server:
```bash
node server.js
```

## Working Methodologies

### AI World Generation
- AI generates worlds based on player inputs, including dynamic landscapes and characters

### Skybox Generation
- Cube mapping renders a 360° environment for the player using six images

### Character Interaction
- AI NPCs react to player decisions, shaping the game's narrative

### Blockchain
- Players earn and trade NFTs based on in-game creations

## Running the App Locally
1. Make sure GaiaNode is running
2. Run the frontend and backend as described
3. Access the game at localhost:3000

## Technical Implementation Details

### Cube Mapping for Skybox with Three.js
Cube mapping creates a skybox by mapping six images to a cube. This provides a 360° environment around the player.

```javascript
const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
  'posx.jpg', 'negx.jpg',
  'posy.jpg', 'negy.jpg',
  'posz.jpg', 'negz.jpg'
]);

scene.background = texture;
```

### AI Chatting Feature
AI NPCs generate dynamic conversations based on player inputs. NPC behavior adjusts depending on player interactions.

```javascript
const npc = new NPCCharacter();

npc.onChatInput = (input) => {
  const response = aiModel.generateResponse(input);
  npc.speak(response);
};

npc.chat();
```

### NFT Creation
As players build their worlds, they earn NFTs representing their creations. NFTs are minted via smart contracts and are stored on the blockchain.

```javascript
const nft = createNFT(player.worldData);
mintNFT(player.wallet, nft);
```

Players can trade NFTs on external marketplaces or in-game.