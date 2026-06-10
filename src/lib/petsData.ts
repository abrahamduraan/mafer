// =====================================================================
// PETS DATA — los 14 personajes kawaii (7 gatitos + 7 perritos). Cada uno
// con su paleta única, tipo de orejas/hocico, marcas y accesorio. La data
// es estática y declarativa: PetCard la traduce a un SVG chibi.
// =====================================================================

// Frases que los animalitos alternan (coro de cumpleaños), pick aleatorio.
export const PET_MESSAGES = [
  "Happy birthday! 🎂",
  "I love you 💖",
  "You're the best 🌟",
  "Yay! 🎉",
  "Woof woof! 🐾",
  "Meow 🐱",
  "Princess 👑",
  "So cute! 💕",
  "Love you lots 💞",
  "Party time! 🎈",
  "Hugs 🤗",
  "You shine ✨",
  "Best day ever 🌈",
  "Mwah! 💋",
  "Cheers! 🥂",
  "Forever young 🦋",
  "Pretty girl 🌸",
  "Happy day 🎀",
  "Stay sparkly ✨",
  "Sending love 💌",
] as const;

export type PetKind = "cat" | "dog";

// Forma de orejas
export type EarStyle =
  | "cat" // triángulos parados
  | "cat-fluffy" // triángulos peludos
  | "dog-floppy" // caídas a los lados
  | "dog-erect" // paradas (husky)
  | "dog-semi" // una parada + una caída (zaguate)
  | "dog-long"; // largas con pelo (yorky / dachshund)

// Hocico
export type SnoutStyle = "cat" | "dog" | "dog-pointy";

// Marcas de pelaje
export type Markings =
  | "none"
  | "siamese"
  | "tabby"
  | "calico"
  | "tuxedo"
  | "husky"
  | "yorky";

// Cola
export type TailStyle = "none" | "cat" | "dog" | "dog-fast";

// Accesorio distintivo
export type Accessory =
  | "ear-bow" // moño grande en la oreja
  | "pearls" // collar de perlas
  | "neck-bow" // lazo al cuello
  | "scarf" // bufanda
  | "gold-collar" // collar dorado
  | "ear-flower" // florecita en la oreja
  | "party-hat" // gorro de fiesta con borla
  | "birthday-cone" // gorrito cónico de cumpleaños
  | "head-bow" // moño grande en la cabeza (zaguate)
  | "angel" // aureola + alitas
  | "sweater" // suéter tejido (chihuahua)
  | "none";

export interface PetData {
  id: string;
  name: string;
  kind: PetKind;
  seed: number;

  // colores
  body: string; // pelaje principal
  bodyShade: string; // sombra / borde del pelaje
  patch: string; // marcas (rayas, manchas, puntos siamés)
  belly: string; // pecho / hocico claro
  innerEar: string; // interior de orejas
  eye: string; // iris
  cheek: string; // mejillas
  accent: string; // color del accesorio
  accent2: string; // detalle del accesorio

  // forma
  ears: EarStyle;
  snout: SnoutStyle;
  markings: Markings;
  tail: TailStyle;
  accessory: Accessory;

  // extras
  fluffy?: boolean; // contorno peludo (esponjosos)
  wink?: boolean; // un ojo guiñado (sassy)
  bigShine?: boolean; // brillo de ojos extra grande (zaguate)
  glow?: boolean; // glow dorado constante (angelito)
  sparkles?: boolean; // sparkles dorados alrededor
  tiltOften?: boolean; // ladea la cabeza más seguido (curioso)
  longBody?: boolean; // cuerpo alargado (dachshund)
  tiny?: boolean; // muy pequeñito (chihuahua)
}

