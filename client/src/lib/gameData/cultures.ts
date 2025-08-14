export interface NPC {
  id: string;
  name: string;
  title: string;
  color: string;
  dialogue: string[];
  challenges: string[];
}

export interface Culture {
  id: string;
  name: string;
  theme: 'ice' | 'desert' | 'forest' | 'stone';
  color: string;
  position: [number, number, number];
  description: string;
  npcs: NPC[];
  artifacts: string[];
}

export const cultures: Culture[] = [
  {
    id: 'norse',
    name: 'Norse Realm',
    theme: 'ice',
    color: '#87ceeb',
    position: [-20, 0, -20],
    description: 'A frozen realm of warriors and ancient gods, where honor and bravery are paramount.',
    npcs: [
      {
        id: 'erik_skaldsson',
        name: 'Erik Skaldsson',
        title: 'Master Skald',
        color: '#4682b4',
        dialogue: [
          "Welcome, traveler! I am Erik, keeper of our ancient sagas.",
          "The stories of our gods and heroes live through the spoken word.",
          "Would you like to test your knowledge of Norse mythology?"
        ],
        challenges: ['norse_0', 'norse_1', 'norse_2']
      },
      {
        id: 'astrid_shieldmaiden',
        name: 'Astrid',
        title: 'Shieldmaiden',
        color: '#6495ed',
        dialogue: [
          "Greetings! I am Astrid, protector of this realm.",
          "Our culture values courage and wisdom in equal measure.",
          "Test your knowledge of our ways, if you dare!"
        ],
        challenges: ['norse_3', 'norse_4']
      }
    ],
    artifacts: ['Mjolnir Replica', 'Runic Stone', 'Viking Compass']
  },
  {
    id: 'egyptian',
    name: 'Egyptian Kingdom',
    theme: 'desert',
    color: '#daa520',
    position: [20, 0, -20],
    description: 'An ancient civilization of pharaohs and pyramids, masters of art, science, and the afterlife.',
    npcs: [
      {
        id: 'khaemwaset',
        name: 'Khaemwaset',
        title: 'High Priest',
        color: '#b8860b',
        dialogue: [
          "Blessed be your journey, traveler. I am Khaemwaset.",
          "Our civilization has thrived for millennia along the Nile.",
          "Let me share the wisdom of the ancients with you."
        ],
        challenges: ['egyptian_0', 'egyptian_1', 'egyptian_2']
      },
      {
        id: 'nefertiti_scribe',
        name: 'Nefertiti',
        title: 'Royal Scribe',
        color: '#cd853f',
        dialogue: [
          "Welcome to our kingdom! I record the deeds of pharaohs.",
          "Knowledge of hieroglyphs opens doors to understanding.",
          "Shall we test your knowledge of our great civilization?"
        ],
        challenges: ['egyptian_3', 'egyptian_4']
      }
    ],
    artifacts: ['Golden Ankh', 'Papyrus Scroll', 'Canopic Jar']
  },
  {
    id: 'japanese',
    name: 'Japanese Village',
    theme: 'forest',
    color: '#dc143c',
    position: [-20, 0, 20],
    description: 'A harmonious blend of tradition and nature, where honor, respect, and beauty guide daily life.',
    npcs: [
      {
        id: 'takeshi_sensei',
        name: 'Takeshi',
        title: 'Sensei',
        color: '#8b0000',
        dialogue: [
          "Konnichiwa! Welcome to our peaceful village.",
          "Our way emphasizes harmony between nature and humanity.",
          "Would you honor us by learning about our traditions?"
        ],
        challenges: ['japanese_0', 'japanese_1', 'japanese_2']
      },
      {
        id: 'sakura_priestess',
        name: 'Sakura',
        title: 'Shrine Maiden',
        color: '#ff69b4',
        dialogue: [
          "Greetings, traveler. The kami smile upon your visit.",
          "Our festivals celebrate the changing seasons.",
          "Test your understanding of our sacred ways."
        ],
        challenges: ['japanese_3', 'japanese_4']
      }
    ],
    artifacts: ['Katana Tsuba', 'Cherry Blossom Scroll', 'Wooden Tea Bowl']
  },
  {
    id: 'aztec',
    name: 'Aztec Temple',
    theme: 'stone',
    color: '#8b4513',
    position: [20, 0, 20],
    description: 'A mighty empire of warriors and scholars, who mastered astronomy, agriculture, and architecture.',
    npcs: [
      {
        id: 'itzel_priest',
        name: 'Itzel',
        title: 'Temple Priest',
        color: '#a0522d',
        dialogue: [
          "Welcome, traveler, to our sacred temple.",
          "We are children of Quetzalcoatl, the feathered serpent.",
          "Our knowledge of the stars guides our people."
        ],
        challenges: ['aztec_0', 'aztec_1', 'aztec_2']
      },
      {
        id: 'xochitl_warrior',
        name: 'Xochitl',
        title: 'Eagle Warrior',
        color: '#cd853f',
        dialogue: [
          "Greetings! I am Xochitl, protector of our temple.",
          "Our empire spans from mountain to sea.",
          "Prove your knowledge of our great civilization!"
        ],
        challenges: ['aztec_3', 'aztec_4']
      }
    ],
    artifacts: ['Obsidian Blade', 'Feathered Headdress', 'Calendar Stone']
  }
];
