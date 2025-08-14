import { Position } from "../stores/useGameState";

export function calculateDistance(pos1: Position, pos2: Position): number {
  return Math.sqrt(
    Math.pow(pos1.x - pos2.x, 2) + 
    Math.pow(pos1.y - pos2.y, 2) + 
    Math.pow(pos1.z - pos2.z, 2)
  );
}

export function calculateDistance2D(pos1: Position, pos2: Position): number {
  return Math.sqrt(
    Math.pow(pos1.x - pos2.x, 2) + 
    Math.pow(pos1.z - pos2.z, 2)
  );
}

export function isWithinRadius(pos1: Position, pos2: Position, radius: number): boolean {
  return calculateDistance2D(pos1, pos2) <= radius;
}

export function generateRandomPosition(center: Position, radius: number): Position {
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.random() * radius;
  
  return {
    x: center.x + Math.cos(angle) * distance,
    y: center.y,
    z: center.z + Math.sin(angle) * distance
  };
}

export function formatExperience(exp: number): string {
  if (exp >= 1000) {
    return `${(exp / 1000).toFixed(1)}k`;
  }
  return exp.toString();
}

export function getExperienceForLevel(level: number): number {
  return level * 100;
}

export function getLevelFromExperience(exp: number): number {
  return Math.floor(exp / 100) + 1;
}

export function getRandomChallengeId(cultureId: string): string {
  const challengeNumbers = [0, 1, 2, 3, 4];
  const randomNumber = challengeNumbers[Math.floor(Math.random() * challengeNumbers.length)];
  return `${cultureId}_${randomNumber}`;
}

export function getCultureColorByTheme(theme: string): string {
  switch (theme) {
    case 'ice': return '#87ceeb';
    case 'desert': return '#daa520';
    case 'forest': return '#228b22';
    case 'stone': return '#8b4513';
    default: return '#666666';
  }
}

export function playSound(soundPath: string, volume = 1.0): void {
  try {
    const audio = new Audio(soundPath);
    audio.volume = volume;
    audio.play().catch(error => {
      console.log(`Could not play sound ${soundPath}:`, error);
    });
  } catch (error) {
    console.log(`Error creating audio for ${soundPath}:`, error);
  }
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function timeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}
