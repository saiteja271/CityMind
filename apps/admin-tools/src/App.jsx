import React, { useState, useEffect } from 'react';
import MetricsDashboard from './components/MetricsDashboard';
import EntitySpawner from './components/EntitySpawner';
import SaveInspector from './components/SaveInspector';

/**
 * Main Admin Dashboard Application Component
 */
export default function App() {
  const [activeTab, setActiveTab] = useState('metrics');
  const [cities, setCities] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState('');
  const [socketStatus, setSocketStatus] = useState('connected');
  const [serverHealth, setServerHealth] = useState(null);

  // Fetch cities list for selector
  useEffect(() => {
    const loadCities = async () => {
      try {
        const response = await fetch('/api/v1/cities?limit=50');
        const data = await response.json();
        if (data.success && Array.isArray(data.cities)) {
          setCities(data.cities);
          if (data.cities.length > 0 && !selectedCityId) {
            setSelectedCityId(data.cities[0]._id);
          }
        }
      } catch (err) {
        console.warn('Could not fetch cities list:', err.message);
      }
    };

    const loadHealth = async () => {
      try {
        const response = await fetch('/health');
        const data = await response.json();
        if (data.status === 'online') {
          setServerHealth(data);
        }
      } catch (err) {
        console.warn('Health check failed:', err.message);
      }
    };

    loadCities();
    loadHealth();
  }, []);

  return (
    <div style={styles.appContainer}>
      {/* Top Navbar */}
      <header style={styles.navbar}>
        <div style={styles.logoSection}>
          <h1 style={styles.logoTitle}>CITYMIND</h1>
          <span style={styles.logoBadge}>ADMIN CONSOLE</span>
        </div>

        {/* Global Controls */}
        <div style={styles.controlsSection}>
          <label style={styles.citySelectorLabel}>Target City:</label>
          <select
            value={selectedCityId}
            onChange={(e) => setSelectedCityId(e.target.value)}
            style={styles.citySelect}
          >
            {cities.length === 0 ? (
              <option value="">No Cities Found</option>
            ) : (
              cities.map((city) => (
                <option key={city._id} value={city._id}>
                  {city.name} (Pop: {city.stats?.population || 0})
                </option>
              ))
            )}
          </select>
        </div>
      </header>

      {/* Main Content Area with Navigation Tabs */}
      <div style={styles.mainLayout}>
        <nav style={styles.tabBar}>
          <button
            onClick={() => setActiveTab('metrics')}
            style={styles.tabButton(activeTab === 'metrics')}
          >
            📊 System Telemetry
          </button>
          <button
            onClick={() => setActiveTab('spawner')}
            style={styles.tabButton(activeTab === 'spawner')}
          >
            🧪 Spawner & Debug Tools
          </button>
          <button
            onClick={() => setActiveTab('inspector')}
            style={styles.tabButton(activeTab === 'inspector')}
          >
            🔍 City Save Inspector
          </button>
        </nav>

        {/* Tab Content Panels */}
        <main style={styles.contentBody}>
          {activeTab === 'metrics' && (
            <MetricsDashboard socketStatus={socketStatus} serverHealth={serverHealth} />
          )}

          {activeTab === 'spawner' && (
            <EntitySpawner activeCityId={selectedCityId} />
          )}

          {activeTab === 'inspector' && (
            <SaveInspector activeCityId={selectedCityId} />
          )}
        </main>
      </div>
    </div>
  );
}

const styles = {
  appContainer: {
    minHeight: '100vh',
    backgroundColor: '#0b0f19',
    color: '#e2e8f0'
  },
  navbar: {
    height: '64px',
    backgroundColor: '#111827',
    borderBottom: '1px solid #1f2937',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px'
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logoTitle: {
    fontSize: '20px',
    fontWeight: '800',
    letterSpacing: '1px',
    color: '#60a5fa'
  },
  logoBadge: {
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    color: '#60a5fa',
    padding: '3px 8px',
    borderRadius: '4px',
    border: '1px solid rgba(96, 165, 250, 0.3)'
  },
  controlsSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  citySelectorLabel: {
    fontSize: '13px',
    color: '#9ca3af',
    fontWeight: '500'
  },
  citySelect: {
    backgroundColor: '#1f2937',
    color: '#f3f4f6',
    border: '1px solid #374151',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '13px',
    outline: 'none'
  },
  mainLayout: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '24px'
  },
  tabBar: {
    display: 'flex',
    gap: '8px',
    borderBottom: '1px solid #1f2937',
    paddingBottom: '12px',
    marginBottom: '24px'
  },
  tabButton: (isActive) => ({
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: isActive ? '#1f2937' : 'transparent',
    color: isActive ? '#60a5fa' : '#9ca3af',
    fontWeight: isActive ? '600' : '400',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }),
  contentBody: {
    width: '100%'
  }
};
