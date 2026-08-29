import React from 'react';
import { useGameStore } from '../../store/gameStore';

/**
 * Heatmap Overlay Selector Component
 * Renders a floating map overlay control bar allowing players to toggle
 * spatial data visualizers across 12 urban diagnostic dimensions.
 */
export const HeatmapOverlaySelector = () => {
  const { overlayMode, setOverlayMode } = useGameStore();

  const overlays = [
    { id: 'none', label: 'Default View', icon: '🗺️', color: '#94a3b8' },
    { id: 'power', label: 'Power Grid', icon: '⚡', color: '#facc15' },
    { id: 'water', label: 'Water & Sewage', icon: '💧', color: '#38bdf8' },
    { id: 'telecom', label: '5G Telecom', icon: '📡', color: '#a855f7' },
    { id: 'traffic', label: 'Traffic Density', icon: '🚗', color: '#f87171' },
    { id: 'pollution', label: 'Air & Smog Pollution', icon: '🏭', color: '#fb923c' },
    { id: 'crime', label: 'Crime Risk', icon: '🚨', color: '#ef4444' },
    { id: 'land_value', label: 'Land Value', icon: '💎', color: '#34d399' },
    { id: 'health', label: 'Healthcare Access', icon: '🏥', color: '#4ade80' },
    { id: 'education', label: 'Education Quality', icon: '🎓', color: '#60a5fa' },
    { id: 'fire_risk', label: 'Fire Hazard', icon: '🔥', color: '#f97316' },
    { id: 'noise', label: 'Noise Pollution', icon: '🔊', color: '#e879f9' },
  ];

  return (
    <div style={containerStyle}>
      <div style={titleStyle}>MAP OVERLAY HEATMAPS</div>
      <div style={gridStyle}>
        {overlays.map((ov) => {
          const isSelected = overlayMode === ov.id;
          return (
            <button
              key={ov.id}
              onClick={() => setOverlayMode(ov.id)}
              style={{
                ...buttonStyle,
                border: isSelected ? `2px solid ${ov.color}` : '1px solid #334155',
                background: isSelected ? '#1e293b' : '#0f172a',
                color: isSelected ? '#f8fafc' : '#94a3b8',
              }}
              title={`Toggle ${ov.label} spatial overlay`}
            >
              <span style={{ fontSize: '14px', marginRight: '6px' }}>{ov.icon}</span>
              <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{ov.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const containerStyle = {
  position: 'absolute',
  top: '70px',
  right: '20px',
  background: 'rgba(15, 23, 42, 0.90)',
  backdropFilter: 'blur(8px)',
  border: '1px solid #334155',
  borderRadius: '10px',
  padding: '12px',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
  zIndex: 100,
  maxWidth: '320px',
};

const titleStyle = {
  fontSize: '10px',
  fontWeight: 'bold',
  letterSpacing: '1px',
  color: '#38bdf8',
  marginBottom: '8px',
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '6px',
};

const buttonStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '6px 8px',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  textAlign: 'left',
};

export default HeatmapOverlaySelector;
