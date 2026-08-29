import React, { useState } from 'react';

/**
 * EntitySpawner Component
 * Administrative command panel for spawning citizen population batches,
 * invoking environmental disasters, and injecting treasury funds.
 */
export default function EntitySpawner({ activeCityId, onTriggerAction }) {
  const [spawnCount, setSpawnCount] = useState(25);
  const [selectedDisaster, setSelectedDisaster] = useState('tornado');
  const [disasterIntensity, setDisasterIntensity] = useState(5);
  const [customTreasuryAmount, setCustomTreasuryAmount] = useState(1000000);
  const [logMessages, setLogMessages] = useState([]);

  const addLog = (msg, type = 'info') => {
    setLogMessages((prev) => [
      { id: Date.now(), time: new Date().toLocaleTimeString(), text: msg, type },
      ...prev.slice(0, 15)
    ]);
  };

  const handleSpawnCitizens = async () => {
    if (!activeCityId) {
      addLog('Error: No active city selected.', 'error');
      return;
    }

    addLog(`Spawning ${spawnCount} citizens into city ${activeCityId}...`, 'info');
    try {
      const response = await fetch('/api/v1/citizens/spawn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cityId: activeCityId, count: spawnCount })
      });
      const data = await response.json();
      if (data.success) {
        addLog(`Successfully spawned ${spawnCount} citizens.`, 'success');
        if (onTriggerAction) onTriggerAction('spawn', spawnCount);
      } else {
        addLog(`Spawn failed: ${data.error}`, 'error');
      }
    } catch (err) {
      addLog(`Network error during spawn: ${err.message}`, 'error');
    }
  };

  const handleTriggerDisaster = async () => {
    if (!activeCityId) {
      addLog('Error: No active city selected for disaster invocation.', 'error');
      return;
    }

    addLog(`Triggering ${selectedDisaster.toUpperCase()} (Intensity: ${disasterIntensity})`, 'warning');
    try {
      const response = await fetch(`/api/v1/admin/cities/${activeCityId}/trigger-disaster`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disasterType: selectedDisaster, intensity: disasterIntensity })
      });
      const data = await response.json();
      if (data.success) {
        addLog(`Disaster "${selectedDisaster}" deployed successfully!`, 'success');
        if (onTriggerAction) onTriggerAction('disaster', selectedDisaster);
      } else {
        addLog(`Disaster invocation failed: ${data.error}`, 'error');
      }
    } catch (err) {
      addLog(`Disaster trigger error: ${err.message}`, 'error');
    }
  };

  const handleModifyTreasury = async (amount) => {
    if (!activeCityId) {
      addLog('Error: No active city selected for treasury update.', 'error');
      return;
    }

    const val = amount !== undefined ? amount : customTreasuryAmount;
    addLog(`Injecting $${val.toLocaleString()} into treasury...`, 'info');
    try {
      const response = await fetch(`/api/v1/admin/cities/${activeCityId}/inject-funds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: val })
      });
      const data = await response.json();
      if (data.success) {
        addLog(`Treasury updated! New balance: $${data.newTreasury.toLocaleString()}`, 'success');
        if (onTriggerAction) onTriggerAction('treasury', data.newTreasury);
      } else {
        addLog(`Treasury update failed: ${data.error}`, 'error');
      }
    } catch (err) {
      addLog(`Treasury update error: ${err.message}`, 'error');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.sectionHeader}>Entity Spawner & Simulation Commands</h2>

      <div style={styles.grid}>
        {/* Panel 1: Citizen Spawner */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>👥 Citizen Population Spawner</h3>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Spawn Batch Size: {spawnCount}</label>
            <input
              type="range"
              min="1"
              max="100"
              value={spawnCount}
              onChange={(e) => setSpawnCount(Number(e.target.value))}
              style={styles.slider}
            />
          </div>
          <button onClick={handleSpawnCitizens} style={styles.button('#3b82f6')}>
            Spawn {spawnCount} Citizens
          </button>
        </div>

        {/* Panel 2: Disaster Trigger */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🌋 Disaster Invocation System</h3>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Disaster Type:</label>
            <select
              value={selectedDisaster}
              onChange={(e) => setSelectedDisaster(e.target.value)}
              style={styles.select}
            >
              <option value="tornado">Tornado</option>
              <option value="earthquake">Earthquake</option>
              <option value="fire">Wildfire Spike</option>
              <option value="pollution_surge">Toxic Pollution Surge</option>
              <option value="economic_crash">Economic Downturn</option>
            </select>
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Intensity Level: {disasterIntensity} / 10</label>
            <input
              type="range"
              min="1"
              max="10"
              value={disasterIntensity}
              onChange={(e) => setDisasterIntensity(Number(e.target.value))}
              style={styles.slider}
            />
          </div>
          <button onClick={handleTriggerDisaster} style={styles.button('#ef4444')}>
            Trigger {selectedDisaster.toUpperCase()}
          </button>
        </div>

        {/* Panel 3: Treasury Injection */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>💰 Financial Injection Control</h3>
          <div style={styles.presetRow}>
            <button onClick={() => handleModifyTreasury(100000)} style={styles.presetButton}>
              +$100k
            </button>
            <button onClick={() => handleModifyTreasury(1000000)} style={styles.presetButton}>
              +$1M
            </button>
            <button onClick={() => handleModifyTreasury(10000000)} style={styles.presetButton}>
              +$10M
            </button>
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Custom Amount ($):</label>
            <input
              type="number"
              value={customTreasuryAmount}
              onChange={(e) => setCustomTreasuryAmount(Number(e.target.value))}
              style={styles.input}
            />
          </div>
          <button onClick={() => handleModifyTreasury()} style={styles.button('#10b981')}>
            Inject Custom Funds
          </button>
        </div>
      </div>

      {/* Action Execution Logs Console */}
      <div style={styles.consoleContainer}>
        <h4 style={styles.consoleTitle}>Administrative Command Log Output</h4>
        <div style={styles.consoleBox}>
          {logMessages.length === 0 ? (
            <span style={{ color: '#6b7280' }}>No admin actions executed in this session.</span>
          ) : (
            logMessages.map((log) => (
              <div key={log.id} style={styles.logItem(log.type)}>
                <span style={{ color: '#6b7280', marginRight: '8px' }}>[{log.time}]</span>
                {log.text}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    backgroundColor: '#111827',
    borderRadius: '12px',
    border: '1px solid #1f2937',
    marginBottom: '24px'
  },
  sectionHeader: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#f3f4f6',
    marginBottom: '20px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '24px'
  },
  card: {
    backgroundColor: '#1f2937',
    padding: '20px',
    borderRadius: '10px',
    border: '1px solid #374151'
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: '16px'
  },
  fieldGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    fontSize: '13px',
    color: '#9ca3af',
    marginBottom: '6px'
  },
  slider: {
    width: '100%',
    accentColor: '#3b82f6'
  },
  select: {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    backgroundColor: '#111827',
    border: '1px solid #4b5563',
    color: '#e5e7eb',
    fontSize: '14px'
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    backgroundColor: '#111827',
    border: '1px solid #4b5563',
    color: '#e5e7eb',
    fontSize: '14px'
  },
  presetRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px'
  },
  presetButton: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#374151',
    border: '1px solid #4b5563',
    color: '#e5e7eb',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  button: (bgColor) => ({
    width: '100%',
    padding: '12px',
    backgroundColor: bgColor,
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px'
  }),
  consoleContainer: {
    backgroundColor: '#0b0f19',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #1f2937'
  },
  consoleTitle: {
    fontSize: '14px',
    color: '#9ca3af',
    marginBottom: '10px'
  },
  consoleBox: {
    fontFamily: 'monospace',
    fontSize: '13px',
    maxHeight: '150px',
    overflowY: 'auto'
  },
  logItem: (type) => ({
    padding: '4px 0',
    color: type === 'error' ? '#f87171' : type === 'warning' ? '#fbbf24' : type === 'success' ? '#4ade80' : '#e2e8f0'
  })
};
