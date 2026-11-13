import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import cn from "classnames";
import { useFormik } from "formik";

import {
  MapMode,
  selectMapMode,
  selectSelectedCoords,
} from "@/store/slices/mapSlice";
import { mapActions } from "@/store";
import { useAppDispatch, useAuthSelector, useMapSelector } from "@/store/hooks";
import Button from "@/modules/shared/Button/";
import Loader from "@/modules/shared/Loader";

import PlaceField from "../PlaceField/PlaceField";
import PlacePhotoField from "./PlacePhotoField";
import styles from "./PlaceForm.module.scss";

import { INITIAL_VALUES } from "./PlaceForm.types";
import type { FormValues, FormPages } from "./PlaceForm.types";

import { validatePlaceForm } from "./PlaceForm.utils";
import { Tag, type CreatePlace, type Place, type TagKey } from "@/types";
import { getAddressFromCoords } from "../utils";
import { placeService } from "@/services/placeService";
import WorkingHoursPicker from "../WorkingHoursPicker";
// import { form } from "@/modules/Groups/CreateGroup/CreateGroup.module.scss";

const PlaceForm: React.FC = () => {
  const [activePage, setActivePage] = useState<FormPages>(1);
  const [isAddressLoading, setIsAddressLoading] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const { currentUser } = useAuthSelector();
  const selectedCoords = useSelector(selectSelectedCoords);
  const { categories } = useMapSelector();

  const formik = useFormik<FormValues>({
    initialValues: INITIAL_VALUES,
    enableReinitialize: true,
    validate: validatePlaceForm,
    onSubmit: async (values) => {
      if (!selectedCoords || !currentUser) return;

      const CreatePlacePayload: CreatePlace = {
        name: values.name,
        description: values.description,
        category_ids: [values.category || ""],
        tags: values.tags,
        address: selectedCoords.address || "",
        latitude: selectedCoords.lat || 0,
        longitude: selectedCoords.lng || 0,
        opening_hours: {
          opens_at: values.opens_at,
          closes_at: values.closes_at,
        },
      };
      setSaveError(false);

      try {
        formik.setSubmitting(true);
        const backendPlace: Place = await dispatch(
          mapActions.addPlace(CreatePlacePayload),
        ).unwrap();
        if (values.photo) {
          try {
            const photoResult = await placeService.addPhoto(
              backendPlace.id,
              values.photo as File,
            );

            dispatch(
              mapActions.updatePlace({
                id: backendPlace.id,
                photos: { [photoResult.position]: photoResult },
              }),
            );
          } catch (error) {
            console.error("Failed to upload photo:", error);
          }
        }

        formik.setSubmitting(false);
        setActivePage(4);
      } catch (error) {
        console.error("Failed to add place:", error);
        setSaveError(true);
      }
    },
  });

  const isOpen = useSelector(selectMapMode) === MapMode.Add;

  const onClose = () => {
    dispatch(mapActions.setMapMode(MapMode.Show));
    dispatch(mapActions.clearSelectedCoord());
  };

  useEffect(() => {
    if (!isOpen) return;

    setSaveError(false);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    formik.resetForm({ values: INITIAL_VALUES });
    setActivePage(1);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const setTimeoutForError = setTimeout(() => {
      formik.isSubmitting && formik.setSubmitting(false);
      setSaveError(false);
    }, 3000);

    return () => clearTimeout(setTimeoutForError);
  }, [saveError]);

  useEffect(() => {
    const getAddress = async () => {
      if (selectedCoords) {
        try {
          setIsAddressLoading(true);
          const { lat, lng } = selectedCoords;
          const address = await getAddressFromCoords(lat, lng);
          dispatch(mapActions.setSelectedCoords({ lat, lng, address }));
        } catch (e) {
          console.error("Failed to fetch address", e);
        } finally {
          setIsAddressLoading(false);
        }
      }
    };

    if (!selectedCoords?.address && activePage === 2) {
      getAddress();
    }
  }, [activePage, selectedCoords?.address]);

  if (!isOpen) return null;

  const handleCategoryClick = (
    newCategory: React.ChangeEvent<any> | string,
  ) => {
    if (typeof newCategory !== "string" || !categories[newCategory]) {
      return;
    }
    formik.setFieldValue("category", newCategory);
  };

  const handleTagClick = (currentTag: React.ChangeEvent<any> | string) => {
    if (
      typeof currentTag !== "string" ||
      !Object.keys(Tag).includes(currentTag)
    ) {
      return;
    }

    const currentTags = formik.values.tags;
    const isSelected = currentTags.includes(currentTag as TagKey);
    const updatedTags = isSelected
      ? currentTags.filter((tag) => tag !== currentTag)
      : [...currentTags, currentTag];

    formik.setFieldValue("tags", updatedTags);
  };

  const isDisabledNext = () => {
    if (isAddressLoading || formik.isSubmitting) return true;
    if (activePage === 1) return !formik.values.name || !formik.values.category;
    if (activePage === 2)
      return !formik.values.description.trim() || !selectedCoords?.address;
    return false;
  };

  const getNextButtonText = () => {
    if (activePage > 3) {
      return "Great";
    }
    if (isAddressLoading) {
      return "Loading...";
    }
    if (saveError) {
      return "Error! Try again";
    }
    return "Next";
  };

  const handleNextClick = () => {
    if (activePage === 3) {
      formik.submitForm();
    } else if (activePage === 4) {
      onClose();
    } else {
      setActivePage((prev) => (prev + 1) as FormPages);
    }
  };

  const handlePrevPageButton = () => {
    if (activePage > 1) setActivePage((prev) => (prev - 1) as FormPages);
  };

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={(e) => e.preventDefault()}>
          <header className={styles.PlaceForm__header}>
            <h1>
              {activePage === 4
                ? "Your place is now on the map"
                : `Add place ${activePage}/3`}
            </h1>

            {activePage > 1 && activePage < 4 && (
              <button
                className={styles.PlaceForm__headerPrevPageButton}
                type="button"
                onClick={handlePrevPageButton}
                aria-label="Previous page"
              />
            )}
            <button
              className={styles.PlaceForm__headerClose}
              type="button"
              onClick={onClose}
              aria-label="Close modal"
            />
          </header>

          <main>
            {/* Шаг 1 */}
            <fieldset
              className={cn(styles.PlaceForm__fieldset, {
                [styles.PlaceForm__fieldset_active]: activePage === 1,
              })}
            >
              <PlaceField
                label="Name"
                name="name"
                type="text"
                placeholder="Place name"
                required
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.name}
                touched={formik.touched.name}
              />
              <PlaceField
                label="Category"
                name="category"
                type="selectButtons"
                required
                value={formik.values.category || ""}
                options={categories}
                onChange={handleCategoryClick}
                onBlur={formik.handleBlur}
              />
              <PlaceField
                label="Tags"
                name="tags"
                type="selectButtons"
                value={formik.values.tags}
                options={Tag}
                onChange={handleTagClick}
                onBlur={formik.handleBlur}
              />
            </fieldset>

            {/* Шаг 2 */}
            <fieldset
              className={cn(styles.PlaceForm__fieldset, {
                [styles.PlaceForm__fieldset_active]: activePage === 2,
              })}
            >
              <PlaceField
                label="Description"
                name="description"
                type="textarea"
                required
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.description}
                touched={formik.touched.description}
              />

              {/* Поле локації з компонентом Loader */}
              <div style={{ position: "relative" }}>
                <PlaceField
                  label="Location"
                  name="address"
                  type="text"
                  required
                  value={
                    isAddressLoading
                      ? "Loading address..."
                      : selectedCoords?.address || ""
                  }
                  onChange={() => {}}
                  onBlur={formik.handleBlur}
                  touched={false}
                />
                {isAddressLoading && (
                  <div
                    style={{
                      position: "absolute",
                      right: 12,
                      top: 36,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Loader />
                  </div>
                )}
              </div>

              <PlacePhotoField
                label="Photo"
                name="photo"
                onChange={(file) => formik.setFieldValue("photo", file)}
              />
            </fieldset>

            {/* Шаг 2 */}
            <fieldset
              className={cn(styles.PlaceForm__fieldset, {
                [styles.PlaceForm__fieldset_active]: activePage === 3,
              })}
            >
              <WorkingHoursPicker
                startTime={formik.values.opens_at}
                endTime={formik.values.closes_at}
                setStartTime={(startTime) => {
                  debugger;
                  formik.setFieldValue("opens_at", startTime);
                }}
                setEndTime={(endTime) =>
                  formik.setFieldValue("closes_at", endTime)
                }
              />
            </fieldset>

            {/* Шаг 4 (Успех) */}
            <div
              className={cn(styles.PlaceForm__fieldset, {
                [styles.PlaceForm__fieldset_active]: activePage === 4,
              })}
            >
              <span className={styles.PlaceForm__finalMessage}>
                Other people can find it and add it to their lists.
              </span>
            </div>
          </main>

          <footer className={styles.PlaceForm__footer}>
            <Button
              type="button"
              disabled={isDisabledNext()}
              onClick={handleNextClick}
              text={getNextButtonText()}
            />
          </footer>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default PlaceForm;
