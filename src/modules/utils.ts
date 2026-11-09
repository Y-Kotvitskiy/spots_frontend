import type { AxiosError } from "axios";
import { EMAIL_PATTERN } from "./constants.ts";
import type { ErrorResponse } from "@/types";
import type { Dispatch, SetStateAction } from "react";

export function validateName(value: string) {
  const regexSpecialSymbols = /^[a-zA-Z0-9\s]+$/;
  const regexOneLetter = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s]+$/;

  if (!value) return "Can`t be empty";
  if (value.length < 2) return "At least 2 characters";
  if (value.length > 20) return "Maximum 20 characters";
  if (!regexSpecialSymbols.test(value))
    return "Name can't contain any special symbols";
  if (!regexOneLetter.test(value))
    return "Name must contain at least one letter";
}

export function validateEmail(value: string) {
  if (!value) return "Email is required";
  if (value.length > 254) return "Email can't be longer than 254 characters";
  if (!EMAIL_PATTERN.test(value)) return "Email is not valid";
}

export function validatePassword(value: string) {
  const regexOneLetter = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s]+$/;
  const regexOneNumber = /^(?=.*\d)[a-zA-Z0-9\s]+$/;
  const regexSpaces = /^(?=.*\d)[a-zA-Z0-9]+$/;

  if (!value) return "Password is required";
  if (value.length < 6) return "At least 6 characters";
  if (!regexOneLetter.test(value))
    return "Password must contain at least one letter";
  if (!regexOneNumber.test(value))
    return "Password must contain at least one number";
  if (!regexSpaces.test(value)) return "Password can't contain spaces";
  if (value.length < 8 || value.length > 100)
    return "Password must be 8-100 characters long";
}

export type LoginErrors = AxiosError<ErrorResponse>;

export function setErrorMessages(
  error: LoginErrors,
  setFieldError: (field: string, message: string | undefined) => void,
  setError: Dispatch<SetStateAction<string>>,
) {
  if (!error.response?.data) return;
  const errorResponse = error.response.data;
  const errors = { email: "", password: "" };

  if (typeof errorResponse.detail === "string") {
    setError(errorResponse.detail ?? "");
  } else {
    errorResponse.detail.forEach((errorDetail) => {
      for (const fieldName in errors) {
        if (errorDetail.loc.includes(fieldName)) {
          setFieldError(fieldName, errorDetail.msg);
        }
      }
    });
  }
}
