/**
 * @citymind/simulation-core - Comprehensive City Simulation Core Package
 * Central ES module entry point exporting citizens, economy, infrastructure, municipal services, and zoning engines.
 */

// Root Simulation Engine
export { SimulationEngine } from './SimulationEngine.js';

// Citizens Subsystem
export { Citizen } from './citizens/Citizen.js';
export {
  CitizenPsychology,
  PSYCHOLOGY_DEFAULTS,
  MEMORY_TYPE,
  RELATIONSHIP_TYPE
} from './citizens/CitizenPsychology.js';
export {
  CitizenAI,
  AI_STATE,
  ACTION_TYPE
} from './citizens/CitizenAI.js';
export { CitizenSocialGraph } from './citizens/CitizenSocialGraph.js';
export { CitizenManager } from './citizens/CitizenManager.js';

// Economy Subsystem
export { EconomyEngine, CREDIT_RATING } from './economy/EconomyEngine.js';
export {
  TaxationEngine,
  TAX_CHANNEL,
  RESIDENTIAL_TAX_BRACKETS
} from './economy/TaxationEngine.js';
export {
  MarketSystem,
  BusinessEntity,
  COMMODITY_TYPE,
  COMMODITY_DEFAULTS
} from './economy/MarketSystem.js';
export {
  TradeSystem,
  TRADE_HUB_TYPE,
  RESOURCE_TYPE
} from './economy/TradeSystem.js';

// Utility Infrastructure Subsystem
export { PowerGrid, PowerNode, POWER_PLANT_TYPE } from './infrastructure/PowerGrid.js';
export { WaterGrid } from './infrastructure/WaterGrid.js';
export { TelecomGrid, TelecomTower, TOWER_TYPE } from './infrastructure/TelecomGrid.js';
export { WasteSystem, GarbageTruck, FACILITY_TYPE } from './infrastructure/WasteSystem.js';

// Municipal Services & Zoning Subsystem
export { PoliceService, PatrolVehicle, CRIME_TYPE } from './services/PoliceService.js';
export { FireService, FireEngine } from './services/FireService.js';
export { HealthcareService, Ambulance } from './services/HealthcareService.js';
export {
  EducationService,
  SchoolFacility,
  SCHOOL_TYPE,
  TECH_UNLOCKS
} from './services/EducationService.js';
export { ZoningEngine, ZONE_TYPE } from './services/ZoningEngine.js';
