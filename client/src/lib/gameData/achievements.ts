export interface Achievement {
  id: string;
  name: string;
  description: string;
  type: 'exploration' | 'knowledge' | 'mastery' | 'social';
  requirementType: 'visitRegions' | 'correctAnswers' | 'completeQuests' | 'reachLevel' | 'collectItems';
  requirementValue: number;
  experienceReward: number;
  cultureFilter?: string;
  itemTypeFilter?: 'artifact' | 'knowledge' | 'trophy';
}

export const achievements: Achievement[] = [
  // Exploration Achievements
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Visit your first cultural region',
    type: 'exploration',
    requirementType: 'visitRegions',
    requirementValue: 1,
    experienceReward: 50
  },
  {
    id: 'world_traveler',
    name: 'World Traveler',
    description: 'Visit all 4 cultural regions',
    type: 'exploration',
    requirementType: 'visitRegions',
    requirementValue: 4,
    experienceReward: 200
  },

  // Knowledge Achievements - Overall
  {
    id: 'quick_learner',
    name: 'Quick Learner',
    description: 'Answer 5 challenges correctly',
    type: 'knowledge',
    requirementType: 'correctAnswers',
    requirementValue: 5,
    experienceReward: 75
  },
  {
    id: 'scholar',
    name: 'Scholar',
    description: 'Answer 15 challenges correctly',
    type: 'knowledge',
    requirementType: 'correctAnswers',
    requirementValue: 15,
    experienceReward: 150
  },
  {
    id: 'cultural_expert',
    name: 'Cultural Expert',
    description: 'Answer 30 challenges correctly',
    type: 'knowledge',
    requirementType: 'correctAnswers',
    requirementValue: 30,
    experienceReward: 300
  },

  // Culture-Specific Knowledge
  {
    id: 'norse_apprentice',
    name: 'Norse Apprentice',
    description: 'Answer 3 Norse challenges correctly',
    type: 'knowledge',
    requirementType: 'correctAnswers',
    requirementValue: 3,
    experienceReward: 100,
    cultureFilter: 'Norse'
  },
  {
    id: 'egyptian_scholar',
    name: 'Egyptian Scholar',
    description: 'Answer 3 Egyptian challenges correctly',
    type: 'knowledge',
    requirementType: 'correctAnswers',
    requirementValue: 3,
    experienceReward: 100,
    cultureFilter: 'Egyptian'
  },
  {
    id: 'japanese_student',
    name: 'Japanese Student',
    description: 'Answer 3 Japanese challenges correctly',
    type: 'knowledge',
    requirementType: 'correctAnswers',
    requirementValue: 3,
    experienceReward: 100,
    cultureFilter: 'Japanese'
  },
  {
    id: 'aztec_warrior',
    name: 'Aztec Warrior',
    description: 'Answer 3 Aztec challenges correctly',
    type: 'knowledge',
    requirementType: 'correctAnswers',
    requirementValue: 3,
    experienceReward: 100,
    cultureFilter: 'Aztec'
  },

  // Mastery Achievements
  {
    id: 'norse_master',
    name: 'Norse Master',
    description: 'Answer 5 Norse challenges correctly',
    type: 'mastery',
    requirementType: 'correctAnswers',
    requirementValue: 5,
    experienceReward: 200,
    cultureFilter: 'Norse'
  },
  {
    id: 'egyptian_master',
    name: 'Egyptian Master',
    description: 'Answer 5 Egyptian challenges correctly',
    type: 'mastery',
    requirementType: 'correctAnswers',
    requirementValue: 5,
    experienceReward: 200,
    cultureFilter: 'Egyptian'
  },
  {
    id: 'japanese_master',
    name: 'Japanese Master',
    description: 'Answer 5 Japanese challenges correctly',
    type: 'mastery',
    requirementType: 'correctAnswers',
    requirementValue: 5,
    experienceReward: 200,
    cultureFilter: 'Japanese'
  },
  {
    id: 'aztec_master',
    name: 'Aztec Master',
    description: 'Answer 5 Aztec challenges correctly',
    type: 'mastery',
    requirementType: 'correctAnswers',
    requirementValue: 5,
    experienceReward: 200,
    cultureFilter: 'Aztec'
  },

  // Level Achievements
  {
    id: 'novice_explorer',
    name: 'Novice Explorer',
    description: 'Reach level 3',
    type: 'mastery',
    requirementType: 'reachLevel',
    requirementValue: 3,
    experienceReward: 100
  },
  {
    id: 'experienced_adventurer',
    name: 'Experienced Adventurer',
    description: 'Reach level 5',
    type: 'mastery',
    requirementType: 'reachLevel',
    requirementValue: 5,
    experienceReward: 200
  },
  {
    id: 'cultural_master',
    name: 'Cultural Master',
    description: 'Reach level 10',
    type: 'mastery',
    requirementType: 'reachLevel',
    requirementValue: 10,
    experienceReward: 500
  },

  // Collection Achievements
  {
    id: 'artifact_hunter',
    name: 'Artifact Hunter',
    description: 'Collect 3 artifacts',
    type: 'exploration',
    requirementType: 'collectItems',
    requirementValue: 3,
    experienceReward: 150,
    itemTypeFilter: 'artifact'
  },
  {
    id: 'knowledge_keeper',
    name: 'Knowledge Keeper',
    description: 'Collect 5 knowledge items',
    type: 'knowledge',
    requirementType: 'collectItems',
    requirementValue: 5,
    experienceReward: 200,
    itemTypeFilter: 'knowledge'
  },
  {
    id: 'trophy_collector',
    name: 'Trophy Collector',
    description: 'Collect 2 trophies',
    type: 'mastery',
    requirementType: 'collectItems',
    requirementValue: 2,
    experienceReward: 250,
    itemTypeFilter: 'trophy'
  },
  {
    id: 'grand_collector',
    name: 'Grand Collector',
    description: 'Collect 15 total items',
    type: 'mastery',
    requirementType: 'collectItems',
    requirementValue: 15,
    experienceReward: 400
  }
];
