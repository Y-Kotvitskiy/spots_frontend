import heic2any from "heic2any";
import type { AxiosError } from "axios";
import { EMAIL_PATTERN, MAX_FILE_SIZE_BYTES } from "./constants.ts";
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
  const regexOneLetter = /[a-zA-Z]/;
  const regexOneNumber = /[0-9]/;
  const regexSpaces = /\s/;

  if (!value) return "Password is required";

  if (value.length < 6) return "At least 6 characters";

  if (!regexOneLetter.test(value))
    return "Password must contain at least one letter";

  if (!regexOneNumber.test(value))
    return "Password must contain at least one number";

  if (regexSpaces.test(value)) return "Password can't contain spaces";

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

const isHeicFile = (file: File): boolean => {
  const lowerName = file.name.toLowerCase();
  return (
    lowerName.endsWith(".heic") ||
    lowerName.endsWith(".heif") ||
    file.type === "image/heic" ||
    file.type === "image/heif"
  );
};

const loadImageElement = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };

    img.src = objectUrl;
  });
};

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to compress image via canvas"));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality
    );
  });
};

const encodeCanvasToMaxSize = async (
  source: HTMLImageElement,
  fileName: string,
  maxBytes: number,
  initialQuality = 0.8,
): Promise<File> => {
  const targetMime = "image/jpeg";
  const origWidth = source.naturalWidth || source.width;
  const origHeight = source.naturalHeight || source.height;

  const maxInitialDim = 2560;
  let scale = Math.min(1, maxInitialDim / Math.max(origWidth, origHeight));

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context is not available");
  }

  for (let pass = 0; pass < 7; pass++) {
    if (pass > 0) {
      scale *= 0.7;
    }

    canvas.width = Math.max(1, Math.round(origWidth * scale));
    canvas.height = Math.max(1, Math.round(origHeight * scale));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);

    const qualities =
      pass === 0 && initialQuality !== 0.85
        ? [initialQuality, 0.72, 0.58, 0.45, 0.3]
        : [0.85, 0.72, 0.58, 0.45, 0.3];

    for (const quality of qualities) {
      const blob = await canvasToBlob(canvas, targetMime, quality);
      if (blob.size <= maxBytes) {
        const nextName = fileName.replace(/\.[^.]+$/, ".jpg");
        return new File([blob], nextName, { type: targetMime });
      }
    }
  }

  const maxMb = (maxBytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, "");
  throw new Error(`Unable to compress image below ${maxMb} MB`);
};

const compressImageToMaxSize = async (
  file: File,
  maxBytes = MAX_FILE_SIZE_BYTES,
): Promise<File> => {
  if (file.size <= maxBytes) {
    return file;
  }

  const img = await loadImageElement(file);
  return encodeCanvasToMaxSize(img, file.name, maxBytes, 0.85);
};

export const normalizePhotoFile = async (
  file: File,
  maxBytes = MAX_FILE_SIZE_BYTES,
): Promise<File> => {
  let workingFile = file;
  let wasConvertedFromHeic = false;

  if (isHeicFile(workingFile)) {
    try {
      const converted = await heic2any({
        blob: workingFile,
        toType: "image/jpeg",
        quality: 0.85,
      });

      const blob = Array.isArray(converted) ? converted[0] : converted;
      if (!blob || blob.size === 0) {
        throw new Error("Empty blob returned from heic2any");
      }

      const jpgName = workingFile.name.replace(/\.(heic|heif)$/i, ".jpg");
      workingFile = new File([blob], jpgName, { type: "image/jpeg" });
      wasConvertedFromHeic = true;
    } catch (heicErr) {
      console.error("[normalizePhotoFile] heic2any failed:", {
        name: file.name,
        size: file.size,
        heicErr,
      });
      throw new Error(
        "This HEIC image couldn't be converted in the browser. Please convert it to JPG/PNG and try again.",
        { cause: heicErr },
      );
    }
  }

  if (wasConvertedFromHeic) {
    const img = await loadImageElement(workingFile);
    return encodeCanvasToMaxSize(img, workingFile.name, maxBytes, 0.8);
  }

  if (workingFile.size > maxBytes) {
    workingFile = await compressImageToMaxSize(workingFile, maxBytes);
  }

  return workingFile;
};