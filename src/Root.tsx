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
import GoogleMap from "./modules/GoogleMap";

const Root = () => {
  return (
    <AuthProvider>
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
            <Route path="/activate/:activationToken" element={<Activation />} />
            <Route element={<RequireAuth />}>
              <Route index element={<GoogleMap />} />
              <Route path="/map" element={<GoogleMap />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/personal-room" element={<PersonalRoom />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default Root;
