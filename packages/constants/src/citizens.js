/**
 * CITYMIND Citizen Simulation Constants & Systems
 * Production-quality dataset covering Big 5 personality traits, 60+ career tracks,
 * shift schedules, emotional state transition tables, utility need models,
 * life stage parameters, and mortality/sickness matrices.
 */

// ---------------------------------------------------------------------------
// 1. OCEAN BIG 5 PERSONALITY TRAITS
// ---------------------------------------------------------------------------
export const BIG_FIVE_TRAITS = Object.freeze({
  OPENNESS: {
    id: 'openness',
    name: 'Openness to Experience',
    description: 'Degree of intellectual curiosity, creativity, and preference for novelty.',
    range: [0, 100],
    defaultMean: 50,
    defaultStdDev: 15,
    impacts: {
      educationSpeed: 0.002, // +0.2% per point
      entertainmentNeedMultiplier: 0.0015,
      adaptabilityToPolicyChange: 0.003,
      preferredHousingCategory: ['residential_high', 'residential_luxury']
    }
  },
  CONSCIENTIOUSNESS: {
    id: 'conscientiousness',
    name: 'Conscientiousness',
    description: 'Tendency to exercise self-discipline, act dutifully, and aim for achievement.',
    range: [0, 100],
    defaultMean: 50,
    defaultStdDev: 15,
    impacts: {
      workProductivity: 0.003,
      savingsRate: 0.0025,
      crimePropensity: -0.004,
      healthDecayRate: -0.001
    }
  },
  EXTRAVERSION: {
    id: 'extraversion',
    name: 'Extraversion',
    description: 'Energy, positive emotions, urgency, assertiveness, sociability and garrulousness.',
    range: [0, 100],
    defaultMean: 50,
    defaultStdDev: 15,
    impacts: {
      socialNeedDecay: 0.003, // Extraverts lose social energy faster
      happinessFromEvents: 0.004,
      preferredCommercialCategory: ['commercial_entertainment', 'commercial_mall'],
      commuteStressMultiplier: 0.001
    }
  },
  AGREEABLENESS: {
    id: 'agreeableness',
    name: 'Agreeableness',
    description: 'Compassionate and cooperative rather than suspicious and antagonistic towards others.',
    range: [0, 100],
    defaultMean: 50,
    defaultStdDev: 15,
    impacts: {
      taxCompliance: 0.003,
      communityVolunteering: 0.005,
      crimePropensity: -0.005,
      voterApprovalBase: 0.002
    }
  },
  NEUROTICISM: {
    id: 'neuroticism',
    name: 'Neuroticism',
    description: 'Tendency to experience unpleasant emotions easily, such as anger, anxiety, depression, and vulnerability.',
    range: [0, 100],
    defaultMean: 50,
    defaultStdDev: 15,
    impacts: {
      stressDecayMultiplier: 0.004,
      sicknessSusceptibility: 0.003,
      disasterPanicThreshold: -0.005,
      happinessDecayRate: 0.002
    }
  }
});

// ---------------------------------------------------------------------------
// 2. EDUCATION TIERS
// ---------------------------------------------------------------------------
export const EDUCATION_TIERS = Object.freeze({
  NONE: { level: 0, name: 'None', minAge: 0, yearsRequired: 0 },
  HIGH_SCHOOL: { level: 1, name: 'High School Diploma', minAge: 18, yearsRequired: 12 },
  VOCATIONAL: { level: 2, name: 'Vocational Certification', minAge: 20, yearsRequired: 14 },
  BACHELOR: { level: 3, name: 'Bachelor Degree', minAge: 22, yearsRequired: 16 },
  MASTER: { level: 4, name: 'Master Degree', minAge: 24, yearsRequired: 18 },
  PHD: { level: 5, name: 'Doctorate (PhD)', minAge: 28, yearsRequired: 22 }
});

