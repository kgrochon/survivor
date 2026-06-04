import type { TribeName } from "./tribes";

import angelinaPhoto from "../img/players/angela-headshot.png";
import aubryPhoto from "../img/players/aubrey-headshot.png";
import charliePhoto from "../img/players/charlie-headshot.png";
import chrissyPhoto from "../img/players/chrissy-headshot.png";
import christianPhoto from "../img/players/christian-headshot.png";
import ciriePhoto from "../img/players/cirie-headshot.png";
import coachPhoto from "../img/players/coach-headshot.png";
import colbyPhoto from "../img/players/colby-headshot.png";
import deePhoto from "../img/players/dee-headshot.png";
import emilyPhoto from "../img/players/emily-headshot.png";
import genevievePhoto from "../img/players/genevieve-headshot.png";
import jennaPhoto from "../img/players/jenna-headshot.png";
import joePhoto from "../img/players/joe-headshot.png";
import jonathanPhoto from "../img/players/jonathon-headshot.png";
import kamillaPhoto from "../img/players/kamilla-headshot.png";
import kylePhoto from "../img/players/kyle-headshot.png";
import mikePhoto from "../img/players/mike-headshot.png";
import ozzyPhoto from "../img/players/ozzy-headshot.png";
import qPhoto from "../img/players/q-headshot.png";
import rickPhoto from "../img/players/rick-headshot.png";
import rizoPhoto from "../img/players/rizzo-headshot.png";
import savannahPhoto from "../img/players/savannah-headshot.png";
import stepheniePhoto from "../img/players/stephanie-headshot.png";
import tiffanyPhoto from "../img/players/tiffany-headshot.png";

/** A previous Survivor season a returning player competed on. */
export interface PriorSeason {
  season: number;
  placement: number;
}

/**
 * A point in a player's Season-50 journey where their tribe assignment
 * starts. The first entry is the starting tribe (`fromEpisode: 1`); later
 * entries record swaps and the merge.
 */
export interface TribeAssignment {
  fromEpisode: number;
  tribe: TribeName;
}

export interface CastMember {
  /** Stable kebab-case slug used to link records (e.g. `eliminated[i].id`). */
  id: string;
  name: string;
  /** Local headshot bundled with the app. Used everywhere by default. */
  photo: string;
  /** Larger CDN-hosted portrait, used in the player detail panel. */
  httpPhoto: string;
  /** Season-50 tribe events, ordered earliest first. Must contain at least one entry. */
  tribeJourney: TribeAssignment[];
  seasons: PriorSeason[];
}

/** The player's current tribe (the most recent event in their journey). */
export function currentTribe(journey: TribeAssignment[]): TribeName {
  return journey[journey.length - 1].tribe;
}

/**
 * Tribe the player was on as of `episode`. Uses the latest event whose
 * `fromEpisode` is `<= episode`; falls back to the starting tribe.
 */
export function tribeAtEpisode(
  journey: TribeAssignment[],
  episode: number,
): TribeName {
  let result = journey[0].tribe;
  for (const event of journey) {
    if (event.fromEpisode <= episode) result = event.tribe;
    else break;
  }
  return result;
}

