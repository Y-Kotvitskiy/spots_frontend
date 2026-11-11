import React, { useState, useRef, useEffect } from "react";
import styles from "./EditProfileModal.module.scss";
import Icon from "@/modules/shared/Icon";
import FormButton from "@/modules/AuthContainer/FormButton";

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
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState(currentName);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined | null>(
    currentAvatar
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Синхронізуємо локальний стейт при відкритті або зміні пропсів
  useEffect(() => {
    setName(currentName);
    setAvatarPreview(currentAvatar);
    setSelectedFile(undefined);
  }, [currentName, currentAvatar, isOpen]);

  if (!isOpen) return null;

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
      await onSave(name, selectedFile);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modal__header}>
          <h3 className={styles.modal__title}>Edit profile</h3>
          <button className={styles.modal__closeBtn} onClick={onClose} type="button">
            <Icon name="close" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modal__form}>
          <div className={styles.modal__avatarSection}>
            <div 
              className={styles.modal__avatarWrapper} 
              onClick={handleTriggerFileSelect}
              style={{ cursor: "pointer" }}
            >
              <img
                src={
                  avatarPreview ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
                }
                alt="Profile avatar"
                className={styles.modal__avatar}
              />
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

          <FormButton type="submit" text={isLoading ? "Saving..." : "Save changes"} />
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;