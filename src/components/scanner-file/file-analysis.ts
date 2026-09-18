import { getExtension } from "@/components/scanner-file/file-validation";

const FILE_TYPE_LABEL: Record<string, string> = {
  ".pdf": "PDF document",
  ".docx": "Word document",
  ".zip": "ZIP archive",
  ".apk": "Android package",
  ".exe": "Windows executable",
  ".msi": "Windows installer",
  ".js": "JavaScript file",
};

export function fileTypeLabel(fileName: string): string {
  return FILE_TYPE_LABEL[getExtension(fileName)] ?? "Unknown file type";
}
