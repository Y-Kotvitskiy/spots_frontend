export interface Place {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  createAt: string;
}

export interface CreatePlace {
  name: string;
  latitude: number;
  longitude: number;
}