// ---------------------------------------------------------------------------
// 3. 60+ CAREER TRACKS
// ---------------------------------------------------------------------------
export const CAREERS = Object.freeze({
  // Unemployed & Non-Working
  UNEMPLOYED: {
    id: 'unemployed',
    title: 'Unemployed Jobseeker',
    category: 'service',
    educationRequired: EDUCATION_TIERS.NONE.level,
    baseMonthlySalary: 800, // Safety net benefit
    skills: { tech: 5, management: 0, physical: 10, creative: 10, social: 10 },
    prestige: 0,
    workplaceCategory: null
  },
  RETIRED: {
    id: 'retired',
    title: 'Retired Senior',
    category: 'service',
    educationRequired: EDUCATION_TIERS.NONE.level,
    baseMonthlySalary: 1800, // Pension
    skills: { tech: 20, management: 20, physical: 5, creative: 20, social: 30 },
    prestige: 2,
    workplaceCategory: null
  },
  STUDENT: {
    id: 'student',
    title: 'University Student',
    category: 'education',
    educationRequired: EDUCATION_TIERS.HIGH_SCHOOL.level,
    baseMonthlySalary: 400,
    skills: { tech: 30, management: 15, physical: 10, creative: 35, social: 30 },
    prestige: 3,
    workplaceCategory: 'public_services'
  },

  // Service & Retail (10 careers)
  JANITOR: {
    id: 'janitor',
    title: 'Sanitation Custodian',
    category: 'service',
    educationRequired: EDUCATION_TIERS.NONE.level,
    baseMonthlySalary: 2200,
    skills: { tech: 5, management: 5, physical: 45, creative: 5, social: 10 },
    prestige: 1,
    workplaceCategory: 'commercial'
  },
  FAST_FOOD_COOK: {
    id: 'fast_food_cook',
    title: 'Line Cook',
    category: 'service',
    educationRequired: EDUCATION_TIERS.NONE.level,
    baseMonthlySalary: 2400,
    skills: { tech: 5, management: 10, physical: 40, creative: 15, social: 20 },
    prestige: 1,
    workplaceCategory: 'commercial'
  },
  RETAIL_CASHIER: {
    id: 'retail_cashier',
    title: 'Retail Store Cashier',
    category: 'service',
    educationRequired: EDUCATION_TIERS.NONE.level,
    baseMonthlySalary: 2500,
    skills: { tech: 15, management: 10, physical: 20, creative: 10, social: 40 },
    prestige: 1,
    workplaceCategory: 'commercial'
  },
  BARISTA: {
    id: 'barista',
    title: 'Artisan Barista',
    category: 'service',
    educationRequired: EDUCATION_TIERS.HIGH_SCHOOL.level,
    baseMonthlySalary: 2700,
    skills: { tech: 10, management: 15, physical: 20, creative: 30, social: 50 },
    prestige: 2,
    workplaceCategory: 'commercial'
  },
  SECURITY_GUARD: {
    id: 'security_guard',
    title: 'Private Security Officer',
    category: 'service',
    educationRequired: EDUCATION_TIERS.HIGH_SCHOOL.level,
    baseMonthlySalary: 3100,
    skills: { tech: 15, management: 15, physical: 60, creative: 5, social: 25 },
    prestige: 2,
    workplaceCategory: 'commercial'
  },
  DELIVERY_DRIVER: {
    id: 'delivery_driver',
    title: 'Courier & Logistics Driver',
    category: 'transport',
    educationRequired: EDUCATION_TIERS.HIGH_SCHOOL.level,
    baseMonthlySalary: 3200,
    skills: { tech: 20, management: 10, physical: 50, creative: 5, social: 25 },
    prestige: 2,
    workplaceCategory: 'transport'
  },
  HOTEL_RECEPTIONIST: {
    id: 'hotel_receptionist',
    title: 'Front Desk Concierge',
    category: 'service',
    educationRequired: EDUCATION_TIERS.HIGH_SCHOOL.level,
    baseMonthlySalary: 3400,
    skills: { tech: 25, management: 20, physical: 15, creative: 15, social: 60 },
    prestige: 3,
    workplaceCategory: 'commercial'
  },
  HAIRDRESSER: {
    id: 'hairdresser',
    title: 'Stylist & Cosmetologist',
    category: 'service',
    educationRequired: EDUCATION_TIERS.VOCATIONAL.level,
    baseMonthlySalary: 3600,
    skills: { tech: 10, management: 20, physical: 30, creative: 65, social: 55 },
    prestige: 3,
    workplaceCategory: 'commercial'
  },
  TAXI_DRIVER: {
    id: 'taxi_driver',
    title: 'Urban Transit Driver',
    category: 'transport',
    educationRequired: EDUCATION_TIERS.HIGH_SCHOOL.level,
    baseMonthlySalary: 3100,
    skills: { tech: 15, management: 10, physical: 40, creative: 5, social: 45 },
    prestige: 2,
    workplaceCategory: 'transport'
  },
  WAITRESS_WAITER: {
    id: 'waitress_waiter',
    title: 'Fine Dining Server',
    category: 'service',
    educationRequired: EDUCATION_TIERS.HIGH_SCHOOL.level,
    baseMonthlySalary: 3300,
    skills: { tech: 10, management: 15, physical: 35, creative: 15, social: 65 },
    prestige: 2,
    workplaceCategory: 'commercial'
  },

  // Trades & Industrial (10 careers)
  CONSTRUCTION_WORKER: {
    id: 'construction_worker',
    title: 'Site Construction Laborer',
    category: 'industrial',
    educationRequired: EDUCATION_TIERS.NONE.level,
    baseMonthlySalary: 3600,
    skills: { tech: 10, management: 10, physical: 80, creative: 5, social: 15 },
    prestige: 2,
    workplaceCategory: 'industrial'
  },
  ELECTRICIAN: {
    id: 'electrician',
    title: 'Licensed Journeyman Electrician',
    category: 'industrial',
    educationRequired: EDUCATION_TIERS.VOCATIONAL.level,
    baseMonthlySalary: 5200,
    skills: { tech: 50, management: 25, physical: 55, creative: 15, social: 25 },
    prestige: 4,
    workplaceCategory: 'infrastructure'
  },
  PLUMBER: {
    id: 'plumber',
    title: 'Master Pipefitter & Plumber',
    category: 'industrial',
    educationRequired: EDUCATION_TIERS.VOCATIONAL.level,
    baseMonthlySalary: 5400,
    skills: { tech: 45, management: 30, physical: 65, creative: 10, social: 30 },
    prestige: 4,
    workplaceCategory: 'infrastructure'
  },
  WELDER: {
    id: 'welder',
    title: 'Precision Industrial Welder',
    category: 'industrial',
    educationRequired: EDUCATION_TIERS.VOCATIONAL.level,
    baseMonthlySalary: 4900,
    skills: { tech: 40, management: 15, physical: 75, creative: 20, social: 15 },
    prestige: 3,
    workplaceCategory: 'industrial'
  },
  CNC_OPERATOR: {
    id: 'cnc_operator',
    title: 'CNC Machinist Operator',
    category: 'industrial',
    educationRequired: EDUCATION_TIERS.VOCATIONAL.level,
    baseMonthlySalary: 4700,
    skills: { tech: 60, management: 15, physical: 45, creative: 15, social: 15 },
    prestige: 3,
    workplaceCategory: 'industrial'
  },
  AUTO_MECHANIC: {
    id: 'auto_mechanic',
    title: 'Automotive Specialist Technician',
    category: 'industrial',
    educationRequired: EDUCATION_TIERS.VOCATIONAL.level,
    baseMonthlySalary: 4600,
    skills: { tech: 50, management: 20, physical: 60, creative: 15, social: 25 },
    prestige: 3,
    workplaceCategory: 'industrial'
  },
  POWER_PLANT_OPERATOR: {
    id: 'power_plant_operator',
    title: 'Power Grid Station Operator',
    category: 'infrastructure',
    educationRequired: EDUCATION_TIERS.VOCATIONAL.level,
    baseMonthlySalary: 6200,
    skills: { tech: 70, management: 40, physical: 30, creative: 10, social: 25 },
    prestige: 5,
    workplaceCategory: 'infrastructure'
  },
  CRANE_OPERATOR: {
    id: 'crane_operator',
    title: 'Heavy Crane Tower Operator',
    category: 'industrial',
    educationRequired: EDUCATION_TIERS.VOCATIONAL.level,
    baseMonthlySalary: 5800,
    skills: { tech: 55, management: 20, physical: 70, creative: 10, social: 20 },
    prestige: 4,
    workplaceCategory: 'industrial'
  },
  WAREHOUSE_MANAGER: {
    id: 'warehouse_manager',
    title: 'Logistics Warehouse Manager',
    category: 'industrial',
    educationRequired: EDUCATION_TIERS.BACHELOR.level,
    baseMonthlySalary: 6500,
    skills: { tech: 50, management: 70, physical: 30, creative: 15, social: 45 },
    prestige: 5,
    workplaceCategory: 'industrial'
  },
  RECYCLING_PLANT_TECH: {
    id: 'recycling_plant_tech',
    title: 'Resource Recovery Technician',
    category: 'industrial',
    educationRequired: EDUCATION_TIERS.VOCATIONAL.level,
    baseMonthlySalary: 4100,
    skills: { tech: 40, management: 20, physical: 55, creative: 15, social: 20 },
    prestige: 3,
    workplaceCategory: 'industrial'
  },

  // Corporate & White Collar (10 careers)
  ACCOUNTANT: {
    id: 'accountant',
    title: 'Certified Public Accountant',
    category: 'office',
    educationRequired: EDUCATION_TIERS.BACHELOR.level,
    baseMonthlySalary: 6800,
    skills: { tech: 60, management: 45, physical: 5, creative: 10, social: 35 },
    prestige: 5,
    workplaceCategory: 'commercial'
  },
  HR_SPECIALIST: {
    id: 'hr_specialist',
    title: 'Human Resources Specialist',
    category: 'office',
    educationRequired: EDUCATION_TIERS.BACHELOR.level,
    baseMonthlySalary: 5900,
    skills: { tech: 30, management: 55, physical: 5, creative: 25, social: 75 },
    prestige: 4,
    workplaceCategory: 'commercial'
  },
  MARKETING_MANAGER: {
    id: 'marketing_manager',
    title: 'Brand Marketing Director',
    category: 'office',
    educationRequired: EDUCATION_TIERS.BACHELOR.level,
    baseMonthlySalary: 7900,
    skills: { tech: 45, management: 65, physical: 5, creative: 75, social: 70 },
    prestige: 6,
    workplaceCategory: 'commercial'
  },
  FINANCIAL_ANALYST: {
    id: 'financial_analyst',
    title: 'Senior Financial Risk Analyst',
    category: 'office',
    educationRequired: EDUCATION_TIERS.BACHELOR.level,
    baseMonthlySalary: 8800,
    skills: { tech: 75, management: 50, physical: 5, creative: 20, social: 40 },
    prestige: 7,
    workplaceCategory: 'commercial'
  },
  CORPORATE_LAWYER: {
    id: 'corporate_lawyer',
    title: 'Corporate Legal Counsel',
    category: 'office',
    educationRequired: EDUCATION_TIERS.MASTER.level,
    baseMonthlySalary: 13500,
    skills: { tech: 40, management: 70, physical: 5, creative: 45, social: 85 },
    prestige: 8,
    workplaceCategory: 'commercial'
  },
  MANAGEMENT_CONSULTANT: {
    id: 'management_consultant',
    title: 'Strategy Management Consultant',
    category: 'office',
    educationRequired: EDUCATION_TIERS.MASTER.level,
    baseMonthlySalary: 12000,
    skills: { tech: 55, management: 85, physical: 5, creative: 50, social: 75 },
    prestige: 8,
    workplaceCategory: 'commercial'
  },
  OPERATIONS_DIRECTOR: {
    id: 'operations_director',
    title: 'VP of Global Operations',
    category: 'office',
    educationRequired: EDUCATION_TIERS.MASTER.level,
    baseMonthlySalary: 16500,
    skills: { tech: 60, management: 90, physical: 10, creative: 40, social: 70 },
    prestige: 9,
    workplaceCategory: 'commercial'
  },
  CHIEF_EXECUTIVE_OFFICER: {
    id: 'chief_executive_officer',
    title: 'Chief Executive Officer (CEO)',
    category: 'office',
    educationRequired: EDUCATION_TIERS.MASTER.level,
    baseMonthlySalary: 32000,
    skills: { tech: 50, management: 100, physical: 5, creative: 60, social: 90 },
    prestige: 10,
    workplaceCategory: 'commercial'
  },
  REAL_ESTATE_BROKER: {
    id: 'real_estate_broker',
    title: 'Commercial Real Estate Broker',
    category: 'office',
    educationRequired: EDUCATION_TIERS.BACHELOR.level,
    baseMonthlySalary: 8200,
    skills: { tech: 35, management: 60, physical: 10, creative: 35, social: 85 },
    prestige: 6,
    workplaceCategory: 'commercial'
  },
  PUBLIC_RELATIONS_OFFICER: {
    id: 'public_relations_officer',
    title: 'Chief Communications Officer',
    category: 'office',
    educationRequired: EDUCATION_TIERS.BACHELOR.level,
    baseMonthlySalary: 7400,
    skills: { tech: 35, management: 55, physical: 5, creative: 65, social: 90 },
    prestige: 6,
    workplaceCategory: 'commercial'
  },

  // Tech & Engineering (10 careers)
  JUNIOR_SOFTWARE_ENGINEER: {
    id: 'junior_software_engineer',
    title: 'Junior Frontend Developer',
    category: 'tech',
    educationRequired: EDUCATION_TIERS.BACHELOR.level,
    baseMonthlySalary: 6200,
    skills: { tech: 70, management: 15, physical: 5, creative: 40, social: 25 },
    prestige: 5,
    workplaceCategory: 'commercial'
  },
  SENIOR_SOFTWARE_ENGINEER: {
    id: 'senior_software_engineer',
    title: 'Full-Stack Lead Engineer',
    category: 'tech',
    educationRequired: EDUCATION_TIERS.BACHELOR.level,
    baseMonthlySalary: 11500,
    skills: { tech: 90, management: 50, physical: 5, creative: 55, social: 40 },
    prestige: 7,
    workplaceCategory: 'commercial'
  },
  DATA_SCIENTIST: {
    id: 'data_scientist',
    title: 'AI & Data Science Specialist',
    category: 'tech',
    educationRequired: EDUCATION_TIERS.MASTER.level,
    baseMonthlySalary: 12500,
    skills: { tech: 95, management: 35, physical: 5, creative: 45, social: 30 },
    prestige: 8,
    workplaceCategory: 'commercial'
  },
  CYBERSECURITY_ANALYST: {
    id: 'cybersecurity_analyst',
    title: 'Information Security Specialist',
    category: 'tech',
    educationRequired: EDUCATION_TIERS.BACHELOR.level,
    baseMonthlySalary: 10200,
    skills: { tech: 88, management: 30, physical: 5, creative: 35, social: 25 },
    prestige: 7,
    workplaceCategory: 'commercial'
  },
  DEVOPS_ENGINEER: {
    id: 'devops_engineer',
    title: 'Cloud Systems Infrastructure Engineer',
    category: 'tech',
    educationRequired: EDUCATION_TIERS.BACHELOR.level,
    baseMonthlySalary: 10800,
    skills: { tech: 85, management: 40, physical: 5, creative: 30, social: 35 },
    prestige: 7,
    workplaceCategory: 'commercial'
  },
  ROBOTICS_ENGINEER: {
    id: 'robotics_engineer',
    title: 'Autonomous Robotics Systems Engineer',
    category: 'tech',
    educationRequired: EDUCATION_TIERS.MASTER.level,
    baseMonthlySalary: 13200,
    skills: { tech: 92, management: 45, physical: 25, creative: 60, social: 30 },
    prestige: 8,
    workplaceCategory: 'industrial'
  },
  BIOMEDICAL_ENGINEER: {
    id: 'biomedical_engineer',
    title: 'Biomedical Prosthetics Designer',
    category: 'tech',
    educationRequired: EDUCATION_TIERS.MASTER.level,
    baseMonthlySalary: 12800,
    skills: { tech: 90, management: 35, physical: 15, creative: 65, social: 35 },
    prestige: 8,
    workplaceCategory: 'industrial'
  },
  CIVIL_ENGINEER: {
    id: 'civil_engineer',
    title: 'Structural Infrastructure Engineer',
    category: 'engineering',
    educationRequired: EDUCATION_TIERS.BACHELOR.level,
    baseMonthlySalary: 8500,
    skills: { tech: 75, management: 55, physical: 25, creative: 45, social: 40 },
    prestige: 6,
    workplaceCategory: 'infrastructure'
  },
  CHIEF_TECHNOLOGY_OFFICER: {
    id: 'chief_technology_officer',
    title: 'Chief Technology Officer (CTO)',
    category: 'tech',
    educationRequired: EDUCATION_TIERS.MASTER.level,
    baseMonthlySalary: 28000,
    skills: { tech: 95, management: 90, physical: 5, creative: 70, social: 65 },
    prestige: 10,
    workplaceCategory: 'commercial'
  },
  QUANTUM_RESEARCHER: {
    id: 'quantum_researcher',
    title: 'Principal Quantum Computing Scientist',
    category: 'tech',
    educationRequired: EDUCATION_TIERS.PHD.level,
    baseMonthlySalary: 18500,
    skills: { tech: 100, management: 25, physical: 5, creative: 80, social: 25 },
    prestige: 9,
    workplaceCategory: 'commercial'
  },

  // Healthcare & Education (10 careers)
  PARAMEDIC: {
    id: 'paramedic',
    title: 'Emergency Medical Responder',
    category: 'health',
    educationRequired: EDUCATION_TIERS.VOCATIONAL.level,
    baseMonthlySalary: 4200,
    skills: { tech: 40, management: 30, physical: 70, creative: 10, social: 60 },
    prestige: 5,
    workplaceCategory: 'public_services'
  },
  REGISTERED_NURSE: {
    id: 'registered_nurse',
    title: 'Clinical Registered Nurse',
    category: 'health',
    educationRequired: EDUCATION_TIERS.BACHELOR.level,
    baseMonthlySalary: 5800,
    skills: { tech: 45, management: 40, physical: 50, creative: 15, social: 80 },
    prestige: 6,
    workplaceCategory: 'public_services'
  },
  PHARMACIST: {
    id: 'pharmacist',
    title: 'Doctor of Pharmacy',
    category: 'health',
    educationRequired: EDUCATION_TIERS.MASTER.level,
    baseMonthlySalary: 9500,
    skills: { tech: 70, management: 45, physical: 15, creative: 15, social: 65 },
    prestige: 7,
    workplaceCategory: 'public_services'
  },
  GENERAL_PRACTITIONER: {
    id: 'general_practitioner',
    title: 'Family Physician / MD',
    category: 'health',
    educationRequired: EDUCATION_TIERS.PHD.level,
    baseMonthlySalary: 16000,
    skills: { tech: 75, management: 60, physical: 25, creative: 30, social: 85 },
    prestige: 9,
    workplaceCategory: 'public_services'
  },
  SURGEON: {
    id: 'surgeon',
    title: 'Chief Neurosurgeon',
    category: 'health',
    educationRequired: EDUCATION_TIERS.PHD.level,
    baseMonthlySalary: 28000,
    skills: { tech: 85, management: 65, physical: 85, creative: 40, social: 65 },
    prestige: 10,
    workplaceCategory: 'public_services'
  },
  PRIMARY_TEACHER: {
    id: 'primary_teacher',
    title: 'Elementary School Teacher',
    category: 'education',
    educationRequired: EDUCATION_TIERS.BACHELOR.level,
    baseMonthlySalary: 4500,
    skills: { tech: 30, management: 50, physical: 25, creative: 60, social: 85 },
    prestige: 5,
    workplaceCategory: 'public_services'
  },
  HIGH_SCHOOL_TEACHER: {
    id: 'high_school_teacher',
    title: 'Secondary STEM Educator',
    category: 'education',
    educationRequired: EDUCATION_TIERS.BACHELOR.level,
    baseMonthlySalary: 5100,
    skills: { tech: 50, management: 55, physical: 20, creative: 50, social: 80 },
    prestige: 5,
    workplaceCategory: 'public_services'
  },
  UNIVERSITY_PROFESSOR: {
    id: 'university_professor',
    title: 'Tenured Department Chair',
    category: 'education',
    educationRequired: EDUCATION_TIERS.PHD.level,
    baseMonthlySalary: 11000,
    skills: { tech: 75, management: 70, physical: 10, creative: 70, social: 75 },
    prestige: 8,
    workplaceCategory: 'public_services'
  },
  SCHOOL_PRINCIPAL: {
    id: 'school_principal',
    title: 'Academy Principal',
    category: 'education',
    educationRequired: EDUCATION_TIERS.MASTER.level,
    baseMonthlySalary: 8500,
    skills: { tech: 40, management: 85, physical: 15, creative: 35, social: 85 },
    prestige: 7,
    workplaceCategory: 'public_services'
  },
  RESEARCH_SCIENTIST: {
    id: 'research_scientist',
    title: 'Senior Clinical Investigator',
    category: 'education',
    educationRequired: EDUCATION_TIERS.PHD.level,
    baseMonthlySalary: 13500,
    skills: { tech: 90, management: 45, physical: 15, creative: 75, social: 40 },
    prestige: 8,
    workplaceCategory: 'public_services'
  },

  // Public Services & Government (10 careers)
  POLICE_OFFICER: {
    id: 'police_officer',
    title: 'Patrol Police Officer',
    category: 'public',
    educationRequired: EDUCATION_TIERS.HIGH_SCHOOL.level,
    baseMonthlySalary: 4400,
    skills: { tech: 30, management: 25, physical: 75, creative: 10, social: 55 },
    prestige: 4,
    workplaceCategory: 'public_services'
  },
  POLICE_DETECTIVE: {
    id: 'police_detective',
    title: 'Senior Criminal Investigator',
    category: 'public',
    educationRequired: EDUCATION_TIERS.BACHELOR.level,
    baseMonthlySalary: 6800,
    skills: { tech: 55, management: 50, physical: 60, creative: 45, social: 70 },
    prestige: 6,
    workplaceCategory: 'public_services'
  },
  FIREFIGHTER: {
    id: 'firefighter',
    title: 'Rescue Firefighter',
    category: 'public',
    educationRequired: EDUCATION_TIERS.HIGH_SCHOOL.level,
    baseMonthlySalary: 4500,
    skills: { tech: 25, management: 20, physical: 85, creative: 10, social: 50 },
    prestige: 5,
    workplaceCategory: 'public_services'
  },
  FIRE_CHIEF: {
    id: 'fire_chief',
    title: 'District Fire Battalion Chief',
    category: 'public',
    educationRequired: EDUCATION_TIERS.BACHELOR.level,
    baseMonthlySalary: 9200,
    skills: { tech: 50, management: 85, physical: 60, creative: 30, social: 70 },
    prestige: 8,
    workplaceCategory: 'public_services'
  },
  CITY_PLANNER: {
    id: 'city_planner',
    title: 'Urban Infrastructure Planner',
    category: 'public',
    educationRequired: EDUCATION_TIERS.MASTER.level,
    baseMonthlySalary: 8800,
    skills: { tech: 70, management: 75, physical: 15, creative: 65, social: 65 },
    prestige: 7,
    workplaceCategory: 'public_services'
  },
  JUDGE: {
    id: 'judge',
    title: 'District Superior Judge',
    category: 'public',
    educationRequired: EDUCATION_TIERS.MASTER.level,
    baseMonthlySalary: 18000,
    skills: { tech: 40, management: 80, physical: 5, creative: 40, social: 90 },
    prestige: 9,
    workplaceCategory: 'public_services'
  },
  MAYORAL_ADVISOR: {
    id: 'mayoral_advisor',
    title: 'Senior Municipal Policy Advisor',
    category: 'public',
    educationRequired: EDUCATION_TIERS.MASTER.level,
    baseMonthlySalary: 14000,
    skills: { tech: 50, management: 85, physical: 5, creative: 55, social: 95 },
    prestige: 9,
    workplaceCategory: 'public_services'
  },
  ENVIRONMENTAL_INSPECTOR: {
    id: 'environmental_inspector',
    title: 'EPA Compliance Officer',
    category: 'public',
    educationRequired: EDUCATION_TIERS.BACHELOR.level,
    baseMonthlySalary: 6200,
    skills: { tech: 60, management: 45, physical: 35, creative: 20, social: 55 },
    prestige: 5,
    workplaceCategory: 'environment'
  },
  SOCIAL_WORKER: {
    id: 'social_worker',
    title: 'Community Welfare Specialist',
    category: 'public',
    educationRequired: EDUCATION_TIERS.BACHELOR.level,
    baseMonthlySalary: 4200,
    skills: { tech: 20, management: 35, physical: 20, creative: 30, social: 95 },
    prestige: 4,
    workplaceCategory: 'public_services'
  },
  LIBRARY_DIRECTOR: {
    id: 'library_director',
    title: 'Head Municipal Librarian',
    category: 'public',
    educationRequired: EDUCATION_TIERS.MASTER.level,
    baseMonthlySalary: 6500,
    skills: { tech: 45, management: 60, physical: 10, creative: 40, social: 70 },
    prestige: 6,
    workplaceCategory: 'public_services'
  }
});

