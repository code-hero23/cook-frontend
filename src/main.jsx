// Global Event & CustomEvent Polyfill for Safari and old browsers
(function () {
    if (typeof window === 'undefined') return;
    try {
        new CustomEvent('test');
        new Event('test');
    } catch (e) {
        const polyfill = function (event, params) {
            params = params || { bubbles: false, cancelable: false, detail: undefined };
            const evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        };
        polyfill.prototype = window.Event.prototype;
        window.CustomEvent = polyfill;
        window.Event = polyfill;
    }
})();

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <App />
        </GoogleOAuthProvider>
    </StrictMode>,
)
