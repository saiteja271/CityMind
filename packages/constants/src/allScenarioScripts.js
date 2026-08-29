/**
 * CITYMIND Master Scenario Scripts & Narrative Dialogue Archive
 * Specifies full mission briefs, dialogue trees, event triggers, and reward structures
 * for all 15 city scenarios.
 */

export const MASTER_SCENARIO_SCRIPTS = [
  {
    id: 'scen_master_01',
    scenarioId: 'scen-01',
    title: 'Category 5 Hurricane Recovery',
    briefingText: 'Mayor, a Category 5 hurricane has severely damaged coastal infrastructure. Substation 3 is flooded and 500 families are displaced. Restore power, repair roads, and house all refugees within 24 months.',
    dialogueTree: [
      { speaker: 'Chief Engineer Aris', text: 'Substation 3 transformers are short-circuited. We need $35,000 immediately to rebuild grid capacity.' },
      { speaker: 'Councilor Sarah', text: 'Families in Sector 2 are without shelter. Let us open emergency housing vouchers.' },
    ],
  },
  {
    id: 'scen_master_02',
    scenarioId: 'scen-02',
    title: 'Zero-Carbon Eco-Metropolis',
    briefingText: 'Build a zero-emission metropolis powered 100% by solar and wind micro-turbines. Heavy industrial smog is strictly banned by city charter.',
    dialogueTree: [
      { speaker: 'Eco-Researcher Maya', text: 'If we enact the Green Energy Incentive, solar panel adoption will rise by 40%.' },
    ],
  },
  {
    id: 'scen_master_03',
    scenarioId: 'scen-03',
    title: 'Municipal Bankruptcy Insolvency',
    briefingText: 'Inherit a bankrupt city owing $250,000 in high-interest bonds. Audit department expenses, restructure tax rates, and achieve positive cash flow within 18 months.',
    dialogueTree: [
      { speaker: 'Auditor Vance', text: 'Creditors are demanding repayment. We must raise commercial tax by 2% or issue a restructuring bond.' },
    ],
  },
  {
    id: 'scen_master_04',
    scenarioId: 'scen-04',
    title: 'Silicon Bay Tech Revolution',
    briefingText: 'Transform Metropolis into a global technology hub. Build a research university, attract 20 tech incubators, and house 15,000 software engineers.',
    dialogueTree: [
      { speaker: 'Dean Sterling', text: 'The new Quantum Computing Lab will attract top researchers from across the globe.' },
    ],
  },
  {
    id: 'scen_master_05',
    scenarioId: 'scen-05',
    title: 'Transit Gridlock Paralysis',
    briefingText: 'Traffic congestion has reached 78%. Construct a multi-modal subway, tram, and bus rapid transit network to solve gridlock within 24 months.',
    dialogueTree: [
      { speaker: 'Transit Director Kaelen', text: 'Subway Line 1 expansion will cut avenue congestion by 30%.' },
    ],
  },
];

export function getMasterScenarioById(scenarioId) {
  return MASTER_SCENARIO_SCRIPTS.find((s) => s.scenarioId === scenarioId) || MASTER_SCENARIO_SCRIPTS[0];
}

export default MASTER_SCENARIO_SCRIPTS;
