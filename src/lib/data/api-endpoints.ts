export const API_ENDPOINTS = [
  { method: "POST", path: "/api/v1/scan/url", desc: "Submit a URL for analysis" },
  { method: "POST", path: "/api/v1/scan/file", desc: "Submit a file for analysis" },
  { method: "GET", path: "/api/v1/report/:id", desc: "Retrieve a scan report by ID" },
  { method: "POST", path: "/api/v1/report/url", desc: "Submit a community threat report" },
  { method: "GET", path: "/api/v1/intelligence/domain/:domain", desc: "Domain threat intelligence" },
  { method: "GET", path: "/api/v1/intelligence/ip/:ip", desc: "IP threat intelligence" },
] as const;

export const CODE_SAMPLES = {
  curl: `curl -X POST https://api.nikscanner.com/v1/scan/url \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com"}'`,
  javascript: `const res = await fetch("https://api.nikscanner.com/v1/scan/url", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.NIKSCANNER_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ url: "https://example.com" }),
});
const result = await res.json();`,
  node: `import { NikScanner } from "@nikscanner/sdk";

const client = new NikScanner(process.env.NIKSCANNER_API_KEY);
const result = await client.scan({ url: "https://example.com" });

if (result.malicious) {
  await client.block(result.url);
}`,
  python: `import requests

res = requests.post(
    "https://api.nikscanner.com/v1/scan/url",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={"url": "https://example.com"},
)
result = res.json()`,
} as const;