// ---------------------------------------------------------------------------
// 4. DAILY SHIFT SCHEDULES
// ---------------------------------------------------------------------------
export const SHIFT_SCHEDULES = Object.freeze({
  MORNING_SHIFT: {
    id: 'morning_shift',
    name: 'Standard Morning Shift',
    hours: { workStart: 8, workEnd: 17, sleepStart: 22, sleepEnd: 6 },
    hourlyActivities: [
      'sleep', 'sleep', 'sleep', 'sleep', 'sleep', 'sleep', 'wake_prep', 'commute_work',
      'work', 'work', 'work', 'work', 'lunch', 'work', 'work', 'work',
      'work', 'commute_home', 'shopping_leisure', 'socializing', 'family', 'rest', 'sleep', 'sleep'
    ]
  },
  EVENING_SHIFT: {
    id: 'evening_shift',
    name: 'Afternoon & Evening Shift',
    hours: { workStart: 16, workEnd: 1, sleepStart: 2, sleepEnd: 10 },
    hourlyActivities: [
      'sleep', 'sleep', 'sleep', 'sleep', 'sleep', 'sleep', 'sleep', 'sleep',
      'sleep', 'sleep', 'wake_prep', 'leisure', 'lunch', 'leisure', 'commute_work', 'work',
      'work', 'work', 'work', 'dinner', 'work', 'work', 'work', 'commute_home'
    ]
  },
  NIGHT_SHIFT: {
    id: 'night_shift',
    name: 'Graveyard Night Shift',
    hours: { workStart: 0, workEnd: 8, sleepStart: 9, sleepEnd: 17 },
    hourlyActivities: [
      'work', 'work', 'work', 'work', 'lunch', 'work', 'work', 'work',
      'commute_home', 'sleep', 'sleep', 'sleep', 'sleep', 'sleep', 'sleep', 'sleep',
      'sleep', 'wake_prep', 'shopping', 'socializing', 'dinner', 'rest', 'commute_work', 'work'
    ]
  },
  REMOTE_FLEX: {
    id: 'remote_flex',
    name: 'Remote Flexible Hours',
    hours: { workStart: 9, workEnd: 17, sleepStart: 23, sleepEnd: 7 },
    hourlyActivities: [
      'sleep', 'sleep', 'sleep', 'sleep', 'sleep', 'sleep', 'sleep', 'wake_prep',
      'exercise', 'work', 'work', 'work', 'lunch', 'work', 'work', 'work',
      'work', 'learning', 'family', 'socializing', 'hobbies', 'rest', 'rest', 'sleep'
    ]
  },
  FREELANCE: {
    id: 'freelance',
    name: 'Freelance Gig Economy',
    hours: { workStart: 10, workEnd: 19, sleepStart: 1, sleepEnd: 9 },
    hourlyActivities: [
      'sleep', 'sleep', 'sleep', 'sleep', 'sleep', 'sleep', 'sleep', 'sleep',
      'sleep', 'wake_prep', 'work', 'work', 'work', 'lunch', 'work', 'work',
      'work', 'work', 'work', 'leisure', 'socializing', 'hobbies', 'rest', 'sleep'
    ]
  },
  STUDENT_SCHEDULE: {
    id: 'student_schedule',
    name: 'Academic Student Schedule',
    hours: { workStart: 9, workEnd: 15, sleepStart: 0, sleepEnd: 7 },
    hourlyActivities: [
      'sleep', 'sleep', 'sleep', 'sleep', 'sleep', 'sleep', 'sleep', 'wake_prep',
      'commute_campus', 'study_class', 'study_class', 'study_class', 'lunch', 'study_class', 'study_class', 'club_activity',
      'commute_home', 'study_homework', 'dinner', 'socializing', 'gaming_leisure', 'party_social', 'rest', 'sleep'
    ]
  },
  RETIRED_SCHEDULE: {
    id: 'retired_schedule',
    name: 'Leisure Senior Schedule',
    hours: { workStart: 0, workEnd: 0, sleepStart: 21, sleepEnd: 6 },
    hourlyActivities: [
      'sleep', 'sleep', 'sleep', 'sleep', 'sleep', 'sleep', 'wake_prep', 'morning_walk',
      'gardening', 'breakfast', 'community_center', 'socializing', 'lunch', 'nap', 'reading', 'park_stroll',
      'hobby', 'cooking', 'dinner', 'television', 'family_call', 'rest', 'sleep', 'sleep'
    ]
  }
});

