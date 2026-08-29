import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore.js';
import { BUILDING_DEFS, BUILDING_CATEGORY } from '@citymind/constants';
import { formatCurrency } from '@citymind/utilities';

const CATEGORIES = [
  { id: BUILDING_CATEGORY.RESIDENTIAL, label: 'Residential' },
  { id: BUILDING_CATEGORY.COMMERCIAL, label: 'Commercial' },
  { id: BUILDING_CATEGORY.INDUSTRIAL, label: 'Industrial' },
  { id: BUILDING_CATEGORY.PUBLIC, label: 'Public' },
  { id: BUILDING_CATEGORY.INFRASTRUCTURE, label: 'Infrastructure' },
  { id: BUILDING_CATEGORY.ENVIRONMENT, label: 'Environment' }
];

export default function BuildMenu() {
  const { setTool, selectedTool, toggleBuildMenu } = useGameStore();
  const [category, setCategory] = useState(BUILDING_CATEGORY.RESIDENTIAL);

  const buildings = Object.values(BUILDING_DEFS).filter((b) => b.category === category);

  return (
    <div style={{
      position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(26,35,50,0.96)', border: '1px solid var(--border)', borderRadius: 12,
      padding: '0.75rem', zIndex: 90, maxWidth: '90vw', backdropFilter: 'blur(8px)'
    }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
        {CATEGORIES.map((c) => (
          <button key={c.id} className={category === c.id ? '' : 'secondary'}
            onClick={() => setCategory(c.id)} style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}>
            {c.label}
          </button>
        ))}
        <button className="secondary" onClick={toggleBuildMenu} style={{ marginLeft: 'auto', fontSize: '0.8rem' }}>✕</button>
      </div>
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
        {buildings.map((b) => (
          <button key={b.id}
            className={selectedTool === b.id ? '' : 'secondary'}
            onClick={() => setTool(selectedTool === b.id ? null : b.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              minWidth: 90, padding: '0.5rem', fontSize: '0.75rem'
            }}>
            <span style={{ fontWeight: 600 }}>{b.name}</span>
            <span style={{ color: 'var(--text-muted)' }}>{formatCurrency(b.cost)}</span>
          </button>
        ))}
      </div>
      {selectedTool && (
        <div style={{ marginTop: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Selected: {BUILDING_DEFS[selectedTool]?.name} — Click on map to place. Right-click or Esc to cancel.
        </div>
      )}
    </div>
  );
}
