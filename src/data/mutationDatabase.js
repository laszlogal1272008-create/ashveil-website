// Ashveil Mutation Database
export const mutationDatabase = {
  mainMutations: [
    {
      id: 'cellular-regeneration',
      name: 'Cellular Regeneration',
      description: 'Recovers health slightly faster',
      category: 'main'
    },
    {
      id: 'congenital-hypoalgesia',
      name: 'Congenital Hypoalgesia',
      description: 'Reduce incoming damage when fighting larger species',
      category: 'main'
    },
    {
      id: 'efficient-digestion',
      name: 'Efficient Digestion',
      description: 'Your food drains more slowly',
      category: 'main'
    },
    {
      id: 'enlarged-meniscus',
      name: 'Enlarged Meniscus',
      description: 'Fall damage hits stamina before draining health',
      category: 'main'
    },
    {
      id: 'epidermal-fibrosis',
      name: 'Epidermal Fibrosis',
      description: 'Increase bleed resistance',
      category: 'main'
    },
    {
      id: 'featherweight',
      name: 'Featherweight',
      description: 'Your footprints fade much faster',
      category: 'main'
    },
    {
      id: 'hydrodynamic',
      name: 'Hydrodynamic',
      description: 'Increased swimming speed',
      category: 'main'
    },
    {
      id: 'hydro-regenerative',
      name: 'Hydro-regenerative',
      description: 'Recover health faster during rainy weather',
      category: 'main'
    },
    {
      id: 'increased-inspiratory-capacity',
      name: 'Increased Inspiratory Capacity',
      description: 'Increased O2 Capacity',
      category: 'main'
    },
    {
      id: 'infrasound-communication',
      name: 'Infrasound Communication',
      description: 'Make significantly less noise when talking in chat',
      category: 'main'
    },
    {
      id: 'nocturnal',
      name: 'Nocturnal',
      description: 'Faster health/locked health recover and higher move speed at night',
      category: 'main'
    },
    {
      id: 'osteosclerosis',
      name: 'Osteosclerosis',
      description: 'Resist or Reduce fracture damage',
      category: 'main'
    },
    {
      id: 'photosynthetic-tissue',
      name: 'Photosynthetic Tissue',
      description: 'Faster health/locked health recovery and higher move speed during the day',
      category: 'main'
    },
    {
      id: 'reabsorption',
      name: 'Reabsorption',
      description: 'Recover a small amount of water during rainy weather or swimming in drinkable water',
      category: 'main'
    },
    {
      id: 'submerged-optical-retention',
      name: 'Submerged Optical Retention',
      description: 'Increased underwater vision range',
      category: 'main'
    },
    {
      id: 'sustained-hydration',
      name: 'Sustained Hydration',
      description: 'Your water drains more slowly',
      category: 'main'
    },
    {
      id: 'wader',
      name: 'Wader',
      description: 'Less hindered when wading through shallows water',
      category: 'main'
    },
    {
      id: 'hematophagy',
      name: 'Hematophagy',
      description: 'Restore some thirst while eating corpses (maxed 0.17.54)',
      category: 'main'
    },
    {
      id: 'hemomania',
      name: 'Hemomania',
      description: 'Do extra damage on bleeding target',
      category: 'main'
    },
    {
      id: 'hypermetabolic',
      name: 'Hypermetabolic',
      description: 'The less hunger you have the more damage you deal.',
      category: 'main'
    },
    {
      id: 'accelerated-prey',
      name: 'Accelerated Prey',
      description: 'Deal more damage to animals with low health',
      category: 'main'
    }
  ],
  
  parentMutations: [
    {
      id: 'advanced-gestation',
      name: 'Advanced Gestation',
      description: 'Faster egg gestation / incubation / cooldown rate',
      category: 'parent'
    },
    {
      id: 'enhanced-digestion',
      name: 'Enhanced Digestion',
      description: 'Decrease nutrition decay rate',
      category: 'parent'
    },
    {
      id: 'heightened-ghrelin',
      name: 'Heightened Ghrelin',
      description: 'Increased overeating capacity by a large amount.',
      category: 'parent'
    },
    {
      id: 'multichambered-lungs',
      name: 'Multichambered Lungs',
      description: 'Reduce stamina regeneration threshold',
      category: 'parent'
    },
    {
      id: 'reinforced-tendons',
      name: 'Reinforced Tendons',
      description: 'Jumping costs less stamina',
      category: 'parent'
    },
    {
      id: 'reniculate-kidneys',
      name: 'Reniculate Kidneys',
      description: 'Can drink saltwater',
      category: 'parent'
    }
  ]
};

// Helper functions
export const getAllMutations = () => {
  return [...mutationDatabase.mainMutations, ...mutationDatabase.parentMutations];
};

export const getMutationsByCategory = (category) => {
  if (category === 'mainMutations') {
    return mutationDatabase.mainMutations;
  } else if (category === 'parentMutations') {
    return mutationDatabase.parentMutations;
  }
  return mutationDatabase[category] || [];
};

export const searchMutations = (query, category = 'all') => {
  let mutations = category === 'all' ? getAllMutations() : getMutationsByCategory(category);
  
  if (!query) return mutations;
  
  const searchTerm = query.toLowerCase();
  return mutations.filter(mutation => 
    mutation.name.toLowerCase().includes(searchTerm) ||
    mutation.description.toLowerCase().includes(searchTerm)
  );
};

export const getMutationById = (id) => {
  return getAllMutations().find(mutation => mutation.id === id);
};