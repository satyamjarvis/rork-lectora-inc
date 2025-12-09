import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';

// Default translations for error boundary
// These are in English as fallback, but the ErrorBoundary will use its own defaults
const defaultTranslations = {
  title: 'Something went wrong',
  message: 'The app encountered an unexpected error. Please try again.',
  retry: 'Retry',
  technicalDetails: 'Technical details:',
};

export function ErrorBoundaryWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary translations={defaultTranslations}>
      {children}
    </ErrorBoundary>
  );
}

