import { PLAYER_SPEED, TILE_SIZE } from './constants.js';

// Base GameObject class
export class GameObject {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw(ctx, cameraOffsetX, cameraOffsetY) {
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

// Player class
export class Player extends GameObject {
    constructor(x, y) {
        super(x, y, 30, 30, '#8B4513');
        this.velocityX = 0;
        this.velocityY = 0;
        this.isMovingLeft = false;
        this.isMovingRight = false;
        this.isMovingUp = false;
        this.isMovingDown = false;
    }

    update(mapWidth, mapHeight, updateCamera) {
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
        const mapWidthPx = mapWidth * TILE_SIZE;
        const mapHeightPx = mapHeight * TILE_SIZE;
        
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > mapWidthPx) this.x = mapWidthPx - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > mapHeightPx) this.y = mapHeightPx - this.height;
        
        // Update camera to follow player
        updateCamera();
    }

    draw(ctx, cameraOffsetX, cameraOffsetY) {
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

// Coin class
export class Coin extends GameObject {
    constructor(x, y) {
        super(x, y, 15, 15, '#FFD700');
    }

    draw(ctx, cameraOffsetX, cameraOffsetY) {
        const screenX = this.x - cameraOffsetX;
        const screenY = this.y - cameraOffsetY;
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(screenX + this.width / 2, screenY + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
    }
} 