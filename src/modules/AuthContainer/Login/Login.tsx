import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useFormik, type FormikErrors, type FormikHelpers } from "formik";
import { AxiosError } from "axios";

import styles from "./Login.module.scss";
import { useAuth } from "@/components/AuthContext";
import { usePageError } from "@/modules/hooks.ts";
import { validateEmail, validatePassword } from "@/modules/utils.ts";
import FormField from "../FormField";
import FormButton from "../FormButton/FormButton.tsx";

interface FormValues {
  email: string;
  password: string;
}

type LoginErrors = AxiosError<{
  errors?: { email?: string; password?: string };
  message: string;
}>;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [error, setError] = usePageError("");
  const { login, isChecked, currentUser } = useAuth();

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

      try {
        await login(values.email, values.password);
        const state = location.state as { from?: Location };
        navigate(state.from?.pathname ?? "/");
      } catch (err) {
        const error = err as LoginErrors;
        if (!error.response?.data) return;
        const { errors, message } = error.response.data;

        setFieldError("email", errors?.email);
        setFieldError("password", errors?.password);

        setError(message ?? "");
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
            id="password"
            placeholder="*******"
            rightIcon="fa-lock"
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
          {error && <p className={styles.Login__error}>{error}</p>}
        </div>
      </form>
    </>
  );
};

export default Login;
