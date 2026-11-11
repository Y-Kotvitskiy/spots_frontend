import styles from "./Login.module.scss";

import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useFormik, type FormikErrors, type FormikHelpers } from "formik";

import { useAppDispatch, useAppSelector } from "@/store/hooks.ts";
import { usePageError } from "@/modules/hooks.ts";
import {
  setErrorMessages,
  validateEmail,
  validatePassword,
  type LoginErrors,
} from "@/modules/utils.ts";
import FormField from "../FormField";
import FormButton from "../FormButton/FormButton.tsx";
import Icon from "@/modules/shared/Icon/Icon.tsx";
import { authActions } from "@/store";

interface FormValues {
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [error, setError] = usePageError("");

  const { isChecked, currentUser } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },

    validate: (values): FormikErrors<FormValues> | void => {
      const { email, password } = values;

      const errors: { email?: string; password?: string } = {};

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
      const { email, password } = values;

      try {
        await dispatch(
          authActions.login({ emailLogin: email, password }),
        ).unwrap();
        const state = location.state as { from?: Location };
        navigate(state?.from?.pathname ?? "/");
      } catch (err) {
        debugger;
        setErrorMessages(err as LoginErrors, setFieldError, setError);
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

    if (!name) {
      return;
    }

    if (name && typeof value === "string") {
      formik.setFieldValue(name, value.trim());
    }

    formik.handleBlur(event);
  };

  return (
    <>
      <form
        onSubmit={formik.handleSubmit}
        onBlur={handleFormBlur}
        className={styles.Login}
      >
        <h1 className={styles.Login__title}>Log in</h1>
        <div className={styles.Login__controls}>
          <FormField
            label="Email"
            name="email"
            type="email"
            required
            placeholder="e.g. bobsmith@gmail.com"
            rightIcon="fa-lock"
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
            required
            id="password"
            placeholder="*******"
            rightIcon="fa-lock"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={errors.password}
            touched={touched.password}
          />

          {error && (
            <p className={styles.Login__error}>
              <Icon
                name="error"
                size={16}
                className={styles.Login__errorIcon}
              />
              {error}
            </p>
          )}

          <FormButton
            type="submit"
            disabled={isSubmitting || !!errors.email || !!errors.password}
            text="Log in"
          />
        </div>

        <div className={styles.Login__messages}>
          <p>
            <Link
              className={styles.Login__messageLink}
              to="/forgot-password"
              state={formik.values.email}
            >
              Forgot password?
            </Link>
          </p>
          <p className={styles.Login__messagesRegistration}>
            Do not have an account?
            <Link className={styles.Login__messageLink} to="/register">
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </>
  );
};

export default Login;