// ---------------------------------------------------------------------------
// 5. EMOTIONAL STATE TRANSITION TABLE
// ---------------------------------------------------------------------------
export const EMOTIONAL_STATES = Object.freeze({
  ECSTATIC: 'ecstatic',
  HAPPY: 'happy',
  CONTENT: 'content',
  NEUTRAL: 'neutral',
  STRESSED: 'stressed',
  SAD: 'sad',
  ANGRY: 'angry',
  DEPRESSED: 'depressed',
  BURNT_OUT: 'burnt_out'
});

export const EMOTIONAL_TRANSITION_MATRIX = Object.freeze({
  [EMOTIONAL_STATES.NEUTRAL]: {
    onHighHappiness: EMOTIONAL_STATES.CONTENT,
    onHighStress: EMOTIONAL_STATES.STRESSED,
    onHighUnmetNeeds: EMOTIONAL_STATES.SAD,
    onHighCrimeExposure: EMOTIONAL_STATES.ANGRY
  },
  [EMOTIONAL_STATES.CONTENT]: {
    onMaxHappiness: EMOTIONAL_STATES.HAPPY,
    onModerateStress: EMOTIONAL_STATES.NEUTRAL,
    onHighUnmetNeeds: EMOTIONAL_STATES.SAD
  },
  [EMOTIONAL_STATES.HAPPY]: {
    onMaxHappiness: EMOTIONAL_STATES.ECSTATIC,
    onModerateStress: EMOTIONAL_STATES.CONTENT,
    onDisasterEvent: EMOTIONAL_STATES.STRESSED
  },
  [EMOTIONAL_STATES.STRESSED]: {
    onStressRelief: EMOTIONAL_STATES.NEUTRAL,
    onProlongedOverwork: EMOTIONAL_STATES.BURNT_OUT,
    onHighPollution: EMOTIONAL_STATES.ANGRY
  },
  [EMOTIONAL_STATES.SAD]: {
    onNeedFulfilled: EMOTIONAL_STATES.NEUTRAL,
    onProlongedPoverty: EMOTIONAL_STATES.DEPRESSED,
    onSocialConnection: EMOTIONAL_STATES.CONTENT
  },
  [EMOTIONAL_STATES.BURNT_OUT]: {
    onVacationRest: EMOTIONAL_STATES.STRESSED,
    onJobLoss: EMOTIONAL_STATES.DEPRESSED
  }
});

