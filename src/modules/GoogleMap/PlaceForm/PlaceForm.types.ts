import type { TagKey } from "@/types";

export interface FormValues {
  name: string;
  category: string | null;
  tags: TagKey[];
  address: string;
  description: string;
  location: string;
  photo: File | null;
  opens_at: string;
  closes_at: string;
}

export type FormPages = 1 | 2 | 3 | 4;

export const INITIAL_VALUES: FormValues = {
  name: "",
  category: null,
  tags: [],
  address: "",
  description: "",
  location: "",
  photo: null,
  opens_at: "09:00",
  closes_at: "18:00",
};
