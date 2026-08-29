import React, { useState } from 'react';

const styles = {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(160deg, #0a1628 0%, #1a2332 50%, #0f1a2e 100%)',
    position: 'relative',
    overflow: 'hidden'
  },
  title: {
    fontSize: '3.5rem',
    fontWeight: 700,
    letterSpacing: '0.15em',
    background: 'linear-gradient(135deg, #1a73e8, #34a853, #fbbc04)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '0.25rem'
  },
  tagline: {
    color: 'var(--text-muted)',
    fontSize: '1.1rem',
    marginBottom: '2.5rem'
  },
  menu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    width: 280
  },
  btn: {
    padding: '0.9rem 1.5rem',
    fontSize: '1rem',
    fontWeight: 600,
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text)',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    width: 320,
    padding: '1.5rem',
    background: 'var(--surface)',
    borderRadius: 12,
    border: '1px solid var(--border)'
  },
  label: { fontSize: '0.85rem', color: 'var(--text-muted)' }
};

export default function MainMenu({ onStart }) {
  const [view, setView] = useState('main');
  const [name, setName] = useState('New City');
  const [mode, setMode] = useState('sandbox');
  const [population, setPopulation] = useState(50);
  const [mapSize, setMapSize] = useState(80);

  if (view === 'new') {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>CITYMIND</h1>
        <p style={styles.tagline}>Build the city. Shape the society. Watch intelligence emerge.</p>
        <div style={styles.form}>
          <div>
            <div style={styles.label}>City Name</div>
            <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%' }} />
          </div>
          <div>
            <div style={styles.label}>Game Mode</div>
            <select value={mode} onChange={(e) => setMode(e.target.value)} style={{ width: '100%' }}>
              <option value="sandbox">Sandbox</option>
              <option value="scenario">Scenario</option>
              <option value="challenge">Challenge</option>
            </select>
          </div>
          <div>
            <div style={styles.label}>Map Size: {mapSize}×{mapSize}</div>
            <input type="range" min={40} max={120} value={mapSize}
              onChange={(e) => setMapSize(+e.target.value)} style={{ width: '100%' }} />
          </div>
          <div>
            <div style={styles.label}>Starting Population: {population}</div>
            <input type="range" min={10} max={200} value={population}
              onChange={(e) => setPopulation(+e.target.value)} style={{ width: '100%' }} />
          </div>
          <button onClick={() => onStart({ name, mode, mapWidth: mapSize, mapHeight: mapSize, population })}>
            Start Simulation
          </button>
          <button className="secondary" onClick={() => setView('main')}>Back</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>CITYMIND</h1>
      <p style={styles.tagline}>Build the city. Shape the society. Watch intelligence emerge.</p>
      <div style={styles.menu}>
        <button style={styles.btn} onClick={() => setView('new')}>New City</button>
        <button style={{ ...styles.btn, opacity: 0.6 }} disabled>Load Game</button>
        <button style={{ ...styles.btn, opacity: 0.6 }} disabled>Settings</button>
      </div>
      <p style={{ position: 'absolute', bottom: 24, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        CITYMIND v1.0 — AI-Driven Dynamic City Simulation
      </p>
    </div>
  );
}