// ---------------------------------------------------------------------------
// 6. UTILITY NEED PRIORITIES & DECAY RATES
// ---------------------------------------------------------------------------
export const UTILITY_NEEDS = Object.freeze({
  HUNGER: {
    id: 'hunger',
    name: 'Nutritional Hunger',
    decayRatePerHour: 4.16, // 100 to 0 in ~24h
    criticalThreshold: 20,
    priorityWeight: 10.0
  },
  ENERGY: {
    id: 'energy',
    name: 'Rest & Vitality',
    decayRatePerHour: 6.25, // 100 to 0 in ~16h awake
    criticalThreshold: 15,
    priorityWeight: 9.0
  },
  HEALTH: {
    id: 'health',
    name: 'Physical Health',
    decayRatePerHour: 0.1, // Slow decay unless sick
    criticalThreshold: 30,
    priorityWeight: 8.5
  },
  SAFETY: {
    id: 'safety',
    name: 'Personal Safety',
    decayRatePerHour: 0.5,
    criticalThreshold: 40,
    priorityWeight: 8.0
  },
  WEALTH: {
    id: 'wealth',
    name: 'Financial Security',
    decayRatePerHour: 0.05,
    criticalThreshold: 25,
    priorityWeight: 7.0
  },
  SOCIAL: {
    id: 'social',
    name: 'Social Belonging',
    decayRatePerHour: 1.5,
    criticalThreshold: 20,
    priorityWeight: 5.5
  },
  ENTERTAINMENT: {
    id: 'entertainment',
    name: 'Recreation & Fun',
    decayRatePerHour: 2.0,
    criticalThreshold: 15,
    priorityWeight: 4.5
  },
  EDUCATION: {
    id: 'education',
    name: 'Intellectual Growth',
    decayRatePerHour: 0.2,
    criticalThreshold: 10,
    priorityWeight: 3.5
  },
  FULFILLMENT: {
    id: 'fulfillment',
    name: 'Self-Actualization',
    decayRatePerHour: 0.1,
    criticalThreshold: 10,
    priorityWeight: 2.5
  }
});

