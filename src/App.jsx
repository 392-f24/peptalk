import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PepProvider as PepProvider } from './utilities/context';
import Dashboard from "./pages/dashboard";
import LoginPage from "./pages/login";
import Entry from './pages/entry';
import JournalEntryPage from './pages/JournalEntryPage';

const App = () => {
  return (
    <PepProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/new-entry" element={<Entry />} />
          <Route path="/entry/:id" element={<JournalEntryPage />} />
        </Routes>
      </Router>
    </PepProvider>
  );
};

export default App;