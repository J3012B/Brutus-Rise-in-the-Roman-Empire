import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE, TILE_TYPES, TILE_COLORS } from './modules/constants.js';
import { errorHandler, calculateMapSize, updateScore } from './modules/utility.js';
import { Player, Coin } from './modules/gameObjects.js';
import { generateRomeMap, drawMap } from './modules/mapGenerator.js';
import * as GameController from './modules/gameController.js';

// Game variables
let canvas, ctx;
let gameRunning = false;
let score = 0;
let animationId;
let lastTimestamp = 0;
let player, coins = [];
let isFullscreen = true; // Start in fullscreen by default
let gameMap = [];
let cameraOffsetX = 0;
let cameraOffsetY = 0;
let mapWidth = 30; // Initial value, will be recalculated
let mapHeight = 20; // Initial value, will be recalculated

// Initialize game
function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Calculate map size based on screen dimensions
    const mapSize = calculateMapSize(TILE_SIZE);
    mapWidth = mapSize.mapWidth;
    mapHeight = mapSize.mapHeight;
    
    // Generate the map
    gameMap = generateRomeMap(mapWidth, mapHeight);
    
    // Create player in the center of the map
    const playerX = Math.floor(mapWidth / 2) * TILE_SIZE;
    const playerY = Math.floor(mapHeight / 2) * TILE_SIZE;
    player = new Player(playerX, playerY);
    
    // Reset game state
    coins = [];
    score = 0;
    updateScore(score);
    
    // Add initial coins
    spawnCoins(10);
    
    // Set up event listeners
    setupEventListeners();
    
    // Enter fullscreen by default
    if (isFullscreen) {
        setTimeout(() => {
            enterFullscreen();
            // Start the game immediately
            startGame();
        }, 100);
    }
}

// Spawn coins
function spawnCoins(count) {
    const newCoins = GameController.spawnCoins(
        count, 
        mapWidth, 
        mapHeight, 
        gameMap, 
        TILE_TYPES, 
        TILE_SIZE
    );
    
    // Convert plain objects to Coin instances
    newCoins.forEach(coinData => {
        const coin = new Coin(coinData.x, coinData.y);
        coins.push(coin);
    });
}

// Set up event listeners
function setupEventListeners() {
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (!gameRunning) {
            // If game is not running, any key press will start it
            startGame();
            return;
        }
        
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                player.isMovingLeft = true;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                player.isMovingRight = true;
                break;
            case 'ArrowUp':
            case 'w':
            case 'W':
                player.isMovingUp = true;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                player.isMovingDown = true;
                break;
            case 'Escape':
                if (isFullscreen) {
                    exitFullscreen();
                }
                break;
        }
    });

    document.addEventListener('keyup', (e) => {
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                player.isMovingLeft = false;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                player.isMovingRight = false;
                break;
            case 'ArrowUp':
            case 'w':
            case 'W':
                player.isMovingUp = false;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                player.isMovingDown = false;
                break;
        }
    });

    // Handle browser fullscreen change
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    // Double click on canvas to toggle fullscreen
    canvas.addEventListener('dblclick', () => {
        if (isFullscreen) {
            exitFullscreen();
        } else {
            enterFullscreen();
        }
    });
    
    // Click anywhere to start the game
    document.addEventListener('click', () => {
        if (!gameRunning) {
            startGame();
        }
    });
}

// Update camera position
function updateCameraPosition() {
    const cameraPosition = GameController.updateCamera(
        player, 
        canvas, 
        mapWidth, 
        mapHeight, 
        cameraOffsetX, 
        cameraOffsetY
    );
    
    cameraOffsetX = cameraPosition.cameraOffsetX;
    cameraOffsetY = cameraPosition.cameraOffsetY;
}

// Game control functions
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        lastTimestamp = performance.now();
        gameLoop(lastTimestamp);
    }
}

function pauseGame() {
    gameRunning = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

function restartGame() {
    pauseGame();
    initGame();
    startGame();
}

function enterFullscreen() {
    isFullscreen = GameController.enterFullscreen(
        document.querySelector('.game-container'), 
        canvas
    );
    
    // Resize canvas for fullscreen
    GameController.resizeCanvas(isFullscreen, canvas, GAME_WIDTH, GAME_HEIGHT);
    
    // Recalculate map size
    const mapSize = calculateMapSize(TILE_SIZE);
    mapWidth = mapSize.mapWidth;
    mapHeight = mapSize.mapHeight;
    
    // Regenerate the map if needed
    if (gameMap.length === 0 || gameMap[0].length === 0) {
        gameMap = generateRomeMap(mapWidth, mapHeight);
    }
}

function exitFullscreen() {
    isFullscreen = GameController.exitFullscreen(
        document.querySelector('.game-container'), 
        canvas, 
        GAME_WIDTH, 
        GAME_HEIGHT
    );
}

function handleFullscreenChange() {
    isFullscreen = GameController.handleFullscreenChange(isFullscreen);
}

// Game loop
function gameLoop(timestamp) {
    if (!gameRunning) return;
    
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the map
    drawMap(ctx, gameMap, cameraOffsetX, cameraOffsetY, canvas, TILE_COLORS);
    
    // Update game objects
    player.update(mapWidth, mapHeight, updateCameraPosition);
    
    // Check for collisions
    score = GameController.checkCollisions(player, coins, score, () => spawnCoins(1));
    
    // Draw game objects
    player.draw(ctx, cameraOffsetX, cameraOffsetY);
    coins.forEach(coin => coin.draw(ctx, cameraOffsetX, cameraOffsetY));
    
    // Continue game loop
    animationId = requestAnimationFrame(gameLoop);
}

// Handle window resize
window.addEventListener('resize', () => {
    if (isFullscreen) {
        GameController.resizeCanvas(isFullscreen, canvas, GAME_WIDTH, GAME_HEIGHT);
        
        // Recalculate map size
        const mapSize = calculateMapSize(TILE_SIZE);
        mapWidth = mapSize.mapWidth;
        mapHeight = mapSize.mapHeight;
    }
    updateCameraPosition();
});

// Initialize the game when the page loads
window.addEventListener('load', () => {
    try {
        initGame();
    } catch (error) {
        errorHandler(error, "Error initializing game");
    }
}); 