export const castData: CastMember[] = [
  {
    id: "jenna-lewis-dougherty",
    name: "Jenna Lewis-Dougherty",
    tribeJourney: [
      { fromEpisode: 1, tribe: "Cila" },
      { fromEpisode: 6, tribe: "Merge" },
    ],
    seasons: [
      { season: 1, placement: 8 },
      { season: 8, placement: 3 },
    ],
    photo: jennaPhoto,
    httpPhoto:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_559,y_183,w_1379,h_775/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbc432rdmgmh0ddkp.jpg",
  },
  {
    id: "colby-donaldson",
    name: "Colby Donaldson",
    tribeJourney: [
      { fromEpisode: 1, tribe: "Vatu" },
      { fromEpisode: 3, tribe: "Kalo" },
      { fromEpisode: 6, tribe: "Merge" },
    ],
    seasons: [
      { season: 2, placement: 2 },
      { season: 8, placement: 12 },
      { season: 20, placement: 5 },
    ],
    photo: colbyPhoto,
    httpPhoto:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_0,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbbv7bnygssr2nfmx.jpg",
  },
  {
    id: "stephenie-lagrossa-kendrick",
    name: "Stephenie LaGrossa Kendrick",
    tribeJourney: [
      { fromEpisode: 1, tribe: "Vatu" },
      { fromEpisode: 6, tribe: "Merge" },
    ],
    seasons: [
      { season: 10, placement: 7 },
      { season: 11, placement: 2 },
      { season: 20, placement: 19 },
    ],
    photo: stepheniePhoto,
    httpPhoto:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_0,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbcxf91v1vq94ya8s.jpg",
  },
  {
    id: "cirie-fields",
    name: "Cirie Fields",
    tribeJourney: [
      { fromEpisode: 1, tribe: "Cila" },
      { fromEpisode: 6, tribe: "Merge" },
    ],
    seasons: [
      { season: 12, placement: 4 },
      { season: 16, placement: 3 },
      { season: 20, placement: 17 },
      { season: 34, placement: 6 },
    ],
    photo: ciriePhoto,
    httpPhoto:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_90,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbbqghycsf9h7ehyt.jpg",
  },
  {
    id: "ozzy-lusth",
    name: "Ozzy Lusth",
    tribeJourney: [
      { fromEpisode: 1, tribe: "Cila" },
      { fromEpisode: 3, tribe: "Vatu" },
      { fromEpisode: 6, tribe: "Merge" },
    ],
    seasons: [
      { season: 13, placement: 2 },
      { season: 16, placement: 9 },
      { season: 23, placement: 4 },
      { season: 34, placement: 12 },
    ],
    photo: ozzyPhoto,
    httpPhoto:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_65,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbcgr596217xbpqwe.jpg",
  },
  {
    id: "coach-wade",
    name: "Coach Wade",
    tribeJourney: [
      { fromEpisode: 1, tribe: "Kalo" },
      { fromEpisode: 6, tribe: "Merge" },
    ],
    seasons: [
      { season: 18, placement: 5 },
      { season: 20, placement: 12 },
      { season: 23, placement: 2 },
    ],
    photo: coachPhoto,
    httpPhoto:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_407,w_2000,h_1125/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjb82jcg73nb58hbcb.jpg",
  },
  {
    id: "aubry-bracco",
    name: "Aubry Bracco",
    tribeJourney: [
      { fromEpisode: 1, tribe: "Vatu" },
      { fromEpisode: 3, tribe: "Kalo" },
      { fromEpisode: 6, tribe: "Merge" },
    ],
    seasons: [
      { season: 32, placement: 2 },
      { season: 34, placement: 5 },
      { season: 38, placement: 16 },
    ],
    photo: aubryPhoto,
    httpPhoto:
      "https://parade.com/.image/c_fill,w_1200,h_1200,g_faces:center/ODowMDAwMDAwMDAxNTY4Njk1/survivor-50-aubry-bracco-header.jpg",
  },
  {
    id: "chrissy-hofbeck",
    name: "Chrissy Hofbeck",
    tribeJourney: [
      { fromEpisode: 1, tribe: "Kalo" },
      { fromEpisode: 6, tribe: "Merge" },
    ],
    seasons: [{ season: 35, placement: 2 }],
    photo: chrissyPhoto,
    httpPhoto:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_41,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbbgp9t969nt0jppn.jpg",
  },
  {
    id: "christian-hubicki",
    name: "Christian Hubicki",
    tribeJourney: [
      { fromEpisode: 1, tribe: "Cila" },
      { fromEpisode: 3, tribe: "Vatu" },
      { fromEpisode: 6, tribe: "Merge" },
    ],
    seasons: [{ season: 37, placement: 7 }],
    photo: christianPhoto,
    httpPhoto:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_101,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbbp3vqeea2tmtw0g.jpg",
  },
  {
    id: "angelina-keeley",
    name: "Angelina Keeley",
    tribeJourney: [
      { fromEpisode: 1, tribe: "Vatu" },
      { fromEpisode: 6, tribe: "Merge" },
    ],
    seasons: [{ season: 37, placement: 3 }],
    photo: angelinaPhoto,
    httpPhoto:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_99,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjb8081kem9qb8xkc7.jpg",
  },
  {
    id: "mike-white",
    name: "Mike White",
    tribeJourney: [
      { fromEpisode: 1, tribe: "Kalo" },
      { fromEpisode: 3, tribe: "Vatu" },
      { fromEpisode: 6, tribe: "Merge" },
    ],
    seasons: [{ season: 37, placement: 2 }],
    photo: mikePhoto,
    httpPhoto:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_0,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbcdv1vrhwx0a430c.jpg",
  },
  {
    id: "rick-devens",
    name: "Rick Devens",
    tribeJourney: [
      { fromEpisode: 1, tribe: "Cila" },
      { fromEpisode: 6, tribe: "Merge" },
    ],
    seasons: [{ season: 38, placement: 4 }],
    photo: rickPhoto,
    httpPhoto:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_135,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbcsq1fqbn7jydxyg.jpg",
  },
  {
    id: "jonathan-young",
    name: "Jonathan Young",
    tribeJourney: [
      { fromEpisode: 1, tribe: "Kalo" },
      { fromEpisode: 3, tribe: "Cila" },
      { fromEpisode: 6, tribe: "Merge" },
    ],
    seasons: [{ season: 42, placement: 4 }],
    photo: jonathanPhoto,
    httpPhoto:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_58,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbc9t98b0cwy300ww.jpg",
  },
  {
    id: "dee-valladares",
    name: "Dee Valladares",
    tribeJourney: [
      { fromEpisode: 1, tribe: "Kalo" },
      { fromEpisode: 3, tribe: "Cila" },
      { fromEpisode: 6, tribe: "Merge" },
    ],
    seasons: [{ season: 45, placement: 1 }],
    photo: deePhoto,
    httpPhoto:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_57,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbbxp7t3r2kzbsdyq.jpg",
  },
  {
    id: "emily-flippen",
    name: "Emily Flippen",
    tribeJourney: [
      { fromEpisode: 1, tribe: "Cila" },
      { fromEpisode: 3, tribe: "Vatu" },
      { fromEpisode: 6, tribe: "Merge" },
    ],
    seasons: [{ season: 45, placement: 7 }],
    photo: emilyPhoto,
    httpPhoto:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_87,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbbzj1ks7aq7e201d.jpg",
  },
  {
    id: "q-burdette",
    name: "Q Burdette",
    tribeJourney: [
      { fromEpisode: 1, tribe: "Vatu" },
      { fromEpisode: 6, tribe: "Merge" },
    ],
    seasons: [{ season: 46, placement: 6 }],
    photo: qPhoto,
    httpPhoto:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_0,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbcpgv7qrngg8yarh.jpg",
  },
  {
    id: "tiffany-ervin",
    name: "Tiffany Ervin",
    tribeJourney: [
      { fromEpisode: 1, tribe: "Kalo" },
      { fromEpisode: 6, tribe: "Merge" },
    ],
    seasons: [{ season: 46, placement: 8 }],
    photo: tiffanyPhoto,
    httpPhoto:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_0,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbcyg8ewdk8asekq5.jpg",
  },
  {
    id: "charlie-davis",
    name: "Charlie Davis",
    tribeJourney: [
      { fromEpisode: 1, tribe: "Kalo" },
      { fromEpisode: 3, tribe: "Cila" },
      { fromEpisode: 6, tribe: "Merge" },
    ],
    seasons: [{ season: 46, placement: 2 }],
    photo: charliePhoto,
    httpPhoto:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_0,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbbete4cdr38y67bq.jpg",
  },
  {
    id: "genevieve-mushaluk",
    name: "Genevieve Mushaluk",
    tribeJourney: [
      { fromEpisode: 1, tribe: "Vatu" },
      { fromEpisode: 3, tribe: "Kalo" },
      { fromEpisode: 6, tribe: "Merge" },
    ],
    seasons: [{ season: 47, placement: 5 }],
    photo: genevievePhoto,
    httpPhoto:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_0,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbc2nqtywch35ckfa.jpg",
  },
  {
    id: "kamilla-karthigesu",
    name: "Kamilla Karthigesu",
    tribeJourney: [
      { fromEpisode: 1, tribe: "Kalo" },
      { fromEpisode: 3, tribe: "Cila" },
      { fromEpisode: 6, tribe: "Merge" },
    ],
    seasons: [{ season: 48, placement: 4 }],
    photo: kamillaPhoto,
    httpPhoto:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_0,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbcam24z4kyy60a3f.jpg",
  },
  {
    id: "kyle-fraser",
    name: "Kyle Fraser",
    tribeJourney: [
      { fromEpisode: 1, tribe: "Vatu" },
      { fromEpisode: 6, tribe: "Merge" },
    ],
    seasons: [{ season: 48, placement: 1 }],
    photo: kylePhoto,
    httpPhoto:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_158,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbcc9818tdf6denz5.jpg",
  },
  {
    id: "joe-hunter",
    name: "Joe Hunter",
    tribeJourney: [
      { fromEpisode: 1, tribe: "Cila" },
      { fromEpisode: 3, tribe: "Kalo" },
      { fromEpisode: 6, tribe: "Merge" },
    ],
    seasons: [{ season: 48, placement: 3 }],
    photo: joePhoto,
    httpPhoto:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_189,w_2000,h_1125/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbc886bzp0p3kcdjx.jpg",
  },
  {
    id: "rizo-velovic",
    name: "Rizo Velovic",
    tribeJourney: [
      { fromEpisode: 1, tribe: "Vatu" },
      { fromEpisode: 3, tribe: "Cila" },
      { fromEpisode: 6, tribe: "Merge" },
    ],
    seasons: [{ season: 49, placement: 4 }],
    photo: rizoPhoto,
    httpPhoto:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_64,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbcv3a8f373fhnyb6.jpg",
  },
  {
    id: "savannah-louie",
    name: "Savannah Louie",
    tribeJourney: [
      { fromEpisode: 1, tribe: "Cila" },
      { fromEpisode: 6, tribe: "Merge" },
    ],
    seasons: [{ season: 49, placement: 1 }],
    photo: savannahPhoto,
    httpPhoto:
      "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_100,w_3000,h_1687/c_fill,w_280,ar_1:1,f_auto,q_auto,g_face/images/ImageExchange/mmsport/399/01kjbcwej4vgb44q5chq.jpg",
  },
];
