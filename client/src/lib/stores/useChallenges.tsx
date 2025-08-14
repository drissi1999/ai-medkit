import { create } from "zustand";
import { challenges, Challenge } from "../gameData/challenges";

interface ChallengeAttempt {
  challengeId: string;
  answer: string;
  correct: boolean;
  timestamp: Date;
}

interface ChallengeState {
  attempts: ChallengeAttempt[];
  correctAnswers: Record<string, number>;
  
  // Actions
  submitAnswer: (challengeId: string, answer: string, correct: boolean) => void;
  getChallengeById: (id: string) => Challenge | null;
  getAttempts: (challengeId: string) => ChallengeAttempt[];
  getCorrectCount: (cultureId: string) => number;
}

export const useChallenges = create<ChallengeState>((set, get) => ({
  attempts: [],
  correctAnswers: {},
  
  submitAnswer: (challengeId, answer, correct) => {
    const attempt: ChallengeAttempt = {
      challengeId,
      answer,
      correct,
      timestamp: new Date()
    };
    
    set((state) => {
      const newAttempts = [...state.attempts, attempt];
      const newCorrectAnswers = { ...state.correctAnswers };
      
      if (correct) {
        const challenge = challenges.find(c => c.id === challengeId);
        if (challenge) {
          const culture = challenge.culture;
          newCorrectAnswers[culture] = (newCorrectAnswers[culture] || 0) + 1;
        }
      }
      
      return {
        attempts: newAttempts,
        correctAnswers: newCorrectAnswers
      };
    });
    
    console.log(`Challenge ${challengeId} submitted: ${correct ? 'Correct' : 'Incorrect'}`);
  },
  
  getChallengeById: (id) => {
    return challenges.find(challenge => challenge.id === id) || null;
  },
  
  getAttempts: (challengeId) => {
    return get().attempts.filter(attempt => attempt.challengeId === challengeId);
  },
  
  getCorrectCount: (cultureId) => {
    return get().correctAnswers[cultureId] || 0;
  }
}));
