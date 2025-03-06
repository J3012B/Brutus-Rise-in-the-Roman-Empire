// Texture manager for handling game textures
const textureCache = new Map();

/**
 * Load an image from a URL and return a promise
 * @param {string} url - The URL of the image to load
 * @returns {Promise<HTMLImageElement>} - A promise that resolves with the loaded image
 */
export function loadImage(url) {
    return new Promise((resolve, reject) => {
        // Check if the image is already in the cache
        if (textureCache.has(url)) {
            resolve(textureCache.get(url));
            return;
        }
        
        // Create a new image
        const img = new Image();
        
        // Set up event handlers
        img.onload = () => {
            // Cache the loaded image
            textureCache.set(url, img);
            resolve(img);
        };
        
        img.onerror = () => {
            reject(new Error(`Failed to load image: ${url}`));
        };
        
        // Start loading the image
        img.src = url;
    });
}

/**
 * Create a cobblestone texture and return it as a data URL
 * @param {number} size - The size of the texture in pixels
 * @param {number} seed - Random seed for the texture
 * @returns {string} - The data URL of the texture
 */
export function createCobblestoneTexture(size, seed = 0) {
    // Create an off-screen canvas for the pattern
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = size;
    patternCanvas.height = size;
    const patternCtx = patternCanvas.getContext('2d');
    
    // Base color for the cobblestone
    patternCtx.fillStyle = '#A9A9A9';
    patternCtx.fillRect(0, 0, size, size);
    
    // Size of each cobblestone
    const stoneSize = Math.max(4, Math.floor(size / 10));
    const gap = 1;
    
    // Number of stones in a row/column
    const stonesPerRow = Math.floor(size / (stoneSize + gap));
    
    // Use a deterministic pattern based on position and seed
    for (let sy = 0; sy < stonesPerRow; sy++) {
        for (let sx = 0; sx < stonesPerRow; sx++) {
            // Calculate position of this stone
            const stoneX = sx * (stoneSize + gap) + gap;
            const stoneY = sy * (stoneSize + gap) + gap;
            
            // Deterministic color variation based on position and seed
            const colorVariation = ((sx * 7 + sy * 13) + seed * 17) % 30;
            
            // Base color
            const baseColor = 169; // A9A9A9
            
            const r = baseColor - colorVariation;
            const g = baseColor - colorVariation;
            const b = baseColor - colorVariation;
            
            patternCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            
            // Deterministic irregularity
            const irregularity = (Math.sin(sx * 0.7 + sy * 0.9 + seed) * 2 - 1) * 0.5;
            const actualSize = stoneSize + irregularity;
            
            patternCtx.fillRect(stoneX, stoneY, actualSize, actualSize);
            
            // Add highlights to some stones based on position
            if ((sx + sy + seed) % 3 === 0) {
                patternCtx.fillStyle = `rgba(255, 255, 255, 0.2)`;
                patternCtx.fillRect(stoneX, stoneY, actualSize / 2, actualSize / 2);
            }
        }
    }
    
    // Add mortar lines
    patternCtx.strokeStyle = '#777777';
    patternCtx.lineWidth = 0.5;
    
    // Horizontal mortar lines
    for (let i = 1; i < stonesPerRow; i++) {
        const lineY = i * (stoneSize + gap);
        patternCtx.beginPath();
        patternCtx.moveTo(0, lineY);
        patternCtx.lineTo(size, lineY);
        patternCtx.stroke();
    }
    
    // Vertical mortar lines
    for (let i = 1; i < stonesPerRow; i++) {
        const lineX = i * (stoneSize + gap);
        patternCtx.beginPath();
        patternCtx.moveTo(lineX, 0);
        patternCtx.lineTo(lineX, size);
        patternCtx.stroke();
    }
    
    // Return the texture as a data URL
    return patternCanvas.toDataURL('image/png');
}

/**
 * Generate and save cobblestone textures
 * @param {number} size - The size of each texture
 * @param {number} count - The number of variations to generate
 * @returns {Promise<HTMLImageElement[]>} - A promise that resolves with the loaded textures
 */
export async function generateCobblestoneTextures(size, count = 4) {
    const textures = [];
    
    // Generate variations
    for (let i = 0; i < count; i++) {
        const dataUrl = createCobblestoneTexture(size, i);
        
        // Cache the data URL
        const cacheKey = `cobblestone_${i}`;
        textureCache.set(cacheKey, dataUrl);
        
        // Load the image from the data URL
        try {
            const img = await loadImage(dataUrl);
            textures.push(img);
        } catch (error) {
            console.error(`Failed to load cobblestone texture ${i}:`, error);
        }
    }
    
    return textures;
}

/**
 * Get a cached texture by key
 * @param {string} key - The key of the texture to get
 * @returns {HTMLImageElement|null} - The texture, or null if not found
 */
export function getTexture(key) {
    return textureCache.get(key) || null;
}

/**
 * Clear the texture cache
 */
export function clearTextureCache() {
    textureCache.clear();
} 