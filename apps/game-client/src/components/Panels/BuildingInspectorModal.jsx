import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';

/**
 * Building Inspector Modal Component
 * Renders building stats, efficiency status, worker/resident capacity list,
 * power & water connectivity, upgrade tier options, and demolition actions.
 */
export const BuildingInspectorModal = () => {
  const { selectedEntity, closeModal, stats } = useGameStore();
  const [activeTab, setActiveTab] = useState('status'); // 'status', 'occupants', 'upgrades', 'maintenance'

  const building = selectedEntity?.type === 'building' ? selectedEntity.data : {
    id: 'bld-55219',
    name: 'High-Tech Solar Power Substation',
    category: 'Infrastructure',
    level: 2,
    maxLevel: 5,
    condition: 94,
    efficiency: 98,
    powerProduced: 120,
    powerConsumed: 0,
    waterConsumed: 15,
    wasteProduced: 5,
    pollution: 2,
    occupancy: { current: 14, max: 20 },
    employees: [
      { name: 'Dr. Aris Thorne', role: 'Chief Engineer', salary: '$85,000' },
      { name: 'Maya Lin', role: 'Grid Operator', salary: '$62,000' },
      { name: 'Kaelen Voss', role: 'Maintenance Tech', salary: '$48,000' },
    ],
    upgrades: [
      { level: 3, name: 'Battery Array Extension', cost: 15000, effect: '+40 MW Power Storage', unlocked: false },
      { level: 4, name: 'AI Smart Grid Synchronizer', cost: 32000, effect: '+15% Grid Efficiency', unlocked: false },
      { level: 5, name: 'Fusion Hybrid Coupling', cost: 75000, effect: '+150 MW Clean Energy Output', unlocked: false },
    ],
    maintenanceCost: 450,
  };

  return (
    <div className="modal-overlay" style={modalOverlayStyle}>
      <div className="modal-content" style={modalContentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#f8fafc' }}>
              🏢 {building.name}
            </h2>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              ID: {building.id} • Category: {building.category} • Level {building.level} / {building.maxLevel}
            </span>
          </div>
          <button onClick={closeModal} style={closeButtonStyle}>✕</button>
        </div>

        {/* Navigation Tabs */}
        <div style={tabBarStyle}>
          {['status', 'occupants', 'upgrades', 'maintenance'].map((tab) => (
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

        {/* Body */}
        <div style={{ padding: '20px', overflowY: 'auto', maxHeight: '480px' }}>
          {activeTab === 'status' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={cardStyle}>
                  <div style={cardTitleStyle}>Operating Efficiency</div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4ade80', marginBottom: '4px' }}>
                    {building.efficiency}%
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Physical Condition: <strong style={{ color: '#38bdf8' }}>{building.condition}%</strong>
                  </div>
                </div>

                <div style={cardStyle}>
                  <div style={cardTitleStyle}>Utility Impact</div>
                  <div style={rowStyle}><span>Power Output:</span><strong style={{ color: '#facc15' }}>+{building.powerProduced} MW</strong></div>
                  <div style={rowStyle}><span>Water Demand:</span><strong style={{ color: '#38bdf8' }}>{building.waterConsumed} L/min</strong></div>
                  <div style={rowStyle}><span>Smog Emission:</span><strong style={{ color: '#fb923c' }}>{building.pollution} ppm</strong></div>
                </div>
              </div>

              <div style={cardStyle}>
                <div style={cardTitleStyle}>Capacity & Utilization</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span>Personnel Assigned</span>
                  <span>{building.occupancy.current} / {building.occupancy.max}</span>
                </div>
                <div style={{ height: '8px', background: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${(building.occupancy.current / building.occupancy.max) * 100}%`,
                      background: '#38bdf8',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'occupants' && (
            <div>
              <h4 style={{ color: '#f8fafc', marginTop: 0 }}>Assigned Employees & Personnel</h4>
              {building.employees.map((emp, idx) => (
                <div key={idx} style={{ ...cardStyle, marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#f8fafc' }}>{emp.name}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{emp.role}</div>
                  </div>
                  <div style={{ fontSize: '13px', color: '#4ade80', fontWeight: 'bold' }}>{emp.salary}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'upgrades' && (
            <div>
              <h4 style={{ color: '#f8fafc', marginTop: 0 }}>Building Upgrade Tree</h4>
              {building.upgrades.map((upg) => (
                <div key={upg.level} style={{ ...cardStyle, marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#38bdf8' }}>Level {upg.level}: {upg.name}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0' }}>{upg.effect}</div>
                      <div style={{ fontSize: '11px', color: '#facc15' }}>Cost: ${upg.cost.toLocaleString()}</div>
                    </div>
                    <button
                      style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        background: upg.unlocked ? '#334155' : '#0284c7',
                        color: '#fff',
                        border: 'none',
                        cursor: upg.unlocked ? 'default' : 'pointer',
                        fontWeight: 'bold',
                      }}
                    >
                      {upg.unlocked ? 'Purchased' : 'Upgrade'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div>
              <h4 style={{ color: '#f8fafc', marginTop: 0 }}>Maintenance & Management</h4>
              <div style={cardStyle}>
                <p>Monthly Maintenance Fee: <strong style={{ color: '#f87171' }}>${building.maintenanceCost}/mo</strong></p>
                <button
                  style={{
                    padding: '10px 16px',
                    borderRadius: '6px',
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    width: '100%',
                    marginTop: '12px',
                  }}
                >
                  💣 Demolish Building (-$500 Cleanup)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.75)',
  backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000,
};

const modalContentStyle = {
  width: '560px',
  maxHeight: '85vh',
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '12px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
  display: 'flex', flexDirection: 'column', overflow: 'hidden',
};

const headerStyle = {
  padding: '16px 20px',
  borderBottom: '1px solid #1e293b',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  background: '#182234',
};

const closeButtonStyle = {
  background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer',
};

const tabBarStyle = {
  display: 'flex', background: '#1e293b', borderBottom: '1px solid #334155', padding: '0 12px',
};

const tabButtonStyle = {
  background: 'transparent', border: 'none', padding: '10px 16px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer',
};

const cardStyle = {
  background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '14px',
};

const cardTitleStyle = {
  fontSize: '12px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '8px', textTransform: 'uppercase',
};

const rowStyle = {
  display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px',
};

export default BuildingInspectorModal;
