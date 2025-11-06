import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Setup Mock Service Worker for browser
export const worker = setupWorker(...handlers);