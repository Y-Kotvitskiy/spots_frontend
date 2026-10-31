import React, { useState, useRef } from "react";
import styles from "./EditProfileModal.module.scss";
import Icon from "@/modules/shared/Icon";
import FormButton from "@/modules/AuthContainer/FormButton";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName?: string;
  currentAvatar?: string;
  onSave: (newName: string, newAvatar?: File) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentName = "",
  currentAvatar,
  onSave,
}) => {
  const [name, setName] = useState(currentName);
  const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(currentAvatar);

  // Реф для прихованого файлового інпуту
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Обробник вибору файлу
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // Створюємо локальний URL для миттєвого прев'ю картинки
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Клік по кнопці або аватарці відкриває діалог вибору файлу
  const handleTriggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name, avatarFile);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Шапка модалки */}
        <div className={styles.modal__header}>
          <h3 className={styles.modal__title}>Edit profile</h3>
          <button className={styles.modal__closeBtn} onClick={onClose} type="button">
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className={styles.modal__form}>
          {/* Блок аватарки */}
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

            {/* Прихований інпут для завантаження файлу */}
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

          {/* Поле введення імені */}
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

          {/* Використовуємо універсальний компонент кнопки */}
          <FormButton type="submit" text="Save changes" />
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;