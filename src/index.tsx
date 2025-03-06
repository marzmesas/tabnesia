import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

console.log('Extension script loading...');

const container = document.getElementById('root');
if (!container) {
  console.error('Failed to find root element');
} else {
  console.log('Root element found, rendering app...');
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('App rendered');
} 