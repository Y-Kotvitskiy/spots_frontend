import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import App from "./App.tsx";
import RequireAuth from "./components/RequireAuth.tsx";
import PublicOnlyRoute from "./components/PublicOnlyRoute.tsx"; // Імпортуємо наш новий компонент
import Activation from "./modules/Activation";
// import Groups from "./modules/Groups";
import PersonalRoom from "./modules/PersonalRoom";
import AuthContainer from "./modules/AuthContainer";
import Login from "./modules/AuthContainer/Login";
import Registration from "./modules/AuthContainer/Registration";
import ForgotPassword from "./modules/AuthContainer/ForgotPassword";
import ResetPassword from "./modules/AuthContainer/ResetPassword/index.ts";
import { Provider } from "react-redux";
import store from "./store";
import { APIProvider } from "@vis.gl/react-google-maps";
import ProtectedLayout from "./modules/ProtectedLayout/ProtectedLayout.tsx";
import PlaceDetails from "./modules/PlaceDetails/PlaceDetails.tsx";
import Welcome from "./modules/AuthContainer/Welcome";

const Root = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_DEV_KEY as string;
  const hasToken = Boolean(localStorage.getItem("accessToken"));

  return (
    <APIProvider apiKey={apiKey}>
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route element={<App />}>
              <Route
                path="/"
                element={
                  <Navigate to={hasToken ? "/map" : "/welcome"} replace />
                }
              />

              <Route element={<PublicOnlyRoute />}>
                <Route path="/welcome" element={<Welcome />} />

                <Route element={<AuthContainer />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Registration />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route
                    path="/reset-password/:email/:jwt"
                    element={<ResetPassword />}
                  />
                </Route>
              </Route>

              <Route
                path="/activate/:activationToken"
                element={<Activation />}
              />

              {/* Захищені маршрути: сюди пускаємо ТІЛЬКИ залогінених */}
              <Route element={<RequireAuth />}>
                <Route element={<ProtectedLayout />}>
                  <Route index element={null} />
                  {/* Или заглушка, если на главной только карта */}
                  <Route path="/map" element={null} />
                  <Route path="/map/:id" element={null} />
                  {/* <Route path="/groups" element={<Groups />} /> */}
                  <Route path="/places/:id" element={<PlaceDetails />} />
                  <Route path="/personal-room" element={<PersonalRoom />} />
                </Route>
              </Route>

              {/* Будь-який невідомий шлях перенаправляємо за аналогією */}
              <Route
                path="*"
                element={
                  <Navigate to={hasToken ? "/map" : "/welcome"} replace />
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </Provider>
    </APIProvider>
  );
};

export default Root;
