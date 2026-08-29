import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';

/**
 * Economy Dashboard Panel Component
 * Displays City Financials, Sector Revenues, Tax Sliders, Sector Subsidies,
 * Municipal Bond Market, Emergency Loans, and Financial History Charts.
 */
export const EconomyDashboard = () => {
  const { stats, taxes, updateTaxRate, closeModal } = useGameStore();
  const [activeTab, setActiveTab] = useState('budget'); // 'budget', 'taxes', 'subsidies', 'bonds', 'history'

  const [subsidies, setSubsidies] = useState({
    greenTech: 500,
    publicTransit: 1200,
    healthcareSubsidy: 800,
    educationGrant: 1000,
    lowIncomeWelfare: 1500,
  });

  const [bonds, setBonds] = useState([
    { id: 'BOND-2026-A', name: 'Municipal Infrastructure Bond 5Y', principal: 100000, yieldRate: 4.5, termMonths: 60, status: 'Active' },
    { id: 'BOND-2026-B', name: 'Green Energy Transition Bond 10Y', principal: 250000, yieldRate: 5.2, termMonths: 120, status: 'Available' },
  ]);

  const handleSubsidyChange = (key, val) => {
    setSubsidies((prev) => ({ ...prev, [key]: parseInt(val, 10) || 0 }));
  };

  const calculateTotalTaxIncome = () => {
    const resIncome = (stats.population * 12) * (taxes.residentialLow / 100);
    const comIncome = (stats.population * 8) * (taxes.commercialLow / 100);
    const indIncome = (stats.population * 10) * (taxes.industrialLight / 100);
    return Math.round(resIncome + comIncome + indIncome);
  };

  const totalSubsidies = Object.values(subsidies).reduce((a, b) => a + b, 0);

  return (
    <div className="modal-overlay" style={modalOverlayStyle}>
      <div className="modal-content" style={modalContentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#f8fafc' }}>
              🏦 City Financial & Economy Dashboard
            </h2>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              Treasury Balance: <strong style={{ color: '#4ade80' }}>${stats.treasury.toLocaleString()}</strong> | Monthly Net Cash Flow: <strong style={{ color: '#38bdf8' }}>+${(calculateTotalTaxIncome() - totalSubsidies).toLocaleString()}</strong>
            </span>
          </div>
          <button onClick={closeModal} style={closeButtonStyle}>✕</button>
        </div>

        {/* Navigation Tabs */}
        <div style={tabBarStyle}>
          {['budget', 'taxes', 'subsidies', 'bonds', 'history'].map((tab) => (
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
        <div style={{ padding: '20px', overflowY: 'auto', maxHeight: '520px' }}>
          {activeTab === 'budget' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                {/* Revenue Card */}
                <div style={cardStyle}>
                  <div style={cardTitleStyle}>Monthly Income Sources</div>
                  <div style={rowStyle}><span>Residential Taxes</span><strong style={{ color: '#4ade80' }}>+${Math.round(calculateTotalTaxIncome() * 0.45).toLocaleString()}</strong></div>
                  <div style={rowStyle}><span>Commercial Taxes</span><strong style={{ color: '#4ade80' }}>+${Math.round(calculateTotalTaxIncome() * 0.35).toLocaleString()}</strong></div>
                  <div style={rowStyle}><span>Industrial Taxes</span><strong style={{ color: '#4ade80' }}>+${Math.round(calculateTotalTaxIncome() * 0.20).toLocaleString()}</strong></div>
                  <div style={rowStyle}><span>Public Transit Fares</span><strong style={{ color: '#4ade80' }}>+$2,400</strong></div>
                  <div style={{ ...rowStyle, borderTop: '1px solid #334155', paddingTop: '8px', fontWeight: 'bold' }}>
                    <span>Total Income</span>
                    <span style={{ color: '#4ade80' }}>+${(calculateTotalTaxIncome() + 2400).toLocaleString()}</span>
                  </div>
                </div>

                {/* Expense Card */}
                <div style={cardStyle}>
                  <div style={{ ...cardTitleStyle, color: '#f87171' }}>Monthly Expenditures</div>
                  <div style={rowStyle}><span>Infrastructure & Power Maintenance</span><strong style={{ color: '#f87171' }}>-$3,200</strong></div>
                  <div style={rowStyle}><span>Police & Fire Services</span><strong style={{ color: '#f87171' }}>-$2,800</strong></div>
                  <div style={rowStyle}><span>Healthcare & Education</span><strong style={{ color: '#f87171' }}>-$2,100</strong></div>
                  <div style={rowStyle}><span>Sector Subsidies</span><strong style={{ color: '#f87171' }}>-${totalSubsidies.toLocaleString()}</strong></div>
                  <div style={{ ...rowStyle, borderTop: '1px solid #334155', paddingTop: '8px', fontWeight: 'bold' }}>
                    <span>Total Expenses</span>
                    <span style={{ color: '#f87171' }}>-${(8100 + totalSubsidies).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* RCI Demand Card */}
              <div style={cardStyle}>
                <div style={cardTitleStyle}>RCI Zoning Demand Indicators</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#4ade80', fontWeight: 'bold' }}>Residential (R)</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f8fafc' }}>{stats.rciDemand.residential}%</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>High demand for housing</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#60a5fa', fontWeight: 'bold' }}>Commercial (C)</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f8fafc' }}>{stats.rciDemand.commercial}%</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Moderate retail demand</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#facc15', fontWeight: 'bold' }}>Industrial (I)</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f8fafc' }}>{stats.rciDemand.industrial}%</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Factory jobs needed</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'taxes' && (
            <div>
              <h4 style={{ color: '#f8fafc', marginTop: 0 }}>Tax Code & Sector Sliders</h4>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>
                Adjusting tax rates affects municipal revenue and citizen satisfaction. High taxes suppress economic growth.
              </p>

              {[
                { label: 'Low-Density Residential Tax', key: 'residentialLow', val: taxes.residentialLow },
                { label: 'High-Density Residential Tax', key: 'residentialHigh', val: taxes.residentialHigh },
                { label: 'Low-Density Commercial Tax', key: 'commercialLow', val: taxes.commercialLow },
                { label: 'High-Density Commercial Tax', key: 'commercialHigh', val: taxes.commercialHigh },
                { label: 'Light Industrial Tax', key: 'industrialLight', val: taxes.industrialLight },
                { label: 'Heavy Industrial Tax', key: 'industrialHeavy', val: taxes.industrialHeavy },
                { label: 'Carbon Emission Tariff', key: 'carbonTax', val: taxes.carbonTax },
                { label: 'Property Value Tax', key: 'propertyTax', val: taxes.propertyTax },
              ].map((item) => (
                <div key={item.key} style={{ ...cardStyle, marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#f8fafc' }}>{item.label}</span>
                    <span style={{ fontSize: '14px', color: '#38bdf8', fontWeight: 'bold' }}>{item.val}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={item.val}
                    onChange={(e) => updateTaxRate(item.key, parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'subsidies' && (
            <div>
              <h4 style={{ color: '#f8fafc', marginTop: 0 }}>City Sector Subsidies & Grants</h4>
              <div style={cardStyle}>
                {[
                  { label: 'Green Energy Transition Subsidy', key: 'greenTech', desc: 'Promotes solar/wind adoption & reduces air pollution' },
                  { label: 'Public Transit Fare Subsidy', key: 'publicTransit', desc: 'Lowers traffic congestion and encourages subway use' },
                  { label: 'Healthcare & Preventive Medicine Grant', key: 'healthcareSubsidy', desc: 'Boosts citizen lifespan and lowers disease spread' },
                  { label: 'Higher Education Research Grant', key: 'educationGrant', desc: 'Attracts high-tech industries and skilled workers' },
                  { label: 'Low-Income Family Assistance Program', key: 'lowIncomeWelfare', desc: 'Reduces poverty-driven crime and raises happiness' },
                ].map((sub) => (
                  <div key={sub.key} style={{ marginBottom: '14px', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#f8fafc' }}>{sub.label}</span>
                      <span style={{ fontSize: '13px', color: '#4ade80' }}>${subsidies[sub.key]}/mo</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>{sub.desc}</div>
                    <input
                      type="number"
                      value={subsidies[sub.key]}
                      onChange={(e) => handleSubsidyChange(sub.key, e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bonds' && (
            <div>
              <h4 style={{ color: '#f8fafc', marginTop: 0 }}>Municipal Bond & Debt Market</h4>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                Issue city bonds to fund major capital projects. Bonds incur monthly interest repayments.
              </p>
              {bonds.map((b) => (
                <div key={b.id} style={{ ...cardStyle, marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#38bdf8' }}>{b.name}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        Principal: ${b.principal.toLocaleString()} | Interest Rate: {b.yieldRate}% APY | Term: {b.termMonths} mo
                      </div>
                    </div>
                    <button
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        background: b.status === 'Active' ? '#334155' : '#0284c7',
                        color: '#fff',
                        border: 'none',
                        cursor: b.status === 'Active' ? 'default' : 'pointer',
                      }}
                    >
                      {b.status === 'Active' ? 'Active Bond' : 'Issue Bond'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h4 style={{ color: '#f8fafc', marginTop: 0 }}>50-Tick Financial History</h4>
              <div style={cardStyle}>
                <div style={cardTitleStyle}>Treasury & Revenue Trend</div>
                <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', gap: '4px', paddingTop: '20px' }}>
                  {[200, 210, 220, 215, 230, 240, 245, 250, 260, 270, 280, 290, 300, 310, 320].map((val, idx) => (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        height: `${(val / 350) * 100}%`,
                        background: '#38bdf8',
                        borderRadius: '2px 2px 0 0',
                      }}
                      title={`Month ${idx + 1}: $${val}k`}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '6px' }}>
                  <span>15 Months Ago</span>
                  <span>Present</span>
                </div>
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
  width: '680px',
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
};

const tabButtonStyle = {
  background: 'transparent',
  border: 'none',
  padding: '10px 16px',
  fontSize: '11px',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const cardStyle = {
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  padding: '14px',
};

const cardTitleStyle = {
  fontSize: '12px',
  fontWeight: 'bold',
  color: '#38bdf8',
  marginBottom: '10px',
  textTransform: 'uppercase',
};

const rowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '13px',
  color: '#cbd5e1',
  marginBottom: '6px',
};

const inputStyle = {
  width: '100%',
  background: '#0f172a',
  border: '1px solid #334155',
  color: '#f8fafc',
  padding: '6px 10px',
  borderRadius: '4px',
  fontSize: '12px',
};

export default EconomyDashboard;
