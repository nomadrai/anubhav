import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { JourneyProvider } from './journey/JourneyContext';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(<StrictMode><JourneyProvider><App /></JourneyProvider></StrictMode>);
