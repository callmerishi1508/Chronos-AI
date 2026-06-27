import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import ErrorBoundary from './components/ErrorBoundary';

import { MotionConfig } from "motion/react";

import { AIProviderProvider } from './context/AIProviderContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AIProviderProvider>
        <MotionConfig reducedMotion="user">
          <App />
        </MotionConfig>
      </AIProviderProvider>
    </ErrorBoundary>
  </StrictMode>,
);
