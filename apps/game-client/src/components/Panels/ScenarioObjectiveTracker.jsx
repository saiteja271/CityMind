import React, { useState, useEffect, useMemo } from 'react';

/**
 * ADVISOR HINT DATA DEFINITIONS
 */
const ADVISORS_DATA = [
  {
    role: 'City Planner',
    name: 'Sophia Vance',
    avatar: '👩‍💼',
    color: '#1a73e8',
    tips: [
      'Zoning commercial districts directly adjacent to transit stops boosts business sales by +25%.',
      'Keep heavy industrial zones downwind of residential neighborhoods to prevent pollution happiness penalties.',
      'High-density residential buildings require high land values and top-tier education coverage.'
    ]
  },
  {
    role: 'Chief Economist',
    name: 'Marcus Sterling',
    avatar: '👨‍💼',
    color: '#34a853',
    tips: [
      'Increasing property tax above 12% creates negative migration and stalls population growth.',
      'Refinancing municipal bonds during high economic growth phases lowers annual interest overhead.',
      'Inter-city energy exports provide reliable passive monthly cash flow without cluttering commercial zones.'
    ]
  },
  {
    role: 'Environmental Officer',
    name: 'Dr. Aris Thorne',
    avatar: '👩‍🔬',
    color: '#00acc1',
    tips: [
      'Bio-filtration wetlands remove ground contamination 40% faster than chemical treatment plants.',
      'Replacing coal power plants with solar thermal parks eliminates air pollution complaints.',
      'Extensive city parks boost surrounding land values by up to +$150/sqm.'
    ]
  },
  {
    role: 'Emergency Manager',
    name: 'Commander Hank Miller',
    avatar: '👨‍🚒',
    color: '#ea4335',
    tips: [
      'Deploy fire station coverage near industrial warehouses to reduce catastrophic blaze risks.',
      'Coastal seawalls prevent hurricane storm surges from destroying expensive seaport docks.',
      'High hospital coverage prevents viral epidemics from spreading beyond 5% infection rates.'
    ]
  }
];

/**
 * MAIN SCENARIO OBJECTIVE TRACKER HUD COMPONENT
 */
