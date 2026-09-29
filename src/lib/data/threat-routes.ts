/** [longitude, latitude] */
export type LonLat = [number, number];

const LOCATIONS = {
  // Asia
  singapore: [103.8, 1.35] as LonLat,
  mumbai: [72.8, 19.07] as LonLat,
  tokyo: [139.7, 35.68] as LonLat,
  seoul: [126.98, 37.57] as LonLat,
  beijing: [116.4, 39.9] as LonLat,
  bangkok: [100.5, 13.75] as LonLat,
  jakarta: [106.85, -6.2] as LonLat,

  // Europe
  frankfurt: [8.68, 50.11] as LonLat,
  london: [-0.12, 51.5] as LonLat,
  paris: [2.35, 48.85] as LonLat,
  amsterdam: [4.9, 52.37] as LonLat,
  moscow: [37.6, 55.75] as LonLat,
  istanbul: [28.97, 41.01] as LonLat,

  // North America
  newYork: [-74, 40.7] as LonLat,
  losAngeles: [-118.24, 34.05] as LonLat,
  sanFrancisco: [-122.42, 37.77] as LonLat,
  seattle: [-122.33, 47.61] as LonLat,
  toronto: [-79.38, 43.65] as LonLat,
  chicago: [-87.63, 41.88] as LonLat,

  // South America
  saoPaulo: [-46.6, -23.5] as LonLat,
  buenosAires: [-58.38, -34.6] as LonLat,
  santiago: [-70.67, -33.45] as LonLat,

  // Africa
  lagos: [3.4, 6.5] as LonLat,
  cairo: [31.24, 30.04] as LonLat,
  nairobi: [36.82, -1.29] as LonLat,
  johannesburg: [28.05, -26.2] as LonLat,

  // Australia
  sydney: [151.2, -33.87] as LonLat,
  melbourne: [144.96, -37.81] as LonLat,

  // Middle East
  dubai: [55.27, 25.2] as LonLat,
};

const LOCATION_LABELS: Record<keyof typeof LOCATIONS, string> = {
  singapore: "Singapore",
  mumbai: "Mumbai, IN",
  tokyo: "Tokyo, JP",
  seoul: "Seoul, KR",
  beijing: "Beijing, CN",
  bangkok: "Bangkok, TH",
  jakarta: "Jakarta, ID",
  frankfurt: "Frankfurt, DE",
  london: "London, UK",
  paris: "Paris, FR",
  amsterdam: "Amsterdam, NL",
  moscow: "Moscow, RU",
  istanbul: "Istanbul, TR",
  newYork: "New York, US",
  losAngeles: "Los Angeles, US",
  sanFrancisco: "San Francisco, US",
  seattle: "Seattle, US",
  toronto: "Toronto, CA",
  chicago: "Chicago, US",
  saoPaulo: "Sao Paulo, BR",
  buenosAires: "Buenos Aires, AR",
  santiago: "Santiago, CL",
  lagos: "Lagos, NG",
  cairo: "Cairo, EG",
  nairobi: "Nairobi, KE",
  johannesburg: "Johannesburg, ZA",
  sydney: "Sydney, AU",
  melbourne: "Melbourne, AU",
  dubai: "Dubai, AE",
};

export interface ThreatRoute {
  from: LonLat;
  to: LonLat;
  fromName: string;
  toName: string;
}

function route(fromKey: keyof typeof LOCATIONS, toKey: keyof typeof LOCATIONS): ThreatRoute {
  return { from: LOCATIONS[fromKey], to: LOCATIONS[toKey], fromName: LOCATION_LABELS[fromKey], toName: LOCATION_LABELS[toKey] };
}

/** Demo attack routes shown on the threat globe. */
export const THREAT_ROUTES: ThreatRoute[] = [
  // Asia → Europe
  route("singapore", "frankfurt"),
  route("mumbai", "frankfurt"),
  route("tokyo", "london"),
  route("seoul", "paris"),
  route("beijing", "amsterdam"),
  route("bangkok", "london"),

  // Asia → Australia
  route("singapore", "sydney"),
  route("tokyo", "sydney"),
  route("seoul", "melbourne"),

  // Europe → North America
  route("london", "newYork"),
  route("frankfurt", "newYork"),
  route("paris", "toronto"),

  // North America → Asia
  route("newYork", "tokyo"),
  route("sanFrancisco", "singapore"),
  route("losAngeles", "tokyo"),

  // North America → Australia
  route("newYork", "sydney"),
  route("losAngeles", "sydney"),
  route("sanFrancisco", "melbourne"),

  // South America → North America
  route("saoPaulo", "newYork"),
  route("santiago", "losAngeles"),

  // Africa → Europe
  route("lagos", "london"),
  route("johannesburg", "frankfurt"),
  route("cairo", "paris"),

  // Africa → Asia / Australia
  route("lagos", "singapore"),
  route("nairobi", "mumbai"),
  route("johannesburg", "sydney"),

  // Europe → Asia
  route("moscow", "frankfurt"),
  route("moscow", "tokyo"),
  route("london", "singapore"),
  route("frankfurt", "mumbai"),

  // Europe → Middle East / Asia
  route("london", "dubai"),
  route("frankfurt", "dubai"),
  route("istanbul", "mumbai"),
];