// ---------------------------------------------------------------------------
// 7. LIFE STAGE PARAMETERS
// ---------------------------------------------------------------------------
export const LIFE_STAGES = Object.freeze({
  INFANT: { id: 'infant', ageRange: [0, 3], productivityFactor: 0.0, healthcareDemand: 2.5, educationDemand: 0.0 },
  CHILD: { id: 'child', ageRange: [4, 12], productivityFactor: 0.0, healthcareDemand: 1.2, educationDemand: 2.0 },
  TEEN: { id: 'teen', ageRange: [13, 17], productivityFactor: 0.2, healthcareDemand: 1.0, educationDemand: 2.5 },
  YOUNG_ADULT: { id: 'young_adult', ageRange: [18, 29], productivityFactor: 0.9, healthcareDemand: 0.8, educationDemand: 1.5 },
  ADULT: { id: 'adult', ageRange: [30, 54], productivityFactor: 1.0, healthcareDemand: 1.0, educationDemand: 0.5 },
  SENIOR: { id: 'senior', ageRange: [55, 69], productivityFactor: 0.7, healthcareDemand: 1.8, educationDemand: 0.2 },
  ELDERLY: { id: 'elderly', ageRange: [70, 100], productivityFactor: 0.0, healthcareDemand: 3.5, educationDemand: 0.1 }
});

