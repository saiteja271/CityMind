/**
 * CITYMIND Citizens Name Database & Persona Presets
 * Comprehensive dictionary of first names, last names, hobbies, background lore presets,
 * and personality profiles for multi-agent citizen generation.
 */

export const FIRST_NAMES = [
  'Alexander', 'Elena', 'Marcus', 'Sophia', 'Lucas', 'Olivia', 'Ethan', 'Emma', 'Liam', 'Ava',
  'Noah', 'Isabella', 'Mason', 'Mia', 'Oliver', 'Charlotte', 'Elijah', 'Amelia', 'James', 'Harper',
  'Benjamin', 'Evelyn', 'Sebastian', 'Abigail', 'Henry', 'Emily', 'Alexander', 'Elizabeth',
  'Daniel', 'Mila', 'Matthew', 'Ella', 'Jackson', 'Avery', 'David', 'Sofia', 'Joseph', 'Camila',
  'Samuel', 'Aria', 'Gabriel', 'Scarlett', 'Julian', 'Victoria', 'John', 'Madison', 'Anthony', 'Luna',
];

export const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
];

export const CITIZEN_HOBBIES = [
  'Gardening & Urban Botany', 'Jogging & Marathon Running', 'Photography & Architecture',
  'Painting & Sculpting', 'Cooking & Gourmet Baking', 'Chess & Strategy Games',
  'Reading Sci-Fi Novels', 'Playing Acoustic Guitar', 'Bicycle Touring', 'Astronomy & Stargazing',
  'DIY Home Automation', 'Volunteer Community Work', 'Pottery & Ceramics', 'Hiking & Camping',
];

export const CITIZEN_PERSONA_PRESETS = [
  {
    title: 'Ambitious Tech Entrepreneur',
    ocean: { openness: 90, conscientiousness: 85, extraversion: 75, agreeableness: 60, neuroticism: 35 },
    preferredCareer: 'Software Engineer',
    housingPreference: 'Highrise Apartment',
    quote: 'Innovation is the only path toward urban progress.',
  },
  {
    title: 'Dedicated Green Activist',
    ocean: { openness: 95, conscientiousness: 70, extraversion: 80, agreeableness: 90, neuroticism: 40 },
    preferredCareer: 'Environmental Researcher',
    housingPreference: 'Eco-Housing Co-op',
    quote: 'A city that breathes fresh air is a city that thrives.',
  },
  {
    title: 'Pragmatic Factory Foreman',
    ocean: { openness: 40, conscientiousness: 90, extraversion: 50, agreeableness: 70, neuroticism: 25 },
    preferredCareer: 'Industrial Supervisor',
    housingPreference: 'Suburban Single Family',
    quote: 'Hard work and stable infrastructure keep the lights on.',
  },
  {
    title: 'Artistic Cultural Curator',
    ocean: { openness: 98, conscientiousness: 50, extraversion: 65, agreeableness: 85, neuroticism: 55 },
    preferredCareer: 'Gallery Director',
    housingPreference: 'Historic Loft',
    quote: 'Culture is the soul of every great metropolis.',
  },
];

export function getRandomFirstName() {
  return FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
}

export function getRandomLastName() {
  return LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
}

export function getRandomHobby() {
  return CITIZEN_HOBBIES[Math.floor(Math.random() * CITIZEN_HOBBIES.length)];
}

export default {
  FIRST_NAMES,
  LAST_NAMES,
  CITIZEN_HOBBIES,
  CITIZEN_PERSONA_PRESETS,
  getRandomFirstName,
  getRandomLastName,
  getRandomHobby,
};
