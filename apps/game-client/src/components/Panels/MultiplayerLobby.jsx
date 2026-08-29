import React, { useState, useEffect, useMemo, useRef } from 'react';

/**
 * MAYOR SPECIALIZATION ROLES DEFINITION
 */
export const MAYOR_ROLES = [
  { id: 'governor', name: 'Chief Governor', icon: '🏛️', color: '#1a73e8', desc: 'Overall zoning approval, district policies & veto power.' },
  { id: 'finance', name: 'Finance Director', icon: '💼', color: '#34a853', desc: 'Tax rates, municipal bond refinancing & treasury budget allocation.' },
  { id: 'utilities', name: 'Energy & Utility Chief', icon: '⚡', color: '#fbbc04', desc: 'Power grid balance, clean water pipelines & waste recycling.' },
  { id: 'transport', name: 'Transport Commissioner', icon: '🚆', color: '#4285f4', desc: 'Road grids, bus rapid transit & subway line expansion.' },
  { id: 'environment', name: 'Environmental Director', icon: '🌿', color: '#00acc1', desc: 'Parks, pollution remediation & emergency disaster response.' }
];

/**
 * INITIAL MOCK MULTIPLAYER ROOMS
 */
const MOCK_ROOMS = [
  {
    id: 'room_101',
    name: 'Metropolis Megacity Co-Op',
    host: 'Mayor_Vanderbilt',
    map: 'Riverdale Basin',
    players: 3,
    maxPlayers: 6,
    ping: 24,
    hasPassword: shadow => false,
    startingBudget: 1000000,
    disasters: 'Normal',
    status: 'In Lobby'
  },
  {
    id: 'room_102',
    name: 'Desert Oasis Solar Grid',
    host: 'SolarSam',
    map: 'Sun Valley Dunes',
    players: 2,
    maxPlayers: 4,
    ping: 48,
    hasPassword: true,
    startingBudget: 500000,
    disasters: 'Off',
    status: 'In Lobby'
  },
  {
    id: 'room_103',
    name: 'Toxic Cleanup Taskforce',
    host: 'BioGuardian',
    map: 'Oldport River',
    players: 4,
    maxPlayers: 4,
    ping: 32,
    hasPassword: false,
    startingBudget: 750000,
    disasters: 'Frequent',
    status: 'In Game'
  }
];

/**
 * MAIN MULTIPLAYER LOBBY COMPONENT
 */