// ---------------------------------------------------------------------------
// 8. SICKNESS AND MORTALITY TABLES
// ---------------------------------------------------------------------------
export const ILLNESSES = Object.freeze({
  COMMON_COLD: {
    id: 'common_cold',
    name: 'Common Viral Cold',
    durationDays: 3,
    mortalityRisk: 0.0001,
    productivityPenalty: 0.25,
    transmissibility: 0.35,
    cureCost: 50
  },
  POLLUTION_COUGH: {
    id: 'pollution_cough',
    name: 'Smog-Induced Respiratory Syndrome',
    durationDays: 7,
    mortalityRisk: 0.005,
    productivityPenalty: 0.40,
    transmissibility: 0.0,
    cureCost: 250
  },
  STRESS_BURNOUT: {
    id: 'stress_burnout',
    name: 'Chronic Overwork Exhaustion',
    durationDays: 14,
    mortalityRisk: 0.001,
    productivityPenalty: 0.70,
    transmissibility: 0.0,
    cureCost: 800
  },
  SEVERE_INFECTION: {
    id: 'severe_infection',
    name: 'Bacterial Outbreak Infection',
    durationDays: 10,
    mortalityRisk: 0.08,
    productivityPenalty: 0.90,
    transmissibility: 0.65,
    cureCost: 1500
  },
  HEART_ATTACK: {
    id: 'heart_attack',
    name: 'Acute Cardiovascular Event',
    durationDays: 1,
    mortalityRisk: 0.35,
    productivityPenalty: 1.0,
    transmissibility: 0.0,
    cureCost: 12000
  }
});

