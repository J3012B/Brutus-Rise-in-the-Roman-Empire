// Game constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 400;
const PLAYER_SPEED = 5;
const COIN_VALUE = 10;

// Tile constants
const TILE_SIZE = 40;
// Map size will be determined dynamically based on screen size
let MAP_WIDTH = 30; // Initial value, will be recalculated
let MAP_HEIGHT = 20; // Initial value, will be recalculated

// Tile types
const TILE_TYPES = {
    EMPTY: 0,
    ROAD: 1,
    BUILDING: 2,
    TEMPLE: 3,
    WALL: 4,
    WATER: 5
};

// Tile colors
const TILE_COLORS = {
    [TILE_TYPES.EMPTY]: '#8B7355', // Dirt/ground
    [TILE_TYPES.ROAD]: '#A9A9A9', // Stone road
    [TILE_TYPES.BUILDING]: '#CD853F', // Wooden building
    [TILE_TYPES.TEMPLE]: '#F5F5DC', // Marble temple
    [TILE_TYPES.WALL]: '#696969', // Stone wall
    [TILE_TYPES.WATER]: '#4682B4'  // Water
};

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
let hideHUD = true; // Always hide HUD in this version

// Error handler function
const errorHandler = (error, message) => {
    console.error(`${message}: ${error.message}`);
    // Display error message to user if needed
};

// Game objects
class GameObject {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw() {
        // Draw relative to camera position
        const screenX = this.x - cameraOffsetX;
        const screenY = this.y - cameraOffsetY;
        
        ctx.fillStyle = this.color;
        ctx.fillRect(screenX, screenY, this.width, this.height);
    }

    update() {
        // Base update method, to be overridden
    }

    intersects(other) {
        return !(
            this.x + this.width < other.x ||
            other.x + other.width < this.x ||
            this.y + this.height < other.y ||
            other.y + other.height < this.y
        );
    }
}

class Player extends GameObject {
    constructor(x, y) {
        super(x, y, 30, 30, '#8B4513');
        this.velocityX = 0;
        this.velocityY = 0;
        this.isMovingLeft = false;
        this.isMovingRight = false;
        this.isMovingUp = false;
        this.isMovingDown = false;
    }

    update() {
        // Update velocity based on key presses
        this.velocityX = 0;
        this.velocityY = 0;
        
        if (this.isMovingLeft) this.velocityX = -PLAYER_SPEED;
        if (this.isMovingRight) this.velocityX = PLAYER_SPEED;
        if (this.isMovingUp) this.velocityY = -PLAYER_SPEED;
        if (this.isMovingDown) this.velocityY = PLAYER_SPEED;

        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Keep player within map bounds
        const mapWidthPx = MAP_WIDTH * TILE_SIZE;
        const mapHeightPx = MAP_HEIGHT * TILE_SIZE;
        
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > mapWidthPx) this.x = mapWidthPx - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > mapHeightPx) this.y = mapHeightPx - this.height;
        
        // Update camera to follow player
        updateCamera();
    }

    draw() {
        // Draw relative to camera position
        const screenX = this.x - cameraOffsetX;
        const screenY = this.y - cameraOffsetY;
        
        // Draw Roman soldier (simple version)
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(screenX, screenY, this.width, this.height);
        
        // Draw helmet
        ctx.fillStyle = '#CD853F';
        ctx.fillRect(screenX + 5, screenY - 5, this.width - 10, 5);
        
        // Draw shield
        ctx.fillStyle = '#A52A2A';
        ctx.fillRect(screenX - 5, screenY + 5, 5, this.height - 10);
    }
}

class Coin extends GameObject {
    constructor(x, y) {
        super(x, y, 15, 15, '#FFD700');
    }

