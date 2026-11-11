import React from "react";
import styles from "./ConfirmForm.module.scss";
import Icon from "@/modules/shared/Icon";
import FormButton from "../Button";

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
            <Icon name="close" />
          </button>
        </div>

        <div className={styles.modal__confirmContainer}>
          <div className={styles.modal__confirmTextWrapper}>
            <p className={styles.modal__confirmText}>{message}</p>
          </div>

          <div className={styles.modal__confirmActions}>

            <FormButton
              type="button"
              text={cancelText}
              variant="grey"
              onClick={onClose}
            />

            <FormButton
              type="button"
              text={confirmText}
              variant={confirmVariant === "danger" ? "danger" : "default"}
              onClick={() => {
                onConfirm();
                onClose();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmForm;