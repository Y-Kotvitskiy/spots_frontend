export interface Place {
  id: number;
  creator_id: number;
  name: string;
  description: string;
  category: CategoryKey;
  tags: TagKey[];
  address: string;
  latitude: number;
  longitude: number;
  photo?: string;
  created_at: string;
}

export interface CreatePlace {
  name: string;
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
export type TagKey = keyof typeof Tag;

export enum Tag {
  wi_fi = "Wi-Fi",
  power_outlets = "Power outlets",
  outdoor_seating = "Outdoor seating",
  parking = "Parking",
  restrooms = "Restrooms",
  vegan_options = "Vegan options",
}
