import { BrowserRouter, Route, Routes } from "react-router-dom";
import Map from "./modules/Map/Map.tsx";
import App from "./App.tsx";
import Login from "./modules/Login/index.ts";
import Registration from "./modules/Registration/index.ts";

import AuthProvider from "./components/AuthContext.tsx";
import RequireAuth from "./components/RequireAuth.tsx";
import Activation from "./modules/Activation/index.ts";
import Groups from "./modules/Groups/index.ts";
import PersonalRoom from "./modules/PersonalRoom/index.ts";

const Root = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<App />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registration />} />
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
