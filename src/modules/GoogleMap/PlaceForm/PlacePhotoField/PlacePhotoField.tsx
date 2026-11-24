import { useEffect, useRef, useState } from "react";
import styles from "./PlacePhotoField.module.scss";
import heic2any from "heic2any";

export interface PlacePhotoFieldProps {
  label?: string;
  name: string;
  required?: boolean;
  onChange: (photo: File | null) => void;
  className?: string;
}

const isHeicFile = (file: File): boolean => {
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return (
    mime === "image/heic" ||
    mime === "image/heif" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
};

const PlacePhotoField: React.FC<PlacePhotoFieldProps> = ({
  label,
  name,
  required,
  onChange,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Прибираємо витік пам'яті при розмонтуванні компонента
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    onChange(file);

    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }

    if (isHeicFile(file)) {
      setIsConverting(true);
      try {
        const converted = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.85,
        });

        const jpegBlob = Array.isArray(converted) ? converted[0] : converted;
        const objectUrl = URL.createObjectURL(jpegBlob);
        setPreview(objectUrl);
      } catch (error) {
        console.error("Помилка конвертації HEIC:", error);
        // Якщо браузер усе ж підтримує HEIC нативно (наприклад, Safari)
        setPreview(URL.createObjectURL(file));
      } finally {
        setIsConverting(false);
      }
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
  };
  const handleFileClear = () => {
    onChange(null);
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(null);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.PlacePhotoField}>
      {label && (
        <label htmlFor={name} className={styles.PlacePhotoField__label}>
          {label}
          {required && (
            <span className={styles.PlacePhotoField__required}> *</span>
          )}
        </label>
      )}
      <div className={styles.PlacePhotoField__valueContainer}>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        {preview ? (
          <div className={styles.PlacePhotoField__photoContainer}>
            <>
              <button
                type="button"
                onClick={handleFileClear}
                className={styles.PlacePhotoField__clearButton}
              ></button>

              <img
                src={preview}
                alt="Preview"
                className={styles.PlacePhotoField__img}
              />
            </>
          </div>
        ) : isConverting ? (
          <div className={styles.PlacePhotoField__loadMessage}>
            Конвертація HEIC...
          </div>
        ) : (
          <button
            type="button"
            onClick={handleButtonClick}
            className={styles.PlacePhotoField__loadButton}
          ></button>
        )}
      </div>
    </div>
  );
};

export default PlacePhotoField;
