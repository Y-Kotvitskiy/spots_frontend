import { BrowserRouter, Route, Routes } from "react-router-dom";
import Map from "./modules/Map/Map.tsx";
import App from "./App.tsx";

import AuthProvider from "./components/AuthContext.tsx";
import RequireAuth from "./components/RequireAuth.tsx";
import Activation from "./modules/Activation";
import Groups from "./modules/Groups";
import PersonalRoom from "./modules/PersonalRoom";
import AuthContainer from "./modules/AuthContainer";
import Login from "./modules/AuthContainer/Login";
import Registration from "./modules/AuthContainer/Registration";

const Root = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<App />}>
            <Route element={<AuthContainer />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Registration />} />
            </Route>
            <Route path="/activate/:activationToken" element={<Activation />} />
            <Route element={<RequireAuth />}>
              <Route index element={<Map />} />
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
