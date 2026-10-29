import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import './index.css';
import App from './App.jsx';
import { MetaProvider, ToastProvider } from './lib/context.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <MetaProvider>
        <App />
      </MetaProvider>
    </ToastProvider>
  </StrictMode>,
);
