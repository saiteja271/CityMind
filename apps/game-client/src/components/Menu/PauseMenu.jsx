import React from 'react';
import { useGameStore } from '../../store/gameStore.js';

export default function PauseMenu() {
  const { togglePauseMenu, returnToMenu, simulation } = useGameStore();

  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200
    }}>
      <div className="panel" style={{ width: 300, textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Paused</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={togglePauseMenu}>Resume</button>
          <button className="secondary" disabled>Save Game</button>
          <button className="secondary" onClick={() => { togglePauseMenu(); returnToMenu(); }}>Main Menu</button>
        </div>
        {simulation && (
          <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {simulation.name} — {simulation.time.format()}
          </p>
        )}
      </div>
    </div>
  );
}
