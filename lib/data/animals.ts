export interface Animal {
  id: string;
  name: string;
  group: string;
  habitat: string;
  diet: 'carnivore' | 'herbivore' | 'omnivore';
  activity: 'nocturnal' | 'diurnal';
  body: 'legs' | 'wings' | 'fins' | 'flippers';
  size: 'tiny' | 'small' | 'medium' | 'large';
  image: string;
}

export const ANIMALS: Animal[] = [
  { id: 'lion',      name: 'Lion',      group: 'cat',          habitat: 'savanna', diet: 'carnivore', activity: 'diurnal',   body: 'legs',     size: 'large',  image: '/images/pippy/animals/lion.png' },
  { id: 'tiger',     name: 'Tiger',     group: 'cat',          habitat: 'forest',  diet: 'carnivore', activity: 'nocturnal', body: 'legs',     size: 'large',  image: '/images/pippy/animals/tiger.png' },
  { id: 'cheetah',   name: 'Cheetah',   group: 'cat',          habitat: 'savanna', diet: 'carnivore', activity: 'diurnal',   body: 'legs',     size: 'medium', image: '/images/pippy/animals/cheetah.png' },
  { id: 'leopard',   name: 'Leopard',   group: 'cat',          habitat: 'forest',  diet: 'carnivore', activity: 'nocturnal', body: 'legs',     size: 'medium', image: '/images/pippy/animals/leopard.png' },
  { id: 'house-cat', name: 'House Cat', group: 'cat',          habitat: 'home',    diet: 'carnivore', activity: 'nocturnal', body: 'legs',     size: 'small',  image: '/images/pippy/animals/house-cat.png' },
  { id: 'dog',       name: 'Dog',       group: 'dog',          habitat: 'home',    diet: 'omnivore',  activity: 'diurnal',   body: 'legs',     size: 'medium', image: '/images/pippy/animals/dog.png' },
  { id: 'wolf',      name: 'Wolf',      group: 'dog',          habitat: 'forest',  diet: 'carnivore', activity: 'nocturnal', body: 'legs',     size: 'large',  image: '/images/pippy/animals/wolf.png' },
  { id: 'elephant',  name: 'Elephant',  group: 'elephant',     habitat: 'savanna', diet: 'herbivore', activity: 'diurnal',   body: 'legs',     size: 'large',  image: '/images/pippy/animals/elephant.png' },
  { id: 'giraffe',   name: 'Giraffe',   group: 'giraffe',      habitat: 'savanna', diet: 'herbivore', activity: 'diurnal',   body: 'legs',     size: 'large',  image: '/images/pippy/animals/giraffe.png' },
  { id: 'zebra',     name: 'Zebra',     group: 'zebra',        habitat: 'savanna', diet: 'herbivore', activity: 'diurnal',   body: 'legs',     size: 'large',  image: '/images/pippy/animals/zebra.png' },
  { id: 'deer',      name: 'Deer',      group: 'deer',         habitat: 'forest',  diet: 'herbivore', activity: 'diurnal',   body: 'legs',     size: 'large',  image: '/images/pippy/animals/deer.png' },
  { id: 'rabbit',    name: 'Rabbit',    group: 'rabbit',       habitat: 'meadow',  diet: 'herbivore', activity: 'diurnal',   body: 'legs',     size: 'small',  image: '/images/pippy/animals/rabbit.png' },
  { id: 'squirrel',  name: 'Squirrel',  group: 'rodent',       habitat: 'forest',  diet: 'herbivore', activity: 'diurnal',   body: 'legs',     size: 'small',  image: '/images/pippy/animals/squirrel.png' },
  { id: 'raccoon',   name: 'Raccoon',   group: 'raccoon',      habitat: 'forest',  diet: 'omnivore',  activity: 'nocturnal', body: 'legs',     size: 'medium', image: '/images/pippy/animals/raccoon.png' },
  { id: 'hedgehog',  name: 'Hedgehog',  group: 'hedgehog',     habitat: 'forest',  diet: 'carnivore', activity: 'nocturnal', body: 'legs',     size: 'small',  image: '/images/pippy/animals/hedgehog.png' },
  { id: 'bat',       name: 'Bat',       group: 'bat',          habitat: 'cave',    diet: 'carnivore', activity: 'nocturnal', body: 'wings',    size: 'medium', image: '/images/pippy/animals/bat.png' },
  { id: 'owl',       name: 'Owl',       group: 'bird',         habitat: 'forest',  diet: 'carnivore', activity: 'nocturnal', body: 'wings',    size: 'medium', image: '/images/pippy/animals/owl.png' },
  { id: 'parrot',    name: 'Parrot',    group: 'bird',         habitat: 'jungle',  diet: 'herbivore', activity: 'diurnal',   body: 'wings',    size: 'small',  image: '/images/pippy/animals/parrot.png' },
  { id: 'butterfly', name: 'Butterfly', group: 'insect',       habitat: 'meadow',  diet: 'herbivore', activity: 'diurnal',   body: 'wings',    size: 'tiny',   image: '/images/pippy/animals/butterfly.png' },
  { id: 'moth',      name: 'Moth',      group: 'insect',       habitat: 'meadow',  diet: 'herbivore', activity: 'nocturnal', body: 'wings',    size: 'tiny',   image: '/images/pippy/animals/moth.png' },
  { id: 'dolphin',   name: 'Dolphin',   group: 'marine-mammal',habitat: 'ocean',   diet: 'carnivore', activity: 'diurnal',   body: 'fins',     size: 'large',  image: '/images/pippy/animals/dolphin.png' },
  { id: 'seal',      name: 'Seal',      group: 'marine-mammal',habitat: 'ocean',   diet: 'carnivore', activity: 'diurnal',   body: 'flippers', size: 'large',  image: '/images/pippy/animals/seal.png' },
  { id: 'sea-lion',  name: 'Sea Lion',  group: 'marine-mammal',habitat: 'ocean',   diet: 'carnivore', activity: 'diurnal',   body: 'flippers', size: 'large',  image: '/images/pippy/animals/sea-lion.png' },
  { id: 'octopus',   name: 'Octopus',   group: 'mollusk',      habitat: 'ocean',   diet: 'carnivore', activity: 'nocturnal', body: 'fins',     size: 'medium', image: '/images/pippy/animals/octopus.png' },
  { id: 'swordfish', name: 'Swordfish', group: 'fish',         habitat: 'ocean',   diet: 'carnivore', activity: 'diurnal',   body: 'fins',     size: 'large',  image: '/images/pippy/animals/swordfish.png' },
  { id: 'shark',     name: 'Shark',     group: 'fish',         habitat: 'ocean',   diet: 'carnivore', activity: 'diurnal',   body: 'fins',     size: 'large',  image: '/images/pippy/animals/shark.png' },
  { id: 'penguin',   name: 'Penguin',   group: 'bird',         habitat: 'polar',   diet: 'carnivore', activity: 'diurnal',   body: 'flippers', size: 'medium', image: '/images/pippy/animals/penguin.png' },
];

export function getAnimalById(id: string): Animal | undefined {
  return ANIMALS.find(a => a.id === id);
}
