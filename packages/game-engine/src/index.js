/**
 * @citymind/game-engine
 * Core engine exports: world, camera, rendering, audio, input, particle system.
 */

// World & Entities
export { Tile } from './world/Tile.js';
export { MapGrid } from './world/MapGrid.js';
export { Camera } from './world/Camera.js';
export { Pathfinder } from './world/Pathfinder.js';
export { EntityManager } from './entities/EntityManager.js';

// Input & Physics
export { InputManager } from './input/InputManager.js';
export { CameraPhysics } from './input/CameraPhysics.js';
export { InteractionController, TOOL_TYPES } from './input/InteractionController.js';

// Rendering Pipeline & Sub-renderers
export { CanvasRenderer } from './rendering/CanvasRenderer.js';
export { LayeredRenderer, RENDER_LAYERS } from './rendering/LayeredRenderer.js';
export { BuildingRenderer } from './rendering/BuildingRenderer.js';
export { VehicleRenderer, VEHICLE_TYPES } from './rendering/VehicleRenderer.js';
export { TerrainRenderer } from './rendering/TerrainRenderer.js';
export { ParticleEngine, Particle, ParticlePool, ParticleEmitter } from './rendering/ParticleEngine.js';

// Audio Synthesizer Engine
export { SoundEngine } from './audio/SoundEngine.js';

// Projection, Lighting & UI Manager
export * from './rendering/IsometricProjection.js';
export * from './rendering/LightingEngine.js';
export * from './ui/CanvasUIManager.js';

