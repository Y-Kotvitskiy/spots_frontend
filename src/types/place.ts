export interface OpeningHours {
  opens_at: string;
  closes_at: string;
}

export interface BackendPhoto {
  id: string;
  user_id?: string;
  place_id?: string;
  name?: string;
  content_type?: string;
  position: number;
  created_at?: string;
  url: string;
}

export interface BackendPlace {
  id: string;
  creator_id: string;
  creator_name?: string;
  name: string;
  description: string;
  categories: BackendCategory[];
  tags: BackendTag[];
  address: string;
  latitude: number;
  longitude: number;
  opening_hours?: OpeningHours | null;
  photos?: BackendPhoto[];
  created_at: string;
  updated_at?: string;
  url?: string;
}

export interface Place {
  id: string;
  creator_id: string;
  creator_name?: string;
  name: string;
  description: string;
  categoryId: string;
  category: string;
  tags: TagKey[];
  address: string;
  latitude: number;
  longitude: number;
  opening_hours?: OpeningHours | null;
  photos?: PlacePhotos;
  created_at: string;
}

export interface UpdatePlace {
  name?: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  opening_hours?: OpeningHours;
  category_ids?: string[];
  tags?: string[];
}

export type PlacePhotos = Record<number, BackendPhoto>;

export type BackendCategory = { id: string; name: string };
export type BackendTag = { id: string; name: string };

export interface BackendPlace {
  id: string;
  creator_id: string;
  name: string;
  description: string;
  categories: BackendCategory[];
  tags: BackendTag[];
  address: string;
  latitude: number;
  longitude: number;
  photos?: BackendPhoto[];
  created_at: string;
}

export interface BackendPhoto {
  id: string;
  url: string;
  position: number;
}

export interface CreatePlace {
  name: string;
  description: string;
  category_ids: string[];
  tags: string[];
  address: string;
  latitude: number;
  longitude: number;
}

export enum Category {
  cafe = "Cafe",
  restaurant = "Restaurant",
  bar = "Bar",
  bakery = "Bakery",
  street_food = "Street food",
  museum = "Museum",
  park = "Park",
  shopping = "Shopping",
}

export type CategoryKey = keyof typeof Category;

export enum Tag {
  wi_fi = "Wi-Fi",
  power_outlets = "Power outlets",
  outdoor_seating = "Outdoor seating",
  parking = "Parking",
  restrooms = "Restrooms",
  vegan_options = "Vegan options",
}

export type TagKey = keyof typeof Tag;
