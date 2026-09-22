export type TcgGame = "pokemon" | "cyberpunk";

export type BinderLayout = {
  id: string;
  label: string;
  columns: number;
  rows: number;
};

export type CardSet = {
  id: string;
  name: string;
};

export type BinderCard = {
  id: string;
  game: TcgGame;

  name: string;
  number?: string;
  rarity?: string;

  set?: CardSet;

  images: {
    small: string;
    large: string;
  };
};

export type CardPocketContent = {
  type: "card";
  card: BinderCard;
};

export type ImagePocketContent = {
  type: "image";
  imageUrl: string;
};

export type PocketContent =
  | CardPocketContent
  | ImagePocketContent
  | null;

export type BinderPocket = {
  id: string;
  content: PocketContent;
};

export type BinderPage = {
  game: TcgGame;
  layout: BinderLayout;
  pageColor: string;
  pockets: BinderPocket[];
};