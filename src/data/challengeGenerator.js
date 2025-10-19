// Daily Challenge Generator for Ashveil
// This generates fair and balanced challenges for different skill levels

import { dinosaurDatabase } from './dinosaurDatabase';

// Challenge Templates
export const challengeTemplates = {
  // GROWTH CHALLENGES
  growth: {
    easy: [
      {
        type: 'growth',
        title: 'First Steps',
        description: 'Grow from juvenile to sub-adult as any herbivore',
        reward: { amount: 2800, currency: 'Sylvan Shards' },
        difficulty: 'Easy',
        timeLimit: '6 hours',
        category: 'Growth'
      },
      {
        type: 'growth',
        title: 'Carnivore Cub',
        description: 'Grow from juvenile to sub-adult as any small carnivore',
        reward: { amount: 2800, currency: 'Razor Talons' },
        difficulty: 'Easy',
        timeLimit: '6 hours',
        category: 'Growth'
      },
      {
        type: 'growth',
        title: 'Swift Growth',
        description: 'Reach sub-adult size as Gallimimus or Dryosaurus',
        reward: { amount: 3200, currency: 'Sylvan Shards' },
        difficulty: 'Easy',
        timeLimit: '4 hours',
        category: 'Growth'
      }
    ],
    medium: [
      {
        type: 'growth',
        title: 'Adult Achievement',
        description: 'Grow to full adult as any medium-sized dinosaur',
        reward: { amount: 5200, currency: 'Auto-detect' },
        difficulty: 'Medium',
        timeLimit: '8 hours',
        category: 'Growth'
      },
      {
        type: 'growth',
        title: 'Apex Aspirant',
        description: 'Grow to adult as any Apex tier dinosaur',
        reward: { amount: 6800, currency: 'Auto-detect' },
        difficulty: 'Medium',
        timeLimit: '12 hours',
        category: 'Growth'
      },
      {
        type: 'growth',
        title: 'Double Growth',
        description: 'Grow 2 different species to sub-adult in the same day',
        reward: { amount: 6000, currency: 'Razor Talons' },
        difficulty: 'Medium',
        timeLimit: '16 hours',
        category: 'Growth'
      }
    ],
    hard: [
      {
        type: 'growth',
        title: 'Perfect Growth',
        description: 'Reach adult without dying as any Legendary tier dinosaur',
        reward: { amount: 11500, currency: 'Auto-detect' },
        difficulty: 'Hard',
        timeLimit: '20 hours',
        category: 'Growth'
      },
      {
        type: 'growth',
        title: 'Triple Threat',
        description: 'Grow 3 different dinosaurs to adult in the same day',
        reward: { amount: 12800, currency: 'Razor Talons' },
        difficulty: 'Hard',
        timeLimit: '24 hours',
        category: 'Growth'
      }
    ]
  },

  // HUNTING CHALLENGES
  hunting: {
    easy: [
      {
        type: 'hunting',
        title: 'First Kill',
        description: 'Kill any player as a carnivore',
        reward: { amount: 3200, currency: 'Razor Talons' },
        difficulty: 'Easy',
        timeLimit: '8 hours',
        category: 'Combat'
      },
      {
        type: 'hunting',
        title: 'Small Game Hunter',
        description: 'Kill a small herbivore (Dryosaurus, Hypsilophodon, Beipiaosaurus)',
        reward: { amount: 2800, currency: 'Razor Talons' },
        difficulty: 'Easy',
        timeLimit: '6 hours',
        category: 'Combat'
      },
      {
        type: 'hunting',
        title: 'Pack Strike',
        description: 'Get a kill while in a group of 2+ carnivores',
        reward: { amount: 3500, currency: 'Razor Talons' },
        difficulty: 'Easy',
        timeLimit: '10 hours',
        category: 'Combat'
      }
    ],
    medium: [
      {
        type: 'hunting',
        title: 'Medium Prey Hunter',
        description: 'Kill a medium herbivore (Maiasaura, Tenontosaurus, Pachycephalosaurus)',
        reward: { amount: 5500, currency: 'Razor Talons' },
        difficulty: 'Medium',
        timeLimit: '10 hours',
        category: 'Combat'
      },
      {
        type: 'hunting',
        title: 'Carnivore Slayer',
        description: 'Kill another carnivore in PvP combat',
        reward: { amount: 6200, currency: 'Razor Talons' },
        difficulty: 'Medium',
        timeLimit: '12 hours',
        category: 'Combat'
      },
      {
        type: 'hunting',
        title: 'Multi-Kill',
        description: 'Get 2 kills in the same life as any carnivore',
        reward: { amount: 6800, currency: 'Razor Talons' },
        difficulty: 'Medium',
        timeLimit: '8 hours',
        category: 'Combat'
      }
    ],
    hard: [
      {
        type: 'hunting',
        title: 'Large Game Hunter',
        description: 'Kill a large herbivore (Triceratops, Stegosaurus, Diabloceratops)',
        reward: { amount: 10500, currency: 'Razor Talons' },
        difficulty: 'Hard',
        timeLimit: '12 hours',
        category: 'Combat'
      },
      {
        type: 'hunting',
        title: 'Apex Duel',
        description: 'Kill an Apex tier dinosaur in single combat',
        reward: { amount: 12200, currency: 'Razor Talons' },
        difficulty: 'Hard',
        timeLimit: '18 hours',
        category: 'Combat'
      },
      {
        type: 'hunting',
        title: 'Killing Spree',
        description: 'Get 3 kills in the same life',
        reward: { amount: 11800, currency: 'Razor Talons' },
        difficulty: 'Hard',
        timeLimit: '16 hours',
        category: 'Combat'
      }
    ],
    extreme: [
      {
        type: 'hunting',
        title: 'Apex Predator',
        description: 'Kill 2 Apex tier dinosaurs in the same life',
        reward: { amount: 16200, currency: 'Razor Talons' },
        difficulty: 'Extreme',
        timeLimit: '24 hours',
        category: 'Combat'
      },
      {
        type: 'hunting',
        title: 'Perfect Hunter',
        description: 'Get 5 kills without dying as any carnivore',
        reward: { amount: 17000, currency: 'Razor Talons' },
        difficulty: 'Extreme',
        timeLimit: '24 hours',
        category: 'Combat'
      }
    ]
  },

  // SURVIVAL CHALLENGES
  survival: {
    easy: [
      {
        type: 'survival',
        title: 'Endurance Test',
        description: 'Survive 30 minutes without dying as any dinosaur',
        reward: { amount: 2500, currency: 'Auto-detect' },
        difficulty: 'Easy',
        timeLimit: '4 hours',
        category: 'Survival'
      },
      {
        type: 'survival',
        title: 'Safe Haven',
        description: 'Survive 1 hour as a herbivore without taking damage',
        reward: { amount: 3100, currency: 'Sylvan Shards' },
        difficulty: 'Easy',
        timeLimit: '6 hours',
        category: 'Survival'
      }
    ],
    medium: [
      {
        type: 'survival',
        title: 'Midnight Survivor',
        description: 'Survive 2 hours during night time as any dinosaur',
        reward: { amount: 5800, currency: 'Auto-detect' },
        difficulty: 'Medium',
        timeLimit: '8 hours',
        category: 'Survival'
      },
      {
        type: 'survival',
        title: 'Peaceful Herbivore',
        description: 'Survive 3 hours as herbivore without killing any players',
        reward: { amount: 6500, currency: 'Sylvan Shards' },
        difficulty: 'Medium',
        timeLimit: '12 hours',
        category: 'Survival'
      },
      {
        type: 'survival',
        title: 'Small but Mighty',
        description: 'Survive 2 hours as a small dinosaur (under 500kg)',
        reward: { amount: 6200, currency: 'Auto-detect' },
        difficulty: 'Medium',
        timeLimit: '10 hours',
        category: 'Survival'
      }
    ],
    hard: [
      {
        type: 'survival',
        title: 'Marathon Runner',
        description: 'Survive 4 hours in a single life as any herbivore',
        reward: { amount: 10800, currency: 'Sylvan Shards' },
        difficulty: 'Hard',
        timeLimit: '18 hours',
        category: 'Survival'
      },
      {
        type: 'survival',
        title: 'Apex Endurance',
        description: 'Survive 3 hours as an Apex tier dinosaur',
        reward: { amount: 11500, currency: 'Auto-detect' },
        difficulty: 'Hard',
        timeLimit: '20 hours',
        category: 'Survival'
      }
    ],
    extreme: [
      {
        type: 'survival',
        title: 'Immortal',
        description: 'Survive 6 hours in a single life as any dinosaur',
        reward: { amount: 15500, currency: 'Auto-detect' },
        difficulty: 'Extreme',
        timeLimit: '24 hours',
        category: 'Survival'
      }
    ]
  },

  // SOCIAL CHALLENGES
  social: {
    easy: [
      {
        type: 'social',
        title: 'Helpful Friend',
        description: 'Help protect a juvenile for 30 minutes',
        reward: { amount: 3200, currency: 'Sylvan Shards' },
        difficulty: 'Easy',
        timeLimit: '8 hours',
        category: 'Social'
      },
      {
        type: 'social',
        title: 'Pack Member',
        description: 'Stay in a group of 3+ for 1 hour',
        reward: { amount: 2900, currency: 'Auto-detect' },
        difficulty: 'Easy',
        timeLimit: '6 hours',
        category: 'Social'
      }
    ],
    medium: [
      {
        type: 'social',
        title: 'Herd Leader',
        description: 'Lead a herbivore herd of 4+ members for 2 hours',
        reward: { amount: 6800, currency: 'Sylvan Shards' },
        difficulty: 'Medium',
        timeLimit: '12 hours',
        category: 'Social'
      },
      {
        type: 'social',
        title: 'Pack Alpha',
        description: 'Lead a carnivore pack of 3+ members for 90 minutes',
        reward: { amount: 6200, currency: 'Razor Talons' },
        difficulty: 'Medium',
        timeLimit: '10 hours',
        category: 'Social'
      }
    ],
    hard: [
      {
        type: 'social',
        title: 'Community Guardian',
        description: 'Protect juveniles from 3 different attacks in one day',
        reward: { amount: 12000, currency: 'Sylvan Shards' },
        difficulty: 'Hard',
        timeLimit: '20 hours',
        category: 'Social'
      }
    ]
  },

  // EXPLORATION CHALLENGES
  exploration: {
    easy: [
      {
        type: 'exploration',
        title: 'Wanderer',
        description: 'Visit 3 different major landmarks in one life',
        reward: { amount: 3400, currency: 'Sylvan Shards' },
        difficulty: 'Easy',
        timeLimit: '8 hours',
        category: 'Exploration'
      },
      {
        type: 'exploration',
        title: 'Water Explorer',
        description: 'Spend 30 minutes near water sources as any dinosaur',
        reward: { amount: 2700, currency: 'Auto-detect' },
        difficulty: 'Easy',
        timeLimit: '6 hours',
        category: 'Exploration'
      }
    ],
    medium: [
      {
        type: 'exploration',
        title: 'Long Journey',
        description: 'Travel 5km in a single life without using teleport',
        reward: { amount: 6000, currency: 'Sylvan Shards' },
        difficulty: 'Medium',
        timeLimit: '10 hours',
        category: 'Exploration'
      },
      {
        type: 'exploration',
        title: 'Cave Dweller',
        description: 'Spend 1 hour in cave systems as any dinosaur',
        reward: { amount: 5500, currency: 'Auto-detect' },
        difficulty: 'Medium',
        timeLimit: '8 hours',
        category: 'Exploration'
      }
    ],
    hard: [
      {
        type: 'exploration',
        title: 'Island Explorer',
        description: 'Visit all 7 major landmarks in a single life',
        reward: { amount: 11200, currency: 'Sylvan Shards' },
        difficulty: 'Hard',
        timeLimit: '16 hours',
        category: 'Exploration'
      }
    ]
  },

  // SPECIFIC DINOSAUR CHALLENGES
  specific: {
    easy: [
      {
        type: 'specific',
        title: 'Swift Escape',
        description: 'Outrun 3 predators as Gallimimus without taking damage',
        reward: { amount: 3100, currency: 'Sylvan Shards' },
        difficulty: 'Easy',
        timeLimit: '6 hours',
        category: 'Species-Specific',
        requiredDino: 'gallimimus'
      },
      {
        type: 'specific',
        title: 'Tiny Terror',
        description: 'Get a kill as Troodon using pack tactics',
        reward: { amount: 3500, currency: 'Razor Talons' },
        difficulty: 'Easy',
        timeLimit: '8 hours',
        category: 'Species-Specific',
        requiredDino: 'troodon'
      }
    ],
    medium: [
      {
        type: 'specific',
        title: 'Charging Bull',
        description: 'Get 2 kills using charge attack as Triceratops',
        reward: { amount: 6800, currency: 'Sylvan Shards' },
        difficulty: 'Medium',
        timeLimit: '12 hours',
        category: 'Species-Specific',
        requiredDino: 'triceratops'
      },
      {
        type: 'specific',
        title: 'Tail Strike Master',
        description: 'Kill a large carnivore with tail attack as Stegosaurus',
        reward: { amount: 7200, currency: 'Sylvan Shards' },
        difficulty: 'Medium',
        timeLimit: '12 hours',
        category: 'Species-Specific',
        requiredDino: 'stegosaurus'
      },
      {
        type: 'specific',
        title: 'Aerial Dominance',
        description: 'Stay airborne for 2 hours as Pteranodon',
        reward: { amount: 5800, currency: 'Sylvan Shards' },
        difficulty: 'Medium',
        timeLimit: '10 hours',
        category: 'Species-Specific',
        requiredDino: 'pteranodon'
      }
    ],
    hard: [
      {
        type: 'specific',
        title: 'King of Beasts',
        description: 'Kill 3 different species as Tyrannosaurus in one life',
        reward: { amount: 12500, currency: 'Razor Talons' },
        difficulty: 'Hard',
        timeLimit: '18 hours',
        category: 'Species-Specific',
        requiredDino: 'tyrannosaurus'
      },
      {
        type: 'specific',
        title: 'Swamp Lord',
        description: 'Kill 2 players using death roll as Deinosuchus',
        reward: { amount: 11800, currency: 'Razor Talons' },
        difficulty: 'Hard',
        timeLimit: '16 hours',
        category: 'Species-Specific',
        requiredDino: 'deinosuchus'
      }
    ]
  }
};

