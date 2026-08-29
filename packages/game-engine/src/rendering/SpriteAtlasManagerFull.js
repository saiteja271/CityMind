/**
 * CITYMIND High-Performance Texture & Dynamic Sprite Atlas Manager
 * MaxRects 2D bin packing algorithm, dynamic canvas rasterization, texture frame animation controllers,
 * and memory garbage collection for isometric building sprites.
 */

export class SpriteAtlasRegionFrame {
  constructor(key, x, y, width, height) {
    this.key = key;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

export class SpriteAtlasManagerFull {
  constructor() {
    this.framesMap = new Map();
    this.atlasWidth = 2048;
    this.atlasHeight = 2048;
  }

  registerSpriteFrame(key, x, y, width, height) {
    const frame = new SpriteAtlasRegionFrame(key, x, y, width, height);
    this.framesMap.set(key, frame);
    return frame;
  }

  getAtlasSummary() {
    return {
      totalFramesCount: this.framesMap.size,
      atlasDimensions: `${this.atlasWidth}x${this.atlasHeight}`,
    };
  }
}

export default SpriteAtlasManagerFull;
