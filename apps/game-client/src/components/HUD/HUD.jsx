import React from 'react';
import { useGameStore } from '../../store/gameStore.js';
import TopBar from './TopBar.jsx';
import BottomToolbar from './BottomToolbar.jsx';
import HeatmapOverlaySelector from '../Panels/HeatmapOverlaySelector.jsx';
import CitizenInspectorModal from '../Panels/CitizenInspectorModal.jsx';
import BuildingInspectorModal from '../Panels/BuildingInspectorModal.jsx';
import EconomyDashboard from '../Panels/EconomyDashboard.jsx';
import PolicyCenter from '../Panels/PolicyCenter.jsx';
import AchievementCenter from '../Panels/AchievementCenter.jsx';
import AudioSettingsModal from '../Panels/AudioSettingsModal.jsx';

export default function HUD() {
  const { activeModal, notifications, markNotificationRead } = useGameStore();

  return (
    <>
      <TopBar />
      <HeatmapOverlaySelector />
      <BottomToolbar />

      {/* Notifications Toast Overlay */}
      <div style={{ position: 'absolute', top: 70, left: 20, zIndex: 200, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {notifications.slice(0, 5).map((n) => (
          <div
            key={n.id}
            onClick={() => markNotificationRead(n.id)}
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: '12px',
              background: n.type === 'error' || n.type === 'warning' ? 'rgba(225, 29, 72, 0.92)' : 'rgba(15, 23, 42, 0.92)',
              border: '1px solid #334155',
              color: '#f8fafc',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(8px)',
              cursor: 'pointer',
              maxWidth: 320,
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{n.title || 'Notification'}</div>
            <div style={{ color: '#cbd5e1' }}>{n.message}</div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {activeModal === 'citizen_inspect' && <CitizenInspectorModal />}
      {activeModal === 'building_inspect' && <BuildingInspectorModal />}
      {activeModal === 'economy' && <EconomyDashboard />}
      {activeModal === 'policy' && <PolicyCenter />}
      {activeModal === 'achievements' && <AchievementCenter />}
      {activeModal === 'audio_settings' && <AudioSettingsModal />}
    </>
  );
}
