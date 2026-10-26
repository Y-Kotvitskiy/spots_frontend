export interface Place {
  id: number;
  creator_id: number;
  name: string;
  description: string;
  category: string;
  tags: string[];
  address: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface CreatePlace {
  name: string;
  latitude: number;
  longitude: number;
}
