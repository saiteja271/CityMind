import React from 'react';
import { useGameStore } from '../../store/gameStore.js';
import { formatCurrency, formatNumber, formatPercent } from '@citymind/utilities';

export default function StatsPanel() {
  const { simulation, toggleStats, hudStats } = useGameStore();
  if (!simulation || !hudStats) return null;

  const cit = simulation.citizens.getStats();
  const eco = simulation.economy.getStats();
  const bld = simulation.buildings.getStats();
  const map = simulation.map.getStats();

  const section = { marginBottom: '1rem' };
  const row = { display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', fontSize: '0.9rem' };

  return (
    <div className="panel" style={{
      position: 'absolute', top: 56, left: 12, width: 300, maxHeight: 'calc(100% - 80px)',
      overflowY: 'auto', zIndex: 90, background: 'rgba(26,35,50,0.96)'
    }}>
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>City Statistics</span>
        <button className="secondary" onClick={toggleStats} style={{ padding: '0.2rem 0.5rem' }}>✕</button>
      </div>
      <div style={section}>
        <strong>Population</strong>
        <div style={row}><span>Total</span><span>{formatNumber(cit.total)}</span></div>
        <div style={row}><span>Employed</span><span>{formatNumber(cit.employed)}</span></div>
        <div style={row}><span>Unemployed</span><span>{formatNumber(cit.unemployed)} ({formatPercent(cit.unemploymentRate)})</span></div>
        <div style={row}><span>Homeless</span><span>{formatNumber(cit.homeless)}</span></div>
        <div style={row}><span>Avg Happiness</span><span>{cit.averageHappiness.toFixed(1)}</span></div>
        <div style={row}><span>Avg Age</span><span>{cit.averageAge.toFixed(1)}</span></div>
      </div>
      <div style={section}>
        <strong>Economy</strong>
        <div style={row}><span>Budget</span><span>{formatCurrency(eco.budget)}</span></div>
        <div style={row}><span>Tax Rate</span><span>{formatPercent(eco.taxRate)}</span></div>
        <div style={row}><span>Last Revenue</span><span>{formatCurrency(eco.lastMonthRevenue)}</span></div>
        <div style={row}><span>Last Expenses</span><span>{formatCurrency(eco.lastMonthExpenses)}</span></div>
      </div>
      <div style={section}>
        <strong>Buildings</strong>
        <div style={row}><span>Total</span><span>{bld.total}</span></div>
        <div style={row}><span>Housing Capacity</span><span>{bld.housingCapacity}</span></div>
        <div style={row}><span>Jobs</span><span>{bld.filledJobs} / {bld.totalJobs}</span></div>
      </div>
      <div style={section}>
        <strong>Environment</strong>
        <div style={row}><span>Pollution</span><span>{(simulation.environment.pollution || 0).toFixed(1)}</span></div>
        <div style={row}><span>Weather</span><span>{simulation.environment.weather}</span></div>
        <div style={row}><span>Road Tiles</span><span>{map.roadCount}</span></div>
      </div>
    </div>
  );
}
