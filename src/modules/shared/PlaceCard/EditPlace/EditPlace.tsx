import React, { useState, useRef } from "react";
import styles from "./EditPlace.module.scss";
import Icon from "@/modules/shared/Icon";
import FormButton from "@/modules/AuthContainer/FormButton";
import Loader from "@/modules/shared/Loader";
import Placeholder from "@/modules/shared/Placeholder";
import { Tag, type Place, type TagKey, type BackendPhoto } from "@/types";
import { useMapSelector } from "@/store/hooks";
import { placeService } from "@/services/placeService";
import cn from "classnames";
import WorkingHoursPicker from "./WorkingHoursPicker";
import { createPortal } from "react-dom";

// ==========================================
// SUB-COMPONENT FOR MODAL PHOTO CARD
// ==========================================

interface ModalPhotoCardProps {
  photo: BackendPhoto;
  placeName: string;
  isDeleting: boolean;
  isDisabled: boolean;
  onDelete: (id: string) => void;
}

const ModalPhotoCard: React.FC<ModalPhotoCardProps> = ({
  photo,
  placeName,
  isDeleting,
  isDisabled,
  onDelete,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={cn(styles.modal__photoCard, {
        [styles.cardDimmed]: isDisabled && !isDeleting,
        [styles.cardLoading]: isDeleting,
      })}
    >
      {/* плейсхолдер */}
      {(!photo.url || !isLoaded) && (
        <div className={styles.modal__placeholderWrapper}>
          <Placeholder text={placeName} />
          {photo.url && <Loader className={styles.modal__photoLoaderOverlay} />}
        </div>
      )}

      {/* Зображення */}
      {photo.url && (
        <img
          key={photo.url}
          src={photo.url}
          alt="Place photo"
          className={cn(styles.modal__photoImage, {
            [styles.modal__photoImageLoaded]: isLoaded,
            [styles.modal__photoImageHidden]: !isLoaded,
          })}
          onLoad={() => setIsLoaded(true)}
        />
      )}

      {/* Оверлей */}
      {isDeleting && (
        <div className={styles.modal__photoLoaderOverlay}>
          <Loader />
        </div>
      )}

      <button
        type="button"
        className={styles.modal__deletePhotoBtn}
        onClick={() => onDelete(photo.id)}
        disabled={isDisabled}
        aria-label="Delete photo"
      >
        <Icon name="close" className={styles.icon__close} />
      </button>
    </div>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================

interface EditPlaceProps {
  isOpen: boolean;
  onClose: () => void;
  place: Place;
  onUpdate?: (updatedPlace: Place) => void;
}

const EditPlace: React.FC<EditPlaceProps> = ({
  isOpen,
  onClose,
  place,
  onUpdate,
}) => {
  const [activePage, setActivePage] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhotoId, setLoadingPhotoId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const { categories } = useMapSelector();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(place?.name || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    place?.categoryId || ""
  );
  const [selectedTags, setSelectedTags] = useState<TagKey[]>(place?.tags || []);
  const [description, setDescription] = useState(place?.description || "");
  const [address, setAddress] = useState(place?.address || "");
  
  const [photos, setPhotos] = useState<BackendPhoto[]>(
    place?.photos ? Object.values(place.photos) : []
  );

  const [workingHours, setWorkingHours] = useState(
    place?.opening_hours
      ? `${place.opening_hours.opens_at}-${place.opening_hours.closes_at}`
      : "08:00-20:00"
  );
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  if (!isOpen) return null;

  const handleCategoryClick = (catKey: string) => {
    setSelectedCategory(catKey);
  };

  const handleTagClick = (tagKey: string) => {
    const isSelected = selectedTags.includes(tagKey as TagKey);
    const updatedTags = isSelected
      ? selectedTags.filter((t) => t !== tagKey)
      : [...selectedTags, tagKey as TagKey];
    setSelectedTags(updatedTags);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && place?.id) {
      try {
        setErrorMessage("");
        setLoadingPhotoId("adding");
        const newPhoto: BackendPhoto = await placeService.addPhoto(place.id, file);
        const updatedPhotos = [...photos, newPhoto];
        setPhotos(updatedPhotos);
        if (onUpdate) {
          onUpdate({ ...place, photos: updatedPhotos as unknown as Place["photos"] });
        }
      } catch (err: unknown) {
        console.error("Failed to add photo:", err);
        const error = err as { response?: { data?: { message?: string } } };
        setErrorMessage(error.response?.data?.message || "Failed to add photo");
      } finally {
        setLoadingPhotoId(null);
        if (e.target) e.target.value = "";
      }
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!place?.id || loadingPhotoId) return;
    try {
      setErrorMessage("");
      setLoadingPhotoId(photoId);
      await placeService.deletePhoto(place.id, photoId);
      const updatedPhotos = photos.filter((p) => p.id !== photoId);
      setPhotos(updatedPhotos);
      if (onUpdate) {
        onUpdate({ ...place, photos: updatedPhotos as unknown as Place["photos"] });
      }
    } catch (err: unknown) {
      console.error("Failed to delete photo:", err);
      const error = err as { response?: { data?: { message?: string } } };
      setErrorMessage(error.response?.data?.message || "Failed to delete photo");
    } finally {
      setLoadingPhotoId(null);
    }
  };

  const handleNextOrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (activePage < 3) {
      setActivePage((prev) => (prev + 1) as 1 | 2 | 3);
      return;
    }

    try {
      setIsLoading(true);

      const [opens_at, closes_at] = workingHours.split("-");
      const updateData = {
        name,
        description,
        address,
        category_ids: selectedCategory ? [selectedCategory] : [],
        tags: selectedTags,
        opening_hours: {
          opens_at: opens_at?.trim() || "08:00",
          closes_at: closes_at?.trim() || "20:00",
        },
      };

      const updatedPlace = await placeService.update(place.id, updateData);

      if (onUpdate) {
        const mappedPlace: Place = {
          ...place,
          ...updatedPlace,
          categoryId: selectedCategory,
          categoryName: categories[selectedCategory] || place.categoryName,
          tags: selectedTags,
          description,
          address,
          opening_hours: updateData.opening_hours,
        };
        onUpdate(mappedPlace);
      }
      onClose();
    } catch (error: unknown) {
      console.error("Failed to update place:", error);

      const err = error as {
        response?: {
          data?: {
            message?: string;
            detail?: Array<{ msg: string }>;
          };
        };
        message?: string;
      };

      const errData = err.response?.data;
      let backendMessage: string;

      if (Array.isArray(errData?.detail) && errData.detail.length > 0) {
        backendMessage = errData.detail[0].msg;
      } else {
        backendMessage = errData?.message || err.message || "Failed to update place";
      }

      setErrorMessage(backendMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isPhotosActionActive = loadingPhotoId !== null;
  const placeNameForPlaceholder = name.trim() || "Place";

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modal__header}>
          {activePage > 1 ? (
            <button
              className={styles.modal__backBtn}
              onClick={() => {
                setActivePage((prev) => (prev - 1) as 1 | 2);
                setErrorMessage("");
              }}
              type="button"
              aria-label="Previous page"
            >
              <Icon name="back" />
            </button>
          ) : (
            <div style={{ width: 28 }} />
          )}

          <h3 className={styles.modal__title}>Edit place {activePage}/3</h3>

          <button className={styles.modal__closeBtn} onClick={onClose} type="button" aria-label="Close modal">
            <Icon name="close"/>
          </button>
        </div>

        <form onSubmit={handleNextOrSubmit} className={styles.modal__form}>
          {activePage === 1 && (
            <>
              <div className={styles.modal__field}>
                <label className={styles.modal__label}>
                  Place name <span className={styles.modal__required}>*</span>
                </label>
                <div className={styles.modal__inputWrapper}>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={styles.modal__input}
                    placeholder="Place name"
                    required
                  />
                </div>
              </div>

              <div className={styles.modal__setField}>
                <label className={styles.modal__label}>Category</label>
                <div className={styles.modal__chipsGrid}>
                  {Object.entries(categories).map(([key, label]) => {
                    const isSelected = selectedCategory === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        className={cn(styles.modal__chip, {
                          [styles.modal__chipActive]: isSelected,
                        })}
                        onClick={() => handleCategoryClick(key)}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.modal__setField}>
                <label className={styles.modal__label}>Tags</label>
                <div className={styles.modal__chipsGrid}>
                  {Object.entries(Tag).map(([key, label]) => {
                    const isSelected = selectedTags.includes(key as TagKey);
                    return (
                      <button
                        key={key}
                        type="button"
                        className={cn(styles.modal__chip, {
                          [styles.modal__chipActive]: isSelected,
                        })}
                        onClick={() => handleTagClick(key)}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {activePage === 2 && (
            <>
              <div className={styles.modal__setField}>
                <label className={styles.modal__label}>
                  Description <span className={styles.modal__required}>*</span>
                </label>
                <div className={styles.modal__textareaWrapper}>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={styles.modal__textarea}
                    placeholder="Place description..."
                    rows={4}
                    required
                  />
                </div>
              </div>

              <div className={styles.modal__setField}>
                <label className={styles.modal__label}>
                  Location <span className={styles.modal__required}>*</span>
                </label>
                <div className={styles.modal__inputWrapper}>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={styles.modal__input}
                    placeholder="12 Main Street, Kyiv, 04210"
                    required
                  />
                </div>
              </div>

              <div className={styles.modal__setField}>
                <label className={styles.modal__label}>Photos</label>
                <div className={styles.modal__photosGrid}>
                  {photos.map((photo) => (
                    <ModalPhotoCard
                      key={photo.id}
                      photo={photo}
                      placeName={placeNameForPlaceholder}
                      isDeleting={loadingPhotoId === photo.id}
                      isDisabled={isPhotosActionActive}
                      onDelete={handleDeletePhoto}
                    />
                  ))}

                  {photos.length < 5 && (
                    <button
                      type="button"
                      className={cn(styles.modal__addPhotoCard, {
                        [styles.cardDimmed]: isPhotosActionActive && loadingPhotoId !== "adding",
                        [styles.cardLoading]: loadingPhotoId === "adding",
                      })}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isPhotosActionActive}
                      aria-label="Add photo"
                    >
                      {loadingPhotoId === "adding" ? (
                        <div className={styles.modal__photoLoaderOverlay}>
                          <Loader />
                        </div>
                      ) : (
                        <Icon name="plus" size={28} />
                      )}
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: "none" }}
                />
              </div>
            </>
          )}

          {activePage === 3 && (
            <>
              <div className={styles.modal__setField}>
                <label className={styles.modal__label}>
                  Working hours <span className={styles.modal__required}>*</span>
                </label>
                <div 
                  className={styles.modal__inputWrapper} 
                  onClick={() => setIsPickerOpen(true)}
                  style={{ cursor: "pointer" }}
                >
                  <input
                    type="text"
                    value={workingHours}
                    readOnly
                    className={styles.modal__input}
                    placeholder="08:00-20:00"
                    required
                  />
                  <span className={styles.modal__inputIcon}>
                    <Icon name="down" size={16} />
                  </span>
                </div>
              </div>

              <WorkingHoursPicker
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                initialValue={workingHours}
                onSelect={(val) => setWorkingHours(val)}
              />
            </>
          )}

          {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

          <FormButton
            type="submit"
            text={
              isLoading
                ? "Saving..."
                : activePage === 3
                ? "Save changes"
                : "Next"
            }
          />
        </form>
      </div>
    </div>,
  document.body
  );
};

export default EditPlace;