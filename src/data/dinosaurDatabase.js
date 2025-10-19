export const dinosaurDatabase = [
  // Carnivores
  {id: 'tyrannosaurus', name: 'Tyrannosaurus', type: 'carnivore', currency: 'Razor Talons', basePrice: 8000, price: 8000, weight: 8000, rarity: 'Apex', abilities: 'Powerful bite, high stamina, apex predator'},
  {id: 'allosaurus', name: 'Allosaurus', type: 'carnivore', currency: 'Razor Talons', basePrice: 6000, price: 6000, weight: 2000, rarity: 'Legendary', abilities: 'Bite force, speed, balanced stats'},
  {id: 'deinosuchus', name: 'Deinosuchus', type: 'aquatic', currency: 'Razor Talons', basePrice: 7000, price: 7000, weight: 3500, rarity: 'Apex', abilities: 'Death roll grab, underwater stealth, shoreline ambush'},
  {id: 'carnotaurus', name: 'Carnotaurus', type: 'carnivore', currency: 'Razor Talons', basePrice: 4500, price: 4500, weight: 1500, rarity: 'Rare', abilities: 'Ram attacks, burst sprint speed, head-on charges'},
  {id: 'dilophosaurus', name: 'Dilophosaurus', type: 'carnivore', currency: 'Razor Talons', basePrice: 3500, price: 3500, weight: 400, rarity: 'Rare', abilities: 'Venom spit → slows and damages over time'},
  {id: 'ceratosaurus', name: 'Ceratosaurus', type: 'carnivore', currency: 'Razor Talons', basePrice: 5500, price: 5500, weight: 1200, rarity: 'Rare', abilities: 'Charged bite, bacteria, increased defense while eating'},
  {id: 'herrerasaurus', name: 'Herrerasaurus', type: 'carnivore', currency: 'Razor Talons', basePrice: 2500, price: 2500, weight: 350, rarity: 'Rare', abilities: 'Climb, pounce'},
  {id: 'deinonychus', name: 'Deinonychus', type: 'carnivore', currency: 'Razor Talons', basePrice: 3200, price: 3200, weight: 75, rarity: 'Apex', abilities: 'Pounce → bleeding, can pin smaller dinosaurs'},
  {id: 'omniraptor', name: 'Omniraptor', type: 'carnivore', currency: 'Razor Talons', basePrice: 3000, price: 3000, weight: 300, rarity: 'Rare', abilities: 'Pounce attacks, tree climbing, precise strikes'},
  {id: 'troodon', name: 'Troodon', type: 'carnivore', currency: 'Razor Talons', basePrice: 2800, price: 2800, weight: 60, rarity: 'Uncommon', abilities: 'Dodge'},
  // Herbivores
  {id: 'triceratops', name: 'Triceratops', type: 'herbivore', currency: 'Sylvan Shards', basePrice: 6500, price: 6500, weight: 6000, rarity: 'Apex', abilities: 'Charge, horn impale, high health'},
  {id: 'stegosaurus', name: 'Stegosaurus', type: 'herbivore', currency: 'Sylvan Shards', basePrice: 6000, price: 6000, weight: 5500, rarity: 'Legendary', abilities: 'Tail spike thrust → high bleed damage'},
  {id: 'diabloceratops', name: 'Diabloceratops', type: 'herbivore', currency: 'Sylvan Shards', basePrice: 4000, price: 4000, weight: 4000, rarity: 'Rare', abilities: 'Charge → knockdown/stun'},
  {id: 'maiasaura', name: 'Maiasaura', type: 'herbivore', currency: 'Sylvan Shards', basePrice: 3500, price: 3500, weight: 3500, rarity: 'Rare', abilities: 'Group calls for help, herd coordination, alert warnings'},
  {id: 'pachycephalosaurus', name: 'Pachycephalosaurus', type: 'herbivore', currency: 'Sylvan Shards', basePrice: 3800, price: 3800, weight: 1200, rarity: 'Rare', abilities: 'Head slam → fractures (leg, body, head)'},
  {id: 'tenontosaurus', name: 'Tenontosaurus', type: 'herbivore', currency: 'Sylvan Shards', basePrice: 3200, price: 3200, weight: 1000, rarity: 'Rare', abilities: 'Tail whip attacks, quick escapes, stamina advantage'},
  {id: 'gallimimus', name: 'Gallimimus', type: 'omnivore', currency: 'Sylvan Shards', basePrice: 2200, price: 2200, weight: 440, rarity: 'Uncommon', abilities: 'Outrun most predators, quick pecking, flock escapes'},
  {id: 'dryosaurus', name: 'Dryosaurus', type: 'herbivore', currency: 'Sylvan Shards', basePrice: 1800, price: 1800, weight: 90, rarity: 'Common', abilities: 'Hide in dense foliage, quick dashes, evasive movement'},
  {id: 'hypsilophodon', name: 'Hypsilophodon', type: 'herbivore', currency: 'Sylvan Shards', basePrice: 1600, price: 1600, weight: 70, rarity: 'Common', abilities: 'Acid spit, high jumps'},
  {id: 'beipiaosaurus', name: 'Beipiaosaurus', type: 'omnivore', currency: 'Sylvan Shards', basePrice: 2000, price: 2000, weight: 85, rarity: 'Uncommon', abilities: 'Feather displays, varied diet options, moderate climbing'},
  {id: 'pteranodon', name: 'Pteranodon', type: 'flyer', currency: 'Sylvan Shards', basePrice: 5000, price: 5000, weight: 25, rarity: 'Common', abilities: 'Aerial scouting, dive attacks, unreachable nesting'}
];

