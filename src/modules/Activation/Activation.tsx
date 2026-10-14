import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../components/AuthContext";
import { AxiosError } from "axios";
import Loader from "../shared/Loader/Loader.tsx";

const Activation = () => {
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const { activate } = useAuth();
  const { activationToken = "" } = useParams();

  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(3);

  useEffect(() => {
    if (!activationToken) {
      setError("Wrong activation link");
      setDone(true);

      return;
    }

    activate(activationToken)
      .catch((error: AxiosError<{ message?: string }>) => {
        setError(error.response?.data?.message ?? `Wrong activation link`);
      })
      .finally(() => setDone(true));
  }, []);

  useEffect(() => {
    if (!done || error) return;
    // 1. Таймер для зворотного відліку на екрані
    const countdownInterval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // 2. Таймер для перенаправлення через 3 секунди
    const redirectTimer = setTimeout(() => {
      navigate("/", { replace: true });
    }, 3000);

    // 3. Очищення таймерів при розмонтуванні компонента
    return () => {
      clearInterval(countdownInterval);
      clearTimeout(redirectTimer);
    };
  }, [done, error, navigate]);

  if (!done) {
    return <Loader />;
  }

  return (
    <>
      <h1 className="title">Account activation</h1>

      {error ? (
        <p className="notification is-danger is-light">{error}</p>
      ) : (
        <>
          <p className="notification is-success is-light">
            Your account is now active
          </p>
          <p>
            You will be automatically redirected to the profile in{" "}
            <strong>{secondsLeft}</strong> seconds...
          </p>
        </>
      )}
    </>
  );
};

export default Activation;
