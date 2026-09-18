export type FileScanState =
  | "idle"
  | "dragging"
  | "selected"
  | "hashing"
  | "uploading"
  | "scanning"
  | "complete"
  | "error";

export const FILE_STAGES = ["Upload", "Hash", "Signatures", "Behavior", "Verdict"] as const;
