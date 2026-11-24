import heic2any from "heic2any";

const isHeicFile = (file: File): boolean => {
  const lowerName = file.name.toLowerCase();
  return (
    lowerName.endsWith(".heic") ||
    lowerName.endsWith(".heif") ||
    file.type === "image/heic" ||
    file.type === "image/heif"
  );
};

export const normalizePhotoFile = async (
  file: File,
  quality = 0.85
): Promise<File> => {
  if (!isHeicFile(file)) {
    return file;
  }

  const converted = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality,
  });

  const blob = Array.isArray(converted) ? converted[0] : converted;
  const jpgName = file.name.replace(/\.(heic|heif)$/i, ".jpg");

  return new File([blob], jpgName, { type: "image/jpeg" });
};