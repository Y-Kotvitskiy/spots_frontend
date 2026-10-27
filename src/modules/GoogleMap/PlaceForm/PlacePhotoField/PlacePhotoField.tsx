import { useRef, useState } from "react";
import styles from "./PlacePhotoField.module.scss";

export interface PlacePhotoFieldProps {
  label?: string;
  name: string;
  required?: boolean;
  onChange: (photo: File | null) => void;
  className?: string;
}

const PlacePhotoField: React.FC<PlacePhotoFieldProps> = ({
  label,
  name,
  required,
  onChange,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (file) {
      onChange(file);

      if (preview) {
        URL.revokeObjectURL(preview);
      }

      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
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
