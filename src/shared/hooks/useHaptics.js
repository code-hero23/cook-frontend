import { useCallback } from 'react';

/**
 * useHaptics Hook
 * Provides a standardized way to trigger haptic feedback (vibration) on supported devices (Android).
 * 
 * Usage:
 * const { vibrateLight, vibrateMedium, vibrateSuccess } = useHaptics();
 */
const useHaptics = () => {
    const vibrate = useCallback((pattern) => {
        if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
            try {
                navigator.vibrate(pattern);
            } catch (e) {
                // Silently fail if vibration isn't supported or fails
            }
        }
    }, []);

    const vibrateLight = useCallback(() => vibrate(10), [vibrate]);
    const vibrateMedium = useCallback(() => vibrate(20), [vibrate]);
    const vibrateHeavy = useCallback(() => vibrate(50), [vibrate]);
    const vibrateSuccess = useCallback(() => vibrate([10, 30, 20]), [vibrate]);
    const vibrateError = useCallback(() => vibrate([50, 50, 50]), [vibrate]);

    return {
        vibrateLight,
        vibrateMedium,
        vibrateHeavy,
        vibrateSuccess,
        vibrateError
    };
};

export default useHaptics;
