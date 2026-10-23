import styles from "./AddPlace.module.scss";

import { usePageError } from "@/modules/hooks.ts";
import { placeService } from "@/services/placeService.ts";
import type { AxiosError } from "axios";
import { useFormik, type FormikErrors, type FormikHelpers } from "formik";

interface FormValues {
  name: string;
  latitude: number;
  longitude: number;
}

type PlaceErrors = AxiosError<{
  errors?: { name?: string };
  message: string;
}>;

const AddPlace = () => {
  const [error, setError] = usePageError("");

  const formik = useFormik({
    initialValues: {
      name: "test",
      latitude: 1,
      longitude: 1,
    },

    validate: (values): FormikErrors<FormValues> | void => {
      const { name } = values;

      const errors: { name?: string } = {};
      if (!name) {
        errors.name = "Name can`t be empty";
      }

      return errors;
    },

    enableReinitialize: true,

    onSubmit: async (values, helpers: FormikHelpers<FormValues>) => {
      const { setSubmitting, setFieldError } = helpers;

      try {
        await placeService.create(values);
        setError("Save!");
      } catch (err) {
        const error = err as PlaceErrors;
        if (!error.response?.data) return;

        const { errors, message } = error.response.data;

        setFieldError("name", errors?.name);

        setError(message ?? "Error");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { errors, isSubmitting } = formik;

  const handleFormBlur = (event: React.FocusEvent<HTMLFormElement>) => {
    const { name, value } = event.target;

    if (name && typeof value === "string") {
      formik.setFieldValue(name, value.trim());
    }

    formik.handleBlur(event);
  };

  return (
    <form
      className={styles.AddPlace}
      onSubmit={formik.handleSubmit}
      onBlur={handleFormBlur}
    >
      <label htmlFor={"name"}>
        Name
        <input
          id="name"
          name="name"
          placeholder="e.g. John Doe"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      </label>

      <label htmlFor={"latitude"}>
        latitude
        <input
          id="latitude"
          name="latitude"
          value={formik.values.latitude}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      </label>

      <label htmlFor={"longitude"}>
        longitude
        <input
          id="longitude"
          name="longitude"
          value={formik.values.longitude}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      </label>

      <button type="submit" disabled={isSubmitting || !!errors.name}>
        Save
      </button>

      {error && <p className={styles.AddPlace__error}>{error}</p>}
    </form>
  );
};

export default AddPlace;
