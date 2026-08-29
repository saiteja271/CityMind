import React from 'react';
import { useGameStore } from '../../store/gameStore';

/**
 * BottomToolbar HUD Component
 * Main Action bar for selecting active tools: Inspect, Zone Painter (R/C/I),
 * Road Building Tool, Building Placement Menu, Demolition, Policy Center,
 * Economy Dashboard, Advisor, and System Settings.
 */
export const BottomToolbar = () => {
  const { activeTool, setActiveTool, openModal, activeModal } = useGameStore();

  const tools = [
    { id: 'select', label: 'Inspect / Select', icon: '🔍', action: () => setActiveTool('select') },
    { id: 'zone_res', label: 'Zone Residential', icon: '🟢', action: () => setActiveTool('zone_res', { zoneType: 'residential' }) },
    { id: 'zone_com', label: 'Zone Commercial', icon: '🔵', action: () => setActiveTool('zone_com', { zoneType: 'commercial' }) },
    { id: 'zone_ind', label: 'Zone Industrial', icon: '🟡', action: () => setActiveTool('zone_ind', { zoneType: 'industrial' }) },
    { id: 'road', label: 'Build Road', icon: '🛣️', action: () => setActiveTool('road') },
    { id: 'build', label: 'Build Structures', icon: '🏗️', action: () => openModal('build_menu') },
    { id: 'demolish', label: 'Demolish Tool', icon: '🧹', action: () => setActiveTool('demolish') },
  ];

  const dashboards = [
    { id: 'economy', label: 'Financials', icon: '🏦', modal: 'economy' },
    { id: 'policy', label: 'City Policies', icon: '📜', modal: 'policy' },
    { id: 'advisor', label: 'CITYMIND Advisor', icon: '🤖', modal: 'advisor' },
    { id: 'achievements', label: 'Achievements', icon: '🏆', modal: 'achievements' },
    { id: 'audio_settings', label: 'Audio Settings', icon: '🔊', modal: 'audio_settings' },
  ];

  return (
    <div style={containerStyle}>
      {/* Primary Tool Buttons */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {tools.map((t) => {
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={t.action}
              style={{
                ...toolButtonStyle,
                background: isActive ? '#0284c7' : '#1e293b',
                border: isActive ? '1px solid #38bdf8' : '1px solid #334155',
                color: isActive ? '#fff' : '#cbd5e1',
              }}
            >
              <span style={{ fontSize: '16px' }}>{t.icon}</span>
              <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{t.label}</span>
            </button>
          );
        })}
      </div>

      <div style={{ width: '1px', height: '32px', background: '#334155', margin: '0 8px' }} />

      {/* Dashboard & Modal Launchers */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {dashboards.map((d) => {
          const isOpen = activeModal === d.modal;
          return (
            <button
              key={d.id}
              onClick={() => openModal(d.modal)}
              style={{
                ...toolButtonStyle,
                background: isOpen ? '#3b82f6' : '#0f172a',
                border: isOpen ? '1px solid #60a5fa' : '1px solid #334155',
                color: isOpen ? '#fff' : '#94a3b8',
              }}
            >
              <span style={{ fontSize: '16px' }}>{d.icon}</span>
              <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{d.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const containerStyle = {
  position: 'absolute',
  bottom: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(15, 23, 42, 0.92)',
  backdropFilter: 'blur(8px)',
  border: '1px solid #334155',
  borderRadius: '12px',
  padding: '8px 16px',
  display: 'flex',
  alignItems: 'center',
  zIndex: 100,
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
};

const toolButtonStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6px 12px',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  minWidth: '70px',
};

export default BottomToolbar;
