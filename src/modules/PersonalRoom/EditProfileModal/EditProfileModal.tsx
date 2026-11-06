import React, { useState, useRef } from "react";
import styles from "./EditProfileModal.module.scss";
import Icon from "@/modules/shared/Icon";
import FormButton from "@/modules/AuthContainer/FormButton";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName?: string;
  currentAvatar?: string;
  onSave: (newName: string, newAvatarBase64?: string) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentName = "",
  currentAvatar,
  onSave,
}) => {
  const [name, setName] = useState(currentName);
  const [avatarBase64, setAvatarBase64] = useState<string | undefined>(undefined);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(currentAvatar);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatarBase64(base64String);
        setAvatarPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTriggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name, avatarBase64);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modal__header}>
          <h3 className={styles.modal__title}>Edit profile</h3>
          <button className={styles.modal__closeBtn} onClick={onClose} type="button">
            <Icon name="close" size={20} />
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
                src={avatarPreview || "https://images.unsplash.com/photo-1534528741775-53994a69daeb"}
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

          <FormButton type="submit" text="Save changes" />
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;