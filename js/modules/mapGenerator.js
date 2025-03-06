import { TILE_TYPES, TILE_SIZE } from './constants.js';
import { generateCobblestoneTextures } from './textureManager.js';

// Pre-rendered cobblestone patterns
let cobblestoneTextures = [];
let texturesLoaded = false;

// Generate a map with wider streets (3 tiles) and plazas
export function generateRomeMap(mapWidth, mapHeight) {
    console.log(`Generating Rome map with dimensions: ${mapWidth}x${mapHeight}`);
    
    // Initialize empty map
    const gameMap = Array(mapHeight).fill().map(() => Array(mapWidth).fill(TILE_TYPES.EMPTY));
    
    // Create main roads (Cardo and Decumanus) - now 3 tiles wide
    const cardoX = Math.floor(mapWidth / 2);
    const decumanusY = Math.floor(mapHeight / 2);
    
    console.log(`Main roads: Cardo at x=${cardoX}, Decumanus at y=${decumanusY}`);
    
    // Draw Cardo (North-South main road) - 3 tiles wide
    for (let y = 0; y < mapHeight; y++) {
        // Ensure we don't go out of bounds
        if (cardoX - 1 >= 0) gameMap[y][cardoX - 1] = TILE_TYPES.ROAD;
        gameMap[y][cardoX] = TILE_TYPES.ROAD;
        if (cardoX + 1 < mapWidth) gameMap[y][cardoX + 1] = TILE_TYPES.ROAD;
    }
    
    // Draw Decumanus (East-West main road) - 3 tiles wide
    for (let x = 0; x < mapWidth; x++) {
        if (decumanusY - 1 >= 0) gameMap[decumanusY - 1][x] = TILE_TYPES.ROAD;
        gameMap[decumanusY][x] = TILE_TYPES.ROAD;
        if (decumanusY + 1 < mapHeight) gameMap[decumanusY + 1][x] = TILE_TYPES.ROAD;
    }
    
    // Add secondary roads - also 3 tiles wide
    const numSecondaryRoads = Math.min(3, Math.floor(Math.min(mapWidth, mapHeight) / 10));
    console.log(`Adding ${numSecondaryRoads} secondary roads`);
    
    for (let i = 0; i < numSecondaryRoads; i++) {
        // Vertical roads - 3 tiles wide
        const roadX = Math.floor(Math.random() * (mapWidth - 6)) + 3;
        for (let y = 0; y < mapHeight; y++) {
            // Skip near intersections with main road
            if (y < decumanusY - 3 || y > decumanusY + 3) {
                if (roadX - 1 >= 0) gameMap[y][roadX - 1] = TILE_TYPES.ROAD;
                if (roadX < mapWidth) gameMap[y][roadX] = TILE_TYPES.ROAD;
                if (roadX + 1 < mapWidth) gameMap[y][roadX + 1] = TILE_TYPES.ROAD;
            }
        }
        
        // Horizontal roads - 3 tiles wide
        const roadY = Math.floor(Math.random() * (mapHeight - 6)) + 3;
        for (let x = 0; x < mapWidth; x++) {
            // Skip near intersections with main road
            if (x < cardoX - 3 || x > cardoX + 3) {
                if (roadY - 1 >= 0) gameMap[roadY - 1][x] = TILE_TYPES.ROAD;
                if (roadY < mapHeight) gameMap[roadY][x] = TILE_TYPES.ROAD;
                if (roadY + 1 < mapHeight) gameMap[roadY + 1][x] = TILE_TYPES.ROAD;
            }
        }
    }
    
    // Add plazas at key intersections
    const plazaSize = Math.min(7, Math.floor(Math.min(mapWidth, mapHeight) / 6));
    console.log(`Adding main plaza of size ${plazaSize}`);
    addPlaza(gameMap, cardoX, decumanusY, plazaSize); // Main central plaza
    
    // Add a few more smaller plazas
    const numPlazas = Math.min(3, Math.floor(Math.min(mapWidth, mapHeight) / 15));
    console.log(`Adding ${numPlazas} smaller plazas`);
    
    for (let i = 0; i < numPlazas; i++) {
        const plazaX = Math.floor(Math.random() * (mapWidth - 10)) + 5;
        const plazaY = Math.floor(Math.random() * (mapHeight - 10)) + 5;
        
        // Make sure it's not too close to the central plaza
        if (Math.abs(plazaX - cardoX) > 10 || Math.abs(plazaY - decumanusY) > 10) {
            const smallPlazaSize = Math.min(5, Math.floor(Math.min(mapWidth, mapHeight) / 10));
            addPlaza(gameMap, plazaX, plazaY, smallPlazaSize); // Smaller plazas
        }
    }
    
    // Add multi-tile buildings
    addBuildings(gameMap, mapWidth, mapHeight);
    
    // Add temples at key locations
    addTemples(gameMap, cardoX, decumanusY, mapWidth, mapHeight);
    
    // Add some water (Tiber river)
    const riverX = Math.max(3, Math.floor(mapWidth / 4));
    console.log(`Adding Tiber river at x=${riverX}`);
    
    for (let y = 0; y < mapHeight; y++) {
        // Make river 3 tiles wide
        if (riverX - 1 >= 0) gameMap[y][riverX - 1] = TILE_TYPES.WATER;
        if (riverX < mapWidth) gameMap[y][riverX] = TILE_TYPES.WATER;
        if (riverX + 1 < mapWidth) gameMap[y][riverX + 1] = TILE_TYPES.WATER;
        
        // Make the river curve a bit
        if (y % 5 === 0 && riverX + 2 < mapWidth) {
            gameMap[y][riverX + 2] = TILE_TYPES.WATER;
        }
        if (y % 7 === 0 && riverX - 2 >= 0) {
            gameMap[y][riverX - 2] = TILE_TYPES.WATER;
        }
    }
    
    // Load the cobblestone textures if they haven't been loaded yet
    if (!texturesLoaded) {
        loadCobblestoneTextures();
    }
    
    console.log("Map generation complete");
    return gameMap;
}

