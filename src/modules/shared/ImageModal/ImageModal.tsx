import React, { useEffect, useState, useRef, useCallback } from "react";
import styles from "./ImageModal.module.scss";
import Icon from "@/modules/shared/Icon";
import Loader from "@/modules/shared/Loader";
import Placeholder from "../Placeholder";
import { createPortal } from "react-dom";

interface ImageModalProps {
  isOpen: boolean;
  images: { id?: string | number; url: string; alt?: string }[];
  initialIndex?: number;
  onClose: () => void;
  placeName?: string;
}

const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  images,
  initialIndex = 0,
  onClose,
  placeName = "Place",
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setIsLoaded(true);
    }
  }, [currentIndex]);

  const changeImage = useCallback((newIndex: number) => {
    if (newIndex === currentIndex || isFading) return;
    setIsFading(true);

    setTimeout(() => {
      setCurrentIndex(newIndex);
      setIsLoaded(false);
      setIsFading(false);
    }, 200);
  }, [currentIndex, isFading]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    const nextIdx = (currentIndex + 1) % images.length;
    changeImage(nextIdx);
  }, [currentIndex, images.length, changeImage]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    const prevIdx = (currentIndex - 1 + images.length) % images.length;
    changeImage(prevIdx);
  }, [currentIndex, images.length, changeImage]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen || images.length === 0) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  const currentPhoto = images[currentIndex];
  const hasMultiple = images.length > 1;

  return createPortal(
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {hasMultiple && (
          <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={handlePrev} aria-label="Previous photo">
            <Icon name="right" size={24} className={`${styles.iconNavigation} ${styles.rotateLeft}`} />
          </button>
        )}

        <div 
          className={styles.imageContainer}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            <Icon name="close" size={24} className={styles.iconNavigation} />
          </button>

          {(!currentPhoto?.url || !isLoaded) && (
            <div className={styles.placeholderWrapper}>
              <Placeholder text={placeName} />
              {currentPhoto?.url && <Loader className={styles.loader} />}
            </div>
          )}

          {currentPhoto?.url && (
            <img
              key={currentPhoto.url}
              ref={imgRef}
              src={currentPhoto.url}
              alt={currentPhoto.alt || placeName}
              className={`${styles.image} ${
                isLoaded && !isFading ? styles.imageLoaded : styles.imageHidden
              }`}
              onLoad={() => setIsLoaded(true)}
            />
          )}
        </div>

        {hasMultiple && (
          <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={handleNext} aria-label="Next photo">
            <Icon name="right" size={24} className={styles.iconNavigation} />
          </button>
        )}

        {hasMultiple && (
          <div className={styles.footerContainer}>
            <div className={styles.counter}>
              {currentIndex + 1} / {images.length}
            </div>
            <span className={styles.swipeHint}>Swipe left or right to browse</span>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ImageModal;