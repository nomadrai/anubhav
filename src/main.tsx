import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { JourneyProvider } from './journey/JourneyContext';
import './styles/index.css';
import { registerSW } from 'virtual:pwa-register';

// Static app shell only; narration is loaded/cached later, after a Listen gesture.
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(<StrictMode><JourneyProvider><App /></JourneyProvider></StrictMode>);
