import { httpClient } from "../http/httpClient";
type Dictionary = "categories" | "tags";

export const taxonomyService = {
  getAll: (dictionary: Dictionary): Promise<Record<string, string>> =>
    httpClient.get(`/taxonomy/${dictionary}`),
};