// Generate daily challenges
export const generateDailyChallenges = (count = 6) => {
  const challenges = [];
  const usedChallenges = new Set();
  
  // Ensure variety in difficulty and types
  const difficultyDistribution = {
    easy: Math.ceil(count * 0.4), // 40% easy
    medium: Math.ceil(count * 0.4), // 40% medium
    hard: Math.ceil(count * 0.15), // 15% hard
    extreme: Math.ceil(count * 0.05) // 5% extreme
  };

  const challengeTypes = Object.keys(challengeTemplates);
  
  // Generate challenges for each difficulty
  Object.entries(difficultyDistribution).forEach(([difficulty, targetCount]) => {
    let addedCount = 0;
    
    while (addedCount < targetCount && challenges.length < count) {
      // Pick random challenge type
      const randomType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
      const typeTemplates = challengeTemplates[randomType];
      
      if (typeTemplates[difficulty] && typeTemplates[difficulty].length > 0) {
        const availableTemplates = typeTemplates[difficulty].filter(
          template => !usedChallenges.has(`${template.type}-${template.title}`)
        );
        
        if (availableTemplates.length > 0) {
          const selectedTemplate = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
          const challenge = { ...selectedTemplate };
          
          // Auto-detect currency for certain challenges (no Void Pearls - membership only)
          if (challenge.reward.currency === 'Auto-detect') {
            challenge.reward.currency = challenge.type === 'hunting' ? 'Razor Talons' : 
                                       challenge.category === 'Growth' && challenge.description.includes('herbivore') ? 'Sylvan Shards' :
                                       challenge.category === 'Growth' && challenge.description.includes('carnivore') ? 'Razor Talons' :
                                       challenge.category === 'Social' ? 'Sylvan Shards' :
                                       challenge.category === 'Survival' ? 'Sylvan Shards' :
                                       'Razor Talons';
          }
          
          // Add unique ID and generation date
          challenge.id = `daily-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          challenge.generatedDate = new Date().toISOString();
          challenge.status = 'available';
          
          challenges.push(challenge);
          usedChallenges.add(`${challenge.type}-${challenge.title}`);
          addedCount++;
        }
      }
    }
  });
  
  // Fill remaining slots if needed
  while (challenges.length < count) {
    const allTemplates = [];
    
    challengeTypes.forEach(type => {
      Object.values(challengeTemplates[type]).forEach(difficultyArray => {
        difficultyArray.forEach(template => {
          if (!usedChallenges.has(`${template.type}-${template.title}`)) {
            allTemplates.push(template);
          }
        });
      });
    });
    
    if (allTemplates.length === 0) break;
    
    const selectedTemplate = allTemplates[Math.floor(Math.random() * allTemplates.length)];
    const challenge = { ...selectedTemplate };
    
    if (challenge.reward.currency === 'Auto-detect') {
      challenge.reward.currency = 'Razor Talons';
    }
    
    challenge.id = `daily-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    challenge.generatedDate = new Date().toISOString();
    challenge.status = 'available';
    
    challenges.push(challenge);
    usedChallenges.add(`${challenge.type}-${challenge.title}`);
  }
  
  return challenges.sort((a, b) => {
    const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3, 'Extreme': 4 };
    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
  });
};

// Get challenge statistics
export const getChallengeStats = (challenges) => {
  const stats = {
    total: challenges.length,
    byDifficulty: {},
    byCategory: {},
    byType: {},
    totalRewards: {
      'Razor Talons': 0,
      'Sylvan Shards': 0
    }
  };
  
  challenges.forEach(challenge => {
    // Count by difficulty
    stats.byDifficulty[challenge.difficulty] = (stats.byDifficulty[challenge.difficulty] || 0) + 1;
    
    // Count by category
    stats.byCategory[challenge.category] = (stats.byCategory[challenge.category] || 0) + 1;
    
    // Count by type
    stats.byType[challenge.type] = (stats.byType[challenge.type] || 0) + 1;
    
    // Sum rewards (only non-membership currencies)
    if (stats.totalRewards[challenge.reward.currency] !== undefined) {
      stats.totalRewards[challenge.reward.currency] += challenge.reward.amount;
    }
  });
  
  return stats;
};

export default { challengeTemplates, generateDailyChallenges, getChallengeStats };