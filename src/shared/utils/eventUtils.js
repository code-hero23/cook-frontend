/**
 * Safe Event Dispatcher to avoid 'Illegal constructor' errors in Safari and old browsers.
 * Tries the modern CustomEvent constructor first, then falls back to document.createEvent.
 * 
 * @param {string} name - Event name
 * @param {object} detail - Custom data to pass with the event
 */
export const dispatchSafeEvent = (name, detail = {}) => {
    let event;
    try {
        // Try modern CustomEvent constructor (Safest on Chrome/Firefox/Modern Safari)
        event = new CustomEvent(name, { detail, bubbles: true, cancelable: true });
    } catch (e) {
        // Fallback to document.createEvent for older browsers/Safari where CustomEvent exists but is not a constructor
        try {
            if (typeof document !== 'undefined' && document.createEvent) {
                event = document.createEvent('CustomEvent');
                event.initCustomEvent(name, true, true, detail);
            }
        } catch (e2) {
            // Last resort: basic Event if CustomEvent fails completely
            try {
                event = document.createEvent('Event');
                event.initEvent(name, true, true);
            } catch (e3) {
                console.warn(`Failed to dispatch event: ${name}`, e3);
                return;
            }
        }
    }
    
    if (event && typeof window !== 'undefined') {
        window.dispatchEvent(event);
    }
};
