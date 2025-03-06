import { TILE_SIZE, COIN_VALUE } from './constants.js';
import { updateScore } from './utility.js';

// Camera control
export function updateCamera(player, canvas, mapWidth, mapHeight, cameraOffsetX, cameraOffsetY) {
    // Center the camera on the player
    const canvasCenterX = canvas.width / 2;
    const canvasCenterY = canvas.height / 2;
    
    let newCameraOffsetX = player.x + player.width / 2 - canvasCenterX;
    let newCameraOffsetY = player.y + player.height / 2 - canvasCenterY;
    
    // Clamp camera to map boundaries
    const maxOffsetX = mapWidth * TILE_SIZE - canvas.width;
    const maxOffsetY = mapHeight * TILE_SIZE - canvas.height;
    
    newCameraOffsetX = Math.max(0, Math.min(newCameraOffsetX, maxOffsetX));
    newCameraOffsetY = Math.max(0, Math.min(newCameraOffsetY, maxOffsetY));
    
    return { cameraOffsetX: newCameraOffsetX, cameraOffsetY: newCameraOffsetY };
}

// Spawn coins
export function spawnCoins(count, mapWidth, mapHeight, gameMap, tileTypes, tileSize) {
    const coins = [];
    for (let i = 0; i < count; i++) {
        let x, y;
        // Spawn coins at random positions, but not on water
        do {
            x = Math.floor(Math.random() * mapWidth);
            y = Math.floor(Math.random() * mapHeight);
        } while (gameMap[y][x] === tileTypes.WATER);
        
        coins.push({
            x: x * tileSize + tileSize / 4,
            y: y * tileSize + tileSize / 4,
            width: 15,
            height: 15,
            color: '#FFD700'
        });
    }
    return coins;
}

// Check collisions
export function checkCollisions(player, coins, score, spawnNewCoin) {
    let newScore = score;
    let coinsToRemove = [];
    
    // Check for coin collisions
    for (let i = coins.length - 1; i >= 0; i--) {
        if (player.intersects(coins[i])) {
            newScore += COIN_VALUE;
            coinsToRemove.push(i);
            
            // Spawn a new coin
            if (coins.length - coinsToRemove.length < 15) {
                spawnNewCoin();
            }
        }
    }
    
    // Remove collected coins
    for (let i = coinsToRemove.length - 1; i >= 0; i--) {
        coins.splice(coinsToRemove[i], 1);
    }
    
    // Update score display
    updateScore(newScore);
    
    return newScore;
}

// Fullscreen functions
export function enterFullscreen(gameContainer, canvas) {
    try {
        gameContainer.classList.add('fullscreen-mode');
        
        // Force the canvas to take up the entire screen
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        
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
        
        return true;
    } catch (error) {
        console.error(`Error entering fullscreen mode: ${error.message}`);
        return false;
    }
}

export function exitFullscreen(gameContainer, canvas, gameWidth, gameHeight) {
    try {
        gameContainer.classList.remove('fullscreen-mode');
        
        // Reset canvas style
        canvas.style.width = '';
        canvas.style.height = '';
        
        // Reset canvas size
        canvas.width = gameWidth;
        canvas.height = gameHeight;
        
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
        
        return false;
    } catch (error) {
        console.error(`Error exiting fullscreen mode: ${error.message}`);
        return true;
    }
}

export function handleFullscreenChange(isFullscreen) {
    // Check if browser is in fullscreen mode
    const isInFullscreen = document.fullscreenElement || 
                          document.webkitFullscreenElement || 
                          document.mozFullScreenElement || 
                          document.msFullscreenElement;
    
    // If browser exited fullscreen but our game still thinks it's in fullscreen
    if (!isInFullscreen && isFullscreen) {
        return false;
    }
    
    return isFullscreen;
}

export function resizeCanvas(isFullscreen, canvas, gameWidth, gameHeight) {
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
    } else {
        // Reset to default size
        canvas.width = gameWidth;
        canvas.height = gameHeight;
        canvas.style.width = '';
        canvas.style.height = '';
    }
} 