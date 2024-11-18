import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Dashboard from "./pages/dashboard";
import LoginPage from "./pages/login";
import Entry from './pages/entry';
import JournalEntryPage from './pages/JournalEntryPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new-entry" element={<Entry />} />
        <Route path="/entry/:id" element={<JournalEntryPage />} />
      </Routes>
    </Router>
  );
};

export default App;
