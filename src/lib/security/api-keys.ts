import { randomBytes, createHash } from "node:crypto";

export interface ApiKeyRecord {
  id: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  createdAt: string;
  lastUsedAt: string | null;
  requestCount: number;
  revoked: boolean;
}

/** In-memory store for local development — production stores keyHash in Postgres via the ApiKey Prisma model. */
const store: ApiKeyRecord[] = [];

export function hashApiKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

export function generateApiKey(name: string): { record: ApiKeyRecord; rawKey: string } {
  const secret = randomBytes(24).toString("base64url");
  const rawKey = `nsk_live_${secret}`;
  const record: ApiKeyRecord = {
    id: randomBytes(8).toString("hex"),
    name,
    keyPrefix: rawKey.slice(0, 12),
    keyHash: hashApiKey(rawKey),
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
    requestCount: 0,
    revoked: false,
  };
  store.push(record);
  return { record, rawKey };
}

export function listApiKeys(): ApiKeyRecord[] {
  return [...store].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function revokeApiKey(id: string): boolean {
  const record = store.find((k) => k.id === id);
  if (!record) return false;
  record.revoked = true;
  return true;
}

export function renameApiKey(id: string, name: string): boolean {
  const record = store.find((k) => k.id === id);
  if (!record) return false;
  record.name = name;
  return true;
}
