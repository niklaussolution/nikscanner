const AVATAR_SIZE = 128;
const MAX_INPUT_BYTES = 10 * 1024 * 1024;
/** Must stay under the backend's AVATAR_MAX_LENGTH (48 KB) for POST /api/user/avatar. */
const MAX_OUTPUT_LENGTH = 46 * 1024;

/** Center-crops an image file to a square and downsizes it to 128x128, returning a small data
 *  URL (WebP where the browser can encode it, JPEG otherwise) ready for POST /api/user/avatar. */
export async function fileToAvatarDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    throw new Error("Please choose a JPG, PNG or WebP image.");
  }
  if (file.size > MAX_INPUT_BYTES) throw new Error("Image is too large (max 10 MB).");

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("This image format isn't supported. Try a JPG, PNG or WebP.");
  }

  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process the image.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    AVATAR_SIZE,
    AVATAR_SIZE,
  );
  bitmap.close();

  let dataUrl = canvas.toDataURL("image/webp", 0.85);
  if (!dataUrl.startsWith("data:image/webp")) dataUrl = canvas.toDataURL("image/jpeg", 0.85);
  if (dataUrl.length > MAX_OUTPUT_LENGTH) dataUrl = canvas.toDataURL("image/jpeg", 0.6);
  if (dataUrl.length > MAX_OUTPUT_LENGTH) throw new Error("Could not compress the image enough. Try another one.");
  return dataUrl;
}
