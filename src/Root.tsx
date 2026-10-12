import { BrowserRouter, Route, Routes } from "react-router-dom";
import Map from "./modules/Map/Map.tsx";
import App from "./App.tsx";

const Root = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Map />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default Root;