    draw() {
        const screenX = this.x - cameraOffsetX;
        const screenY = this.y - cameraOffsetY;
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(screenX + this.width / 2, screenY + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Calculate map size based on screen dimensions
function calculateMapSize() {
    // Get screen dimensions
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Calculate how many tiles can fit on screen (add extra tiles to ensure no whitespace)
    MAP_WIDTH = Math.ceil(screenWidth / TILE_SIZE) + 2;
    MAP_HEIGHT = Math.ceil(screenHeight / TILE_SIZE) + 2;
    
    console.log(`Map size calculated: ${MAP_WIDTH}x${MAP_HEIGHT} tiles`);
}

// Initialize game
function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Calculate map size based on screen dimensions
    calculateMapSize();
    
    // Generate the map
    generateRomeMap();
    
    // Create player in the center of the map
    const playerX = Math.floor(MAP_WIDTH / 2) * TILE_SIZE;
    const playerY = Math.floor(MAP_HEIGHT / 2) * TILE_SIZE;
    player = new Player(playerX, playerY);
    
    // Reset game state
    coins = [];
    score = 0;
    updateScore();
    
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

function generateRomeMap() {
    // Initialize empty map
    gameMap = Array(MAP_HEIGHT).fill().map(() => Array(MAP_WIDTH).fill(TILE_TYPES.EMPTY));
    
    // Create main roads (Cardo and Decumanus)
    const cardoX = Math.floor(MAP_WIDTH / 2);
    const decumanusY = Math.floor(MAP_HEIGHT / 2);
    
    // Draw Cardo (North-South main road)
    for (let y = 0; y < MAP_HEIGHT; y++) {
        gameMap[y][cardoX] = TILE_TYPES.ROAD;
        gameMap[y][cardoX - 1] = TILE_TYPES.ROAD;
    }
    
    // Draw Decumanus (East-West main road)
    for (let x = 0; x < MAP_WIDTH; x++) {
        gameMap[decumanusY][x] = TILE_TYPES.ROAD;
        gameMap[decumanusY - 1][x] = TILE_TYPES.ROAD;
    }
    
    // Add secondary roads
    for (let i = 0; i < 5; i++) {
        // Vertical roads
        const roadX = Math.floor(Math.random() * MAP_WIDTH);
        for (let y = 0; y < MAP_HEIGHT; y++) {
            if (gameMap[y][roadX] !== TILE_TYPES.ROAD) {
                gameMap[y][roadX] = TILE_TYPES.ROAD;
            }
        }
        
        // Horizontal roads
        const roadY = Math.floor(Math.random() * MAP_HEIGHT);
        for (let x = 0; x < MAP_WIDTH; x++) {
            if (gameMap[roadY][x] !== TILE_TYPES.ROAD) {
                gameMap[roadY][x] = TILE_TYPES.ROAD;
            }
        }
    }
    
    // Add buildings
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            // If it's not a road and random chance
            if (gameMap[y][x] === TILE_TYPES.EMPTY && Math.random() < 0.3) {
                gameMap[y][x] = TILE_TYPES.BUILDING;
            }
        }
    }
    
    // Add temples at key intersections
    // Main temple at the center
    gameMap[decumanusY + 2][cardoX] = TILE_TYPES.TEMPLE;
    gameMap[decumanusY + 2][cardoX + 1] = TILE_TYPES.TEMPLE;
    gameMap[decumanusY + 3][cardoX] = TILE_TYPES.TEMPLE;
    gameMap[decumanusY + 3][cardoX + 1] = TILE_TYPES.TEMPLE;
    
    // Add a few more temples
    for (let i = 0; i < 3; i++) {
        const templeX = Math.floor(Math.random() * (MAP_WIDTH - 2));
        const templeY = Math.floor(Math.random() * (MAP_HEIGHT - 2));
        
        // 2x2 temple
        gameMap[templeY][templeX] = TILE_TYPES.TEMPLE;
        gameMap[templeY][templeX + 1] = TILE_TYPES.TEMPLE;
        gameMap[templeY + 1][templeX] = TILE_TYPES.TEMPLE;
        gameMap[templeY + 1][templeX + 1] = TILE_TYPES.TEMPLE;
    }
    
    // Add some water (Tiber river)
    const riverX = Math.floor(MAP_WIDTH / 4);
    for (let y = 0; y < MAP_HEIGHT; y++) {
        gameMap[y][riverX] = TILE_TYPES.WATER;
        gameMap[y][riverX + 1] = TILE_TYPES.WATER;
        
        // Make the river curve a bit
        if (y % 5 === 0 && riverX + 2 < MAP_WIDTH) {
            gameMap[y][riverX + 2] = TILE_TYPES.WATER;
        }
        if (y % 7 === 0 && riverX - 1 >= 0) {
            gameMap[y][riverX - 1] = TILE_TYPES.WATER;
        }
    }
}

function drawMap() {
    // Fill the entire canvas with the ground color first
    ctx.fillStyle = TILE_COLORS[TILE_TYPES.EMPTY];
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
            if (x < 0 || y < 0 || x >= MAP_WIDTH || y >= MAP_HEIGHT) continue;
            
            const tileType = gameMap[y][x];
            const screenX = x * TILE_SIZE - cameraOffsetX;
            const screenY = y * TILE_SIZE - cameraOffsetY;
            
            // Draw the tile
            ctx.fillStyle = TILE_COLORS[tileType];
            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
            
            // Draw tile borders
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
            
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

function updateCamera() {
    // Center the camera on the player
    const canvasCenterX = canvas.width / 2;
    const canvasCenterY = canvas.height / 2;
    
    cameraOffsetX = player.x + player.width / 2 - canvasCenterX;
    cameraOffsetY = player.y + player.height / 2 - canvasCenterY;
    
    // Clamp camera to map boundaries
    const maxOffsetX = MAP_WIDTH * TILE_SIZE - canvas.width;
    const maxOffsetY = MAP_HEIGHT * TILE_SIZE - canvas.height;
    
    cameraOffsetX = Math.max(0, Math.min(cameraOffsetX, maxOffsetX));
    cameraOffsetY = Math.max(0, Math.min(cameraOffsetY, maxOffsetY));
}

function spawnCoins(count) {
    for (let i = 0; i < count; i++) {
        let x, y;
        // Spawn coins at random positions, but not on water
        do {
            x = Math.floor(Math.random() * MAP_WIDTH);
            y = Math.floor(Math.random() * MAP_HEIGHT);
        } while (gameMap[y][x] === TILE_TYPES.WATER);
        
        coins.push(new Coin(x * TILE_SIZE + TILE_SIZE / 4, y * TILE_SIZE + TILE_SIZE / 4));
    }
}

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

function updateScore() {
    // Update score displays (even though they're hidden)
    document.getElementById('score').textContent = score;
    document.getElementById('floatingScore').textContent = score;
}

function checkCollisions() {
    // Check for coin collisions
    for (let i = coins.length - 1; i >= 0; i--) {
        if (player.intersects(coins[i])) {
            score += COIN_VALUE;
            updateScore();
            coins.splice(i, 1);
            
            // Spawn a new coin
            if (coins.length < 15) {
                spawnCoins(1);
            }
        }
    }
}

function gameLoop(timestamp) {
    if (!gameRunning) return;
    
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the map
    drawMap();
    
    // Update game objects
    player.update();
    
    // Check for collisions
    checkCollisions();
    
    // Draw game objects
    player.draw();
    coins.forEach(coin => coin.draw());
    
    // Continue game loop
    animationId = requestAnimationFrame(gameLoop);
}

// Fullscreen functions
function enterFullscreen() {
    try {
        const gameContainer = document.querySelector('.game-container');
        gameContainer.classList.add('fullscreen-mode');
        
        // Force the canvas to take up the entire screen
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        
        // Resize canvas for fullscreen
        resizeCanvas();
        
        // Request browser fullscreen if supported
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        }
        
        isFullscreen = true;
    } catch (error) {
        errorHandler(error, "Error entering fullscreen mode");
    }
}

function exitFullscreen() {
    try {
        const gameContainer = document.querySelector('.game-container');
        gameContainer.classList.remove('fullscreen-mode');
        
        // Reset canvas style
        canvas.style.width = '';
        canvas.style.height = '';
        
        // Reset canvas size
        canvas.width = GAME_WIDTH;
        canvas.height = GAME_HEIGHT;
        
        // Exit browser fullscreen if active
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        
        isFullscreen = false;
    } catch (error) {
        errorHandler(error, "Error exiting fullscreen mode");
    }
}

function handleFullscreenChange() {
    // Check if browser is in fullscreen mode
    const isInFullscreen = document.fullscreenElement || 
                          document.webkitFullscreenElement || 
                          document.mozFullScreenElement || 
                          document.msFullscreenElement;
    
    // If browser exited fullscreen but our game still thinks it's in fullscreen
    if (!isInFullscreen && isFullscreen) {
        exitFullscreen();
    }
}

function resizeCanvas() {
    if (isFullscreen) {
        // Get the actual screen dimensions
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // Set canvas dimensions to match the screen exactly
        canvas.width = screenWidth;
        canvas.height = screenHeight;
        
        // Force the canvas to take up the entire screen
        canvas.style.width = screenWidth + 'px';
        canvas.style.height = screenHeight + 'px';
        
        // Recalculate map size to ensure it fills the screen
        calculateMapSize();
        
        // Regenerate the map if needed
        if (gameMap.length === 0 || gameMap[0].length === 0) {
            generateRomeMap();
        }
    } else {
        // Reset to default size
        canvas.width = GAME_WIDTH;
        canvas.height = GAME_HEIGHT;
        canvas.style.width = '';
        canvas.style.height = '';
    }
}

// Handle window resize
window.addEventListener('resize', () => {
    if (isFullscreen) {
        resizeCanvas();
    }
    updateCamera();
});

// Initialize the game when the page loads
window.addEventListener('load', () => {
    try {
        initGame();
    } catch (error) {
        errorHandler(error, "Error initializing game");
    }
}); 