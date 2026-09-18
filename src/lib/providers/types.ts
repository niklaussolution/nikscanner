import type { EngineResult, ScanTargetType } from "@/types/scan";

export interface ProviderInput {
  targetType: ScanTargetType;
  target: string;
  hostname?: string;
}

/**
 * Common interface every threat-intelligence provider implements.
 * Providers normalize third-party responses into a single EngineResult
 * shape so the risk engine never has to know about provider-specific
 * payloads.
 */
export interface ScanProvider {
  id: string;
  name: string;
  /** Whether this provider is configured (has an API key) in this environment. */
  isConfigured(): boolean;
  supports(targetType: ScanTargetType): boolean;
  run(input: ProviderInput): Promise<EngineResult>;
}
