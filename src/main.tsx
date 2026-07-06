import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import { BundleProvider } from './state/BundleContext';
import { loadCatalog } from './data/dataAccess';
import './styles/index.css';

// Fetch the catalog from the backend API before rendering, so the app runs on
// API-served data. loadCatalog() falls back to the bundled JSON if the API is
// unreachable, so a clean clone always works.
loadCatalog().finally(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <BundleProvider>
        <App />
      </BundleProvider>
    </React.StrictMode>,
  );
});
