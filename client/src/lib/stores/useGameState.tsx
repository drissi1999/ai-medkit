import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { getLocalStorage, setLocalStorage } from "../utils";

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  progress: number;
  total: number;
  rewardXP: number;
  completed: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: 'artifact' | 'knowledge' | 'trophy';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  culture: string;
  acquiredAt: Date;
}

export interface Interactable {
  id: string;
  position: Position;
  type: 'npc' | 'artifact' | 'portal';
  data: any;
  interactionRadius: number;
}

export interface ActiveChallenge {
  challengeId: string;
  npcId?: string;
  cultureId: string;
}

interface GameState {
  // Player state
  playerPosition: Position;
  playerLevel: number;
  experience: number;
  experienceToNext: number;
  
  // Game world
  interactables: Interactable[];
  visitedRegions: string[];
  
  // Inventory and items
  inventory: InventoryItem[];
  
  // Quests
  currentQuest: Quest | null;
  completedQuests: string[];
  
  // UI state
  showAchievements: boolean;
  showInventory: boolean;
  activeChallenge: ActiveChallenge | null;
  
  // Actions
  setPlayerPosition: (position: Position) => void;
  addExperience: (amount: number) => void;
  addInventoryItem: (item: InventoryItem) => void;
  setCurrentQuest: (quest: Quest | null) => void;
  completeQuest: (questId: string) => void;
  addInteractable: (interactable: Interactable) => void;
  checkNearbyInteractions: (playerPos: Position) => void;
  setActiveChallenge: (challenge: ActiveChallenge | null) => void;
  setShowAchievements: (show: boolean) => void;
  setShowInventory: (show: boolean) => void;
  visitRegion: (regionId: string) => void;
  saveGame: () => void;
  loadGame: () => void;
}

export const useGameState = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    playerPosition: { x: 0, y: 0, z: 0 },
    playerLevel: 1,
    experience: 0,
    experienceToNext: 100,
    interactables: [],
    visitedRegions: [],
    inventory: [],
    currentQuest: {
      id: 'welcome',
      title: 'Welcome to Cultural Quest',
      description: 'Explore the world and talk to NPCs to learn about different cultures!',
      progress: 0,
      total: 1,
      rewardXP: 50,
      completed: false
    },
    completedQuests: [],
    showAchievements: false,
    showInventory: false,
    activeChallenge: null,

    // Actions
    setPlayerPosition: (position) => set({ playerPosition: position }),
    
    addExperience: (amount) => set((state) => {
      const newExp = state.experience + amount;
      const newLevel = Math.floor(newExp / 100) + 1;
      const nextLevelExp = newLevel * 100;
      
      console.log(`Gained ${amount} XP! Total: ${newExp}`);
      
      return {
        experience: newExp,
        playerLevel: newLevel,
        experienceToNext: nextLevelExp
      };
    }),
    
    addInventoryItem: (item) => set((state) => ({
      inventory: [...state.inventory, item]
    })),
    
    setCurrentQuest: (quest) => set({ currentQuest: quest }),
    
    completeQuest: (questId) => set((state) => ({
      completedQuests: [...state.completedQuests, questId],
      currentQuest: state.currentQuest?.id === questId ? null : state.currentQuest
    })),
    
    addInteractable: (interactable) => set((state) => ({
      interactables: [...state.interactables, interactable]
    })),
    
    checkNearbyInteractions: (playerPos) => {
      const { interactables, setActiveChallenge } = get();
      
      for (const interactable of interactables) {
        const distance = Math.sqrt(
          Math.pow(playerPos.x - interactable.position.x, 2) + 
          Math.pow(playerPos.z - interactable.position.z, 2)
        );
        
        if (distance <= interactable.interactionRadius) {
          console.log(`Interacting with ${interactable.type}: ${interactable.id}`);
          
          if (interactable.type === 'npc') {
            // Start a challenge based on the NPC's culture
            setActiveChallenge({
              challengeId: `${interactable.data.cultureId}_${Math.floor(Math.random() * 3)}`,
              npcId: interactable.data.npc.id,
              cultureId: interactable.data.cultureId
            });
          }
          break;
        }
      }
    },
    
    setActiveChallenge: (challenge) => set({ activeChallenge: challenge }),
    setShowAchievements: (show) => set({ showAchievements: show }),
    setShowInventory: (show) => set({ showInventory: show }),
    
    visitRegion: (regionId) => set((state) => {
      if (!state.visitedRegions.includes(regionId)) {
        console.log(`Visited new region: ${regionId}`);
        return {
          visitedRegions: [...state.visitedRegions, regionId]
        };
      }
      return {};
    }),
    
    saveGame: () => {
      const state = get();
      const saveData = {
        playerPosition: state.playerPosition,
        playerLevel: state.playerLevel,
        experience: state.experience,
        inventory: state.inventory,
        visitedRegions: state.visitedRegions,
        completedQuests: state.completedQuests,
        currentQuest: state.currentQuest,
        timestamp: new Date().toISOString()
      };
      
      setLocalStorage('culturalquest_save', saveData);
      console.log('Game saved successfully');
    },
    
    loadGame: () => {
      const saveData = getLocalStorage('culturalquest_save');
      if (saveData) {
        set({
          playerPosition: saveData.playerPosition || { x: 0, y: 0, z: 0 },
          playerLevel: saveData.playerLevel || 1,
          experience: saveData.experience || 0,
          inventory: saveData.inventory || [],
          visitedRegions: saveData.visitedRegions || [],
          completedQuests: saveData.completedQuests || [],
          currentQuest: saveData.currentQuest || null,
        });
        console.log('Game loaded successfully');
      }
    }
  }))
);

// Auto-save every 30 seconds
setInterval(() => {
  useGameState.getState().saveGame();
}, 30000);

// Load game on initialization
useGameState.getState().loadGame();
