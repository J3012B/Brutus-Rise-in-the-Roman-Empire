// Game constants
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 400;
export const PLAYER_SPEED = 5;
export const COIN_VALUE = 10;

// Tile constants
export const TILE_SIZE = 40;

// Tile types
export const TILE_TYPES = {
    EMPTY: 0,
    ROAD: 1,
    BUILDING: 2,
    TEMPLE: 3,
    WALL: 4,
    WATER: 5
};

// Tile colors
export const TILE_COLORS = {
    [TILE_TYPES.EMPTY]: '#8B7355', // Dirt/ground
    [TILE_TYPES.ROAD]: '#A9A9A9', // Stone road
    [TILE_TYPES.BUILDING]: '#CD853F', // Wooden building
    [TILE_TYPES.TEMPLE]: '#F5F5DC', // Marble temple
    [TILE_TYPES.WALL]: '#696969', // Stone wall
    [TILE_TYPES.WATER]: '#4682B4'  // Water
}; 