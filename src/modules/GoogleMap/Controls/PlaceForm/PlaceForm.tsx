import styles from "./PlaceForm.module.scss";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { selectSelectedCoords } from "@/store/mapSlice";
import cn from "classnames";
import Button from "@/modules/shared/Button/";
import { useFormik, type FormikErrors, type FormikHelpers } from "formik";
import PlaceField from "./PlaceField/PlaceField";
import PlacePhotoField from "./PlacePhotoField";

interface FormValues {
  name: string;
  category: string;
  tags: string[];
  address: string;
  description: string;
  location: string;
  photo: File | null;
}

interface ModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  //  onSubmit: (data: ModalFormData) => void;
  initialData?: Partial<FormValues>;
}

const CATEGORIES = [
  "Cafe",
  "Restaurant",
  "Bar",
  "Bakery",
  "Street food",
  "Museum",
  "Park",
  "Shopping",
];

const TAGS = [
  "Wi-Fi",
  "Power outlets",
  "Outdoor seating",
  "Parking",
  "Restrooms",
  "Vegan options",
];

type FormPages = 1 | 2 | 3;

const PlaceForm: React.FC<ModalFormProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const [activePage, setActivePage] = useState<FormPages>(1);

  const selectedCoords = useSelector(selectSelectedCoords);

  const formik = useFormik({
    initialValues: {
      name: "",
      category: "",
      tags: [],
      address: "",
      description: "",
      location: "",
      photo: null,
    } as FormValues,

    validate: (values): FormikErrors<FormValues> | void => {
      const { name, category, description } = values;

      const errors: { name?: string; category?: string; description?: string } =
        {};

      if (!name) {
        errors.name = "Can`t be empty";
      }

      if (!category) {
        errors.category = "Can`t be empty";
      }

      if (!description) {
        errors.description = "Can`t be empty";
      }

      return errors;
    },

    enableReinitialize: true,

    onSubmit: async (values, helpers: FormikHelpers<FormValues>) => {
      const { setSubmitting, setFieldError, setFieldTouched } = helpers;
      //      const { name, email, password } = values;

      setSubmitting(true);

      // authService
      //   .register(name, email, password)
      //   .then(() => setRegistered(true))
      //   .catch((error: RegistrationError) => {
      //     if (error.message) setError(error.message);
      //     if (!error.response?.data) return;

      //     const { errors, message } = error.response.data;

      //     setFieldError("name", errors?.name);
      //     setFieldError("email", errors?.email);
      //     setFieldError("password", errors?.password);

      //     if (message) setError(message);
      //   })
      //   .finally(() => setSubmitting(false));
    },
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    if (isOpen) {
      formik.setValues({
        name: "",
        category: "",
        tags: [],
        address: "",
        description: "",
        location: "",
        photo: null,
      } as FormValues);

      setActivePage(1);
      formik.setTouched({});
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onClose();
  };

  const handleNextClick = () => {
    if (activePage >= 3) {
      setActivePage(1);
    } else {
      setActivePage((prev) => (prev + 1) as FormPages);
    }
  };

  const { touched, errors, setFieldValue, isSubmitting } = formik;

  const handleCategoryClick = (
    newCategory: React.ChangeEvent<any> | string,
  ) => {
    if (typeof newCategory !== "string") return;

    if (formik.values.category !== newCategory) {
      setFieldValue("category", newCategory);
    }
  };

  const handleTagClick = (currentTag: React.ChangeEvent<any> | string) => {
    if (typeof currentTag !== "string") return;
    const values = formik.values;
    const currentTags = values.tags;
    const isSelected = currentTags.includes(currentTag);
    const updatedTags = isSelected
      ? currentTags.filter((tag) => tag !== currentTag) // Удаляем
      : [...currentTags, currentTag]; // Добавляем

    setFieldValue("tags", updatedTags);
  };

  const handlePhotoChange = (file: File | null) => {
    setFieldValue("photo", file);
  };

  const isDisabledNext = () => {
    switch (activePage) {
      case 1: {
        const { name, category } = formik.values;

        return !name || !category;
      }

      case 2: {
        return !formik.values.description.trim();
      }
    }
    return false;
  };

  const handlePrevPageButton = () => {
    if (activePage > 1) setActivePage((prev) => (prev - 1) as FormPages);
  };

  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <header className={styles.PlaceForm__header}>
            <h1>Add place {activePage}/3</h1>
            {activePage != 1 && (
              <button
                className={styles.PlaceForm__headerPrevPageButton}
                type="button"
                onClick={handlePrevPageButton}
              ></button>
            )}
            <button
              className={styles.PlaceForm__headerClose}
              type="button"
              onClick={onClose}
            ></button>
          </header>
          <main>
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
                error={errors.name}
                touched={touched.name}
              />
              <PlaceField
                label="Category"
                name="category"
                type="selectButtons"
                required
                value={formik.values.category}
                options={CATEGORIES}
                onChange={handleCategoryClick}
                onBlur={formik.handleBlur}
              />
              <PlaceField
                label="Tags"
                name="tags"
                type="selectButtons"
                value={formik.values.tags}
                options={TAGS}
                onChange={handleTagClick}
                onBlur={formik.handleBlur}
              />
            </fieldset>
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
                error={errors.description}
                touched={touched.description}
              />
              <PlaceField
                label="Location"
                name="address"
                type="text"
                required
                value={selectedCoords?.address || "*"}
                onChange={(_e) => {}}
                onBlur={formik.handleBlur}
                touched={false}
              />
              <PlacePhotoField
                label="Photo"
                name="photo"
                onChange={handlePhotoChange}
              />
            </fieldset>
            <fieldset
              className={cn(styles.PlaceForm__fieldset, {
                [styles.PlaceForm__fieldset_active]: activePage === 3,
              })}
            ></fieldset>
          </main>
          <footer className={styles.PlaceForm__footer}>
            <Button
              type="button"
              disabled={isDisabledNext()}
              onClick={handleNextClick}
              text="Next"
            />
          </footer>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default PlaceForm;
