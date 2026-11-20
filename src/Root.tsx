import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { APIProvider } from "@vis.gl/react-google-maps";

import App from "./App.tsx";
import RequireAuth from "./components/RequireAuth.tsx";
import Activation from "./modules/Activation";
// import Groups from "./modules/Groups";
import PersonalRoom from "./modules/PersonalRoom";
import AuthContainer from "./modules/AuthContainer";
import Login from "./modules/AuthContainer/Login";
import Registration from "./modules/AuthContainer/Registration";
import ForgotPassword from "./modules/AuthContainer/ForgotPassword";
import ResetPassword from "./modules/AuthContainer/ResetPassword/index.ts";
import store from "./store";
import ProtectedLayout from "./modules/ProtectedLayout/ProtectedLayout.tsx";
import PlaceDetails from "./modules/PlaceDetails/PlaceDetails.tsx";
import Welcome from "./modules/AuthContainer/Welcome";

const Root = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_PLACE_KEY as string;

  return (
    <APIProvider apiKey={apiKey}>
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

              {/* Защищённые маршруты: только для авторизованных */}
              <Route element={<RequireAuth />}>
                <Route element={<ProtectedLayout />}>
                  <Route index element={null} />
                  <Route path="/map" element={null} />
                  <Route path="/map/:id" element={null} />
                  {/* <Route path="/groups" element={<Groups />} /> */}
                  <Route path="/places/:id" element={<PlaceDetails />} />
                  <Route path="/personal-room" element={<PersonalRoom />} />
                </Route>
              </Route>

              <Route path="/" element={<Welcome />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </Provider>
    </APIProvider>
  );
};

export default Root;