export const getDinosaurByType = (type) => {
  return dinosaurDatabase.filter(dino => dino.type === type);
};

export const getCurrencyForType = (type) => {
  return type === 'carnivore' ? 'Razor Talons' : 'Sylvan Shards';
};

export const getAllDinosaurs = () => {
  return dinosaurDatabase;
};

export const getDinosaursByCategory = (category) => {
  if (category === 'carnivore') return getDinosaurByType('carnivore');
  if (category === 'herbivore') return getDinosaurByType('herbivore');
  if (category === 'aquatic') return getDinosaurByType('aquatic');
  if (category === 'flyer') return getDinosaurByType('flyer');
  if (category === 'omnivore') return getDinosaurByType('omnivore');
  return getAllDinosaurs();
};

export const getDinosaurById = (id) => {
  return dinosaurDatabase.find(dino => dino.id === id);
};

export const rarityConfig = {
  'Apex': {
    color: '#FF0000',
    glow: '#FF0000',
    gradient: 'linear-gradient(45deg, #FF0000, #8B0000)',
    border: '3px solid #FF0000',
    shadow: '0 0 30px rgba(255, 0, 0, 0.8)'
  },
  'Legendary': {
    color: '#ffd700',
    glow: '#ffd700',
    gradient: 'linear-gradient(45deg, #ffd700, #b8860b)',
    border: '2px solid #ffd700',
    shadow: '0 0 25px rgba(255, 215, 0, 0.6)'
  },
  'Rare': {
    color: '#9932cc',
    glow: '#9932cc',
    gradient: 'linear-gradient(45deg, #9932cc, #663399)',
    border: '2px solid #9932cc',
    shadow: '0 0 20px rgba(153, 50, 204, 0.5)'
  },
  'Uncommon': {
    color: '#1e90ff',
    glow: '#1e90ff',
    gradient: 'linear-gradient(45deg, #1e90ff, #104e8b)',
    border: '2px solid #1e90ff',
    shadow: '0 0 15px rgba(30, 144, 255, 0.4)'
  },
  'Common': {
    color: '#32cd32',
    glow: '#32cd32',
    gradient: 'linear-gradient(45deg, #32cd32, #228b22)',
    border: '2px solid #32cd32',
    shadow: '0 0 10px rgba(50, 205, 50, 0.3)'
  }
};

export default dinosaurDatabase;