export default function ScenarioObjectiveTracker({
  scenario = null,
  timeRemainingSeconds = 1800, // 30 minutes countdown default
  onCompleteScenario,
  onFailScenario
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(timeRemainingSeconds);
  const [completedObjectives, setCompletedObjectives] = useState(new Set());

  // Default scenario fallback if not passed in prop
  const currentScenario = scenario || {
    id: 'scen_demo',
    title: 'Metropolis Rising',
    category: 'Growth',
    startingConditions: { treasury: 500000 },
    primaryObjectives: [
      { id: 'obj_1', title: 'Reach Population 25,000', target: 25000, current: 18450, unit: 'citizens', required: true },
      { id: 'obj_2', title: 'Achieve Treasury Balance $2.0M', target: 2000000, current: 1450000, unit: '$', required: true },
      { id: 'obj_3', title: 'Maintain Approval Rating Above 80%', target: 80, current: 84, unit: '%', required: true }
    ],
    secondaryObjectives: [
      { id: 'obj_s1', title: 'Build International Airport', target: 1, current: 1, unit: 'facility' },
      { id: 'obj_s2', title: 'Keep Unemployment Below 4%', target: 4, current: 3.2, unit: '%' }
    ],
    bonusChallenges: [
      { id: 'bon_1', title: 'Zero Pollution Complaints for 5 Years', reward: '$250k Bonus', multiplier: '1.25x' }
    ]
  };

  // Timer countdown hook
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onFailScenario) onFailScenario();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft, onFailScenario]);

  // Format seconds to MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins < 10 ? '0' + mins : mins}:${remainderSecs < 10 ? '0' + remainderSecs : remainderSecs}`;
  };

  const timerPercentage = Math.max(0, (secondsLeft / timeRemainingSeconds) * 100);
  const isUrgent = timerPercentage < 15;

  // Toggle objective checkbox completion state manually for testing / interaction
  const toggleObjective = (id) => {
    setCompletedObjectives(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Calculate overall mission completion percentage
  const totalObjectivesCount = currentScenario.primaryObjectives.length;
  const autoCompletedCount = currentScenario.primaryObjectives.filter(o => o.current >= o.target).length;
  const manualCompletedCount = Array.from(completedObjectives).filter(id => id.startsWith('obj_')).length;
  const totalCompletedCount = Math.min(totalObjectivesCount, Math.max(autoCompletedCount, manualCompletedCount));
  const overallProgress = Math.round((totalCompletedCount / totalObjectivesCount) * 100);

  useEffect(() => {
    if (overallProgress === 100 && onCompleteScenario) {
      onCompleteScenario();
    }
  }, [overallProgress, onCompleteScenario]);

  if (isMinimized) {
    return (
      <div style={{
        position: 'absolute',
        top: '70px',
        right: '20px',
        background: '#1a2332',
        border: '1px solid #1a73e8',
        borderRadius: '24px',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        zIndex: 999
      }} onClick={() => setIsMinimized(false)}>
        <span style={{ fontSize: '1rem' }}>🎯</span>
        <strong style={{ fontSize: '0.85rem', color: '#fff' }}>Mission Objectives ({overallProgress}%)</strong>
        <span style={{ fontSize: '0.8rem', color: isUrgent ? '#ea4335' : '#fbbc04', fontWeight: '700' }}>
          ⏱️ {formatTime(secondsLeft)}
        </span>
      </div>
    );
  }

  return (
    <>
      {/* FLOATING OBJECTIVE HUD PANEL */}
      <div style={{
        position: 'absolute',
        top: '70px',
        right: '20px',
        width: '360px',
        background: 'rgba(22, 30, 46, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid #2d3a4f',
        borderRadius: '10px',
        color: '#e8eaed',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        {/* HUD HEADER */}
        <div style={{
          padding: '12px 16px',
          background: 'linear-gradient(90deg, #1a2332 0%, #161e2e 100%)',
          borderBottom: '1px solid #2d3a4f',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          cursor: 'move'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.1rem' }}>🎯</span>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#ffffff', fontWeight: '700' }}>
                {currentScenario.title}
              </h4>
              <span style={{ fontSize: '0.7rem', color: '#4285f4', fontWeight: '600', textTransform: 'uppercase' }}>
                {currentScenario.category} MISSION
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{ background: '#243044', border: 'none', color: '#9aa0a6', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}
            >
              {isExpanded ? '▼' : '▲'}
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              style={{ background: '#243044', border: 'none', color: '#9aa0a6', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}
            >
              —
            </button>
          </div>
        </div>

        {/* COUNTDOWN TIMER BAR */}
        <div style={{
          padding: '8px 16px',
          background: isUrgent ? 'rgba(234, 67, 53, 0.2)' : '#0f1419',
          borderBottom: '1px solid #2d3a4f',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.75rem', color: '#9aa0a6' }}>MISSION TIMER REMAINING:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <strong style={{
              fontSize: '1rem',
              color: isUrgent ? '#ea4335' : '#fbbc04',
              fontFamily: 'monospace',
              fontWeight: '800'
            }}>
              {formatTime(secondsLeft)}
            </strong>
          </div>
        </div>

        {/* OVERALL MISSION PROGRESS BAR */}
        <div style={{ height: '4px', background: '#0f1419', width: '100%' }}>
          <div style={{
            width: `${overallProgress}%`,
            height: '100%',
            background: overallProgress === 100 ? '#34a853' : '#1a73e8',
            transition: 'width 0.4s ease'
          }} />
        </div>

        {/* EXPANDABLE OBJECTIVE CONTENT */}
        {isExpanded && (
          <div style={{ padding: '16px', maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* PRIMARY OBJECTIVES */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#34a853', textTransform: 'uppercase' }}>
                  ⭐ Primary Requirements ({totalCompletedCount}/{totalObjectivesCount})
                </span>
                <span style={{ fontSize: '0.75rem', color: '#9aa0a6' }}>{overallProgress}%</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentScenario.primaryObjectives.map(obj => {
                  const isDone = obj.current >= obj.target || completedObjectives.has(obj.id);
                  const pct = Math.min(100, Math.round((obj.current / obj.target) * 100));

                  return (
                    <div
                      key={obj.id}
                      onClick={() => toggleObjective(obj.id)}
                      style={{
                        background: isDone ? 'rgba(52, 168, 83, 0.12)' : '#1a2332',
                        border: isDone ? '1px solid #34a853' : '1px solid #2d3a4f',
                        borderRadius: '6px',
                        padding: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: isDone ? '#34a853' : '#9aa0a6', fontSize: '0.9rem' }}>
                            {isDone ? '✓' : '○'}
                          </span>
                          <span style={{
                            fontSize: '0.82rem',
                            fontWeight: '600',
                            color: isDone ? '#34a853' : '#ffffff',
                            textDecoration: isDone ? 'line-through' : 'none'
                          }}>
                            {obj.title}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#9aa0a6', fontWeight: '600' }}>
                          {obj.current.toLocaleString()} / {obj.target.toLocaleString()}
                        </span>
                      </div>

                      <div style={{ height: '5px', background: '#0f1419', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: isDone ? '#34a853' : '#1a73e8',
                          transition: 'width 0.3s'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECONDARY MILESTONES */}
            {currentScenario.secondaryObjectives && (
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#fbbc04', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  🎖️ Secondary Milestones
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {currentScenario.secondaryObjectives.map(obj => (
                    <div key={obj.id} style={{ background: '#1a2332', padding: '8px 10px', borderRadius: '6px', fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#e8eaed' }}>{obj.title}</span>
                      <strong style={{ color: '#fbbc04' }}>{obj.target} {obj.unit}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BONUS CHALLENGES */}
            {currentScenario.bonusChallenges && (
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#e5e4e2', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  💎 Platinum Multiplier Challenges
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {currentScenario.bonusChallenges.map(bon => (
                    <div key={bon.id} style={{ background: '#243044', padding: '8px 10px', borderRadius: '6px', fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{bon.title}</span>
                      <span style={{ background: '#fbbc04', color: '#111', padding: '2px 6px', borderRadius: '4px', fontWeight: '800', fontSize: '0.7rem' }}>
                        {bon.multiplier}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ADVISOR TIPS BUTTON */}
            <button
              onClick={() => setShowAdvisorModal(true)}
              style={{
                width: '100%',
                background: 'linear-gradient(90deg, #1a73e8 0%, #4285f4 100%)',
                color: '#fff',
                padding: '8px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              💡 Call Advisor Tactics
            </button>
          </div>
        )}
      </div>

      {/* ADVISOR HINTS DRAWER MODAL */}
      {showAdvisorModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000
        }}>
          <div style={{
            width: '560px',
            background: '#161e2e',
            border: '1px solid #2d3a4f',
            borderRadius: '12px',
            padding: '24px',
            color: '#e8eaed',
            boxShadow: '0 12px 48px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#4285f4', fontWeight: '700' }}>
                🧠 City Hall Advisory Board
              </h3>
              <button
                onClick={() => setShowAdvisorModal(false)}
                style={{ background: 'none', border: 'none', color: '#9aa0a6', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* ADVISOR SELECTION TABS */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {ADVISORS_DATA.map((adv, idx) => (
                <button
                  key={adv.role}
                  onClick={() => setSelectedAdvisor(idx)}
                  style={{
                    flex: 1,
                    background: selectedAdvisor === idx ? adv.color : '#1a2332',
                    color: selectedAdvisor === idx ? '#fff' : '#9aa0a6',
                    border: 'none',
                    padding: '8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '1.2rem' }}>{adv.avatar}</div>
                  <div>{adv.role}</div>
                </button>
              ))}
            </div>

            {/* ADVISOR CONTENT BOX */}
            <div style={{ background: '#1a2332', padding: '16px', borderRadius: '8px', border: '1px solid #2d3a4f' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '2rem' }}>{ADVISORS_DATA[selectedAdvisor].avatar}</span>
                <div>
                  <strong style={{ color: '#fff', fontSize: '0.95rem', display: 'block' }}>
                    {ADVISORS_DATA[selectedAdvisor].name}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: ADVISORS_DATA[selectedAdvisor].color, fontWeight: '700' }}>
                    {ADVISORS_DATA[selectedAdvisor].role}
                  </span>
                </div>
              </div>

              <h4 style={{ color: '#9aa0a6', fontSize: '0.8rem', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
                Tactical Mission Recommendations:
              </h4>
              <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '0.85rem', lineHeight: '1.6', color: '#e8eaed' }}>
                {ADVISORS_DATA[selectedAdvisor].tips.map((tip, i) => (
                  <li key={i} style={{ marginBottom: '6px' }}>{tip}</li>
                ))}
              </ul>
            </div>

            <div style={{ marginTop: '16px', textAlign: 'right' }}>
              <button
                onClick={() => setShowAdvisorModal(false)}
                style={{ background: '#1a73e8', color: '#fff', padding: '8px 20px', borderRadius: '6px', border: 'none', fontWeight: '600' }}
              >
                Close Briefing
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
