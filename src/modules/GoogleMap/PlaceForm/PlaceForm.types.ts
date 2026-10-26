export interface FormValues {
  name: string;
  category: string;
  tags: string[];
  address: string;
  description: string;
  location: string;
  photo: File | null;
}

export type FormPages = 1 | 2 | 3;

export const CATEGORIES = [
  "Cafe",
  "Restaurant",
  "Bar",
  "Bakery",
  "Street food",
  "Museum",
  "Park",
  "Shopping",
] as const;

export const TAGS = [
  "Wi-Fi",
  "Power outlets",
  "Outdoor seating",
  "Parking",
  "Restrooms",
  "Vegan options",
] as const;

export const INITIAL_VALUES: FormValues = {
  name: "",
  category: "",
  tags: [],
  address: "",
  description: "",
  location: "",
  photo: null,
};
