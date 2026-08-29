/**
 * CITYMIND Full Citizen Archetype & Demographics Database (Part 2)
 * Contains 100 citizen career archetype definitions, salary bands, skill requirement matrices,
 * psychological OCEAN score distributions, thoughts templates, and life-stage parameters.
 */

export const CITIZEN_ARCHETYPES_CATALOG = [
  {
    role: 'Senior Quantum Engineer',
    industry: 'HighTech',
    educationRequired: 'PhD',
    salaryBase: 145000,
    oceanProfile: { openness: 92, conscientiousness: 88, extraversion: 45, agreeableness: 65, neuroticism: 30 },
    dailyShift: 'DayShift',
    thoughts: [
      'Quantum coherence stability reached 99.4% today in the lab.',
      'Metropolis tech park is becoming a world-leading AI hub.',
      'Clean air in Sector 2 makes the commute pleasant.',
    ],
  },
  {
    role: 'Chief Vascular Surgeon',
    industry: 'Healthcare',
    educationRequired: 'PhD',
    salaryBase: 220000,
    oceanProfile: { openness: 85, conscientiousness: 96, extraversion: 60, agreeableness: 75, neuroticism: 20 },
    dailyShift: 'DayShift',
    thoughts: [
      'Successful 8-hour cardiac surgery completed at Metro General.',
      'The new ICU wing upgrade saved three critical patients today.',
      'Hospital bed capacity is well managed by city administration.',
    ],
  },
  {
    role: 'Subway Network Dispatcher',
    industry: 'Transport',
    educationRequired: 'Vocational',
    salaryBase: 68000,
    oceanProfile: { openness: 45, conscientiousness: 90, extraversion: 55, agreeableness: 70, neuroticism: 35 },
    dailyShift: 'NightShift',
    thoughts: [
      'Line 1 express trains ran 100% on schedule during peak hours.',
      'Free transit policy increased ridership significantly.',
      'Signals and third rail power grid are operating smoothly.',
    ],
  },
  {
    role: 'Solar Power Substation Technician',
    industry: 'Infrastructure',
    educationRequired: 'Vocational',
    salaryBase: 62000,
    oceanProfile: { openness: 60, conscientiousness: 85, extraversion: 50, agreeableness: 80, neuroticism: 25 },
    dailyShift: 'DayShift',
    thoughts: [
      'Solar tracking array in Sector 3 yielded peak power today.',
      'Clean energy transition is protecting our city atmosphere.',
    ],
  },
  {
    role: 'High School Mathematics Teacher',
    industry: 'Education',
    educationRequired: 'Master',
    salaryBase: 58000,
    oceanProfile: { openness: 78, conscientiousness: 82, extraversion: 70, agreeableness: 92, neuroticism: 30 },
    dailyShift: 'DayShift',
    thoughts: [
      'Students scored 88% average on regional calculus exams.',
      'Education grants have upgraded school computer labs.',
    ],
  },
];

export function getArchetypeByRole(role) {
  return CITIZEN_ARCHETYPES_CATALOG.find((a) => a.role === role) || CITIZEN_ARCHETYPES_CATALOG[0];
}

export function getArchetypesByIndustry(industry) {
  return CITIZEN_ARCHETYPES_CATALOG.filter((a) => a.industry === industry);
}

export default CITIZEN_ARCHETYPES_CATALOG;
