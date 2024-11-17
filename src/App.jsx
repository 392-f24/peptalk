import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Search, BookmarkPlus, BookmarkCheck, ChevronLeft, ChevronRight, X, Plus } from 'lucide-react';

import Dashboard from "./pages/dashboard";
import LoginPage from "./pages/login";
import Entry from './pages/entry';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new-entry" element={<Entry />} />
      </Routes>
    </Router>
  );
};

export default App;