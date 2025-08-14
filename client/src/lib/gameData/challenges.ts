export interface Challenge {
  id: string;
  culture: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  experienceReward: number;
}

export const challenges: Challenge[] = [
  // Norse Challenges
  {
    id: 'norse_0',
    culture: 'Norse',
    question: 'Who is the king of the Norse gods?',
    options: ['Thor', 'Odin', 'Loki', 'Baldur'],
    correctAnswer: 'Odin',
    explanation: 'Odin is the Allfather and king of the Æsir gods in Norse mythology. He rules from Asgard and is known for his wisdom, magic, and sacrifice.',
    difficulty: 'easy',
    experienceReward: 25
  },
  {
    id: 'norse_1',
    culture: 'Norse',
    question: 'What is the name of Thor\'s mighty hammer?',
    options: ['Gungnir', 'Mjolnir', 'Gram', 'Laevateinn'],
    correctAnswer: 'Mjolnir',
    explanation: 'Mjolnir is Thor\'s hammer, crafted by the dwarven brothers. It never misses its target and always returns to Thor\'s hand.',
    difficulty: 'easy',
    experienceReward: 25
  },
  {
    id: 'norse_2',
    culture: 'Norse',
    question: 'What is Ragnarök?',
    options: ['A Norse festival', 'The end of the world', 'A type of ship', 'A warrior\'s code'],
    correctAnswer: 'The end of the world',
    explanation: 'Ragnarök is the prophesied end of the world in Norse mythology, involving a great battle between gods and giants.',
    difficulty: 'medium',
    experienceReward: 35
  },
  {
    id: 'norse_3',
    culture: 'Norse',
    question: 'What are the Valkyries?',
    options: ['Norse goddesses of war', 'Magical weapons', 'Ancient runes', 'Types of longships'],
    correctAnswer: 'Norse goddesses of war',
    explanation: 'Valkyries are divine maidens who serve Odin, choosing which warriors die in battle and escorting the worthy to Valhalla.',
    difficulty: 'medium',
    experienceReward: 35
  },
  {
    id: 'norse_4',
    culture: 'Norse',
    question: 'What connects the nine worlds in Norse cosmology?',
    options: ['The Rainbow Bridge', 'Yggdrasil', 'The Great Ocean', 'Odin\'s Ravens'],
    correctAnswer: 'Yggdrasil',
    explanation: 'Yggdrasil is the World Tree, a massive ash tree that connects all nine worlds in Norse cosmology.',
    difficulty: 'hard',
    experienceReward: 50
  },

  // Egyptian Challenges
  {
    id: 'egyptian_0',
    culture: 'Egyptian',
    question: 'Which river was central to ancient Egyptian civilization?',
    options: ['Euphrates', 'Tigris', 'Nile', 'Jordan'],
    correctAnswer: 'Nile',
    explanation: 'The Nile River was the lifeblood of ancient Egypt, providing water, fertile soil, and transportation.',
    difficulty: 'easy',
    experienceReward: 25
  },
  {
    id: 'egyptian_1',
    culture: 'Egyptian',
    question: 'What is a pharaoh?',
    options: ['A priest', 'A pyramid builder', 'An ancient Egyptian king', 'A type of mummy'],
    correctAnswer: 'An ancient Egyptian king',
    explanation: 'Pharaohs were the rulers of ancient Egypt, considered to be divine intermediaries between the gods and the people.',
    difficulty: 'easy',
    experienceReward: 25
  },
  {
    id: 'egyptian_2',
    culture: 'Egyptian',
    question: 'What is the purpose of mummification?',
    options: ['To create art', 'To preserve the body for the afterlife', 'To honor the gods', 'To show wealth'],
    correctAnswer: 'To preserve the body for the afterlife',
    explanation: 'Egyptians believed the preserved body was necessary for the soul\'s journey in the afterlife.',
    difficulty: 'medium',
    experienceReward: 35
  },
  {
    id: 'egyptian_3',
    culture: 'Egyptian',
    question: 'Who was the Egyptian god of the sun?',
    options: ['Anubis', 'Horus', 'Ra', 'Thoth'],
    correctAnswer: 'Ra',
    explanation: 'Ra was the sun god and one of the most important deities in ancient Egyptian religion.',
    difficulty: 'medium',
    experienceReward: 35
  },
  {
    id: 'egyptian_4',
    culture: 'Egyptian',
    question: 'What is the Rosetta Stone?',
    options: ['A pyramid capstone', 'A key to deciphering hieroglyphs', 'A pharaoh\'s crown', 'A sacred tomb'],
    correctAnswer: 'A key to deciphering hieroglyphs',
    explanation: 'The Rosetta Stone contained the same text in three scripts, allowing scholars to decode Egyptian hieroglyphs.',
    difficulty: 'hard',
    experienceReward: 50
  },

  // Japanese Challenges
  {
    id: 'japanese_0',
    culture: 'Japanese',
    question: 'What is the traditional Japanese tea ceremony called?',
    options: ['Sado', 'Ikebana', 'Origami', 'Kabuki'],
    correctAnswer: 'Sado',
    explanation: 'Sado (茶道) or Chado is the traditional Japanese art of tea preparation, emphasizing harmony, respect, purity, and tranquility.',
    difficulty: 'easy',
    experienceReward: 25
  },
  {
    id: 'japanese_1',
    culture: 'Japanese',
    question: 'What are samurai?',
    options: ['Farmers', 'Merchants', 'Warrior class', 'Monks'],
    correctAnswer: 'Warrior class',
    explanation: 'Samurai were the military nobility and officer caste of medieval and early-modern Japan, following the code of Bushido.',
    difficulty: 'easy',
    experienceReward: 25
  },
  {
    id: 'japanese_2',
    culture: 'Japanese',
    question: 'What is the significance of cherry blossoms (sakura) in Japanese culture?',
    options: ['Symbol of war', 'Symbol of wealth', 'Symbol of the fleeting nature of life', 'Symbol of harvest'],
    correctAnswer: 'Symbol of the fleeting nature of life',
    explanation: 'Sakura represent mono no aware - the bittersweet awareness of the impermanence of all things and the gentle sadness at their passing.',
    difficulty: 'medium',
    experienceReward: 35
  },
  {
    id: 'japanese_3',
    culture: 'Japanese',
    question: 'What is a torii?',
    options: ['A type of sword', 'A traditional gate at Shinto shrines', 'A martial art', 'A festival'],
    correctAnswer: 'A traditional gate at Shinto shrines',
    explanation: 'Torii are traditional Japanese gates most commonly found at the entrance of or within Shinto shrines, marking the entrance to sacred space.',
    difficulty: 'medium',
    experienceReward: 35
  },
  {
    id: 'japanese_4',
    culture: 'Japanese',
    question: 'What is the philosophy behind the Japanese concept of "wabi-sabi"?',
    options: ['Perfection through practice', 'Finding beauty in imperfection', 'Strength through unity', 'Honor before death'],
    correctAnswer: 'Finding beauty in imperfection',
    explanation: 'Wabi-sabi is a Japanese aesthetic concept that finds beauty in imperfection, impermanence, and incompleteness.',
    difficulty: 'hard',
    experienceReward: 50
  },

  // Aztec Challenges
  {
    id: 'aztec_0',
    culture: 'Aztec',
    question: 'What was the capital city of the Aztec Empire?',
    options: ['Cusco', 'Tenochtitlan', 'Chichen Itza', 'Tikal'],
    correctAnswer: 'Tenochtitlan',
    explanation: 'Tenochtitlan was the capital city of the Aztec Empire, built on an island in Lake Texcoco in the Valley of Mexico.',
    difficulty: 'easy',
    experienceReward: 25
  },
  {
    id: 'aztec_1',
    culture: 'Aztec',
    question: 'Who was Quetzalcoatl?',
    options: ['An Aztec emperor', 'A feathered serpent god', 'A type of pyramid', 'A warrior priest'],
    correctAnswer: 'A feathered serpent god',
    explanation: 'Quetzalcoatl was a feathered serpent deity important to many Mesoamerican cultures, associated with wind, air, and learning.',
    difficulty: 'easy',
    experienceReward: 25
  },
  {
    id: 'aztec_2',
    culture: 'Aztec',
    question: 'What were chinampas?',
    options: ['Aztec warriors', 'Floating gardens', 'Stone temples', 'Sacred rituals'],
    correctAnswer: 'Floating gardens',
    explanation: 'Chinampas were artificial islands used for agriculture, allowing the Aztecs to farm in the shallow lake beds.',
    difficulty: 'medium',
    experienceReward: 35
  },
  {
    id: 'aztec_3',
    culture: 'Aztec',
    question: 'What was the Aztec calendar stone primarily used for?',
    options: ['Decoration', 'Timekeeping and religious ceremonies', 'Currency', 'Weapons'],
    correctAnswer: 'Timekeeping and religious ceremonies',
    explanation: 'The Aztec calendar stone was a complex system for tracking time and scheduling religious ceremonies.',
    difficulty: 'medium',
    experienceReward: 35
  },
  {
    id: 'aztec_4',
    culture: 'Aztec',
    question: 'What material did Aztecs value more than gold?',
    options: ['Silver', 'Jade', 'Obsidian', 'Cacao beans'],
    correctAnswer: 'Cacao beans',
    explanation: 'Cacao beans were so valuable to the Aztecs that they were used as currency, and chocolate was considered a gift from the gods.',
    difficulty: 'hard',
    experienceReward: 50
  }
];
