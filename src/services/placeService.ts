import { httpClient } from "../http/httpClient";
import type {
  BackendPhoto,
  BackendPlace,
  CreatePlace,
  UpdatePlace,
} from "../types";

export const placeService = {
  getAll: (): Promise<BackendPlace[]> => httpClient.get("/places"),

  getMyPlaces: (): Promise<BackendPlace[]> => httpClient.get("/places/me"),

  getById: (placeId: string): Promise<BackendPlace> =>
    httpClient.get(`/places/${placeId}`),

  create: (place: CreatePlace): Promise<BackendPlace> =>
    httpClient.post("/places", place),

  delete: (placeId: string): Promise<void> =>
    httpClient.delete(`/places/${placeId}`),

  addPhoto: (placeId: string, photo: File): Promise<BackendPhoto> => {
    const formData = new FormData();
    formData.append("file", photo);

    return httpClient.post(`/places/${placeId}/photos`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  update: (placeId: string, data: UpdatePlace): Promise<BackendPlace> =>
    httpClient.patch(`/places/${placeId}`, data),

  getPhotos: (placeId: string): Promise<BackendPhoto[]> =>
    httpClient.get(`/places/${placeId}/photos`),

  deletePhoto: (placeId: string, photoId: string): Promise<void> =>
    httpClient.delete(`/places/${placeId}/photos/${photoId}`),
};
