import { BrowserRouter as Router } from "react-router-dom";
import { Route, Routes } from "react-router";
import { LandingPage } from "./pages";

import classes from "./App.module.css";

export const App = () => {
  return (
    <Router>
      <div className={classes.container}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          {/*<Route path="/rally-export" element={<RallyExportPage />} />*/}
        </Routes>
      </div>
    </Router>
  );
};
