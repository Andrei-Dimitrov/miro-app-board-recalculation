import { HashRouter as Router } from "react-router-dom";
import { Route, Routes } from "react-router";
import { LandingPage } from "./pages";

import classes from "./App.module.css";

export const App = () => {
  return (
    <Router>
      <div className={classes.container}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/export" element={<h1>Not implemented</h1>} />
        </Routes>
      </div>
    </Router>
  );
};
