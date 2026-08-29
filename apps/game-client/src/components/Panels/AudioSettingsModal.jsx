import React from 'react';
import { useGameStore } from '../../store/gameStore';

/**
 * Audio Settings & Web Audio Synthesizer Controls Component
 * Allows players to tune Master Volume, Ambient Soundscapes, SFX,
 * Dynamic Synthesizer Soundtrack Themes, and Mute States.
 */
export const AudioSettingsModal = () => {
  const { audio, updateAudioSetting, closeModal } = useGameStore();

  const themes = [
    { id: 'ambient_city', name: 'Ambient City Hum (Lo-Fi Synth)', desc: 'Generative chill pads and soft city background hum' },
    { id: 'cyberpunk_pulse', name: 'Cyberpunk Pulse (Bassline & Beats)', desc: 'Energetic synthwave arpeggios for fast-growing cities' },
    { id: 'orchestral_sim', name: 'Symphonic Builder (Classic Orchestral)', desc: 'Sweeping strings and brass for monumental city building' },
    { id: 'minimal_zen', name: 'Zen Drone (Relaxing Micro-Sounds)', desc: 'Calming ambient tones and natural rain sounds' },
  ];

  return (
    <div className="modal-overlay" style={modalOverlayStyle}>
      <div className="modal-content" style={modalContentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#f8fafc' }}>
              🔊 Audio Synthesizer & Soundscape Controls
            </h2>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              Real-time procedural Web Audio API sound generator
            </span>
          </div>
          <button onClick={closeModal} style={closeButtonStyle}>✕</button>
        </div>

        <div style={{ padding: '20px', overflowY: 'auto', maxHeight: '480px' }}>
          {/* Mute Toggle */}
          <div style={{ ...cardStyle, marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#f8fafc' }}>Master Audio Mute</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Silence all game audio and synth loops</div>
            </div>
            <button
              onClick={() => updateAudioSetting('isMuted', !audio.isMuted)}
              style={{
                padding: '8px 18px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 'bold',
                cursor: 'pointer',
                background: audio.isMuted ? '#ef4444' : '#22c55e',
                color: '#fff',
              }}
            >
              {audio.isMuted ? 'MUTED 🔇' : 'AUDIO ACTIVE 🔊'}
            </button>
          </div>

          {/* Volume Sliders */}
          <div style={{ ...cardStyle, marginBottom: '16px' }}>
            <div style={cardTitleStyle}>Volume Channels</div>

            {[
              { label: 'Master Volume', key: 'masterVolume', val: audio.masterVolume },
              { label: 'Ambient City Soundscape', key: 'ambientVolume', val: audio.ambientVolume },
              { label: 'Sound Effects & UI Clicks', key: 'sfxVolume', val: audio.sfxVolume },
              { label: 'Procedural Synth Soundtrack', key: 'musicVolume', val: audio.musicVolume },
            ].map((slider) => (
              <div key={slider.key} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                  <span style={{ color: '#f8fafc', fontWeight: '500' }}>{slider.label}</span>
                  <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{Math.round(slider.val * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={slider.val}
                  onChange={(e) => updateAudioSetting(slider.key, parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
                />
              </div>
            ))}
          </div>

          {/* Synth Theme Selector */}
          <div style={cardStyle}>
            <div style={cardTitleStyle}>Procedural Soundtrack Theme</div>
            {themes.map((th) => (
              <div
                key={th.id}
                onClick={() => updateAudioSetting('synthTheme', th.id)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: audio.synthTheme === th.id ? '1px solid #38bdf8' : '1px solid #334155',
                  background: audio.synthTheme === th.id ? '#1e293b' : '#0f172a',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: audio.synthTheme === th.id ? '#38bdf8' : '#f8fafc' }}>
                  {audio.synthTheme === th.id ? '🎶 ' : ''}{th.name}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{th.desc}</div>
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
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.75)',
  backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000,
};

const modalContentStyle = {
  width: '540px',
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

const cardStyle = {
  background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '14px',
};

const cardTitleStyle = {
  fontSize: '12px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '10px', textTransform: 'uppercase',
};

export default AudioSettingsModal;
