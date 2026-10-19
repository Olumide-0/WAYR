import { ImageSourcePropType } from "react-native";

export type Reward = {
  id: string;
  title: string;
  merchant: string;
  category: string;
  points: number;
  distanceKm: number;
  available: boolean;
  // Higher = more popular (used by the "Popular" sort).
  popularity: number;
  image: ImageSourcePropType;
  // Big photo for the reward detail page; falls back to `image`.
  detailImage?: ImageSourcePropType;
  address: string;
  // [longitude, latitude]
  coordinate: [number, number];
  whatYouGet: string;
  howToRedeem: string;
  steps: string[];
  terms: string;
};

const REWARD_IMAGE = require("../../assets/images/Frame 239.png");
const REWARD_DETAIL_IMAGE = require("../../assets/images/Frame 232.png");

const DEFAULT_STEPS = [
  "Tap Redeem Now below",
  "Show the QR code at the counter",
  "Enjoy your reward",
];

// TODO: replace with the partner rewards from the API.
export const REWARDS: Reward[] = [
  {
    id: "coffee-lab",
    title: "Free Specialty Coffee",
    merchant: "The Coffee Lab",
    category: "Food & Drinks",
    points: 75,
    distanceKm: 0.8,
    available: true,
    popularity: 95,
    image: REWARD_IMAGE,
    detailImage: REWARD_DETAIL_IMAGE,
    address: "Degraves St, Melbourne VIC 3000",
    coordinate: [144.9653, -37.817],
    whatYouGet:
      "Enjoy one complimentary specialty coffee of your choice. Perfect post-walk fuel.",
    howToRedeem:
      "Pay with your Waypoints, then show the QR code to the barista before you order.",
    steps: DEFAULT_STEPS,
    terms:
      "Valid for one beverage. Not redeemable for cash. One redemption per person per day. Excludes bottled drinks.",
  },
  {
    id: "brunch",
    title: "Brunch for Two",
    merchant: "Hardware Société",
    category: "Food & Drinks",
    points: 150,
    distanceKm: 1.2,
    available: true,
    popularity: 80,
    image: REWARD_IMAGE,
    detailImage: REWARD_DETAIL_IMAGE,
    address: "120 Hardware St, Melbourne VIC 3000",
    coordinate: [144.9605, -37.8125],
    whatYouGet: "Two brunch mains from the weekend menu for you and a friend.",
    howToRedeem: "Pay with your Waypoints, then show the QR code when you're seated.",
    steps: DEFAULT_STEPS,
    terms: "Valid Monday to Friday. Drinks not included. Booking recommended.",
  },
  {
    id: "river-cruise",
    title: "Yarra River Cruise",
    merchant: "Melbourne River Cruises",
    category: "Experiences",
    points: 300,
    distanceKm: 1.5,
    available: true,
    popularity: 60,
    image: REWARD_IMAGE,
    detailImage: REWARD_DETAIL_IMAGE,
    address: "Berth 5 Southgate, Melbourne VIC 3006",
    coordinate: [144.9655, -37.8205],
    whatYouGet: "One adult ticket for a one-hour cruise along the Yarra River.",
    howToRedeem: "Pay with your Waypoints, then show the QR code at the ticket booth.",
    steps: DEFAULT_STEPS,
    terms: "Subject to availability. Not valid on public holidays.",
  },
  {
    id: "tote-bag",
    title: "WAYR Tote Bag",
    merchant: "Craft Victoria",
    category: "Retail",
    points: 120,
    distanceKm: 0.6,
    available: true,
    popularity: 70,
    image: REWARD_IMAGE,
    detailImage: REWARD_DETAIL_IMAGE,
    address: "Watson Pl, Melbourne VIC 3000",
    coordinate: [144.9705, -37.8138],
    whatYouGet: "A limited-edition WAYR canvas tote, designed by a local artist.",
    howToRedeem: "Pay with your Waypoints, then show the QR code at the counter.",
    steps: DEFAULT_STEPS,
    terms: "While stocks last. One per person.",
  },
  {
    id: "gallery-tour",
    title: "Guided Gallery Tour",
    merchant: "National Gallery of Victoria",
    category: "Experiences",
    points: 200,
    distanceKm: 2.1,
    available: false,
    popularity: 40,
    image: REWARD_IMAGE,
    detailImage: REWARD_DETAIL_IMAGE,
    address: "180 St Kilda Rd, Melbourne VIC 3006",
    coordinate: [144.9689, -37.8226],
    whatYouGet: "A 45-minute guided tour of the gallery's highlights.",
    howToRedeem: "Pay with your Waypoints, then show the QR code at the info desk.",
    steps: DEFAULT_STEPS,
    terms: "Tours run at 11am and 2pm daily. Bookings required.",
  },
];