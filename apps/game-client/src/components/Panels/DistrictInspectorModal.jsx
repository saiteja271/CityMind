import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';

/**
 * District Inspector Modal Component
 * Displays localized municipal stats for a designated city district:
 * Local Population, District Happiness, Crime Rate, Local Tax Modifier,
 * District Policies, Zoning Distribution, and Special Ordinances.
 */
export const DistrictInspectorModal = () => {
  const { selectedEntity, closeModal } = useGameStore();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'policies', 'zoning', 'taxation'

  const district = selectedEntity?.type === 'district' ? selectedEntity.data : {
    id: 'dist-04',
    name: 'Harbor Tech & Innovation District',
    mayor: 'Councilor Sarah Sterling',
    population: 4850,
    areaTiles: 144,
    happiness: 82,
    crimeRate: 6.4,
    healthIndex: 88,
    educationLevel: 91,
    landValueAvg: '$420/sqm',
    pollutionPpm: 12,
    taxModifier: 0.0, // % offset from citywide tax
    activeOrdinances: [
      { id: 'dist_noise_limit', name: 'Quiet Night Ordinance (10 PM - 7 AM)', impact: '-15% Noise, +5% Happiness' },
      { id: 'dist_tech_sub', name: 'Local Start-up Tax Exemption', impact: '+30% Commercial Growth' },
    ],
    zones: {
      residential: 40,
      commercial: 35,
      industrial: 10,
      parks: 15,
    },
  };

  return (
    <div className="modal-overlay" style={modalOverlayStyle}>
      <div className="modal-content" style={modalContentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#f8fafc' }}>
              📍 {district.name}
            </h2>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              District ID: {district.id} • Representative: {district.mayor} • Area: {district.areaTiles} tiles
            </span>
          </div>
          <button onClick={closeModal} style={closeButtonStyle}>✕</button>
        </div>

        {/* Navigation Tabs */}
        <div style={tabBarStyle}>
          {['overview', 'policies', 'zoning', 'taxation'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...tabButtonStyle,
                borderBottom: activeTab === tab ? '2px solid #38bdf8' : '2px solid transparent',
                color: activeTab === tab ? '#38bdf8' : '#94a3b8',
              }}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div style={{ padding: '20px', overflowY: 'auto', maxHeight: '480px' }}>
          {activeTab === 'overview' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={cardStyle}>
                  <div style={cardTitleStyle}>Demographics & Happiness</div>
                  <div style={rowStyle}><span>District Population:</span><strong style={{ color: '#38bdf8' }}>{district.population.toLocaleString()}</strong></div>
                  <div style={rowStyle}><span>District Happiness:</span><strong style={{ color: '#4ade80' }}>{district.happiness}%</strong></div>
                  <div style={rowStyle}><span>Average Property Value:</span><strong style={{ color: '#facc15' }}>{district.landValueAvg}</strong></div>
                </div>

                <div style={cardStyle}>
                  <div style={cardTitleStyle}>Local Public Services</div>
                  <div style={rowStyle}><span>Local Crime Rate:</span><strong style={{ color: '#4ade80' }}>{district.crimeRate}% (Low)</strong></div>
                  <div style={rowStyle}><span>Healthcare Access:</span><strong style={{ color: '#38bdf8' }}>{district.healthIndex}%</strong></div>
                  <div style={rowStyle}><span>Education Quality:</span><strong style={{ color: '#a855f7' }}>{district.educationLevel}%</strong></div>
                </div>
              </div>

              <div style={cardStyle}>
                <div style={cardTitleStyle}>Active District Ordinances</div>
                {district.activeOrdinances.map((ord) => (
                  <div key={ord.id} style={{ marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid #334155' }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#f8fafc' }}>{ord.name}</div>
                    <div style={{ fontSize: '11px', color: '#4ade80' }}>{ord.impact}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'policies' && (
            <div>
              <h4 style={{ color: '#f8fafc', marginTop: 0 }}>District Policy Enactment</h4>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                Policies enacted here apply exclusively to tiles within {district.name}.
              </p>
              <div style={cardStyle}>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '8px' }}>Available District Laws</div>
                <div style={rowStyle}><span>Heavy Truck Speed Limit (30 km/h)</span><button style={btnStyle}>Enact</button></div>
                <div style={rowStyle}><span>High-Density Residential Zoning Permit</span><button style={btnStyle}>Enact</button></div>
                <div style={rowStyle}><span>District Organic Waste Composting</span><button style={btnStyle}>Enact</button></div>
              </div>
            </div>
          )}

          {activeTab === 'zoning' && (
            <div>
              <h4 style={{ color: '#f8fafc', marginTop: 0 }}>Zoning Ratio Breakdown</h4>
              <div style={cardStyle}>
                <div style={rowStyle}><span>Residential Zones</span><strong>{district.zones.residential}%</strong></div>
                <div style={rowStyle}><span>Commercial Zones</span><strong>{district.zones.commercial}%</strong></div>
                <div style={rowStyle}><span>Industrial Zones</span><strong>{district.zones.industrial}%</strong></div>
                <div style={rowStyle}><span>Parks & Green Belts</span><strong>{district.zones.parks}%</strong></div>
              </div>
            </div>
          )}

          {activeTab === 'taxation' && (
            <div>
              <h4 style={{ color: '#f8fafc', marginTop: 0 }}>District Tax Offset</h4>
              <div style={cardStyle}>
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Adjust local tax rates relative to citywide baselines to incentivize investment in this district.
                </p>
                <div style={rowStyle}><span>District Tax Offset:</span><strong>{district.taxModifier >= 0 ? `+${district.taxModifier}%` : `${district.taxModifier}%`}</strong></div>
                <input type="range" min="-5" max="5" defaultValue="0" style={{ width: '100%', accentColor: '#38bdf8' }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
};

const modalContentStyle = {
  width: '560px', maxHeight: '85vh', backgroundColor: '#0f172a',
  border: '1px solid #334155', borderRadius: '12px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
  display: 'flex', flexDirection: 'column', overflow: 'hidden',
};

const headerStyle = {
  padding: '16px 20px', borderBottom: '1px solid #1e293b',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#182234',
};

const closeButtonStyle = { background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' };
const tabBarStyle = { display: 'flex', background: '#1e293b', borderBottom: '1px solid #334155', padding: '0 12px' };
const tabButtonStyle = { background: 'transparent', border: 'none', padding: '10px 16px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' };
const cardStyle = { background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '14px' };
const cardTitleStyle = { fontSize: '12px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '8px', textTransform: 'uppercase' };
const rowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' };
const btnStyle = { padding: '4px 10px', borderRadius: '4px', background: '#0284c7', color: '#fff', border: 'none', fontSize: '11px', cursor: 'pointer' };

export default DistrictInspectorModal;
