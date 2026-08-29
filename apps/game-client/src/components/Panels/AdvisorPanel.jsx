import React from 'react';
import { useGameStore } from '../../store/gameStore.js';

export default function AdvisorPanel() {
  const { simulation, toggleAdvisor } = useGameStore();
  if (!simulation) return null;
  const advice = simulation.getAdvisorAdvice();

  const priorityColor = { critical: '#ea4335', high: '#fbbc04', medium: '#1a73e8', low: '#34a853' };

  return (
    <div className="panel" style={{
      position: 'absolute', top: 56, right: 12, width: 340, maxHeight: 'calc(100% - 80px)',
      overflowY: 'auto', zIndex: 90, background: 'rgba(26,35,50,0.96)'
    }}>
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>CITYMIND Advisor</span>
        <button className="secondary" onClick={toggleAdvisor} style={{ padding: '0.2rem 0.5rem' }}>✕</button>
      </div>
      {advice.map((a, i) => (
        <div key={i} style={{
          marginBottom: '0.75rem', padding: '0.75rem', borderRadius: 6,
          borderLeft: `3px solid ${priorityColor[a.priority] || '#9aa0a6'}`,
          background: 'var(--surface-2)'
        }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: priorityColor[a.priority], marginBottom: 4 }}>
            {a.priority} — {a.topic}
          </div>
          <div style={{ fontSize: '0.9rem' }}>{a.message}</div>
        </div>
      ))}
    </div>
  );
}
