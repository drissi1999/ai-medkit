import { create } from "zustand";
import { achievements, Achievement } from "../gameData/achievements";
import { useGameState } from "./useGameState";
import { useChallenges } from "./useChallenges";

interface AchievementState {
  unlockedAchievements: string[];
  
  // Actions
  checkAchievements: () => void;
  unlockAchievement: (achievementId: string) => void;
  getAchievementProgress: (achievementId: string) => number;
}

export const useAchievements = create<AchievementState>((set, get) => ({
  unlockedAchievements: [],
  
  checkAchievements: () => {
    const gameState = useGameState.getState();
    const challengeState = useChallenges.getState();
    const { unlockedAchievements, unlockAchievement } = get();
    
    achievements.forEach(achievement => {
      if (unlockedAchievements.includes(achievement.id)) return;
      
      let progress = 0;
      let shouldUnlock = false;
      
      switch (achievement.requirementType) {
        case 'visitRegions':
          progress = gameState.visitedRegions.length;
          shouldUnlock = progress >= achievement.requirementValue;
          break;
          
        case 'completeQuests':
          progress = gameState.completedQuests.length;
          shouldUnlock = progress >= achievement.requirementValue;
          break;
          
        case 'correctAnswers':
          if (achievement.cultureFilter) {
            progress = challengeState.getCorrectCount(achievement.cultureFilter);
          } else {
            progress = Object.values(challengeState.correctAnswers).reduce((sum, count) => sum + count, 0);
          }
          shouldUnlock = progress >= achievement.requirementValue;
          break;
          
        case 'reachLevel':
          progress = gameState.playerLevel;
          shouldUnlock = progress >= achievement.requirementValue;
          break;
          
        case 'collectItems':
          if (achievement.itemTypeFilter) {
            progress = gameState.inventory.filter(item => item.type === achievement.itemTypeFilter).length;
          } else {
            progress = gameState.inventory.length;
          }
          shouldUnlock = progress >= achievement.requirementValue;
          break;
      }
      
      if (shouldUnlock) {
        unlockAchievement(achievement.id);
        gameState.addExperience(achievement.experienceReward);
        console.log(`Achievement unlocked: ${achievement.name}! (+${achievement.experienceReward} XP)`);
      }
    });
  },
  
  unlockAchievement: (achievementId) => {
    set((state) => ({
      unlockedAchievements: [...state.unlockedAchievements, achievementId]
    }));
  },
  
  getAchievementProgress: (achievementId) => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement) return 0;
    
    const gameState = useGameState.getState();
    const challengeState = useChallenges.getState();
    
    switch (achievement.requirementType) {
      case 'visitRegions':
        return gameState.visitedRegions.length;
      case 'completeQuests':
        return gameState.completedQuests.length;
      case 'correctAnswers':
        if (achievement.cultureFilter) {
          return challengeState.getCorrectCount(achievement.cultureFilter);
        }
        return Object.values(challengeState.correctAnswers).reduce((sum, count) => sum + count, 0);
      case 'reachLevel':
        return gameState.playerLevel;
      case 'collectItems':
        if (achievement.itemTypeFilter) {
          return gameState.inventory.filter(item => item.type === achievement.itemTypeFilter).length;
        }
        return gameState.inventory.length;
      default:
        return 0;
    }
  },
  
  achievements
}));

// Check achievements periodically
setInterval(() => {
  useAchievements.getState().checkAchievements();
}, 5000);