/**
 * Base annual mortality rate by age tier.
 */
export function getBaseMortalityRate(age) {
  if (age < 5) return 0.002;
  if (age < 18) return 0.0003;
  if (age < 40) return 0.001;
  if (age < 60) return 0.004;
  if (age < 75) return 0.018;
  if (age < 85) return 0.055;
  return 0.18;
}

// ---------------------------------------------------------------------------
// HELPER FUNCTIONS FOR SIMULATION CORE
// ---------------------------------------------------------------------------
export function generateCitizenProfile(age = 25, educationLevel = 1) {
  const randomizeBig5 = () => Math.min(100, Math.max(0, Math.round(50 + (Math.random() - 0.5) * 30)));
  
  return {
    age,
    educationLevel,
    ocean: {
      openness: randomizeBig5(),
      conscientiousness: randomizeBig5(),
      extraversion: randomizeBig5(),
      agreeableness: randomizeBig5(),
      neuroticism: randomizeBig5()
    },
    emotionalState: EMOTIONAL_STATES.NEUTRAL,
    needs: {
      hunger: 100,
      energy: 100,
      health: 100,
      safety: 100,
      wealth: 50,
      social: 80,
      entertainment: 70,
      education: 50,
      fulfillment: 50
    }
  };
}

export function evaluateEmotionalTransition(currentState, happiness, stress, unmetNeedsCount) {
  if (happiness > 85 && stress < 20) return EMOTIONAL_STATES.HAPPY;
  if (stress > 80) return EMOTIONAL_STATES.BURNT_OUT;
  if (unmetNeedsCount >= 3) return EMOTIONAL_STATES.SAD;
  if (happiness < 30) return EMOTIONAL_STATES.DEPRESSED;
  return currentState;
}

export default {
  BIG_FIVE_TRAITS,
  EDUCATION_TIERS,
  CAREERS,
  SHIFT_SCHEDULES,
  EMOTIONAL_STATES,
  EMOTIONAL_TRANSITION_MATRIX,
  UTILITY_NEEDS,
  LIFE_STAGES,
  ILLNESSES,
  getBaseMortalityRate,
  generateCitizenProfile,
  evaluateEmotionalTransition
};
