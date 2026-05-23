/** The four valid tribes for Season 50 — `Merge` is a phase sentinel for now. */
export type TribeName = "Cila" | "Vatu" | "Kalo" | "Merge";

/** A previous Survivor season a returning player competed on. */
export interface PriorSeason {
  season: number;
  subtitle: string;
  placement: number;
}

export interface CastMember {
  /** Stable kebab-case slug used to link records (e.g. `eliminated[i].id`). */
  id: string;
  name: string;
  /** Cropped square portrait, currently hot-linked from a third-party CDN. */
  photo: string;
  /**
   * One entry per episode of Season 50 (currently 11 slots). Step 3 of the
   * data refactor will replace this with an event-encoded journey.
   */
  tribe: TribeName[];
  seasons: PriorSeason[];
}

export const castData: CastMember[] = [
  {
    id: "jenna-lewis-dougherty",
    name: "Jenna Lewis-Dougherty",
    tribe: [
      "Cila",
      "Cila",
      "Cila",
      "Cila",
      "Cila",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
    ],
    seasons: [
      { season: 1, subtitle: "Borneo", placement: 8 },
      { season: 8, subtitle: "All-Stars", placement: 3 },
    ],
    photo:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_559,y_183,w_1379,h_775/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbc432rdmgmh0ddkp.jpg",
  },
  {
    id: "colby-donaldson",
    name: "Colby Donaldson",
    tribe: [
      "Vatu",
      "Vatu",
      "Kalo",
      "Kalo",
      "Kalo",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
    ],
    seasons: [
      { season: 2, subtitle: "The Australian Outback", placement: 2 },
      { season: 8, subtitle: "All-Stars", placement: 12 },
      { season: 20, subtitle: "Heroes vs. Villains", placement: 5 },
    ],
    photo:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_0,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbbv7bnygssr2nfmx.jpg",
  },
  {
    id: "stephenie-lagrossa-kendrick",
    name: "Stephenie LaGrossa Kendrick",
    tribe: [
      "Vatu",
      "Vatu",
      "Vatu",
      "Vatu",
      "Vatu",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
    ],
    seasons: [
      { season: 10, subtitle: "Palau", placement: 7 },
      { season: 11, subtitle: "Guatemala", placement: 2 },
      { season: 20, subtitle: "Heroes vs. Villains", placement: 19 },
    ],
    photo:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_0,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbcxf91v1vq94ya8s.jpg",
  },
  {
    id: "cirie-fields",
    name: "Cirie Fields",
    tribe: [
      "Cila",
      "Cila",
      "Cila",
      "Cila",
      "Cila",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
    ],
    seasons: [
      { season: 12, subtitle: "Panama-Exile Island", placement: 4 },
      { season: 16, subtitle: "Micronesia", placement: 3 },
      { season: 20, subtitle: "Heroes vs. Villains", placement: 17 },
      { season: 34, subtitle: "Game Changers", placement: 6 },
    ],
    photo:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_90,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbbqghycsf9h7ehyt.jpg",
  },
  {
    id: "ozzy-lusth",
    name: "Ozzy Lusth",
    tribe: [
      "Cila",
      "Cila",
      "Vatu",
      "Vatu",
      "Vatu",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
    ],
    seasons: [
      { season: 13, subtitle: "Cook Islands", placement: 2 },
      { season: 16, subtitle: "Micronesia", placement: 9 },
      { season: 23, subtitle: "South Pacific", placement: 4 },
      { season: 34, subtitle: "Game Changers", placement: 12 },
    ],
    photo:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_65,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbcgr596217xbpqwe.jpg",
  },
  {
    id: "coach-wade",
    name: "Coach Wade",
    tribe: [
      "Kalo",
      "Kalo",
      "Kalo",
      "Kalo",
      "Kalo",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
    ],
    seasons: [
      { season: 18, subtitle: "Tocantins", placement: 5 },
      { season: 20, subtitle: "Heroes vs. Villains", placement: 12 },
      { season: 23, subtitle: "South Pacific", placement: 2 },
    ],
    photo:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_407,w_2000,h_1125/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjb82jcg73nb58hbcb.jpg",
  },
  {
    id: "aubry-bracco",
    name: "Aubry Bracco",
    tribe: [
      "Vatu",
      "Vatu",
      "Kalo",
      "Kalo",
      "Kalo",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
    ],
    seasons: [
      { season: 32, subtitle: "Kaôh Rōng", placement: 2 },
      { season: 34, subtitle: "Game Changers", placement: 5 },
      { season: 38, subtitle: "Edge of Extinction", placement: 16 },
    ],
    photo:
      "https://parade.com/.image/c_fill,w_1200,h_1200,g_faces:center/ODowMDAwMDAwMDAxNTY4Njk1/survivor-50-aubry-bracco-header.jpg",
  },
  {
    id: "chrissy-hofbeck",
    name: "Chrissy Hofbeck",
    tribe: [
      "Kalo",
      "Kalo",
      "Kalo",
      "Kalo",
      "Kalo",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
    ],
    seasons: [
      { season: 35, subtitle: "Heroes vs. Healers vs. Hustlers", placement: 2 },
    ],
    photo:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_41,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbbgp9t969nt0jppn.jpg",
  },
  {
    id: "christian-hubicki",
    name: "Christian Hubicki",
    tribe: [
      "Cila",
      "Cila",
      "Vatu",
      "Vatu",
      "Vatu",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
    ],
    seasons: [{ season: 37, subtitle: "David vs. Goliath", placement: 7 }],
    photo:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_101,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbbp3vqeea2tmtw0g.jpg",
  },
  {
    id: "angelina-keeley",
    name: "Angelina Keeley",
    tribe: [
      "Vatu",
      "Vatu",
      "Vatu",
      "Vatu",
      "Vatu",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
    ],
    seasons: [{ season: 37, subtitle: "David vs. Goliath", placement: 3 }],
    photo:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_99,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjb8081kem9qb8xkc7.jpg",
  },
  {
    id: "mike-white",
    name: "Mike White",
    tribe: [
      "Kalo",
      "Kalo",
      "Vatu",
      "Vatu",
      "Vatu",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
    ],
    seasons: [{ season: 37, subtitle: "David vs. Goliath", placement: 2 }],
    photo:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_0,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbcdv1vrhwx0a430c.jpg",
  },
  {
    id: "rick-devens",
    name: "Rick Devens",
    tribe: [
      "Cila",
      "Cila",
      "Cila",
      "Cila",
      "Cila",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
    ],
    seasons: [{ season: 38, subtitle: "Edge of Extinction", placement: 4 }],
    photo:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_135,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbcsq1fqbn7jydxyg.jpg",
  },
  {
    id: "jonathan-young",
    name: "Jonathan Young",
    tribe: [
      "Kalo",
      "Kalo",
      "Cila",
      "Cila",
      "Cila",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
    ],
    seasons: [{ season: 42, subtitle: "Survivor 42", placement: 4 }],
    photo:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_58,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbc9t98b0cwy300ww.jpg",
  },
  {
    id: "dee-valladares",
    name: "Dee Valladares",
    tribe: [
      "Kalo",
      "Kalo",
      "Cila",
      "Cila",
      "Cila",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
    ],
    seasons: [{ season: 45, subtitle: "Survivor 45", placement: 1 }],
    photo:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_57,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbbxp7t3r2kzbsdyq.jpg",
  },
  {
    id: "emily-flippen",
    name: "Emily Flippen",
    tribe: [
      "Cila",
      "Cila",
      "Vatu",
      "Vatu",
      "Vatu",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
    ],
    seasons: [{ season: 45, subtitle: "Survivor 45", placement: 7 }],
    photo:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_87,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbbzj1ks7aq7e201d.jpg",
  },
  {
    id: "q-burdette",
    name: "Q Burdette",
    tribe: [
      "Vatu",
      "Vatu",
      "Vatu",
      "Vatu",
      "Vatu",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
    ],
    seasons: [{ season: 46, subtitle: "Survivor 46", placement: 6 }],
    photo:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_0,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbcpgv7qrngg8yarh.jpg",
  },
  {
    id: "tiffany-ervin",
    name: "Tiffany Ervin",
    tribe: [
      "Kalo",
      "Kalo",
      "Kalo",
      "Kalo",
      "Kalo",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
    ],
    seasons: [{ season: 46, subtitle: "Survivor 46", placement: 8 }],
    photo:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_0,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbcyg8ewdk8asekq5.jpg",
  },
  {
    id: "charlie-davis",
    name: "Charlie Davis",
    tribe: [
      "Kalo",
      "Kalo",
      "Cila",
      "Cila",
      "Cila",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
    ],
    seasons: [{ season: 46, subtitle: "Survivor 46", placement: 2 }],
    photo:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_0,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbbete4cdr38y67bq.jpg",
  },
  {
    id: "genevieve-mushaluk",
    name: "Genevieve Mushaluk",
    tribe: [
      "Vatu",
      "Vatu",
      "Kalo",
      "Kalo",
      "Kalo",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
    ],
    seasons: [{ season: 47, subtitle: "Survivor 47", placement: 5 }],
    photo:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_0,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbc2nqtywch35ckfa.jpg",
  },
  {
    id: "kamilla-karthigesu",
    name: "Kamilla Karthigesu",
    tribe: [
      "Kalo",
      "Kalo",
      "Cila",
      "Cila",
      "Cila",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
    ],
    seasons: [{ season: 48, subtitle: "Survivor 48", placement: 4 }],
    photo:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_0,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbcam24z4kyy60a3f.jpg",
  },
  {
    id: "kyle-fraser",
    name: "Kyle Fraser",
    tribe: [
      "Vatu",
      "Vatu",
      "Vatu",
      "Vatu",
      "Vatu",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
    ],
    seasons: [{ season: 48, subtitle: "Survivor 48", placement: 1 }],
    photo:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_158,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbcc9818tdf6denz5.jpg",
  },
  {
    id: "joe-hunter",
    name: "Joe Hunter",
    tribe: [
      "Cila",
      "Cila",
      "Kalo",
      "Kalo",
      "Kalo",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
    ],
    seasons: [{ season: 48, subtitle: "Survivor 48", placement: 3 }],
    photo:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_189,w_2000,h_1125/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbc886bzp0p3kcdjx.jpg",
  },
  {
    id: "rizo-velovic",
    name: "Rizo Velovic",
    tribe: [
      "Vatu",
      "Vatu",
      "Cila",
      "Cila",
      "Cila",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
    ],
    seasons: [{ season: 49, subtitle: "Survivor 49", placement: 4 }],
    photo:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_64,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbcv3a8f373fhnyb6.jpg",
  },
  {
    id: "savannah-louie",
    name: "Savannah Louie",
    tribe: [
      "Cila",
      "Cila",
      "Cila",
      "Cila",
      "Cila",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
      "Merge",
    ],
    seasons: [{ season: 49, subtitle: "Survivor 49", placement: 1 }],
    photo:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_100,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbcwej4vgb44q5chq.jpg",
  },
];

