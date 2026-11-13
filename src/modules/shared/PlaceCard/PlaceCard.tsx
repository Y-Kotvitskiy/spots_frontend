import React, { useEffect, useRef, useState } from "react";
import styles from "./PlaceCard.module.scss";
import Icon from "@/modules/shared/Icon";
import Loader from "@/modules/shared/Loader";
import Placeholder from "../Placeholder";

// ==========================================
// TYPES & INTERFACES
// ==========================================

interface PlaceCardProps {
  image?: string;
  title: string;
  category: string;
  workingHours?: string;
  isShared?: boolean | number | string;
  addedBy?: string;
  deleteButtonText?: string;
  onEdit?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
}

// ==========================================
// COMPONENT
// ==========================================

const PlaceCard: React.FC<PlaceCardProps> = ({
  image,
  title,
  category,
  workingHours = "08:00 20:00",
  isShared,
  addedBy,
  deleteButtonText = "Delete place",
  onEdit,
  onShare,
  onDelete,
  onClick,
}) => {

  // ==========================================
  // STATE & REFS
  // ==========================================
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const formattedHours = React.useMemo(() => {
    if (!workingHours) return "";
    const [start, end] = workingHours.trim().split(/\s+/);
    return end ? `${start} - ${end}` : workingHours;
  }, [workingHours]);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setIsImageLoaded(true);
    }
  }, [image]);

  // ==========================================
  // HELPERS
  // ==========================================

const hasActions = onEdit || onShare || onDelete;

  const renderShareStatus = () => {
    if (typeof isShared === "string") return isShared;
    if (typeof isShared === "number") {
      if (isShared === 0) return "Not shared";
      if (isShared === 1) return "Shared in 1 group";
      return `Shared in ${isShared} groups`;
    }
    return isShared ? "Shared in groups" : "Not shared";
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className={styles.placeCard} onClick={onClick}>
      <div className={styles.placeCard__imageWrapper}>
        {(!image || !isImageLoaded) && (
          <div className={styles.placeCard__placeholderContainer}>
            <Placeholder text={title} rows={12} cols={8} />
            {image && <Loader className={styles.placeCard__loaderOverlay} />}
          </div>
        )}

        {/* Картинка */}
        {image && (
          <img
            key={image}
            ref={imgRef}
            src={image}
            alt={title}
            className={`${styles.placeCard__image} ${
              isImageLoaded ? styles.placeCard__imageLoaded : styles.placeCard__imageHidden
            }`}
            onLoad={() => setIsImageLoaded(true)}
          />
        )}
        
        {hasActions && (
          <div className={styles.placeCard__menuContainer} ref={menuRef}>
            <button 
              type="button" 
              className={styles.placeCard__menuBtn} 
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen((prev) => !prev);
              }}
              aria-label="More options"
            >
              <Icon name="menu" size={20} />
            </button>

            {isMenuOpen && (
              <div className={styles.placeCard__dropdown}>
                {onEdit && (
                  <button 
                    type="button" 
                    className={styles.placeCard__dropdownItem}
                    onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onEdit(); }}
                  >
                    Edit place
                  </button>
                )}
                {onShare && (
                  <button 
                    type="button" 
                    className={styles.placeCard__dropdownItem}
                    onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onShare(); }}
                  >
                    Share with group
                  </button>
                )}
                {onDelete && (
                  <button 
                    type="button" 
                    className={styles.placeCard__dropdownItemDanger}
                    onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onDelete(); }}
                  >
                    {deleteButtonText}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.placeCard__content}>
        <h3 className={styles.placeCard__title}>{title}</h3>
        
        <div className={styles.placeCard__info}>
          <span>{category}</span>
          {workingHours !== "none" &&
            <>
              <span className={styles.placeCard__separator}>•</span>
              <span className={styles.placeCard__hours}>{formattedHours}</span>
            </>
          }
        </div>

        {addedBy ? (
          <span className={styles.addedByTag}>Added by {addedBy}</span>
        ) : (
          isShared !== undefined && (
            <div className={styles.placeCard__statusWrapper}>
              <span className={isShared ? styles.placeCard__shared : styles.placeCard__notShared}>
                {renderShareStatus()}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default PlaceCard;