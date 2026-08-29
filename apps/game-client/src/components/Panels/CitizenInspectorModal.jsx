import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';

/**
 * Citizen Inspector Modal Component
 * Renders detailed Bio, Personality Traits (OCEAN), Needs Bars, Itinerary Timeline,
 * Family Tree, Employment status, and Thought Log for a selected citizen.
 */
export const CitizenInspectorModal = () => {
  const { selectedEntity, closeModal } = useGameStore();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'psychology', 'itinerary', 'relationships', 'thoughts'

  if (!selectedEntity || selectedEntity.type !== 'citizen') {
    // Default fallback sample citizen for testing/preview
    var citizen = {
      id: 'cit-84920',
      firstName: 'Elena',
      lastName: 'Vance',
      age: 28,
      gender: 'Female',
      lifeStage: 'Adult',
      education: 'Bachelor',
      occupation: 'Software Engineer',
      workplace: 'Tech Hub Alpha (Sector 4)',
      home: 'Highrise Apt 4B (Sector 2)',
      salary: 78000,
      savings: 24500,
      happiness: 84,
      health: 92,
      stress: 22,
      ocean: {
        openness: 85,
        conscientiousness: 78,
        extraversion: 62,
        agreeableness: 90,
        neuroticism: 30,
      },
      needs: {
        hunger: 88,
        energy: 75,
        social: 82,
        entertainment: 68,
        safety: 95,
        fulfillment: 80,
      },
      itinerary: [
        { time: '07:00', activity: 'Wake Up & Breakfast', location: 'Home' },
        { time: '08:00', activity: 'Commute via Subway', location: 'Transit System' },
        { time: '09:00 - 17:00', activity: 'Work Shift', location: 'Tech Hub Alpha' },
        { time: '17:30', activity: 'Grocery Shopping', location: 'Central Supermarket' },
        { time: '18:30', activity: 'Jogging in Park', location: 'Metropolis Central Park' },
        { time: '20:00', activity: 'Dinner & TV with Partner', location: 'Home' },
        { time: '23:00', activity: 'Sleep', location: 'Home' },
      ],
      family: [
        { relation: 'Partner', name: 'Marcus Vance', age: 30, job: 'Architect' },
        { relation: 'Child', name: 'Leo Vance', age: 3, job: 'Toddler' },
        { relation: 'Parent', name: 'Sophia Vance', age: 58, job: 'Doctor' },
      ],
      thoughts: [
        { tick: 1420, text: 'The subway was fast today! Glad the new transit line opened.', sentiment: 'positive' },
        { tick: 1380, text: 'Taxes went up slightly, but park quality makes up for it.', sentiment: 'neutral' },
        { tick: 1250, text: 'Clean air near Central Park made my evening jog delightful.', sentiment: 'positive' },
        { tick: 1100, text: 'Looking forward to the weekend tech expo.', sentiment: 'positive' },
      ],
    };
  } else {
    var citizen = selectedEntity.data;
  }

  const renderNeedBar = (label, value, color) => (
    <div className="citizen-need-row" key={label} style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '3px' }}>
        <span style={{ fontWeight: '500' }}>{label}</span>
        <span>{value}%</span>
      </div>
      <div style={{ height: '8px', background: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${value}%`,
            background: color,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" style={modalOverlayStyle}>
      <div className="modal-content" style={modalContentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#f8fafc' }}>
              👤 {citizen.firstName} {citizen.lastName}
            </h2>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              ID: {citizen.id} • {citizen.age} yrs • {citizen.gender} • {citizen.occupation}
            </span>
          </div>
          <button onClick={closeModal} style={closeButtonStyle}>✕</button>
        </div>

        {/* Navigation Tabs */}
        <div style={tabBarStyle}>
          {['overview', 'psychology', 'itinerary', 'relationships', 'thoughts'].map((tab) => (
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

        {/* Tab Contents */}
        <div style={{ padding: '16px', overflowY: 'auto', maxHeight: '480px' }}>
          {activeTab === 'overview' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={cardStyle}>
                  <div style={cardTitleStyle}>Bio & Status</div>
                  <p><strong>Education:</strong> {citizen.education}</p>
                  <p><strong>Workplace:</strong> {citizen.workplace}</p>
                  <p><strong>Home:</strong> {citizen.home}</p>
                  <p><strong>Annual Salary:</strong> ${citizen.salary.toLocaleString()}</p>
                  <p><strong>Savings:</strong> ${citizen.savings.toLocaleString()}</p>
                </div>
                <div style={cardStyle}>
                  <div style={cardTitleStyle}>Vitals & Mood</div>
                  <p><strong>Happiness:</strong> <span style={{ color: '#4ade80' }}>{citizen.happiness}%</span></p>
                  <p><strong>Health Index:</strong> <span style={{ color: '#38bdf8' }}>{citizen.health}%</span></p>
                  <p><strong>Stress Level:</strong> <span style={{ color: '#f87171' }}>{citizen.stress}%</span></p>
                </div>
              </div>

              <div style={cardStyle}>
                <div style={cardTitleStyle}>Current Needs Status</div>
                {renderNeedBar('Nourishment & Hunger', citizen.needs.hunger, '#4ade80')}
                {renderNeedBar('Rest & Energy', citizen.needs.energy, '#38bdf8')}
                {renderNeedBar('Social Connection', citizen.needs.social, '#c084fc')}
                {renderNeedBar('Recreation & Fun', citizen.needs.entertainment, '#facc15')}
                {renderNeedBar('Safety & Security', citizen.needs.safety, '#60a5fa')}
                {renderNeedBar('Career Fulfillment', citizen.needs.fulfillment, '#f472b6')}
              </div>
            </div>
          )}

          {activeTab === 'psychology' && (
            <div>
              <h4 style={{ color: '#f8fafc', marginTop: 0 }}>OCEAN Personality Profile</h4>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                Determines how {citizen.firstName} reacts to policy changes, tax hikes, noise pollution, and social events.
              </p>
              <div style={cardStyle}>
                {renderNeedBar('Openness to Experience', citizen.ocean.openness, '#818cf8')}
                {renderNeedBar('Conscientiousness', citizen.ocean.conscientiousness, '#34d399')}
                {renderNeedBar('Extraversion', citizen.ocean.extraversion, '#fbbf24')}
                {renderNeedBar('Agreeableness', citizen.ocean.agreeableness, '#f472b6')}
                {renderNeedBar('Neuroticism (Emotional Sensitivity)', citizen.ocean.neuroticism, '#f87171')}
              </div>
            </div>
          )}

          {activeTab === 'itinerary' && (
            <div>
              <h4 style={{ color: '#f8fafc', marginTop: 0 }}>Daily Schedule & Routine</h4>
              <div style={{ borderLeft: '2px solid #38bdf8', paddingLeft: '12px' }}>
                {citizen.itinerary.map((item, idx) => (
                  <div key={idx} style={{ marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold' }}>{item.time}</span>
                    <div style={{ color: '#f1f5f9', fontWeight: '500' }}>{item.activity}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>📍 {item.location}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'relationships' && (
            <div>
              <h4 style={{ color: '#f8fafc', marginTop: 0 }}>Family & Social Circle</h4>
              {citizen.family.map((mem, idx) => (
                <div key={idx} style={{ ...cardStyle, marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#a855f7', fontWeight: 'bold' }}>{mem.relation}</span>
                  <div style={{ fontSize: '14px', color: '#f8fafc' }}>{mem.name} ({mem.age} yrs)</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Occupation: {mem.job}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'thoughts' && (
            <div>
              <h4 style={{ color: '#f8fafc', marginTop: 0 }}>Recent Thought & Memory Log</h4>
              {citizen.thoughts.map((th, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '10px',
                    borderRadius: '6px',
                    background: '#1e293b',
                    borderLeft: `4px solid ${th.sentiment === 'positive' ? '#4ade80' : th.sentiment === 'negative' ? '#f87171' : '#94a3b8'}`,
                    marginBottom: '8px',
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Tick #{th.tick}</div>
                  <div style={{ fontSize: '13px', color: '#e2e8f0', marginTop: '2px' }}>"{th.text}"</div>
                </div>
              ))}
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
  width: '560px',
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
  padding: '10px 14px',
  fontSize: '11px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const cardStyle = {
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  padding: '12px',
};

const cardTitleStyle = {
  fontSize: '12px',
  fontWeight: 'bold',
  color: '#38bdf8',
  marginBottom: '8px',
  textTransform: 'uppercase',
};

export default CitizenInspectorModal;
