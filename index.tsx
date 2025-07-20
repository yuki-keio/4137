
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Remove loading skeleton before mounting
const loadingSkeleton = rootElement.querySelector('.loading-skeleton');
if (loadingSkeleton) {
  loadingSkeleton.remove();
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
