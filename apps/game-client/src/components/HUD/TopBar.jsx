import React from 'react';
import { useGameStore } from '../../store/gameStore';

/**
 * TopBar HUD Component
 * Displays City Name, Population, Treasury, Happiness Index, Game Date/Time,
 * Weather condition indicator, Simulation Speed Controls, and Quick Action buttons.
 */
export const TopBar = () => {
  const {
    cityName,
    stats,
    gameTime,
    simSpeed,
    isPaused,
    setSimSpeed,
    togglePause,
    openModal,
    overlayMode,
  } = useGameStore();

  const formattedDate = `Year ${gameTime.year}, Month ${gameTime.month}, Day ${gameTime.day}`;
  const formattedTime = `${gameTime.hour.toString().padStart(2, '0')}:00`;

  const weatherIcons = {
    spring: '🌸 Clear Spring',
    summer: '☀️ Sunny Summer',
    autumn: '🍂 Breezy Autumn',
    winter: '❄️ Snowy Winter',
  };

  return (
    <div style={containerStyle}>
      {/* City Title & Population */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🏙️</span>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#f8fafc' }}>{cityName}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Pop: <strong style={{ color: '#38bdf8' }}>{stats.population.toLocaleString()}</strong> ({stats.populationGrowthRate > 0 ? `+${(stats.populationGrowthRate * 100).toFixed(1)}%` : '0%'})</div>
          </div>
        </div>
      </div>

      {/* Financial & Happiness Metrics */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Treasury</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: stats.treasury >= 0 ? '#4ade80' : '#f87171' }}>
              ${stats.treasury.toLocaleString()}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Happiness</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: stats.happiness >= 70 ? '#facc15' : '#f87171' }}>
              😊 {stats.happiness}%
            </div>
          </div>

          <div>
            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Power Demand</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#38bdf8' }}>
              ⚡ {stats.utilities.powerDemand} / {stats.utilities.powerCapacity} MW
            </div>
          </div>
        </div>
      </div>

      {/* Time & Weather Display */}
      <div style={sectionStyle}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#f8fafc' }}>
            ⏰ {formattedTime} | {formattedDate}
          </div>
          <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
            {weatherIcons[gameTime.season]}
          </div>
        </div>
      </div>

      {/* Simulation Speed & Controls */}
      <div style={{ ...sectionStyle, borderRight: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={togglePause}
            style={{
              ...controlButtonStyle,
              background: isPaused ? '#ef4444' : '#334155',
              color: '#fff',
            }}
            title={isPaused ? 'Resume Simulation' : 'Pause Simulation'}
          >
            {isPaused ? '▶️ Resume' : '⏸️ Pause'}
          </button>

          {[1, 2, 4, 8].map((spd) => (
            <button
              key={spd}
              onClick={() => setSimSpeed(spd)}
              style={{
                ...controlButtonStyle,
                background: !isPaused && simSpeed === spd ? '#0284c7' : '#1e293b',
                color: !isPaused && simSpeed === spd ? '#fff' : '#94a3b8',
                border: !isPaused && simSpeed === spd ? '1px solid #38bdf8' : '1px solid #334155',
              }}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const containerStyle = {
  position: 'absolute',
  top: 0, left: 0, right: 0,
  height: '60px',
  background: 'rgba(15, 23, 42, 0.92)',
  backdropFilter: 'blur(8px)',
  borderBottom: '1px solid #334155',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 20px',
  zIndex: 100,
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
};

const sectionStyle = {
  display: 'flex',
  alignItems: 'center',
  paddingRight: '16px',
  borderRight: '1px solid #334155',
  height: '36px',
};

const controlButtonStyle = {
  padding: '6px 12px',
  borderRadius: '6px',
  border: '1px solid #334155',
  fontSize: '12px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};

export default TopBar;
