import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { apolloClient } from '@/lib/apollo';
import { ApolloProvider } from '@apollo/client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import './lib/i18n';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ApolloProvider client={apolloClient}>
          <App />
          <Toaster />
        </ApolloProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
