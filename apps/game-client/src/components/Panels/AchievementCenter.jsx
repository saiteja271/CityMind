import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';

/**
 * Achievement & Quest Center Component
 * Displays unlockable achievements, city milestones, victory conditions,
 * and challenge rewards across Sandbox and Scenario game modes.
 */
export const AchievementCenter = () => {
  const { closeModal, stats } = useGameStore();
  const [filter, setFilter] = useState('all'); // 'all', 'unlocked', 'locked'

  const achievements = [
    { id: 'ach-1', title: 'First Settlement', category: 'Growth', desc: 'Reach a city population of 100 citizens.', progress: Math.min(100, (stats.population / 100) * 100), unlocked: stats.population >= 100, reward: '$10,000 Grant' },
    { id: 'ach-2', title: 'Thriving Metropolis', category: 'Growth', desc: 'Reach a city population of 10,000 citizens.', progress: Math.min(100, (stats.population / 10000) * 100), unlocked: stats.population >= 10000, reward: 'Prestige Landmark Blueprint' },
    { id: 'ach-3', title: 'Utopia', category: 'Happiness', desc: 'Maintain city happiness above 90% for 30 consecutive ticks.', progress: 85, unlocked: false, reward: '$50,000 Grant' },
    { id: 'ach-4', title: 'Green Pioneer', category: 'Environment', desc: 'Generate 100% of municipal electricity from renewable solar/wind energy.', progress: 60, unlocked: false, reward: 'Eco-District Zoning Blueprint' },
    { id: 'ach-5', title: 'Fiscal Wizard', category: 'Economy', desc: 'Accumulate $1,000,000 in the municipal treasury.', progress: Math.min(100, (stats.treasury / 1000000) * 100), unlocked: stats.treasury >= 1000000, reward: 'Financial District Skyscraper' },
    { id: 'ach-6', title: 'Zero Crime Zone', category: 'Safety', desc: 'Lower city crime rate below 2%.', progress: 40, unlocked: false, reward: 'High-Tech Precinct Upgrade' },
    { id: 'ach-7', title: 'Ivy League City', category: 'Education', desc: 'Achieve an education quality index above 85.', progress: (stats.educationIndex / 85) * 100, unlocked: stats.educationIndex >= 85, reward: 'Research University Wing' },
    { id: 'ach-8', title: 'Traffic Mastermind', category: 'Infrastructure', desc: 'Keep traffic congestion below 10% with over 5,000 citizens.', progress: 30, unlocked: false, reward: 'Bullet Train Station' },
  ];

  const filteredAchievements = achievements.filter((a) => {
    if (filter === 'unlocked') return a.unlocked;
    if (filter === 'locked') return !a.unlocked;
    return true;
  });

  const totalUnlocked = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="modal-overlay" style={modalOverlayStyle}>
      <div className="modal-content" style={modalContentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#f8fafc' }}>
              🏆 Achievements & City Milestones
            </h2>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              Unlocked: <strong style={{ color: '#facc15' }}>{totalUnlocked} of {achievements.length}</strong> ({Math.round((totalUnlocked / achievements.length) * 100)}%)
            </span>
          </div>
          <button onClick={closeModal} style={closeButtonStyle}>✕</button>
        </div>

        {/* Filter Bar */}
        <div style={tabBarStyle}>
          {['all', 'unlocked', 'locked'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                ...tabButtonStyle,
                borderBottom: filter === f ? '2px solid #facc15' : '2px solid transparent',
                color: filter === f ? '#facc15' : '#94a3b8',
              }}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* List */}
        <div style={{ padding: '20px', overflowY: 'auto', maxHeight: '480px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {filteredAchievements.map((ach) => (
              <div
                key={ach.id}
                style={{
                  ...cardStyle,
                  border: ach.unlocked ? '1px solid #facc15' : '1px solid #334155',
                  background: ach.unlocked ? '#1e293b' : '#0f172a',
                  opacity: ach.unlocked ? 1 : 0.8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: ach.unlocked ? '#facc15' : '#f8fafc' }}>
                    {ach.unlocked ? '🎖️ ' : '🔒 '}{ach.title}
                  </span>
                  <span style={{ fontSize: '10px', background: '#334155', color: '#cbd5e1', padding: '2px 6px', borderRadius: '4px' }}>
                    {ach.category}
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
                  {ach.desc}
                </div>

                {/* Progress bar */}
                <div style={{ height: '6px', background: '#334155', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${ach.progress}%`,
                      background: ach.unlocked ? '#facc15' : '#38bdf8',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: '#64748b' }}>Reward: <strong style={{ color: '#4ade80' }}>{ach.reward}</strong></span>
                  <span style={{ color: ach.unlocked ? '#facc15' : '#38bdf8', fontWeight: 'bold' }}>
                    {ach.unlocked ? 'COMPLETED' : `${Math.round(ach.progress)}%`}
                  </span>
                </div>
              </div>
            ))}
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
  borderRadius: '8px',
  padding: '12px',
};

export default AchievementCenter;
