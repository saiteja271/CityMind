import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';

/**
 * Policy Center Modal Component
 * Renders City Ordinances and Municipal Laws categorized by domain:
 * Taxation, Environment, Social Welfare, Public Safety, Commerce, Infrastructure.
 * Players can enact, repeal, and manage policies while monitoring citizen approval.
 */
export const PolicyCenter = () => {
  const { activePolicies, togglePolicy, closeModal, stats } = useGameStore();
  const [activeCategory, setActiveCategory] = useState('environment'); // 'taxation', 'environment', 'welfare', 'safety', 'commerce', 'infrastructure'

  const policyCatalog = {
    environment: [
      { id: 'green_energy_incentive', name: 'Green Energy Subsidy', cost: 1500, approval: 82, desc: 'Provides tax rebates for buildings utilizing solar and wind micro-turbines. Reduces air pollution by 20%.' },
      { id: 'recycling_mandate', name: 'Mandatory Recycling Program', cost: 800, approval: 75, desc: 'Requires residential and commercial sorting of waste. Reduces landfill waste accumulation by 35%.' },
      { id: 'plastic_bag_ban', name: 'Single-Use Plastics Ban', cost: 200, approval: 68, desc: 'Bans plastic grocery bags in commercial districts. Reduces water pollution and improves city cleanliness.' },
      { id: 'carbon_tax_high', name: 'Heavy Industrial Carbon Tariff', cost: -3000, approval: 54, desc: 'Imposes heavy penalties on polluting factories. Generates tax revenue but lowers industrial growth by 12%.' },
    ],
    taxation: [
      { id: 'progressive_income_tax', name: 'Progressive Income Bracket Law', cost: -5000, approval: 60, desc: 'Increases tax rates on high earners to fund welfare. Raises tax income but slightly lowers high-income immigration.' },
      { id: 'small_biz_tax_break', name: 'Small Business Exemption', cost: 2200, approval: 88, desc: 'Lowers taxes for local commercial shops. Boosts commercial zone demand by 25%.' },
      { id: 'vacant_land_tax', name: 'Vacant Property Speculation Tax', cost: -1200, approval: 70, desc: 'Penalizes unbuilt zoned lots, encouraging landowners to construct rapidly.' },
    ],
    welfare: [
      { id: 'universal_basic_income', name: 'Universal Basic Income Pilot', cost: 12000, approval: 92, desc: 'Provides a monthly stipend to all citizens. Eliminates extreme poverty and boosts happiness by 15%.' },
      { id: 'free_public_transit', name: 'Free City Transit Act', cost: 3500, approval: 89, desc: 'Makes buses and subways 100% free. Reduces traffic congestion by 30% and air pollution.' },
      { id: 'senior_pension_topup', name: 'Senior Pension Guarantee', cost: 2400, approval: 95, desc: 'Supports elderly citizens with health and housing vouchers.' },
    ],
    safety: [
      { id: 'police_camera_network', name: 'Smart Surveillance Network', cost: 1800, approval: 62, desc: 'Deploys AI cameras across intersections. Reduces crime rate by 25% but lowers privacy satisfaction.' },
      { id: 'neighborhood_watch', name: 'Community Watch Subsidies', cost: 500, approval: 80, desc: 'Funds local volunteer patrol groups. Improves neighborhood safety at low cost.' },
      { id: 'youth_curfew_law', name: 'Nighttime Youth Curfew', cost: 300, approval: 50, desc: 'Restricts juvenile activity after 10 PM. Lowers vandalism but causes youth discontent.' },
    ],
    commerce: [
      { id: 'tech_incubator_grant', name: 'Tech Innovation Incubator', cost: 4000, approval: 85, desc: 'Attracts high-tech offices, research labs, and educated university graduates.' },
      { id: 'tourism_marketing', name: 'Global Tourism Campaign', cost: 2500, approval: 78, desc: 'Promotes city landmarks and hotels. Increases commercial revenue by 18%.' },
    ],
    infrastructure: [
      { id: 'smart_grid_upgrade', name: 'AI Power Grid Load Balancer', cost: 5000, approval: 84, desc: 'Optimizes electrical distribution, preventing blackout cascades during peak demand.' },
      { id: 'water_metering_act', name: 'Smart Water Meter Mandate', cost: 1200, approval: 65, desc: 'Encourages water conservation, lowering municipal water production costs.' },
    ],
  };

  const calculateOverallApproval = () => {
    let base = 75;
    activePolicies.forEach((p) => {
      base += 1.5;
    });
    return Math.min(98, Math.max(25, base));
  };

  return (
    <div className="modal-overlay" style={modalOverlayStyle}>
      <div className="modal-content" style={modalContentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#f8fafc' }}>
              📜 City Hall Policy & Ordinance Center
            </h2>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              Active Enactments: <strong style={{ color: '#38bdf8' }}>{activePolicies.length} laws</strong> | Citizen Political Approval: <strong style={{ color: '#4ade80' }}>{calculateOverallApproval()}%</strong>
            </span>
          </div>
          <button onClick={closeModal} style={closeButtonStyle}>✕</button>
        </div>

        {/* Category Bar */}
        <div style={tabBarStyle}>
          {['environment', 'taxation', 'welfare', 'safety', 'commerce', 'infrastructure'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                ...tabButtonStyle,
                borderBottom: activeCategory === cat ? '2px solid #38bdf8' : '2px solid transparent',
                color: activeCategory === cat ? '#38bdf8' : '#94a3b8',
              }}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Policy Catalog List */}
        <div style={{ padding: '20px', overflowY: 'auto', maxHeight: '500px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
            {policyCatalog[activeCategory].map((policy) => {
              const isActive = activePolicies.includes(policy.id);
              return (
                <div
                  key={policy.id}
                  style={{
                    ...cardStyle,
                    border: isActive ? '1px solid #38bdf8' : '1px solid #334155',
                    background: isActive ? '#1e293b' : '#0f172a',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#f8fafc' }}>
                        {isActive ? '✅ ' : ''}{policy.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 8px 0' }}>
                        {policy.desc}
                      </div>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: '#cbd5e1' }}>
                        <span>Monthly Cost: <strong style={{ color: policy.cost > 0 ? '#f87171' : '#4ade80' }}>{policy.cost > 0 ? `-$${policy.cost}` : `+$${Math.abs(policy.cost)} revenue`}</strong></span>
                        <span>Voter Approval Rate: <strong style={{ color: '#facc15' }}>{policy.approval}%</strong></span>
                      </div>
                    </div>

                    <button
                      onClick={() => togglePolicy(policy.id)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        cursor: 'pointer',
                        background: isActive ? '#ef4444' : '#0284c7',
                        color: '#ffffff',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {isActive ? 'Repeal Law' : 'Enact Law'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.75)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalContentStyle = {
  width: '640px',
  maxHeight: '85vh',
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '12px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

const headerStyle = {
  padding: '16px 20px',
  borderBottom: '1px solid #1e293b',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: '#182234',
};

const closeButtonStyle = {
  background: 'transparent',
  border: 'none',
  color: '#94a3b8',
  fontSize: '18px',
  cursor: 'pointer',
};

const tabBarStyle = {
  display: 'flex',
  background: '#1e293b',
  borderBottom: '1px solid #334155',
  padding: '0 12px',
  overflowX: 'auto',
};

const tabButtonStyle = {
  background: 'transparent',
  border: 'none',
  padding: '10px 14px',
  fontSize: '11px',
  fontWeight: 'bold',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const cardStyle = {
  borderRadius: '8px',
  padding: '14px',
};

export default PolicyCenter;