// Helper function to add a plaza
function addPlaza(gameMap, centerX, centerY, size) {
    const halfSize = Math.floor(size / 2);
    
    for (let y = centerY - halfSize; y <= centerY + halfSize; y++) {
        for (let x = centerX - halfSize; x <= centerX + halfSize; x++) {
            // Check if within map bounds
            if (y >= 0 && y < gameMap.length && x >= 0 && x < gameMap[0].length) {
                gameMap[y][x] = TILE_TYPES.ROAD; // Use ROAD type instead of PLAZA
            }
        }
    }
}

// Helper function to add multi-tile buildings
function addBuildings(gameMap, mapWidth, mapHeight) {
    // Add buildings of different sizes
    const numBuildings = Math.min(30, Math.floor(mapWidth * mapHeight / 40));
    console.log(`Adding ${numBuildings} buildings`);
    
    for (let i = 0; i < numBuildings; i++) {
        // Random building size (2x2, 2x3, 3x2, or 3x3)
        const width = Math.random() < 0.5 ? 2 : 3;
        const height = Math.random() < 0.5 ? 2 : 3;
        
        // Random position
        const x = Math.floor(Math.random() * (mapWidth - width - 2)) + 1;
        const y = Math.floor(Math.random() * (mapHeight - height - 2)) + 1;
        
        // Check if area is empty
        let canPlace = true;
        for (let dy = -1; dy <= height; dy++) {
            for (let dx = -1; dx <= width; dx++) {
                const checkY = y + dy;
                const checkX = x + dx;
                
                // Check if within map bounds
                if (checkY < 0 || checkY >= mapHeight || checkX < 0 || checkX >= mapWidth) {
                    continue;
                }
                
                // Check if tile is not empty (we want a buffer around buildings)
                if (gameMap[checkY][checkX] !== TILE_TYPES.EMPTY) {
                    canPlace = false;
                    break;
                }
            }
            if (!canPlace) break;
        }
        
        // Place building if area is clear
        if (canPlace) {
            for (let dy = 0; dy < height; dy++) {
                for (let dx = 0; dx < width; dx++) {
                    gameMap[y + dy][x + dx] = TILE_TYPES.BUILDING;
                }
            }
        }
    }
}

