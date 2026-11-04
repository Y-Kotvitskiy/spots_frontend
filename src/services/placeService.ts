import { httpClient } from "../http/httpClient";
import type { BackendPhoto, BackendPlace, CreatePlace } from "../types";

export const placeService = {
  getAll: (): Promise<BackendPlace[]> => httpClient.get("/places"),
  create: (place: CreatePlace): Promise<BackendPlace> =>
    httpClient.post("/places", place),
  addPhoto: (placeId: string, photo: File): Promise<BackendPhoto> => {
    const formData = new FormData();
    formData.append("file", photo);

    return httpClient.post(`/places/${placeId}/photos`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
