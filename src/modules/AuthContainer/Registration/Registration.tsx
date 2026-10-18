import styles from "./Registration.module.scss";
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useFormik, type FormikErrors, type FormikHelpers } from "formik";

import { AxiosError } from "axios";
import { authService } from "../../../services/authService.ts";
import { useAuth } from "../../../components/AuthContext.tsx";

import { validateEmail, validatePassword, validateName } from "../../utils.ts";
import { usePageError } from "../../hooks.ts";
import FormButton from "../FormButton";
import FormField from "../FormField/index.ts";
type RegistrationError = AxiosError<{
  errors?: { name?: string; email?: string; password?: string };
  message: string;
}>;

interface FormValues {
  name: string;
  email: string;
  password: string;
}

const Registration = () => {
  const [error, setError] = usePageError("");
  const [registered, setRegistered] = useState(false);

  const { isChecked, currentUser } = useAuth();

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },

    validate: (values): FormikErrors<FormValues> | void => {
      const { name, email, password } = values;

      const errors: { name?: string; email?: string; password?: string } = {};

      const nameError = validateName(name);

      if (nameError) {
        errors.name = nameError;
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

      return errors;
    },

    enableReinitialize: true,

    onSubmit: async (values, helpers: FormikHelpers<FormValues>) => {
      const { setSubmitting, setFieldError } = helpers;
      const { name, email, password } = values;

      setSubmitting(true);

      authService
        .register(name, email, password)
        .then(() => setRegistered(true))
        .catch((error: RegistrationError) => {
          if (error.message) setError(error.message);
          if (!error.response?.data) return;

          const { errors, message } = error.response.data;

          setFieldError("name", errors?.name);
          setFieldError("email", errors?.email);
          setFieldError("password", errors?.password);

          if (message) setError(message);
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

    if (name && typeof value === "string") {
      formik.setFieldValue(name, value.trim());
    }

    formik.handleBlur(event);
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
            name="name"
            type="name"
            autoComplete="name"
            id="name"
            placeholder="e.g. John Doe"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={errors.name}
            touched={touched.name}
          />

          <FormField
            label="Email"
            name="email"
            type="email"
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
            placeholder="*******"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={errors.password}
            touched={touched.password}
          />
          <FormButton
            type="submit"
            disabled={isSubmitting || !!errors.email || !!errors.password}
            text="Log in"
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
        {error && <p className={styles.Registration__error}>{error}</p>}
      </form>
    </>
  );
};

export default Registration;