// Helper function to add temples
function addTemples(gameMap, cardoX, decumanusY, mapWidth, mapHeight) {
    // Main temple near the central plaza
    const mainTempleX = Math.min(cardoX + 5, mapWidth - 4);
    const mainTempleY = Math.min(decumanusY + 5, mapHeight - 4);
    
    console.log(`Adding main temple at (${mainTempleX}, ${mainTempleY})`);
    
    // Create a 4x4 temple (or smaller if near edge)
    const templeWidth = Math.min(4, mapWidth - mainTempleX);
    const templeHeight = Math.min(4, mapHeight - mainTempleY);
    
    for (let y = 0; y < templeHeight; y++) {
        for (let x = 0; x < templeWidth; x++) {
            if (mainTempleY + y < gameMap.length && mainTempleX + x < gameMap[0].length) {
                gameMap[mainTempleY + y][mainTempleX + x] = TILE_TYPES.TEMPLE;
            }
        }
    }
    
    // Add a few more smaller temples
    const numTemples = Math.min(3, Math.floor(Math.min(mapWidth, mapHeight) / 15));
    console.log(`Adding ${numTemples} smaller temples`);
    
    for (let i = 0; i < numTemples; i++) {
        const templeX = Math.floor(Math.random() * (mapWidth - 3));
        const templeY = Math.floor(Math.random() * (mapHeight - 3));
        
        // Check if area is empty
        let canPlace = true;
        for (let dy = -1; dy <= 2; dy++) {
            for (let dx = -1; dx <= 2; dx++) {
                const checkY = templeY + dy;
                const checkX = templeX + dx;
                
                // Check if within map bounds
                if (checkY < 0 || checkY >= mapHeight || checkX < 0 || checkX >= mapWidth) {
                    continue;
                }
                
                // Check if tile is not empty
                if (gameMap[checkY][checkX] !== TILE_TYPES.EMPTY) {
                    canPlace = false;
                    break;
                }
            }
            if (!canPlace) break;
        }
        
        // Place temple if area is clear
        if (canPlace) {
            // Create a 2x2 temple
            for (let y = 0; y < 2; y++) {
                for (let x = 0; x < 2; x++) {
                    if (templeY + y < gameMap.length && templeX + x < gameMap[0].length) {
                        gameMap[templeY + y][templeX + x] = TILE_TYPES.TEMPLE;
                    }
                }
            }
        }
    }
}

// Load cobblestone textures
async function loadCobblestoneTextures() {
    try {
        console.log("Loading cobblestone textures...");
        cobblestoneTextures = await generateCobblestoneTextures(TILE_SIZE, 4);
        texturesLoaded = true;
        console.log(`Loaded ${cobblestoneTextures.length} cobblestone textures`);
    } catch (error) {
        console.error("Failed to load cobblestone textures:", error);
    }
}

// Draw the map
export function drawMap(ctx, gameMap, cameraOffsetX, cameraOffsetY, canvas, tileColors) {
    // Fill the entire canvas with the ground color first
    ctx.fillStyle = tileColors[TILE_TYPES.EMPTY];
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate the visible tile range based on camera position
    const startTileX = Math.floor(cameraOffsetX / TILE_SIZE);
    const startTileY = Math.floor(cameraOffsetY / TILE_SIZE);
    const endTileX = Math.ceil((cameraOffsetX + canvas.width) / TILE_SIZE);
    const endTileY = Math.ceil((cameraOffsetY + canvas.height) / TILE_SIZE);
    
    // Draw only the visible tiles
    for (let y = startTileY; y <= endTileY; y++) {
        for (let x = startTileX; x <= endTileX; x++) {
            // Skip if outside map bounds
            if (x < 0 || y < 0 || x >= gameMap[0].length || y >= gameMap.length) continue;
            
            const tileType = gameMap[y][x];
            const screenX = x * TILE_SIZE - cameraOffsetX;
            const screenY = y * TILE_SIZE - cameraOffsetY;
            
            // Draw the tile based on its type
            if (tileType === TILE_TYPES.ROAD) {
                // Use a consistent pattern based on position
                if (texturesLoaded && cobblestoneTextures.length > 0) {
                    const patternIndex = (x + y) % cobblestoneTextures.length;
                    const texture = cobblestoneTextures[patternIndex];
                    ctx.drawImage(texture, screenX, screenY);
                } else {
                    // Fallback if textures not loaded
                    ctx.fillStyle = tileColors[tileType];
                    ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                }
            } else {
                // Draw regular tiles
                ctx.fillStyle = tileColors[tileType];
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                
                // Draw tile borders for non-road tiles
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
                ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
            }
            
            // Draw additional details based on tile type
            if (tileType === TILE_TYPES.TEMPLE) {
                // Draw columns for temples
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(screenX + 5, screenY + 5, 5, TILE_SIZE - 10);
                ctx.fillRect(screenX + TILE_SIZE - 10, screenY + 5, 5, TILE_SIZE - 10);
                
                // Draw roof
                ctx.fillStyle = '#8B0000';
                ctx.beginPath();
                ctx.moveTo(screenX, screenY);
                ctx.lineTo(screenX + TILE_SIZE / 2, screenY - 10);
                ctx.lineTo(screenX + TILE_SIZE, screenY);
                ctx.fill();
            } else if (tileType === TILE_TYPES.BUILDING) {
                // Draw door
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(screenX + TILE_SIZE / 2 - 5, screenY + TILE_SIZE - 15, 10, 15);
                
                // Draw window
                ctx.fillStyle = '#F0E68C';
                ctx.fillRect(screenX + 10, screenY + 10, 8, 8);
                ctx.fillRect(screenX + TILE_SIZE - 18, screenY + 10, 8, 8);
            }
        }
    }
} 