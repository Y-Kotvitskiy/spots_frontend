import { type FormValues } from "./PlaceForm.types";

export const validatePlaceForm = (values: FormValues) => {
  const errors: Partial<Record<keyof FormValues, string>> = {};

  if (!values.name.trim()) {
    errors.name = "Can't be empty";
  }
  if (!values.category) {
    errors.category = "Can't be empty";
  }
  if (!values.description.trim()) {
    errors.description = "Can't be empty";
  }

  return errors;
};
