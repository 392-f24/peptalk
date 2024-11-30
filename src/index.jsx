import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { PepProvider } from './utilities/context';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <PepProvider>
      <App />
    </PepProvider>
  </React.StrictMode>
);
