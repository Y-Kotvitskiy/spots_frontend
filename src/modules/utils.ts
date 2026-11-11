import type { AxiosError } from "axios";
import { EMAIL_PATTERN } from "./constants.ts";
import type { ErrorResponse } from "@/types";
import type { Dispatch, SetStateAction } from "react";

export function validateName(value: string) {
  if (!value) return "Name is required";
  if (value.length < 3) return "At least 3 characters";
}

export function validateEmail(value: string) {
  if (!value) return "Email is required";
  if (!EMAIL_PATTERN.test(value)) return "Email is not valid";
}

export function validatePassword(value: string) {
  if (!value) return "Password is required";
  if (value.length < 6) return "At least 6 characters";
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
