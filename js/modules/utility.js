// Error handler function
export const errorHandler = (error, message) => {
    console.error(`${message}: ${error.message}`);
    // Display error message to user if needed
};

// Calculate map size based on screen dimensions
export function calculateMapSize(tileSize) {
    // Get screen dimensions
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Calculate how many tiles can fit on screen (add extra tiles to ensure no whitespace)
    const mapWidth = Math.ceil(screenWidth / tileSize) + 2;
    const mapHeight = Math.ceil(screenHeight / tileSize) + 2;
    
    console.log(`Map size calculated: ${mapWidth}x${mapHeight} tiles`);
    
    return { mapWidth, mapHeight };
}

// Update score displays
export function updateScore(score) {
    // Update score displays (even though they're hidden)
    document.getElementById('score').textContent = score;
    document.getElementById('floatingScore').textContent = score;
} 