export type SeasonGroup = {
  season: number;
  subtitle: string;
  players: { id: string; name: string; photo: string; tribe: string }[];
};

/* Mid-century palette: warm creams, terracotta, olive, mustard, with bold black strokes */
export const palette = {
  bg: "#F5EDE0",
  bgAlt: "#EDE3D1",
  ink: "#1A1A18",
  cream: "#FAF6EE",
  terracotta: "#C1533C",
  mustard: "#D4982A",
  olive: "#6dad5a",
  slate: "#799db5",
  warmGray: "#8C8578",
  lightStroke: "#D4CABB",
  cila: "rgb(234 105 51)",
  vatu: "rgb(230 19 100)",
  kalo: "rgb(47 141 126)",
  merge: "#D4982A",
};

export const tribeColors = [
  { name: "Cila", color: palette.cila },
  { name: "Vatu", color: palette.vatu },
  { name: "Kalo", color: palette.kalo },
  { name: "Merge", color: palette.mustard },
];

export const eraStyles: Record<
  string,
  { color: string; label: string; shape: string }
> = {
  classic: { color: palette.terracotta, label: "Classic Era", shape: "●" },
  middle: { color: palette.olive, label: "Mid Era", shape: "◆" },
  modern: { color: palette.slate, label: "Modern Era", shape: "▲" },
  new: { color: palette.mustard, label: "New Era", shape: "■" },
};

export function getEra(season: number) {
  if (season <= 20) return "classic";
  if (season <= 34) return "middle";
  if (season <= 42) return "modern";
  return "new";
}
