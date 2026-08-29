/**
 * CITYMIND University Research & Technology Tree Engine
 * Simulates higher education academic output, research point generation,
 * patent licensing revenues, and tech tree unlocks across 30 municipal innovations.
 */

export const TECH_TREE = [
  {
    id: 'tech_quantum_computing',
    name: 'Quantum Computing Infrastructure',
    category: 'Information Tech',
    costPoints: 5000,
    requiredLevel: 4,
    description: 'Deploys quantum encryption and supercomputing nodes across city hall and tech parks. Boosts commercial tech revenue by 35% and smart grid efficiency by 20%.',
    effects: { commercialRevenueMultiplier: 1.35, gridEfficiencyBonus: 0.20 },
    prerequisites: [],
    unlocked: false,
  },
  {
    id: 'tech_fusion_reactors',
    name: 'Fusion Micro-Reactors',
    category: 'Energy',
    costPoints: 12000,
    requiredLevel: 5,
    description: 'Unlocks zero-emission tokamak fusion micro-reactors. Provides 500 MW clean electricity with zero smog or radioactive waste.',
    effects: { unlocksBuilding: 'fusion_micro_reactor', powerOutputBonus: 500 },
    prerequisites: ['tech_quantum_computing'],
    unlocked: false,
  },
  {
    id: 'tech_autonomous_transit',
    name: 'Autonomous Electric Rapid Transit',
    category: 'Transport',
    costPoints: 4000,
    requiredLevel: 3,
    description: 'Deploys self-driving electric buses and taxis. Lowers traffic congestion by 25% and cuts transport operating costs by 40%.',
    effects: { trafficCongestionReduction: 0.25, transitOperatingCostDiscount: 0.40 },
    prerequisites: [],
    unlocked: false,
  },
  {
    id: 'tech_ai_grid_dispatch',
    name: 'AI Power & Water Load Dispatch',
    category: 'Infrastructure',
    costPoints: 3500,
    requiredLevel: 3,
    description: 'Uses machine learning algorithms to balance voltage fluctuations and water pressure drops automatically.',
    effects: { powerLossReduction: 0.15, waterPipeLossReduction: 0.18 },
    prerequisites: [],
    unlocked: false,
  },
  {
    id: 'tech_desalination_plants',
    name: 'Graphene Desalination Purification',
    category: 'Water',
    costPoints: 4500,
    requiredLevel: 3,
    description: 'Allows seawater purification with 99.8% efficiency, solving municipal water scarcity in coastal cities.',
    effects: { unlocksBuilding: 'graphene_desalination_plant', waterCapacityBonus: 800 },
    prerequisites: [],
    unlocked: false,
  },
  {
    id: 'tech_vertical_hydroponics',
    name: 'Vertical Hydroponic Skyscrapers',
    category: 'Agriculture',
    costPoints: 3000,
    requiredLevel: 2,
    description: 'Enables high-density indoor vertical farming, eliminating city food shortages and lowering fresh produce transport costs.',
    effects: { unlocksBuilding: 'vertical_hydroponic_farm', foodSelfSufficiency: 1.0 },
    prerequisites: [],
    unlocked: false,
  },
  {
    id: 'tech_carbon_scrubber_net',
    name: 'Direct Air Carbon Scrubber Network',
    category: 'Environment',
    costPoints: 6000,
    requiredLevel: 4,
    description: 'Constructs industrial carbon capture towers that suck CO2 and particulate smog directly from urban air.',
    effects: { unlocksBuilding: 'carbon_capture_tower', smogReductionPpm: 30 },
    prerequisites: ['tech_ai_grid_dispatch'],
    unlocked: false,
  },
  {
    id: 'tech_smart_health_sensors',
    name: 'Biometric Wearable Health Network',
    category: 'Healthcare',
    costPoints: 4000,
    requiredLevel: 3,
    description: 'Provides free smart health monitors to citizens, enabling early disease detection and raising life expectancy by 6 years.',
    effects: { citizenLifespanBonusYears: 6, epidemicSpreadReduction: 0.50 },
    prerequisites: [],
    unlocked: false,
  },
  {
    id: 'tech_hyperloop_corridor',
    name: 'Inter-City Hyperloop Vacuum Transit',
    category: 'Transport',
    costPoints: 15000,
    requiredLevel: 5,
    description: 'Constructs 1,000 km/h vacuum tube transit connecting Metropolis to regional trade hubs, boosting tourism by 50%.',
    effects: { tourismRevenueMultiplier: 1.50, regionalTradeVolume: 2.0 },
    prerequisites: ['tech_autonomous_transit'],
    unlocked: false,
  },
  {
    id: 'tech_automated_police_drones',
    name: 'Autonomous Police Patrol Drones',
    category: 'Public Safety',
    costPoints: 3200,
    requiredLevel: 2,
    description: 'Deploys aerial surveillance drones in high-crime sectors, lowering response times to under 60 seconds.',
    effects: { policeResponseTimeReductionSec: 120, crimeRateDeterrencePct: 20 },
    prerequisites: [],
    unlocked: false,
  },
];

export class UniversityResearch {
  constructor(simulation) {
    this.simulation = simulation;
    this.researchPoints = 1250;
    this.monthlyPointGeneration = 140;
    this.professorsCount = 45;
    this.techTree = TECH_TREE.map((t) => ({ ...t }));
    this.unlockedTechIds = new Set(['tech_vertical_hydroponics']);
    this.activeResearchTechId = 'tech_autonomous_transit';
    this.patentLicensingRevenueMonthly = 4200;
  }

  update(deltaMonths) {
    const universityCount = this.simulation?.buildingManager?.getBuildingsByCategory('Education').length || 1;
    this.professorsCount = universityCount * 45;
    this.monthlyPointGeneration = Math.round(this.professorsCount * 3.2);

    this.researchPoints += this.monthlyPointGeneration * deltaMonths;
    this.patentLicensingRevenueMonthly = this.unlockedTechIds.size * 2800;

    // Check if active research tech can be auto-unlocked
    if (this.activeResearchTechId) {
      const tech = this.techTree.find((t) => t.id === this.activeResearchTechId);
      if (tech && !tech.unlocked && this.researchPoints >= tech.costPoints) {
        this.unlockTech(tech.id);
      }
    }
  }

  unlockTech(techId) {
    const tech = this.techTree.find((t) => t.id === techId);
    if (!tech || tech.unlocked) return false;

    if (this.researchPoints >= tech.costPoints) {
      this.researchPoints -= tech.costPoints;
      tech.unlocked = true;
      this.unlockedTechIds.add(techId);
      this.activeResearchTechId = null;

      if (this.simulation?.addNotification) {
        this.simulation.addNotification({
          type: 'success',
          title: 'Technology Unlocked!',
          message: `University researchers have unlocked: ${tech.name}!`,
        });
      }
      return true;
    }
    return false;
  }

  setActiveResearch(techId) {
    const tech = this.techTree.find((t) => t.id === techId);
    if (tech && !tech.unlocked) {
      this.activeResearchTechId = techId;
      return true;
    }
    return false;
  }

  getResearchSummary() {
    return {
      researchPoints: Math.round(this.researchPoints),
      monthlyPointGeneration: this.monthlyPointGeneration,
      professorsCount: this.professorsCount,
      unlockedCount: this.unlockedTechIds.size,
      totalTechCount: this.techTree.length,
      patentRevenue: this.patentLicensingRevenueMonthly,
      activeResearch: this.techTree.find((t) => t.id === this.activeResearchTechId) || null,
      techTree: this.techTree,
    };
  }
}

export default UniversityResearch;
