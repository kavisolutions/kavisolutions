/* Minimal magic-byte checks for uploaded files. Multipart MIME type and
   filename are client-controlled, so they must never be trusted on their own. */

const startsWith = (buffer: Buffer, bytes: number[]): boolean =>
  bytes.every((byte, index) => buffer[index] === byte);

export type SniffedType = "image/jpeg" | "image/png" | "image/webp" | "image/gif" | "application/pdf";

const MIME_TO_EXT: Record<SniffedType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
};

export const fileExtensionFor = (mime: SniffedType): string => MIME_TO_EXT[mime];

export const sniffFileType = (buffer: Buffer): SniffedType | null => {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return null;

  if (startsWith(buffer, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (startsWith(buffer, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) || startsWith(buffer, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])) {
    return "image/gif";
  }
  if (
    startsWith(buffer, [0x52, 0x49, 0x46, 0x46]) &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  if (startsWith(buffer, [0x25, 0x50, 0x44, 0x46, 0x2d])) return "application/pdf";

  return null;
};
