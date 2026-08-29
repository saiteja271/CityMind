import { create } from 'zustand';

/**
 * CITYMIND Central Game Client Store
 * Manages game state, active selection, viewport parameters, UI modals,
 * overlay modes, simulation speed, notifications, policy settings, and audio preferences.
 */
export const useGameStore = create((set, get) => ({
  // --- City Meta State ---
  cityName: 'Metropolis One',
  gameMode: 'sandbox', // 'sandbox', 'scenario', 'challenge'
  difficulty: 'normal',
  seed: 12345,
  isLoaded: false,
  isPaused: false,
  simSpeed: 1, // 0: paused, 1: 1x, 2: 2x, 4: 4x, 8: 8x
  tickCount: 0,
  gameTime: {
    hour: 8,
    day: 1,
    month: 1,
    year: 2026,
    season: 'spring', // 'spring', 'summer', 'autumn', 'winter'
    isDaytime: true,
    lightLevel: 1.0,
  },

  // --- City Stats & Metrics ---
  stats: {
    population: 1250,
    populationGrowthRate: 0.024,
    happiness: 78,
    healthIndex: 82,
    educationIndex: 65,
    crimeRate: 12,
    fireRisk: 8,
    pollutionLevel: 15,
    trafficCongestion: 18,
    unemploymentRate: 4.2,
    treasury: 250000,
    monthlyIncome: 14200,
    monthlyExpenses: 8900,
    netCashFlow: 5300,
    landValueAverage: 145,
    rciDemand: {
      residential: 65,
      commercial: 40,
      industrial: 30,
    },
    utilities: {
      powerCapacity: 500,
      powerDemand: 320,
      powerSatisfaction: 100,
      waterCapacity: 600,
      waterDemand: 290,
      waterSatisfaction: 100,
      wasteCapacity: 400,
      wasteProduction: 210,
      telecomCoverage: 85,
    },
    demographics: {
      infants: 45,
      children: 180,
      teens: 160,
      youngAdults: 320,
      adults: 410,
      seniors: 135,
    },
  },

  // --- Historical Time Series ---
  history: {
    population: [1000, 1050, 1120, 1180, 1250],
    treasury: [200000, 210000, 225000, 238000, 250000],
    happiness: [72, 74, 75, 76, 78],
    pollution: [10, 12, 11, 14, 15],
    crime: [15, 14, 13, 12, 12],
    rciDemand: [
      { r: 50, c: 30, i: 40 },
      { r: 55, c: 35, i: 35 },
      { r: 60, c: 38, i: 32 },
      { r: 65, c: 40, i: 30 },
    ],
  },

  // --- Active Placement & Tool State ---
  activeTool: 'select', // 'select', 'zone_res', 'zone_com', 'zone_ind', 'road', 'build', 'demolish', 'inspect', 'district'
  selectedBuildingType: null,
  selectedZoneType: null,
  roadType: 'asphalt_2lane',
  isDraggingTool: false,
  dragStartCoords: null,
  hoveredTile: null,

  // --- Selection & Inspection Modals ---
  selectedEntity: null, // { type: 'citizen' | 'building' | 'tile' | 'district', id: string, data: object }
  activeModal: null, // null, 'citizen_inspect', 'building_inspect', 'district_inspect', 'economy', 'policy', 'advisor', 'stats', 'achievements', 'audio_settings', 'pause_menu'

  // --- Overlay & Heatmap Modes ---
  overlayMode: 'none', // 'none', 'power', 'water', 'telecom', 'traffic', 'pollution', 'crime', 'land_value', 'health', 'education', 'fire_risk', 'noise'

  // --- Tax Rates & Policies ---
  taxes: {
    residentialLow: 9,
    residentialHigh: 12,
    commercialLow: 10,
    commercialHigh: 14,
    industrialLight: 11,
    industrialHeavy: 15,
    carbonTax: 5,
    propertyTax: 2,
  },
  activePolicies: [
    'green_energy_incentive',
    'free_public_transit',
    'recycling_mandate',
  ],

  // --- Notifications Ticker ---
  notifications: [
    { id: 1, type: 'info', title: 'New Citizens Arrived', message: '12 new families have moved into the East District.', timestamp: Date.now() - 60000, read: false },
    { id: 2, type: 'warning', title: 'Power Grid Alert', message: 'Substation 3 is operating at 92% capacity.', timestamp: Date.now() - 120000, read: false },
  ],

  // --- Audio Settings ---
  audio: {
    masterVolume: 0.8,
    ambientVolume: 0.6,
    sfxVolume: 0.7,
    musicVolume: 0.5,
    isMuted: false,
    synthTheme: 'ambient_city',
  },

  // --- Actions & Mutators ---
  setCityName: (name) => set({ cityName: name }),
  setGameMode: (mode) => set({ gameMode: mode }),
  setSimSpeed: (speed) => set({ simSpeed: speed, isPaused: speed === 0 }),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused, simSpeed: state.isPaused ? 1 : 0 })),

  advanceTick: () => set((state) => {
    const newTick = state.tickCount + 1;
    let newHour = state.gameTime.hour;
    let newDay = state.gameTime.day;
    let newMonth = state.gameTime.month;
    let newYear = state.gameTime.year;

    if (newTick % 10 === 0) {
      newHour = (newHour + 1) % 24;
      if (newHour === 0) {
        newDay += 1;
        if (newDay > 30) {
          newDay = 1;
          newMonth += 1;
          if (newMonth > 12) {
            newMonth = 1;
            newYear += 1;
          }
        }
      }
    }

    const isDay = newHour >= 6 && newHour < 20;
    const seasons = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'];

    return {
      tickCount: newTick,
      gameTime: {
        hour: newHour,
        day: newDay,
        month: newMonth,
        year: newYear,
        season: seasons[newMonth - 1],
        isDaytime: isDay,
        lightLevel: isDay ? 1.0 : 0.35,
      },
    };
  }),

  setActiveTool: (tool, options = {}) => set({
    activeTool: tool,
    selectedBuildingType: options.buildingType || null,
    selectedZoneType: options.zoneType || null,
    roadType: options.roadType || 'asphalt_2lane',
  }),

  setHoveredTile: (tile) => set({ hoveredTile: tile }),
  setSelectedEntity: (entity) => set({ selectedEntity: entity }),
  openModal: (modalName) => set({ activeModal: modalName }),
  closeModal: () => set({ activeModal: null }),

  setOverlayMode: (mode) => set({ overlayMode: mode }),

  updateTaxRate: (category, rate) => set((state) => ({
    taxes: { ...state.taxes, [category]: Math.max(0, Math.min(30, rate)) },
  })),

  togglePolicy: (policyId) => set((state) => {
    const exists = state.activePolicies.includes(policyId);
    return {
      activePolicies: exists
        ? state.activePolicies.filter((p) => p !== policyId)
        : [...state.activePolicies, policyId],
    };
  }),

  addNotification: (notification) => set((state) => ({
    notifications: [
      { id: Date.now(), timestamp: Date.now(), read: false, ...notification },
      ...state.notifications.slice(0, 49),
    ],
  })),

  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
  })),

  clearNotifications: () => set({ notifications: [] }),

  updateAudioSetting: (key, val) => set((state) => ({
    audio: { ...state.audio, [key]: val },
  })),

  updateStats: (newStats) => set((state) => ({
    stats: { ...state.stats, ...newStats },
  })),

  recordHistorySnapshot: () => set((state) => ({
    history: {
      population: [...state.history.population.slice(-50), state.stats.population],
      treasury: [...state.history.treasury.slice(-50), state.stats.treasury],
      happiness: [...state.history.happiness.slice(-50), state.stats.happiness],
      pollution: [...state.history.pollution.slice(-50), state.stats.pollution],
      crime: [...state.history.crime.slice(-50), state.stats.crime],
      rciDemand: [...state.history.rciDemand.slice(-50), state.stats.rciDemand],
    },
  })),
}));