export default function MultiplayerLobby({ socket = null, currentUser = null, onClose }) {
  const [activeTab, setActiveTab] = useState('browser'); // 'browser' | 'lobby' | 'trading' | 'chat'
  const [rooms, setRooms] = useState(MOCK_ROOMS);
  const [selectedRoom, setSelectedRoom] = useState(MOCK_ROOMS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Room Creation Form State
  const [createForm, setCreateForm] = useState({
    name: 'New Mayor Co-Op City',
    map: 'Riverdale Basin',
    maxPlayers: 4,
    password: '',
    startingBudget: 1000000,
    disasters: 'Normal'
  });

  // Current Joined Room Lobby State
  const [joinedRoom, setJoinedRoom] = useState({
    id: 'room_101',
    name: 'Metropolis Megacity Co-Op',
    host: 'Mayor_Vanderbilt',
    map: 'Riverdale Basin',
    myRole: 'governor',
    isReady: false,
    players: [
      { id: 'usr_1', username: 'Mayor_Vanderbilt', role: 'governor', ping: 24, isHost: true, isReady: true },
      { id: 'usr_2', username: 'GridArchitect', role: 'utilities', ping: 45, isHost: false, isReady: true },
      { id: 'usr_3', username: 'Current_Mayor', role: 'finance', ping: 18, isHost: false, isReady: false }
    ]
  });

  // Trading Desk State
  const [commodityMarket, setCommodityMarket] = useState([
    { id: 'elec', name: 'Electricity', icon: '⚡', unit: 'MW/h', price: 42.50, change: +3.4, supply: 1200, demand: 980 },
    { id: 'water', name: 'Clean Water', icon: '💧', unit: 'm3/s', price: 18.20, change: -1.2, supply: 4500, demand: 3900 },
    { id: 'steel', name: 'Industrial Steel', icon: '🏗️', unit: 'tons', price: 145.00, change: +8.1, supply: 850, demand: 1100 },
    { id: 'chips', name: 'Microchips', icon: '💾', unit: 'units', price: 320.00, change: +12.5, supply: 400, demand: 620 }
  ]);

  const [tradeContracts, setTradeContracts] = useState([
    { id: 'trd_01', seller: 'Desert Oasis', buyer: 'Metropolis', item: 'Electricity (50 MW)', value: '$2,125/mo', status: 'Active' },
    { id: 'trd_02', seller: 'Oldport Basin', buyer: 'Metropolis', item: 'Industrial Steel (20 t)', value: '$2,900/mo', status: 'Pending Approval' }
  ]);

  // Chat Window State
  const [chatMessages, setChatMessages] = useState([
    { id: 'm1', sender: 'System', text: 'Welcome to Metropolis Megacity Co-Op Lobby!', timestamp: '12:00 PM', isSystem: true },
    { id: 'm2', sender: 'Mayor_Vanderbilt', text: 'Hey mayors! We need a Finance Director to manage taxes.', timestamp: '12:01 PM' },
    { id: 'm3', sender: 'GridArchitect', text: 'I am ready to build the new solar park once budget is approved.', timestamp: '12:02 PM' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef(null);

  // Socket.IO event listeners binding
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (msg) => {
      setChatMessages(prev => [...prev, msg]);
    };

    const handleUserJoined = (data) => {
      setChatMessages(prev => [...prev, {
        id: `sys_${Date.now()}`,
        sender: 'System',
        text: `${data.username} joined the co-op lobby.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true
      }]);
    };

    socket.on('chat:message_received', handleMessageReceived);
    socket.on('city:user_joined', handleUserJoined);

    return () => {
      socket.off('chat:message_received', handleMessageReceived);
      socket.off('city:user_joined', handleUserJoined);
    };
  }, [socket]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const newMsg = {
      id: `msg_${Date.now()}`,
      sender: currentUser?.username || 'Current_Mayor',
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, newMsg]);

    if (socket) {
      socket.emit('chat:send_message', { cityId: joinedRoom.id, message: chatInput.trim() });
    }
    setChatInput('');
  };

  const handleCreateRoom = (e) => {
    e.preventDefault();
    const newRoom = {
      id: `room_${Date.now()}`,
      name: createForm.name,
      host: currentUser?.username || 'Current_Mayor',
      map: createForm.map,
      players: 1,
      maxPlayers: Number(createForm.maxPlayers),
      ping: 15,
      hasPassword: !!createForm.password,
      startingBudget: Number(createForm.startingBudget),
      disasters: createForm.disasters,
      status: 'In Lobby'
    };
    setRooms(prev => [newRoom, ...prev]);
    setSelectedRoom(newRoom);
    setShowCreateModal(false);
    setActiveTab('lobby');
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#0f1419',
      color: '#e8eaed',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, system-ui, sans-serif',
      overflow: 'hidden'
    }}>
      {/* HEADER */}
      <div style={{
        padding: '16px 24px',
        background: '#1a2332',
        borderBottom: '1px solid #2d3a4f',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1a73e8', fontWeight: '800' }}>
            🌐 CITYMIND Multiplayer Co-Op Lobby & Trade Desk
          </h2>
          <span style={{ background: '#243044', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', color: '#34a853' }}>
            ● Connected to Server
          </span>
        </div>

        {onClose && (
          <button onClick={onClose} className="danger" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            ✕ Exit Lobby
          </button>
        )}
      </div>

      {/* NAVIGATION TABS */}
      <div style={{ padding: '0 24px', background: '#161e2e', borderBottom: '1px solid #2d3a4f', display: 'flex', gap: '12px' }}>
        {[
          { id: 'browser', label: '🔍 Active Rooms Browser' },
          { id: 'lobby', label: '🏛️ Joined City Lobby' },
          { id: 'trading', label: '📈 Inter-City Resource Trading' },
          { id: 'chat', label: '💬 Mayor Co-Op Chat' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px',
              fontSize: '0.85rem',
              fontWeight: '600',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '3px solid #1a73e8' : '3px solid transparent',
              color: activeTab === tab.id ? '#4285f4' : '#9aa0a6',
              borderRadius: 0
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* MAIN BODY AREA */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        
        {/* TAB 1: ROOM BROWSER */}
        {activeTab === 'browser' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* SEARCH & CREATE BAR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
              <input
                type="text"
                placeholder="🔍 Search rooms by name or host..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, background: '#1a2332', border: '1px solid #2d3a4f', color: '#fff', borderRadius: '6px', padding: '8px 12px' }}
              />
              <button
                onClick={() => setShowCreateModal(true)}
                style={{ background: '#34a853', color: '#fff', padding: '8px 20px', borderRadius: '6px', border: 'none', fontWeight: '700' }}
              >
                ➕ Create Co-Op Room
              </button>
            </div>

            {/* ROOM CARDS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
              {rooms.map(rm => (
                <div
                  key={rm.id}
                  style={{
                    background: '#1a2332',
                    border: '1px solid #2d3a4f',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.75rem', background: '#243044', color: '#4285f4', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                        {rm.map}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: rm.ping < 30 ? '#34a853' : '#fbbc04' }}>
                        📶 {rm.ping}ms
                      </span>
                    </div>

                    <h3 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', color: '#fff', fontWeight: '700' }}>
                      {rm.name} {rm.hasPassword && '🔒'}
                    </h3>
                    <p style={{ margin: '0 0 12px 0', fontSize: '0.8rem', color: '#9aa0a6' }}>
                      Host: <strong style={{ color: '#8ab4f8' }}>{rm.host}</strong>
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid #2d3a4f', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#9aa0a6' }}>
                      👥 Mayors: <strong style={{ color: '#fff' }}>{rm.players} / {rm.maxPlayers}</strong>
                    </span>

                    <button
                      onClick={() => { setSelectedRoom(rm); setActiveTab('lobby'); }}
                      disabled={rm.players >= rm.maxPlayers}
                      style={{
                        background: rm.players >= rm.maxPlayers ? '#334155' : '#1a73e8',
                        color: '#fff',
                        padding: '6px 16px',
                        fontSize: '0.8rem',
                        borderRadius: '4px',
                        border: 'none',
                        fontWeight: '600'
                      }}
                    >
                      {rm.players >= rm.maxPlayers ? 'Full' : 'Join Room'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: JOINED CITY LOBBY */}
        {activeTab === 'lobby' && (
          <div style={{ display: 'flex', gap: '24px' }}>
            {/* LEFT: CONNECTED PLAYERS & ROLES */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#1a2332', padding: '16px', borderRadius: '8px', border: '1px solid #2d3a4f' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#4285f4', fontWeight: '700' }}>
                  👥 Connected Mayors ({joinedRoom.players.length} / 6)
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {joinedRoom.players.map(ply => {
                    const roleObj = MAYOR_ROLES.find(r => r.id === ply.role) || MAYOR_ROLES[0];
                    return (
                      <div key={ply.id} style={{ background: '#0f1419', padding: '12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '1.5rem' }}>{roleObj.icon}</span>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{ply.username}</strong>
                              {ply.isHost && <span style={{ background: '#fbbc04', color: '#111', fontSize: '0.65rem', padding: '1px 5px', borderRadius: '3px', fontWeight: '800' }}>HOST</span>}
                            </div>
                            <span style={{ fontSize: '0.75rem', color: roleObj.color, fontWeight: '600' }}>
                              {roleObj.name}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '0.75rem', color: '#9aa0a6' }}>📶 {ply.ping}ms</span>
                          <span style={{
                            background: ply.isReady ? 'rgba(52, 168, 83, 0.2)' : 'rgba(234, 67, 53, 0.2)',
                            color: ply.isReady ? '#34a853' : '#ea4335',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '700'
                          }}>
                            {ply.isReady ? 'READY' : 'NOT READY'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* MAYOR ROLE SELECTION BOX */}
              <div style={{ background: '#1a2332', padding: '16px', borderRadius: '8px', border: '1px solid #2d3a4f' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#fff' }}>
                  🎯 Select Your Mayor Specialization Role:
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                  {MAYOR_ROLES.map(r => (
                    <div
                      key={r.id}
                      onClick={() => setJoinedRoom(prev => ({ ...prev, myRole: r.id }))}
                      style={{
                        background: joinedRoom.myRole === r.id ? 'rgba(26, 115, 232, 0.2)' : '#0f1419',
                        border: joinedRoom.myRole === r.id ? `2px solid ${r.color}` : '1px solid #2d3a4f',
                        padding: '10px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <span>{r.icon}</span>
                        <strong style={{ fontSize: '0.8rem', color: r.color }}>{r.name}</strong>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: '#9aa0a6', lineHeight: '1.3' }}>{r.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: ROOM RULES & LAUNCH CONTROL */}
            <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#1a2332', padding: '16px', borderRadius: '8px', border: '1px solid #2d3a4f' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#fff' }}>⚙️ Room Settings</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: '#9aa0a6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Map:</span> <strong style={{ color: '#fff' }}>{joinedRoom.map}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Starting Funds:</span> <strong style={{ color: '#34a853' }}>$1,000,000</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Disasters:</span> <strong style={{ color: '#fbbc04' }}>Normal</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setJoinedRoom(prev => ({ ...prev, isReady: !prev.isReady }))}
                style={{
                  background: joinedRoom.isReady ? '#ea4335' : '#34a853',
                  color: '#fff',
                  padding: '14px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                {joinedRoom.isReady ? 'CANCEL READY' : '✓ TOGGLE READY STATUS'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: TRADING DESK */}
        {activeTab === 'trading' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fbbc04', fontWeight: '700' }}>
              📈 Regional Commodity Trading Desk & Infrastructure Pipelines
            </h3>

            {/* COMMODITY TICKER GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {commodityMarket.map(item => (
                <div key={item.id} style={{ background: '#1a2332', padding: '14px', borderRadius: '8px', border: '1px solid #2d3a4f' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff' }}>
                      {item.icon} {item.name}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: item.change >= 0 ? '#34a853' : '#ea4335', fontWeight: '700' }}>
                      {item.change >= 0 ? `+${item.change}%` : `${item.change}%`}
                    </span>
                  </div>
                  <strong style={{ fontSize: '1.2rem', color: '#fff', display: 'block', marginBottom: '4px' }}>
                    ${item.price.toFixed(2)} <span style={{ fontSize: '0.75rem', color: '#9aa0a6' }}>/ {item.unit}</span>
                  </strong>
                  <div style={{ fontSize: '0.7rem', color: '#9aa0a6', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Supply: {item.supply}</span>
                    <span>Demand: {item.demand}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* ACTIVE TRADE CONTRACTS TABLE */}
            <div style={{ background: '#1a2332', padding: '16px', borderRadius: '8px', border: '1px solid #2d3a4f' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#fff' }}>📑 Active Inter-City Supply Contracts</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#243044', color: '#9aa0a6', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px' }}>SELLER CITY</th>
                    <th style={{ padding: '8px 12px' }}>BUYER CITY</th>
                    <th style={{ padding: '8px 12px' }}>COMMODITY</th>
                    <th style={{ padding: '8px 12px' }}>SETTLEMENT VALUE</th>
                    <th style={{ padding: '8px 12px' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {tradeContracts.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #2d3a4f' }}>
                      <td style={{ padding: '10px 12px', color: '#8ab4f8' }}>{c.seller}</td>
                      <td style={{ padding: '10px 12px', color: '#8ab4f8' }}>{c.buyer}</td>
                      <td style={{ padding: '10px 12px', fontWeight: '600' }}>{c.item}</td>
                      <td style={{ padding: '10px 12px', color: '#34a853', fontWeight: '700' }}>{c.value}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ background: '#243044', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', color: c.status === 'Active' ? '#34a853' : '#fbbc04' }}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: CHAT WINDOW */}
        {activeTab === 'chat' && (
          <div style={{ height: '480px', display: 'flex', flexDirection: 'column', background: '#1a2332', borderRadius: '8px', border: '1px solid #2d3a4f', overflow: 'hidden' }}>
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {chatMessages.map(msg => (
                <div key={msg.id} style={{
                  background: msg.isSystem ? 'rgba(66, 133, 244, 0.1)' : '#0f1419',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  borderLeft: msg.isSystem ? '3px solid #4285f4' : '3px solid #1a73e8'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <strong style={{ fontSize: '0.8rem', color: msg.isSystem ? '#4285f4' : '#8ab4f8' }}>
                      {msg.sender}
                    </strong>
                    <span style={{ fontSize: '0.7rem', color: '#9aa0a6' }}>{msg.timestamp}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#e8eaed' }}>{msg.text}</p>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            <div style={{ padding: '12px', background: '#161e2e', borderTop: '1px solid #2d3a4f', display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Type mayor message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                style={{ flex: 1, background: '#1a2332', border: '1px solid #2d3a4f', color: '#fff', padding: '8px 12px', borderRadius: '6px' }}
              />
              <button onClick={handleSendMessage} style={{ background: '#1a73e8', color: '#fff', padding: '8px 20px', borderRadius: '6px', border: 'none', fontWeight: '700' }}>
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE ROOM MODAL */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000
        }}>
          <form onSubmit={handleCreateRoom} style={{ width: '420px', background: '#161e2e', border: '1px solid #2d3a4f', padding: '24px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ margin: 0, color: '#fff' }}>➕ Create Co-Op City Room</h3>
            
            <div>
              <label style={{ fontSize: '0.8rem', color: '#9aa0a6' }}>Room Name:</label>
              <input
                type="text"
                required
                value={createForm.name}
                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                style={{ width: '100%', background: '#1a2332', border: '1px solid #2d3a4f', color: '#fff', padding: '8px', borderRadius: '6px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: '#9aa0a6' }}>Terrain Map:</label>
              <select
                value={createForm.map}
                onChange={(e) => setCreateForm(prev => ({ ...prev, map: e.target.value }))}
                style={{ width: '100%', background: '#1a2332', border: '1px solid #2d3a4f', color: '#fff', padding: '8px', borderRadius: '6px' }}
              >
                <option value="Riverdale Basin">Riverdale Basin (Coastal Valley)</option>
                <option value="Sun Valley Dunes">Sun Valley Dunes (Desert)</option>
                <option value="Oldport River">Oldport River (Industrial)</option>
                <option value="Paradise Archipelago">Paradise Archipelago (Islands)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" onClick={() => setShowCreateModal(false)} className="secondary" style={{ flex: 1 }}>Cancel</button>
              <button type="submit" style={{ flex: 1, background: '#34a853', color: '#fff', borderRadius: '6px', border: 'none', fontWeight: '700' }}>Create Room</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
