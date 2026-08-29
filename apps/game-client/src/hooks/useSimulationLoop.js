/**
 * useSimulationLoop - React hook wiring requestAnimationFrame to SimulationEngine updates.
 */
import { useEffect, useRef, useCallback } from 'react';

export function useSimulationLoop(simulation, { onTick, enabled = true } = {}) {
  const frameRef = useRef(null);
  const lastRef = useRef(performance.now());
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  const stop = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!simulation || !enabled) {
      stop();
      return;
    }
    const loop = (now) => {
      const dt = now - lastRef.current;
      lastRef.current = now;
      simulation.update(dt);
      if (onTickRef.current) onTickRef.current(simulation, dt);
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return stop;
  }, [simulation, enabled, stop]);

  return { stop };
}

export default useSimulationLoop;
