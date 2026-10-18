import { Link, Navigate, useParams } from "react-router-dom";
import { useFormik, type FormikErrors, type FormikHelpers } from "formik";
import { AxiosError } from "axios";

import styles from "./ResetPassword.module.scss";
import { useAuth } from "@/components/AuthContext";
import { usePageError } from "@/modules/hooks.ts";
import { validatePassword } from "@/modules/utils.ts";
import FormField from "../FormField";
import FormButton from "../FormButton/FormButton.tsx";
import { authService } from "@/services/authService.ts";
import { useState } from "react";

interface FormValues {
  newPassword: string;
  confirmPassword: string;
}

type ResetErrors = AxiosError<{
  errors?: { oldPassword?: string; newPassword?: string };
  message: string;
}>;

function isTokenValid(token: string): boolean {
  const base64Url = token.split(".")[1];
  if (!base64Url) {
    return false;
  }

  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join(""),
  );

  const data = JSON.parse(jsonPayload);
  const currentTime = Math.floor(Date.now() / 1000);

  if (data?.exp && currentTime > data.exp) {
    return false;
  }

  return data?.purpose === "password-reset";
}

const ResetPassword = () => {
  const { email, jwt } = useParams();
  const { currentUser } = useAuth();

  const [error, setError] = usePageError("");
  const [successfullyReset, setSuccessfullyReset] = useState<Boolean>(false);

  const formik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },

    validate: (values) => {
      const errors: FormikErrors<FormValues> = {};

      const { newPassword, confirmPassword } = values;

      if (!newPassword) {
        errors.newPassword = "Can`t bee empty";
        return errors;
      }

      errors.newPassword = validatePassword(newPassword);
      if (errors.newPassword) {
        return errors;
      }

      if (newPassword && newPassword !== confirmPassword) {
        errors.newPassword = "Should be the same as confirmed password";
        errors.confirmPassword = "Should be the same as new password";
        return errors;
      }

      return;
    },

    onSubmit: async (values, helpers: FormikHelpers<FormValues>) => {
      const { setSubmitting, setFieldError } = helpers;

      try {
        setSubmitting(true);
        await authService.resetPassword(values.newPassword, jwt || "");
        setSuccessfullyReset(true);
      } catch (error) {
        const err = error as ResetErrors;
        if (!err.response?.data?.errors) {
          setError(err?.message || "Can`t reset password");
        } else {
          const { errors, message } = err.response.data;
          setError(message || "Can`t reset password");
          if (errors?.newPassword) {
            setFieldError("newPassword", errors?.newPassword);
          }
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleFormBlur = (event: React.FocusEvent<HTMLFormElement>) => {
    const { name, value } = event.target;

    if (name && typeof value === "string") {
      formik.setFieldValue(name, value.trim());
    }

    formik.handleBlur(event);
  };

  const { touched, errors, isSubmitting } = formik;

  const isLinkCorrect = email && jwt && isTokenValid(jwt);

  if (currentUser) {
    return <Navigate to="/logout" />;
  }

  if (!isLinkCorrect) {
    return (
      <p className={styles.ResetPassword__messagesRegistration}>
        <p className={styles.ResetPassword__error}>This Link is not correct!</p>
      </p>
    );
  }

  if (successfullyReset) {
    return (
      <p className={styles.ResetPassword__messagesRegistration}>
        Password has been updated successfully{" "}
        <Link className={styles.ResetPassword__messageLink} to="/login">
          Login
        </Link>
      </p>
    );
  }

  return (
    <>
      <form
        onSubmit={formik.handleSubmit}
        onBlur={handleFormBlur}
        className={styles.ResetPassword}
      >
        <h1 className={styles.ResetPassword__title}>Create a new password</h1>
        <div className={styles.ResetPassword__controls}>
          <FormField
            label="New password"
            name="newPassword"
            type="password"
            placeholder="*******"
            value={formik.values.newPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={errors.newPassword}
            touched={touched.newPassword}
          />

          <FormField
            label="Password conformation"
            name="confirmPassword"
            type="password"
            id="password"
            placeholder="*******"
            rightIcon="fa-lock"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={errors.confirmPassword}
            touched={touched.confirmPassword}
          />
          <FormButton
            type="submit"
            disabled={
              isSubmitting || !!errors.newPassword || !!errors.confirmPassword
            }
            text="Reset password"
          />
        </div>

        <div className={styles.ResetPassword__messages}></div>
        {error && <p className={styles.ResetPassword__error}>{error}</p>}
      </form>
    </>
  );
};

export default ResetPassword;
