import styles from "./PlaceShareModal.module.scss";

import { createPortal } from "react-dom";
import { useState } from "react";
import Button from "@/modules/shared/Button/";

export function PlaceShareModal({ isOpen, onClose, PlaceId }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareLink = `${window.location.origin}/map/${PlaceId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 3000);
    } catch (err) {
      console.error("Не удалось скопировать текст: ", err);
    }
  };

  return createPortal(
    <div className={styles.PlaceShareModal__overlay} onClick={onClose}>
      <div
        className={styles.PlaceShareModal__content}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.PlaceShareModal__header}>
          <h2>Share Place</h2>
          <button
            className={styles.PlaceShareModal__closeBtn}
            onClick={onClose}
          >
            ×
          </button>
        </header>

        {copied ? (
          <p className={styles.PlaceShareModal__message}>
            Link copied to clipboard
          </p>
        ) : (
          <input
            className={styles.PlaceShareModal__input}
            value={shareLink}
            readOnly
          />
        )}

        <Button onClick={handleCopy} text={copied ? "Great" : "Copy"} />
      </div>
    </div>,
    document.body,
  );
}

export default PlaceShareModal;