export const PETS: PetData[] = [
  // ============ GATITOS (7) ============
  {
    id: "kitty-pink",
    name: "Pink kitty",
    kind: "cat",
    seed: 11,
    body: "#FBC7D4",
    bodyShade: "#E89BB1",
    patch: "#F4A6BC",
    belly: "#FFF1F4",
    innerEar: "#F4A6BC",
    eye: "#2FAE76", // verde esmeralda
    cheek: "#F48FB1",
    accent: "#E8829F",
    accent2: "#C04870",
    ears: "cat",
    snout: "cat",
    markings: "none",
    tail: "cat",
    accessory: "ear-bow",
  },
  {
    id: "kitty-siamese",
    name: "Siamese kitty",
    kind: "cat",
    seed: 23,
    body: "#F7EEDD",
    bodyShade: "#D9C4A0",
    patch: "#9A7B5E", // puntos café
    belly: "#FFFBF2",
    innerEar: "#C9A98A",
    eye: "#7EC8E3", // azul cielo
    cheek: "#E9B7A0",
    accent: "#F5E6D3",
    accent2: "#D4AF7F",
    ears: "cat",
    snout: "cat",
    markings: "siamese",
    tail: "cat",
    accessory: "pearls",
  },
  {
    id: "kitty-peach-tabby",
    name: "Peach tabby",
    kind: "cat",
    seed: 37,
    body: "#FFCBA4",
    bodyShade: "#E89B6B",
    patch: "#E08A52", // rayas
    belly: "#FFF1E4",
    innerEar: "#F2A878",
    eye: "#A9742F",
    cheek: "#F2956B",
    accent: "#E8829F",
    accent2: "#C04870",
    ears: "cat",
    snout: "cat",
    markings: "tabby",
    tail: "cat",
    accessory: "none",
    wink: true,
  },
  {
    id: "kitty-white-fluffy",
    name: "Fluffy white kitty",
    kind: "cat",
    seed: 53,
    body: "#FFFDF8",
    bodyShade: "#EAD9DC",
    patch: "#F3E8EA",
    belly: "#FFFFFF",
    innerEar: "#F6D2DD",
    eye: "#F08FB0", // ojos rosados
    cheek: "#F4A6BC",
    accent: "#C3B2E8", // lazo lila
    accent2: "#9C84D4",
    ears: "cat-fluffy",
    snout: "cat",
    markings: "none",
    tail: "cat",
    accessory: "neck-bow",
    fluffy: true,
  },
  {
    id: "kitty-silver",
    name: "Silver kitty",
    kind: "cat",
    seed: 67,
    body: "#D9DEE3",
    bodyShade: "#AEB6BE",
    patch: "#C2C9D0",
    belly: "#F2F4F6",
    innerEar: "#EAB7C4",
    eye: "#F2C94C", // amarillos
    cheek: "#F4A6BC",
    accent: "#F4A6BC", // bufanda rosa
    accent2: "#E8829F",
    ears: "cat",
    snout: "cat",
    markings: "none",
    tail: "cat",
    accessory: "scarf",
    sparkles: true,
    tiltOften: true,
  },
  {
    id: "kitty-black",
    name: "Little black cat",
    kind: "cat",
    seed: 83,
    body: "#2E2A2E",
    bodyShade: "#1B181B",
    patch: "#3A363A",
    belly: "#FBFBFB", // pecho blanco
    innerEar: "#6E5560",
    eye: "#B6E84B", // verde lima
    cheek: "#9A5A6E",
    accent: "#D4AF7F", // collar dorado
    accent2: "#B98F50",
    ears: "cat",
    snout: "cat",
    markings: "tuxedo",
    tail: "cat",
    accessory: "gold-collar",
  },
  {
    id: "kitty-calico",
    name: "Calico kitty",
    kind: "cat",
    seed: 97,
    body: "#FFFDF8", // base blanca
    bodyShade: "#E2C9A0",
    patch: "#EE9A4D", // manchas naranja
    belly: "#FFFFFF",
    innerEar: "#F2A878",
    eye: "#E0A85C", // miel
    cheek: "#F4A6BC",
    accent: "#F48FB1",
    accent2: "#E8829F",
    ears: "cat",
    snout: "cat",
    markings: "calico",
    tail: "cat",
    accessory: "ear-flower",
  },

  // ============ PERRITOS (7) ============
  {
    id: "dog-golden",
    name: "Golden pup",
    kind: "dog",
    seed: 113,
    body: "#E8C887",
    bodyShade: "#CDA75E",
    patch: "#D9B36C",
    belly: "#FBF1DC",
    innerEar: "#D2A75F",
    eye: "#6B4A2A",
    cheek: "#F2956B",
    accent: "#D4AF7F", // gorro dorado
    accent2: "#B98F50",
    ears: "dog-floppy",
    snout: "dog",
    markings: "none",
    tail: "dog",
    accessory: "party-hat",
  },
  {
    id: "dog-husky",
    name: "Pastel husky",
    kind: "dog",
    seed: 131,
    body: "#DCE9F5",
    bodyShade: "#AEC4DC",
    patch: "#9FB6CF", // capa gris-azul
    belly: "#FFFFFF",
    innerEar: "#EAB7C4",
    eye: "#7FC7E8", // azul hielo
    cheek: "#F4A6BC",
    accent: "#F4A6BC", // gorrito rosa
    accent2: "#E8829F",
    ears: "dog-erect",
    snout: "dog",
    markings: "husky",
    tail: "dog",
    accessory: "birthday-cone",
  },
  {
    id: "dog-bichon",
    name: "Fluffy bichon",
    kind: "dog",
    seed: 149,
    body: "#FFFDF8",
    bodyShade: "#EAD9DC",
    patch: "#F3E8EA",
    belly: "#FFFFFF",
    innerEar: "#F6D2DD",
    eye: "#6B4A3A",
    cheek: "#F4A6BC",
    accent: "#E8829F", // lazo rosa
    accent2: "#C04870",
    ears: "dog-floppy",
    snout: "dog",
    markings: "none",
    tail: "dog",
    accessory: "ear-bow",
    fluffy: true,
  },
  {
    id: "dog-zaguate",
    name: "Zaguate pup",
    kind: "dog",
    seed: 167,
    body: "#241F24", // negro brilloso
    bodyShade: "#100D10",
    patch: "#37313A",
    belly: "#5A4452",
    innerEar: "#7A5A68",
    eye: "#7A4A26", // café con brillo
    cheek: "#8A5266",
    accent: "#F48FB1", // lazito rosado grande
    accent2: "#E8829F",
    ears: "dog-semi",
    snout: "dog-pointy",
    markings: "none",
    tail: "dog-fast",
    accessory: "head-bow",
    bigShine: true,
    tiltOften: true,
  },
  {
    id: "dog-yorky-angel",
    name: "Angel yorkie",
    kind: "dog",
    seed: 181,
    body: "#9A6E4A", // café
    bodyShade: "#7A5638",
    patch: "#C49A6C", // marrón claro
    belly: "#D9B98E",
    innerEar: "#7A5638",
    eye: "#4A3422",
    cheek: "#E2A48C",
    accent: "#D4AF7F", // aureola dorada
    accent2: "#FFFFFF", // alitas
    ears: "dog-long",
    snout: "dog",
    markings: "yorky",
    tail: "dog",
    accessory: "angel",
    glow: true,
    sparkles: true,
  },
  {
    id: "dog-dachshund",
    name: "Dachshund",
    kind: "dog",
    seed: 199,
    body: "#F4C77B",
    bodyShade: "#D9A857",
    patch: "#E3B264",
    belly: "#FBEFD2",
    innerEar: "#C99A4E",
    eye: "#5A3A20",
    cheek: "#F2956B",
    accent: "#D4AF7F", // moño dorado
    accent2: "#B98F50",
    ears: "dog-long",
    snout: "dog-pointy",
    markings: "none",
    tail: "dog",
    accessory: "neck-bow",
    longBody: true,
  },
  {
    id: "dog-chihuahua",
    name: "Chihuahua",
    kind: "dog",
    seed: 211,
    body: "#F5E6D3",
    bodyShade: "#D9C4A0",
    patch: "#E8D3B4",
    belly: "#FFFBF2",
    innerEar: "#EAB7C4",
    eye: "#3A2820",
    cheek: "#F4A6BC",
    accent: "#F48FB1", // suéter rosa
    accent2: "#E8829F",
    ears: "dog-erect",
    snout: "dog",
    markings: "none",
    tail: "dog",
    accessory: "sweater",
    tiny: true,
  },
];
