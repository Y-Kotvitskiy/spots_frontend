import { BrowserRouter, Route, Routes } from "react-router-dom";

import App from "./App.tsx";
import AuthProvider from "./components/AuthContext.tsx";
import RequireAuth from "./components/RequireAuth.tsx";
import Activation from "./modules/Activation";
import Groups from "./modules/Groups";
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

const Root = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_DEV_KEY as string;

  return (
    <APIProvider apiKey={apiKey}>
      <AuthProvider>
        <Provider store={store}>
          <BrowserRouter>
            <Routes>
              <Route element={<App />}>
                <Route element={<AuthContainer />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Registration />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route
                    path="/reset-password/:email/:jwt"
                    element={<ResetPassword />}
                  />
                </Route>
                <Route
                  path="/activate/:activationToken"
                  element={<Activation />}
                />

                {/* Защищенные маршруты */}
                <Route element={<RequireAuth />}>
                  <Route element={<ProtectedLayout />}>
                    <Route index element={null} />{" "}
                    {/* Или заглушка, если на главной только карта */}
                    <Route path="/map" element={null} />
                    <Route path="/groups" element={<Groups />} />
                    <Route path="/personal-room" element={<PersonalRoom />} />
                  </Route>
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </Provider>
      </AuthProvider>
    </APIProvider>
  );
};

export default Root;
