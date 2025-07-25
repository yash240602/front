import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// By removing the import for './index.css', we ensure that the default
// Vite styles do not conflict with Material-UI's CssBaseline component,
// which is the correct way to manage global styles in an MUI project.

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  console.error("Failed to find the root element. Make sure your index.html has a div with id='root'.");
}
