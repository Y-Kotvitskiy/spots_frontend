export const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

export const BREAKPOINTS = {
  tablet: "640px",
  desktop: "1200px",
} as const;

export const OPENS_AT = "09:00";

export const CLOSES_AT = "18:00";

export const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB -> Bigger = Compress Image
export const PAGE_SIZE_OPTIONS = [6, 12, 24] as const; // Count Element on Page