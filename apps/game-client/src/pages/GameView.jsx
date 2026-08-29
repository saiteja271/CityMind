import React, { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../store/gameStore.js';
import { Camera, CanvasRenderer, InputManager } from '@citymind/game-engine';
import { MAP, BUILDING_DEFS, TIME } from '@citymind/constants';
import HUD from '../components/HUD/HUD.jsx';
import BuildMenu from '../components/BuildMenu/BuildMenu.jsx';
import StatsPanel from '../components/Panels/StatsPanel.jsx';
import AdvisorPanel from '../components/Panels/AdvisorPanel.jsx';
import PauseMenu from '../components/Menu/PauseMenu.jsx';

export default function GameView() {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const inputRef = useRef(null);
  const lastTimeRef = useRef(performance.now());

  const {
    simulation, selectedTool, setSelectedTile, placeBuilding,
    updateHud, showBuildMenu, showStats, showAdvisor, pauseMenuOpen,
    togglePause, setSpeed, addNotification
  } = useGameStore();

  const initEngine = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !simulation) return;

    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const camera = new Camera({
      viewportWidth: rect.width,
      viewportHeight: rect.height,
      mapWidth: simulation.map.width * MAP.TILE_SIZE,
      mapHeight: simulation.map.height * MAP.TILE_SIZE
    });
    camera.centerOnTile(
      Math.floor(simulation.map.width / 2),
      Math.floor(simulation.map.height / 2)
    );
    cameraRef.current = camera;

    const renderer = new CanvasRenderer(canvas, camera);
    rendererRef.current = renderer;

    const input = new InputManager(canvas);
    input.bind();
    inputRef.current = input;

    input.on('mousemove', ({ x, y, dx, dy, dragging }) => {
      if (dragging && input.isMouseDown(1) || (dragging && input.isKeyDown(' '))) {
        camera.panImmediate(-dx, -dy);
      }
      const tile = camera.screenToTile(x, y);
      renderer.hoverTile = tile;
      if (selectedTool) {
        renderer.buildPreview = { type: selectedTool, x: tile.x, y: tile.y };
      } else {
        renderer.buildPreview = null;
      }
    });

    input.on('click', ({ x, y, button }) => {
      if (button !== 0) return;
      const tile = camera.screenToTile(x, y);
      setSelectedTile(tile);
      renderer.selectedTile = tile;
      const tool = useGameStore.getState().selectedTool;
      if (tool) {
        const result = placeBuilding(tool, tile.x, tile.y);
        if (result.success) {
          addNotification(`Built ${BUILDING_DEFS[tool]?.name || tool}`, 'success');
        } else {
          addNotification(result.reason || 'Cannot build here', 'error');
        }
      }
    });

    input.on('wheel', ({ x, y, deltaY }) => {
      camera.zoomAt(x, y, deltaY > 0 ? -0.1 : 0.1);
    });

    // Game loop
    const loop = (now) => {
      const dt = now - lastTimeRef.current;
      lastTimeRef.current = now;

      // Keyboard pan
      const speed = MAP.CAMERA_SPEED * (dt / 16);
      if (input.isKeyDown('w') || input.isKeyDown('arrowup')) camera.panImmediate(0, -speed);
      if (input.isKeyDown('s') || input.isKeyDown('arrowdown')) camera.panImmediate(0, speed);
      if (input.isKeyDown('a') || input.isKeyDown('arrowleft')) camera.panImmediate(-speed, 0);
      if (input.isKeyDown('d') || input.isKeyDown('arrowright')) camera.panImmediate(speed, 0);

      camera.update(dt / 16);
      simulation.update(dt);
      renderer.render(simulation.map);
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);

    // HUD update interval
    const hudInterval = setInterval(updateHud, 500);

    return () => {
      cancelAnimationFrame(frameRef.current);
      input.unbind();
      clearInterval(hudInterval);
    };
  }, [simulation]);

  useEffect(() => {
    const cleanup = initEngine();
    return cleanup;
  }, [initEngine]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') useGameStore.getState().togglePauseMenu();
      if (e.key === ' ') { e.preventDefault(); togglePause(); }
      if (e.key === '1') setSpeed(TIME.SPEEDS.NORMAL);
      if (e.key === '2') setSpeed(TIME.SPEEDS.FAST);
      if (e.key === '3') setSpeed(TIME.SPEEDS.FASTER);
      if (e.key === '4') setSpeed(TIME.SPEEDS.FASTEST);
      if (e.key === 'b') useGameStore.getState().toggleBuildMenu();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Update build preview when tool changes
  useEffect(() => {
    if (rendererRef.current) {
      if (!selectedTool) rendererRef.current.buildPreview = null;
    }
  }, [selectedTool]);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      <HUD />
      {showBuildMenu && <BuildMenu />}
      {showStats && <StatsPanel />}
      {showAdvisor && <AdvisorPanel />}
      {pauseMenuOpen && <PauseMenu />}
    </div>
  );
}
