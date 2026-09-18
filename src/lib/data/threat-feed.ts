export interface ThreatFeedItem {
  time: string;
  type: "Phishing" | "Malware" | "Scam" | "Botnet" | "Suspicious" | "Spam";
  indicator: string;
  country: string;
  risk: number;
  status: "Blocked" | "Monitoring" | "Verified";
}

export const THREAT_FEED: ThreatFeedItem[] = [
  { time: "09:41:02", type: "Phishing", indicator: "acc0unt-verify-secure.xyz", country: "🇳🇱 NL", risk: 92, status: "Blocked" },
  { time: "09:40:47", type: "Malware", indicator: "d3a1...f9c2 (SHA-256)", country: "🇷🇺 RU", risk: 98, status: "Verified" },
  { time: "09:40:12", type: "Scam", indicator: "claim-your-airdrop-now.io", country: "🇻🇳 VN", risk: 81, status: "Monitoring" },
  { time: "09:39:58", type: "Botnet", indicator: "185.220.xxx.xxx", country: "🇩🇪 DE", risk: 88, status: "Blocked" },
  { time: "09:39:30", type: "Suspicious", indicator: "bit.ly/3xR9tPz", country: "🇺🇸 US", risk: 63, status: "Monitoring" },
  { time: "09:39:04", type: "Spam", indicator: "promo-blast-mailer.net", country: "🇮🇳 IN", risk: 44, status: "Monitoring" },
  { time: "09:38:41", type: "Phishing", indicator: "paypal-account-limited.com", country: "🇫🇷 FR", risk: 95, status: "Blocked" },
  { time: "09:38:15", type: "Malware", indicator: "free-crack-download.ru", country: "🇷🇺 RU", risk: 96, status: "Verified" },
];

export const TRENDING_THREATS = [
  { label: "Phishing", value: 38 },
  { label: "Malware", value: 26 },
  { label: "Scam", value: 18 },
  { label: "Botnet", value: 9 },
  { label: "Spam", value: 6 },
  { label: "Other", value: 3 },
];

export const DETECTION_TIMELINE = [
  { day: "Mon", detections: 320 },
  { day: "Tue", detections: 410 },
  { day: "Wed", detections: 380 },
  { day: "Thu", detections: 512 },
  { day: "Fri", detections: 470 },
  { day: "Sat", detections: 290 },
  { day: "Sun", detections: 335 },
];
