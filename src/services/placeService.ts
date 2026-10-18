import { httpClient } from "../http/httpClient";
import type { CreatePlace, Place } from "../types";

export const placeService = {
  getAll: (): Promise<Place[]> => httpClient.get("/places"),
  create: (place: CreatePlace): Promise<Place> =>
    httpClient.post("/places", place),
};
