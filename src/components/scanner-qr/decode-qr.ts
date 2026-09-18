import jsQR from "jsqr";

export interface DecodeResult {
  value: string;
}

declare global {
  interface Window {
    BarcodeDetector?: new (options?: { formats: string[] }) => {
      detect(source: ImageBitmapSource): Promise<{ rawValue: string }[]>;
    };
  }
}

/**
 * Decodes a QR code entirely client-side — the image never leaves the
 * browser. Tries the native BarcodeDetector API first (faster, hardware-
 * accelerated where available); falls back to jsQR, the decoder this page
 * already shipped with, when BarcodeDetector is unsupported or finds
 * nothing.
 */
export async function decodeQrFromFile(file: File): Promise<DecodeResult | null> {
  const bitmap = await createImageBitmap(file);

  if (typeof window !== "undefined" && window.BarcodeDetector) {
    try {
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      const results = await detector.detect(bitmap);
      if (results[0]?.rawValue) return { value: results[0].rawValue };
    } catch {
      // fall through to jsQR
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const code = jsQR(imageData.data, imageData.width, imageData.height);
  return code ? { value: code.data } : null;
}
