export const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

export const BREAKPOINTS = {
  tablet: "640px",
  desktop: "1200px",
} as const;

export const OPENS_AT = "09:00";

export const CLOSES_AT = "18:00";

export const COLORS = {
  park: "#239616",
  shopping: "#de4fb7",
  streetFood: "#e86710",
  museum: "#1976D2",
  cafe: "#885200",
  restaurant: "#e62d2d",
  bar: "#9f0fe2",
  bakery: "#f0c843",
  grey90: "#292221",
} as const;

export const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB -> Bigger = Compress Image