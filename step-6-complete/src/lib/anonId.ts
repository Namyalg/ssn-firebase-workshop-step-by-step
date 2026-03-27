// Adjectives for anonymous ID generation
const adjectives = [
  "Curious", "Swift", "Clever", "Quiet", "Bold",
  "Wise", "Keen", "Sharp", "Bright", "Quick",
  "Eager", "Calm", "Witty", "Brave", "Noble",
  "Gentle", "Fierce", "Silent", "Humble", "Merry",
];

// Animals for anonymous ID generation
const animals = [
  "Panda", "Falcon", "Owl", "Fox", "Wolf",
  "Bear", "Hawk", "Raven", "Tiger", "Lion",
  "Eagle", "Otter", "Badger", "Heron", "Crane",
  "Lynx", "Deer", "Elk", "Swan", "Dove",
];

/**
 * Generates a Reddit-style anonymous ID
 * Format: AdjectiveAnimal_Number (e.g., "CuriousPanda_42")
 */
export function generateAnonId(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const number = Math.floor(Math.random() * 100);

  return `${adjective}${animal}_${number}`;
}
