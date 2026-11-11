import type { TagKey } from "@/types";

export interface FormValues {
  name: string;
  category: string | null;
  tags: TagKey[];
  address: string;
  description: string;
  location: string;
  photo: File | null;
}

export type FormPages = 1 | 2 | 3;

export const INITIAL_VALUES: FormValues = {
  name: "",
  category: null,
  tags: [],
  address: "",
  description: "",
  location: "",
  photo: null,
};
