export const dinosaurDatabase = [
  // Carnivores
  {id: 'tyrannosaurus', name: 'Tyrannosaurus', type: 'carnivore', currency: 'Razor Talons', basePrice: 8000},
  {id: 'allosaurus', name: 'Allosaurus', type: 'carnivore', currency: 'Razor Talons', basePrice: 6000},
  {id: 'deinosuchus', name: 'Deinosuchus', type: 'carnivore', currency: 'Razor Talons', basePrice: 7000},
  {id: 'carnotaurus', name: 'Carnotaurus', type: 'carnivore', currency: 'Razor Talons', basePrice: 4500},
  {id: 'dilophosaurus', name: 'Dilophosaurus', type: 'carnivore', currency: 'Razor Talons', basePrice: 3500},
  {id: 'ceratosaurus', name: 'Ceratosaurus', type: 'carnivore', currency: 'Razor Talons', basePrice: 5500},
  {id: 'herrerasaurus', name: 'Herrerasaurus', type: 'carnivore', currency: 'Razor Talons', basePrice: 2500},
  {id: 'omniraptor', name: 'Omniraptor', type: 'carnivore', currency: 'Razor Talons', basePrice: 3000},
  {id: 'troodon', name: 'Troodon', type: 'carnivore', currency: 'Razor Talons', basePrice: 2800},
  // Herbivores
  {id: 'triceratops', name: 'Triceratops', type: 'herbivore', currency: 'Sylvan Shards', basePrice: 6500},
  {id: 'stegosaurus', name: 'Stegosaurus', type: 'herbivore', currency: 'Sylvan Shards', basePrice: 6000},
  {id: 'diabloceratops', name: 'Diabloceratops', type: 'herbivore', currency: 'Sylvan Shards', basePrice: 4000},
  {id: 'maiasaura', name: 'Maiasaura', type: 'herbivore', currency: 'Sylvan Shards', basePrice: 3500},
  {id: 'pachycephalosaurus', name: 'Pachycephalosaurus', type: 'herbivore', currency: 'Sylvan Shards', basePrice: 3800},
  {id: 'tenontosaurus', name: 'Tenontosaurus', type: 'herbivore', currency: 'Sylvan Shards', basePrice: 3200},
  {id: 'gallimimus', name: 'Gallimimus', type: 'herbivore', currency: 'Sylvan Shards', basePrice: 2200},
  {id: 'dryosaurus', name: 'Dryosaurus', type: 'herbivore', currency: 'Sylvan Shards', basePrice: 1800},
  {id: 'hypsilophodon', name: 'Hypsilophodon', type: 'herbivore', currency: 'Sylvan Shards', basePrice: 1600},
  {id: 'beipiaosaurus', name: 'Beipiaosaurus', type: 'herbivore', currency: 'Sylvan Shards', basePrice: 2000},
  {id: 'pteranodon', name: 'Pteranodon', type: 'herbivore', currency: 'Sylvan Shards', basePrice: 5000}
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
  return getAllDinosaurs();
};

export const getDinosaurById = (id) => {
  return dinosaurDatabase.find(dino => dino.id === id);
};

export const rarityConfig = {
  'Apex': {
    color: '#ff0000',
    glow: '#ff0000',
    gradient: 'linear-gradient(45deg, #ff0000, #8b0000)',
    border: '3px solid #ff0000',
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
