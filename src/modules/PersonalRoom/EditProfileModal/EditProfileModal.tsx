import React, { useState, useRef } from "react";
import styles from "./EditProfileModal.module.scss";
import Icon from "@/modules/shared/Icon";
import FormButton from "@/modules/AuthContainer/FormButton";
import Loader from "@/modules/shared/Loader";
import Placeholder from "@/modules/shared/Placeholder";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName?: string;
  currentAvatar?: string | null;
  onSave: (newName: string, avatarFile?: File) => Promise<void> | void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentName = "",
  currentAvatar,
  onSave,
}) => {

  // ==========================================
  // STATES & REFS
  // ==========================================

  const [isLoading, setIsLoading] = useState(false);
  const [isAvatarLoaded, setIsAvatarLoaded] = useState(false);
  const [error, setError] = useState<string>("");

  const [name, setName] = useState(currentName);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined | null>(
    currentAvatar
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // ==========================================
  // EFFECTS
  // ==========================================

  if (!isOpen) return null;

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleTriggerFileSelect = () => {
    fileInputRef.current?.click();
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError("");
      await onSave(name, selectedFile);
    } catch (err: unknown) {
      console.error("Failed to update profile:", err);

      const errorResponse = err as { response?: { data?: { message?: string } } };
      setError(errorResponse.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const profileNameForPattern = name.trim() || "User";

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        {/* Header Section */}

        <div className={styles.modal__header}>
          <h3 className={styles.modal__title}>Edit profile</h3>
          <button className={styles.modal__closeBtn} onClick={onClose} type="button">
            <Icon name="close" />
          </button>
        </div>

        {/* Form Section */}

        <form onSubmit={handleSubmit} className={styles.modal__form}>

          {/* Avatar Section */}

          <div className={styles.modal__avatarSection}>
            <div 
              className={styles.modal__avatarWrapper} 
              onClick={handleTriggerFileSelect}
              style={{ cursor: "pointer" }}
            >
              {/* Патерн-заглушка через спільний компонент Placeholder */}

              {(!avatarPreview || !isAvatarLoaded) && (
                <div className={styles.modal__patternPlaceholder}>
                  <Placeholder text={profileNameForPattern} rows={6} cols={6} />
                  {avatarPreview && (
                    <Loader className={styles.modal__avatarLoader} />
                  )}
                </div>
              )}

              {/* Реальна картинка аватара */}

              {avatarPreview && (
                <img
                  ref={imgRef}
                  src={avatarPreview}
                  alt="Profile avatar"
                  className={`${styles.modal__avatar} ${
                    isAvatarLoaded
                      ? styles.modal__avatarLoaded
                      : styles.modal__avatarHidden
                  }`}
                  onLoad={() => setIsAvatarLoaded(true)}
                />
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: "none" }}
            />

            <button 
              type="button" 
              className={styles.modal__changePhotoText}
              onClick={handleTriggerFileSelect}
            >
              Change photo
            </button>
          </div>

          {/* Name Field Section */}

          <div className={styles.modal__field}>
            <label className={styles.modal__label}>
              Name <span className={styles.modal__required}>*</span>
            </label>
            <div className={styles.modal__inputWrapper}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.modal__input}
                required
              />
              <span className={styles.modal__inputIcon}>
                <Icon name="eye" size={20} /> 
              </span>
            </div>
          </div>


          {error && <p className={styles.modal__error}>{error}</p>}

          {/* Submit Button */}

          <FormButton type="submit" text={isLoading ? "Saving..." : "Save changes"} />
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;