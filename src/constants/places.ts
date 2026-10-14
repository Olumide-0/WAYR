import { ImageSourcePropType } from "react-native";

export type Place = {
  id: string;
  name: string;
  address: string;
  description: string;
  // Longer text for the detail page; falls back to `description` when missing.
  about?: string;
  points: number;
  tags: string[];
  // [longitude, latitude]
  coordinate: [number, number];
  image?: ImageSourcePropType;
  // Big photo for the detail page; falls back to `image` when missing.
  detailImage?: ImageSourcePropType;
};

const PLACE_IMAGE = require("../../assets/images/Frame 239.png");
const DETAIL_IMAGE = require("../../assets/images/Frame 232.png");

// TODO: replace this sample data with the real landmarks from the API.
export const FEATURED_PLACE: Place = {
  id: "national-gallery-of-victoria",
  name: "National Gallery of Victoria",
  address: "180 St Kilda Rd, Melbourne VIC 3006",
  description: "Melbourne living street gallery every visit looks different.",
  about:
    "Australia's oldest and most visited art museum, housing an outstanding collection of international and Australian art spanning ancient to contemporary works.",
  points: 75,
  tags: ["Art", "Museum", "Events"],
  coordinate: [144.9689, -37.8226],
  image: PLACE_IMAGE,
  detailImage: DETAIL_IMAGE,
};

export const NEARBY_PLACES: Place[] = [
  {
    id: "hosier-lane-street-art",
    name: "Hosier Lane Street Art",
    address: "180 St Kilda Rd, Melbourne VIC 3006",
    description: "Famous laneway covered in ever-changing street art and murals.",
    points: 75,
    tags: ["Art", "Culture", "Events"],
    coordinate: [144.9694, -37.8167],
    image: PLACE_IMAGE,
    detailImage: DETAIL_IMAGE,
  },
  {
    id: "flinders-street-station",
    name: "Flinders Street Station",
    address: "180 St Kilda Rd, Melbourne VIC 3006",
    description:
      "Melbourne's iconic heritage railway station and one of the city's most recognizable landmarks.",
    points: 75,
    tags: ["Iconic", "Culture"],
    coordinate: [144.9671, -37.8183],
    image: PLACE_IMAGE,
    detailImage: DETAIL_IMAGE,
  },
  {
    id: "royal-botanic-gardens",
    name: "Royal Botanic Gardens",
    address: "Birdwood Ave, Melbourne VIC 3004",
    description:
      "Sprawling heritage-listed gardens featuring thousands of plant species and stunning lakeside views.",
    points: 75,
    tags: ["Culture", "Iconic"],
    coordinate: [144.9796, -37.8304],
    image: PLACE_IMAGE,
    detailImage: DETAIL_IMAGE,
  },
  {
    id: "federation-square",
    name: "Federation Square",
    address: "Swanston St & Flinders St, Melbourne VIC 3000",
    description:
      "Modern cultural precinct and meeting place in the heart of Melbourne's city center.",
    points: 75,
    tags: ["Culture", "Events", "Art"],
    coordinate: [144.969, -37.818],
    image: PLACE_IMAGE,
    detailImage: DETAIL_IMAGE,
  },
  {
    id: "brighton-beach-boxes",
    name: "Brighton Beach Boxes",
    address: "Esplanade, Brighton VIC 3186",
    description:
      "Row of 82 colorful bathing boxes along the shoreline, a favorite spot for photos.",
    points: 75,
    tags: ["Iconic", "Art"],
    coordinate: [144.9863, -37.9137],
    image: PLACE_IMAGE,
    detailImage: DETAIL_IMAGE,
  },
];

export const ALL_PLACES: Place[] = [FEATURED_PLACE, ...NEARBY_PLACES];

// ---- Route bonuses ("Get Directions" map) ----
// On the way to a landmark the user can branch to nearby places. Each one is worth
// a bonus, and the bonuses add up to the landmark's own points (15 + 25 + 35 = 75).
// Only the places the user actually visits are added.
export const ROUTE_BONUS_POINTS = [15, 25, 35];

export type RouteStop = {
  place: Place;
  points: number;
  isFinal: boolean;
};

const roughDistance = (a: [number, number], b: [number, number]) =>
  Math.hypot(a[0] - b[0], a[1] - b[1]);

// TODO: replace with the stops (and points) returned by the API for this landmark.
export function getRouteStops(final: Place): RouteStop[] {
  const nearby = ALL_PLACES.filter((place) => place.id !== final.id)
    .sort(
      (a, b) =>
        roughDistance(a.coordinate, final.coordinate) -
        roughDistance(b.coordinate, final.coordinate)
    )
    .slice(0, ROUTE_BONUS_POINTS.length)
    // Furthest first, so the route walks towards the final landmark.
    .reverse();

  return [
    ...nearby.map((place, index) => ({
      place,
      points: ROUTE_BONUS_POINTS[index],
      isFinal: false,
    })),
    { place: final, points: final.points, isFinal: true },
  ];
}