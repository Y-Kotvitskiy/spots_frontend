import styles from "./Registration.module.scss";
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useFormik, type FormikErrors, type FormikHelpers } from "formik";

import { authService } from "../../../services/authService.ts";

import {
  validateEmail,
  validatePassword,
  validateName,
  type LoginErrors,
  setErrorMessages,
} from "../../utils.ts";
import { usePageError } from "../../hooks.ts";
import FormButton from "../FormButton";
import FormField from "../FormField/index.ts";
import Icon from "@/modules/shared/Icon/Icon.tsx";
import { useAuthSelector } from "@/store/hooks";

interface FormValues {
  display_name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

const Registration = () => {
  const [error, setError] = usePageError("");
  const [registered, setRegistered] = useState(false);

  const { isChecked, currentUser } = useAuthSelector();

  const formik = useFormik({
    initialValues: {
      display_name: "",
      email: "",
      password: "",
      password_confirmation: "",
    },

    validate: (values): FormikErrors<FormValues> | void => {
      const { display_name, email, password, password_confirmation } = values;

      const errors: {
        display_name?: string;
        email?: string;
        password?: string;
        password_confirmation?: string;
      } = {};

      const nameError = validateName(display_name);

      if (nameError) {
        errors.display_name = nameError;
      }

      const emailError = !email ? "Can`t be empty" : validateEmail(email);

      if (emailError) {
        errors.email = emailError;
      }

      const trimmedPassword = password.trim();

      const passwordError = trimmedPassword
        ? validatePassword(password)
        : "Can`t be empty";

      if (passwordError) {
        errors.password = passwordError;
      }

      if (password !== password_confirmation) {
        errors.password_confirmation = "Should be equal to password";
      }

      return errors;
    },

    enableReinitialize: true,

    onSubmit: async (values, helpers: FormikHelpers<FormValues>) => {
      const { setSubmitting, setFieldError } = helpers;
      const { display_name, email, password } = values;

      setSubmitting(true);

      authService
        .register(display_name, email, password)
        .then(() => setRegistered(true))
        .catch((error: LoginErrors) => {
          setErrorMessages(error as LoginErrors, setFieldError, setError);
        })
        .finally(() => setSubmitting(false));
    },
  });

  if (isChecked && currentUser) {
    return <Navigate to="/" />;
  }

  if (registered) {
    return (
      <section className="">
        <h1 className="title">Check your email</h1>
        <p>We have sent you an email with the activation link</p>
      </section>
    );
  }

  const handleFormBlur = (event: React.FocusEvent<HTMLFormElement>) => {
    const { name, value } = event.target;

    if (name) {
      if (name && typeof value === "string") {
        formik.setFieldValue(name, value.trim());
      }

      formik.handleBlur(event);
    }
  };

  const { touched, errors, isSubmitting } = formik;

  return (
    <>
      <form
        onSubmit={formik.handleSubmit}
        onBlur={handleFormBlur}
        className={styles.Registration}
      >
        <h1 className={styles.Registration__title}>Sign up</h1>
        <div className={styles.Registration__controls}>
          <FormField
            label="Name"
            name="display_name"
            type="name"
            required
            autoComplete="name"
            id="display_name"
            placeholder="e.g. John Doe"
            value={formik.values.display_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={errors.display_name}
            touched={touched.display_name}
          />

          <FormField
            label="Email"
            name="email"
            type="email"
            required
            placeholder="e.g. bobsmith@gmail.com"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={errors.email}
            touched={touched.email}
          />

          <FormField
            label="Password"
            name="password"
            type="password"
            id="password"
            required
            placeholder="*******"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={errors.password}
            touched={touched.password}
          />

          <FormField
            label="Password confirmation"
            name="password_confirmation"
            type="password"
            id="password_confirmation"
            required
            placeholder="*******"
            value={formik.values.password_confirmation}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={errors.password_confirmation}
            touched={touched.password_confirmation}
          />

          {error && (
            <p className={styles.Registration__error}>
              <Icon
                name="error"
                size={16}
                className={styles.Registration__errorIcon}
              />
              {error}
            </p>
          )}

          <FormButton
            type="submit"
            disabled={isSubmitting || !!errors.email || !!errors.password}
            text="Registration"
          />
        </div>
        <div className={styles.Registration__messages}>
          <p className={styles.Registration__messagesRegistration}>
            Already have an account?{" "}
            <Link className={styles.Registration__messageLink} to="/login">
              Log in
            </Link>
          </p>
        </div>
      </form>
    </>
  );
};

export default Registration;
