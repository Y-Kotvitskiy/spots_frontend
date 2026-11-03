import { httpClient } from "../http/httpClient";
import type { BackendPlace, CreatePlace } from "../types";

export const placeService = {
  getAll: (): Promise<BackendPlace[]> => httpClient.get("/places"),
  create: (place: CreatePlace): Promise<BackendPlace> =>
    httpClient.post("/places", place),
};
