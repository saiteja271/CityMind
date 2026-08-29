/**
 * CITYMIND Dynamic Events & Disasters Specifications Database
 * Specifications for 35+ dynamic events across Natural, Technical, Economic, Social, and Environmental categories.
 */

export const EVENT_DATABASE = [
  {
    id: 'disaster_earthquake',
    title: 'Category 7.2 Seismic Earthquake',
    category: 'Natural',
    severity: 'Severe',
    riskFactors: { faultLineProximity: 0.8, buildingIntegrityLow: 0.5 },
    durationTicks: 3,
    damageFormula: 'buildingValue * 0.35',
    advisorAlertText: 'EMERGENCY: A major seismic earthquake has struck the city! Substation 3 collapsed and water mains ruptured.',
    emergencyResponses: [
      { name: 'Deploy Urban Rescue Squads', costDollars: 25000, mitigationPct: 40 },
      { name: 'Declare State of Emergency', costDollars: 50000, mitigationPct: 75 },
    ],
  },
  {
    id: 'disaster_tsunami',
    title: 'Coastal Storm Surge & Tsunami Wave',
    category: 'Natural',
    severity: 'Catastrophic',
    riskFactors: { coastalTileProximity: 0.9, seaWallMissing: 0.7 },
    durationTicks: 4,
    damageFormula: 'coastalBuildingValue * 0.65',
    advisorAlertText: 'TSUNAMI WARNING: Tidal wave approaching the harbor district! Evacuate coastal lowlands immediately.',
    emergencyResponses: [
      { name: 'Raise Harbor Barrier Gates', costDollars: 35000, mitigationPct: 60 },
      { name: 'Evacuate Coastal Sector 1', costDollars: 20000, mitigationPct: 50 },
    ],
  },
  {
    id: 'event_stock_crash',
    title: 'Global Financial Equity Market Crash',
    category: 'Economic',
    severity: 'Moderate',
    riskFactors: { inflationHigh: 0.6, interestRatesHigh: 0.5 },
    durationTicks: 12,
    damageFormula: 'taxRevenue * 0.25',
    advisorAlertText: 'ECONOMIC ALERT: Stock market index dropped by 32%! Commercial business tax revenues will shrink.',
    emergencyResponses: [
      { name: 'Provide Municipal Liquidity Line', costDollars: 75000, mitigationPct: 65 },
    ],
  },
];

export default EVENT_DATABASE;
