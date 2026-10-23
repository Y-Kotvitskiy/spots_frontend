import type { AxiosError } from "axios";
import { useAuth } from "../../components/AuthContext.tsx";
import { useNavigate } from "react-router-dom";
import { usePageError } from "../hooks.ts";
import { useEffect } from "react";

const PersonalRoom = () => {
  const { currentUser, logout } = useAuth();
  const [error, setError] = usePageError("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!error) return;

    const timerId = setTimeout(() => {
      navigate("/");
    }, 3000);

    return () => {
      clearTimeout(timerId);
    };
  }, [navigate, error]);

  const handleLogout = () => {
    logout()
      .then(() => {
        navigate("/");
      })
      .catch((error: AxiosError<{ message?: string }>) => {
        setError(error.response?.data?.message ?? "");
      });
  };

  return (
    <main className="personal-room">
      <h1>Personal Room</h1>
      <dl>
        <dt>
          <strong>Username:</strong>
        </dt>
        <dd>{currentUser?.name}</dd>
        <dt>
          <strong>Email:</strong>
        </dt>
        <dd>{currentUser?.email}</dd>
      </dl>

      <button onClick={handleLogout}>Log out</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </main>
  );
};

export default PersonalRoom;
