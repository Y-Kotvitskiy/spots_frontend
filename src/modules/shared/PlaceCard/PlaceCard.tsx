import { useEffect, useRef, useState } from "react";
import styles from "./PlaceCard.module.scss";
import Loader from "@/modules/shared/Loader";
import Placeholder from "../Placeholder";
import Icon, { type IconName } from "../Icon/Icon";

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

// Назва категорії збігається з назвою іконки та з ключем кольору в SCSS
const CATEGORY_ICONS = [
  "park", "shopping", "street_food", "museum",
  "cafe", "restaurant", "bar", "bakery",
] as const satisfies readonly IconName[];

type Category = (typeof CATEGORY_ICONS)[number];

const isKnownCategory = (key: string): key is Category =>
  (CATEGORY_ICONS as readonly string[]).includes(key);

const getShareStatus = (isShared: PlaceCardProps["isShared"]) => {
  if (typeof isShared === "string") return isShared;
  if (typeof isShared === "number") {
    if (isShared === 0) return "Not shared";
    return `Shared in ${isShared} ${isShared === 1 ? "group" : "groups"}`;
  }
  return isShared ? "Shared in groups" : "Not shared";
};

const PlaceCard = ({
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
}: PlaceCardProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loadedImage, setLoadedImage] = useState<string>();
  const [failedImage, setFailedImage] = useState<string>();
  const menuRef = useRef<HTMLDivElement>(null);

  const hasImage = !!image && failedImage !== image;
  const isImageLoaded = hasImage && loadedImage === image;

  // Закриття меню по кліку поза ним і по Escape
  useEffect(() => {
    if (!isMenuOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setIsMenuOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMenuOpen]);

  const categoryKey = category.toLowerCase().trim().replace(/\s+/g, "_");
  const known = isKnownCategory(categoryKey);
  const iconName: IconName = known ? categoryKey : "map";
  const showPlaceholder = !hasImage || !isImageLoaded;

  const formattedHours = (() => {
    const [start, end] = workingHours.trim().split(/\s+/);
    return end ? `${start}\n${end}` : workingHours;
  })();

  const actions = [
    { label: "Edit place", handler: onEdit },
    { label: "Share with group", handler: onShare },
    { label: deleteButtonText, handler: onDelete, danger: true },
  ].filter((a) => a.handler);

  const status = addedBy
    ? `Added by ${addedBy}`
    : isShared !== undefined
      ? getShareStatus(isShared)
      : null;

  return (
    <div className={styles.placeCard} onClick={onClick}>
      <div className={styles.placeCard__imageWrapper}>
        {showPlaceholder && (
          <div className={styles.placeCard__placeholderWrapper}>
            <div className={styles.placeCard__placeholderContainer}>
              <Placeholder text={title} rows={12} cols={8} />
            </div>

            {!hasImage && (
              <Icon
                name={iconName}
                size={64}
                className={`${styles.placeCard__placeholderIcon} ${
                  known ? styles[`placeCard__placeholderIcon_${categoryKey}`] : ""
                }`}
              />
            )}

            {hasImage && <Loader className={styles.placeCard__loaderOverlay} />}
          </div>
        )}
        {hasImage && (
          <img
            key={image}
            ref={(el) => {
              if (el?.complete && el.naturalWidth > 0) setLoadedImage(image);
            }}
            src={image}
            alt={title}
            loading="lazy"
            className={`${styles.placeCard__image} ${
              isImageLoaded
                ? styles.placeCard__imageLoaded
                : styles.placeCard__imageHidden
            }`}
            onLoad={() => setLoadedImage(image)}
            onError={() => setFailedImage(image)}
          />
        )}
        {actions.length > 0 && (
          <div className={styles.placeCard__menuContainer} ref={menuRef}>
            <button
              type="button"
              className={styles.placeCard__menuBtn}
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen((prev) => !prev);
              }}
              aria-label="More options"
              aria-expanded={isMenuOpen}
            >
              <Icon name="menu" size={20} />
            </button>

            {isMenuOpen && (
              <div className={styles.placeCard__dropdown}>
                {actions.map(({ label, handler, danger }) => (
                  <button
                    key={label}
                    type="button"
                    className={`${styles.placeCard__dropdownItem} ${
                      danger ? styles.placeCard__dropdownItem_danger : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      handler?.();
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.placeCard__content}>
        <h3 className={styles.placeCard__title}>{title}</h3>

        <div className={styles.placeCard__info}>
          <span>{category}</span>
          {workingHours !== "none" && (
            <>
              <span className={styles.placeCard__separator}>•</span>
              <span>{formattedHours}</span>
            </>
          )}
        </div>

        {status && <span className={styles.placeCard__status}>{status}</span>}
      </div>
    </div>
  );
};

export default PlaceCard;