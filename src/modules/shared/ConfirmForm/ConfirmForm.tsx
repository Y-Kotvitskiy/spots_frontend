import React from "react";
import styles from "./ConfirmForm.module.scss";
import Icon from "@/modules/shared/Icon";

interface ConfirmFormProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "danger" | "primary";
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmForm: React.FC<ConfirmFormProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "danger",
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modal__header}>
          <h3 className={styles.modal__title}>{title}</h3>
          <button
            className={styles.modal__closeBtn}
            onClick={onClose}
            type="button"
            aria-label="Close modal"
          >
            <Icon name="close" size={24} />
          </button>
        </div>

        <div className={styles.modal__confirmContainer}>
          <div className={styles.modal__confirmTextWrapper}>
            <p className={styles.modal__confirmText}>{message}</p>
          </div>

          <div className={styles.modal__confirmActions}>
            <button
              type="button"
              className={styles.modal__cancelBtn}
              onClick={onClose}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className={
                confirmVariant === "danger"
                  ? styles.modal__deleteBtn
                  : styles.modal__primaryBtn
              }
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmForm;