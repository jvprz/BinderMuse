import type { BinderCard } from "@/types/binder";

export const mockCards: BinderCard[] = [
  // Pokémon
  {
    id: "pokemon-pikachu-001",
    game: "pokemon",
    name: "Pikachu",
    number: "025",
    rarity: "Rare",
    set: {
      id: "pokemon-151",
      name: "151",
    },
    images: {
      small: "/mock-cards/pikachu.svg",
      large: "/mock-cards/pikachu.svg",
    },
  },
  {
    id: "pokemon-charizard-001",
    game: "pokemon",
    name: "Charizard",
    number: "006",
    rarity: "Rare",
    set: {
      id: "pokemon-151",
      name: "151",
    },
    images: {
      small: "/mock-cards/charizard.svg",
      large: "/mock-cards/charizard.svg",
    },
  },
  {
    id: "pokemon-mew-001",
    game: "pokemon",
    name: "Mew",
    number: "151",
    rarity: "Ultra Rare",
    set: {
      id: "pokemon-151",
      name: "151",
    },
    images: {
      small: "/mock-cards/mew.svg",
      large: "/mock-cards/mew.svg",
    },
  },
  {
    id: "pokemon-gengar-001",
    game: "pokemon",
    name: "Gengar",
    number: "094",
    rarity: "Rare",
    set: {
      id: "pokemon-151",
      name: "151",
    },
    images: {
      small: "/mock-cards/gengar.svg",
      large: "/mock-cards/gengar.svg",
    },
  },
  {
    id: "pokemon-eevee-001",
    game: "pokemon",
    name: "Eevee",
    number: "133",
    rarity: "Common",
    set: {
      id: "pokemon-151",
      name: "151",
    },
    images: {
      small: "/mock-cards/eevee.svg",
      large: "/mock-cards/eevee.svg",
    },
  },
  {
    id: "pokemon-mewtwo-001",
    game: "pokemon",
    name: "Mewtwo",
    number: "150",
    rarity: "Rare",
    set: {
      id: "pokemon-151",
      name: "151",
    },
    images: {
      small: "/mock-cards/mewtwo.svg",
      large: "/mock-cards/mewtwo.svg",
    },
  },

  // Cyberpunk
  {
    id: "cyberpunk-card-001",
    game: "cyberpunk",
    name: "Night City",
    number: "001",
    rarity: "Rare",
    set: {
      id: "cyberpunk-core",
      name: "Core Set",
    },
    images: {
      small: "/mock-cards/cyberpunk-night-city.svg",
      large: "/mock-cards/cyberpunk-night-city.svg",
    },
  },
  {
    id: "cyberpunk-card-002",
    game: "cyberpunk",
    name: "Edgerunner",
    number: "002",
    rarity: "Rare",
    set: {
      id: "cyberpunk-core",
      name: "Core Set",
    },
    images: {
      small: "/mock-cards/cyberpunk-edgerunner.svg",
      large: "/mock-cards/cyberpunk-edgerunner.svg",
    },
  },
  {
    id: "cyberpunk-card-003",
    game: "cyberpunk",
    name: "Afterlife",
    number: "003",
    rarity: "Common",
    set: {
      id: "cyberpunk-core",
      name: "Core Set",
    },
    images: {
      small: "/mock-cards/cyberpunk-afterlife.svg",
      large: "/mock-cards/cyberpunk-afterlife.svg",
    },
  },
  {
    id: "cyberpunk-card-004",
    game: "cyberpunk",
    name: "Chrome",
    number: "004",
    rarity: "Ultra Rare",
    set: {
      id: "cyberpunk-core",
      name: "Core Set",
    },
    images: {
      small: "/mock-cards/cyberpunk-chrome.svg",
      large: "/mock-cards/cyberpunk-chrome.svg",
    },
  },
];

export function getCardsByGame(game: BinderCard["game"]) {
  return mockCards.filter((card) => card.game === game);
}