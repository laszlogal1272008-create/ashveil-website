export const dinosaurDatabase = [
  // Carnivores
  {id: 'tyrannosaurus', name: 'Tyrannosaurus', type: 'carnivore', currency: 'Razor Talons', basePrice: 8000, price: 8000, weight: 8000, rarity: 'Legendary', abilities: 'Apex predator with devastating bite force'},
  {id: 'allosaurus', name: 'Allosaurus', type: 'carnivore', currency: 'Razor Talons', basePrice: 6000, price: 6000, weight: 2000, rarity: 'Rare', abilities: 'Versatile pack hunter'},
  {id: 'deinosuchus', name: 'Deinosuchus', type: 'carnivore', currency: 'Razor Talons', basePrice: 7000, price: 7000, weight: 3500, rarity: 'Legendary', abilities: 'Massive aquatic predator'},
  {id: 'carnotaurus', name: 'Carnotaurus', type: 'carnivore', currency: 'Razor Talons', basePrice: 4500, price: 4500, weight: 1500, rarity: 'Rare', abilities: 'Speed demon carnivore'},
  {id: 'dilophosaurus', name: 'Dilophosaurus', type: 'carnivore', currency: 'Razor Talons', basePrice: 3500, price: 3500, weight: 400, rarity: 'Uncommon', abilities: 'Agile pack hunter'},
  {id: 'ceratosaurus', name: 'Ceratosaurus', type: 'carnivore', currency: 'Razor Talons', basePrice: 5500, price: 5500, weight: 1200, rarity: 'Rare', abilities: 'Horned carnivore'},
  {id: 'herrerasaurus', name: 'Herrerasaurus', type: 'carnivore', currency: 'Razor Talons', basePrice: 2500, price: 2500, weight: 350, rarity: 'Common', abilities: 'Early theropod hunter'},
  {id: 'omniraptor', name: 'Omniraptor', type: 'carnivore', currency: 'Razor Talons', basePrice: 3000, price: 3000, weight: 300, rarity: 'Uncommon', abilities: 'Intelligent pack hunter'},
  {id: 'troodon', name: 'Troodon', type: 'carnivore', currency: 'Razor Talons', basePrice: 2800, price: 2800, weight: 60, rarity: 'Common', abilities: 'Venomous small predator'},
  // Herbivores
  {id: 'triceratops', name: 'Triceratops', type: 'herbivore', currency: 'Sylvan Shards', basePrice: 6500, price: 6500, weight: 6000, rarity: 'Rare', abilities: 'Three-horned herbivore'},
  {id: 'stegosaurus', name: 'Stegosaurus', type: 'herbivore', currency: 'Sylvan Shards', basePrice: 6000, price: 6000, weight: 5500, rarity: 'Rare', abilities: 'Armored herbivore with tail spikes'},
  {id: 'diabloceratops', name: 'Diabloceratops', type: 'herbivore', currency: 'Sylvan Shards', basePrice: 4000, price: 4000, weight: 4000, rarity: 'Uncommon', abilities: 'Horned herbivore'},
  {id: 'maiasaura', name: 'Maiasaura', type: 'herbivore', currency: 'Sylvan Shards', basePrice: 3500, price: 3500, weight: 3500, rarity: 'Uncommon', abilities: 'Caring mother dinosaur'},
  {id: 'pachycephalosaurus', name: 'Pachycephalosaurus', type: 'herbivore', currency: 'Sylvan Shards', basePrice: 3800, price: 3800, weight: 1200, rarity: 'Uncommon', abilities: 'Dome-headed herbivore'},
  {id: 'tenontosaurus', name: 'Tenontosaurus', type: 'herbivore', currency: 'Sylvan Shards', basePrice: 3200, price: 3200, weight: 1000, rarity: 'Common', abilities: 'Agile herbivore'},
  {id: 'gallimimus', name: 'Gallimimus', type: 'herbivore', currency: 'Sylvan Shards', basePrice: 2200, price: 2200, weight: 440, rarity: 'Common', abilities: 'Extremely fast runner'},
  {id: 'dryosaurus', name: 'Dryosaurus', type: 'herbivore', currency: 'Sylvan Shards', basePrice: 1800, price: 1800, weight: 90, rarity: 'Common', abilities: 'Small fast herbivore'},
  {id: 'hypsilophodon', name: 'Hypsilophodon', type: 'herbivore', currency: 'Sylvan Shards', basePrice: 1600, price: 1600, weight: 70, rarity: 'Common', abilities: 'Nimble forest dweller'},
  {id: 'beipiaosaurus', name: 'Beipiaosaurus', type: 'herbivore', currency: 'Sylvan Shards', basePrice: 2000, price: 2000, weight: 85, rarity: 'Common', abilities: 'Feathered herbivore'},
  {id: 'pteranodon', name: 'Pteranodon', type: 'herbivore', currency: 'Sylvan Shards', basePrice: 5000, price: 5000, weight: 25, rarity: 'Rare', abilities: 'Flying reptile'}
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
