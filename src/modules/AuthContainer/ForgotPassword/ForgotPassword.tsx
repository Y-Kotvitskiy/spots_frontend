import { Link, Navigate, useNavigate } from "react-router-dom";
import { useFormik, type FormikErrors, type FormikHelpers } from "formik";
import { AxiosError } from "axios";

import styles from "./ForgotPassword.module.scss";
import { useAuth } from "@/components/AuthContext";
import { usePageError } from "@/modules/hooks.ts";
import { validateEmail } from "@/modules/utils.ts";
import FormField from "../FormField";
import FormButton from "../FormButton/FormButton.tsx";
import { authService } from "@/services/authService.ts";
import { useState } from "react";

interface FormValues {
  email: string;
}

type LoginErrors = AxiosError<{
  errors?: { email?: string; password?: string };
  message: string;
}>;

const ForgotPassword = () => {
  const [error, setError] = usePageError("");
  const { isChecked, currentUser } = useAuth();
  const navigate = useNavigate();

  const [message, setMessage] = useState("");

  const formik = useFormik({
    initialValues: {
      email: "",
    },

    validate: (values): FormikErrors<FormValues> | void => {
      const { email } = values;

      const errors: { email?: string; password?: string } = {};

      const emailError = !email ? "Can`t be empty" : validateEmail(email);

      if (emailError) {
        errors.email = emailError;
      }

      return errors;
    },

    enableReinitialize: true,

    onSubmit: async (values, helpers: FormikHelpers<FormValues>) => {
      const { setSubmitting, setFieldError } = helpers;

      try {
        const result = await authService.forgotPasswordRequest(values.email);
        const message =
          result?.message ||
          "We've sent you a link to reset your password. It may take a few minutes to arrive.";
        setMessage(message);
      } catch (err) {
        const error = err as LoginErrors;
        if (error.response?.data) {
          const { errors, message } = error.response?.data;
          if (errors?.email) {
            setFieldError("email", errors.email);
          }

          setError(message);
        } else {
          setError("Unknown error");
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (isChecked && currentUser) {
    return <Navigate to="/" />;
  }

  const { touched, errors, isSubmitting } = formik;

  const handleFormBlur = (event: React.FocusEvent<HTMLFormElement>) => {
    const { name, value } = event.target;

    if (name && typeof value === "string") {
      formik.setFieldValue(name, value.trim());
    }

    formik.handleBlur(event);
  };

  if (message) {
    return (
      <section className={styles.ForgotPassword}>
        <div className={styles.ForgotPassword__header}>
          <h1 className={styles.ForgotPassword__title}>Check your email?</h1>
          <p className={styles.ForgotPassword__text}>{message}</p>
        </div>
        <div className={styles.ForgotPassword__controls}>
          <FormButton
            text="Back to login"
            onClick={() => {
              navigate("/login");
            }}
          />
        </div>
        <div className={styles.ForgotPassword__messages}>
          <p className={styles.ForgotPassword__messagesRegistration}>
            Didn't get the email?{" "}
            <a
              href="#"
              className={styles.ForgotPassword__messageLink}
              onClick={(event) => {
                event.preventDefault();
                setMessage("");
              }}
            >
              Resend
            </a>
          </p>
        </div>
      </section>
    );
  }

  return (
    <form
      onSubmit={formik.handleSubmit}
      onBlur={handleFormBlur}
      className={styles.ForgotPassword}
    >
      <div className={styles.ForgotPassword__header}>
        <h1 className={styles.ForgotPassword__title}>Forgot password?</h1>
        <p className={styles.ForgotPassword__text}>
          Enter the email you used to sign up and we'll send you a link to reset
          your password.
        </p>
      </div>
      <div className={styles.ForgotPassword__controls}>
        <FormField
          label="Email"
          name="email"
          type="email"
          placeholder="e.g. bobsmith@gmail.com"
          rightIcon="fa-lock"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={errors.email}
          touched={touched.email}
        />

        <FormButton
          type="submit"
          disabled={isSubmitting || !!errors.email}
          text="Send reset link"
        />
      </div>

      <div className={styles.ForgotPassword__messages}>
        <Link className={styles.ForgotPassword__messageLink} to="/login">
          Back to log in
        </Link>
      </div>
      {error && <p className={styles.ForgotPassword__error}>{error}</p>}
    </form>
  );
};

export default ForgotPassword;
