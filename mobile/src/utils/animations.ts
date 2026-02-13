import {
    WithSpringConfig,
    WithTimingConfig,
    Easing,
    withSequence,
    withTiming,
    SharedValue,
} from 'react-native-reanimated';

// Spring config for entrance animations (logo, titles, buttons)
// Slightly underdamped for a natural, lively feel without excessive bounce
export const SPRING_ENTRANCE: WithSpringConfig = {
    damping: 18,
    stiffness: 120,
    mass: 1,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
};

// Spring config for subtle micro-interactions (button presses, dot transitions)
// More damped = snappier, less bouncy
export const SPRING_SNAPPY: WithSpringConfig = {
    damping: 20,
    stiffness: 300,
    mass: 0.8,
};

// Timing config for fades
export const FADE_IN_CONFIG: WithTimingConfig = {
    duration: 400,
    easing: Easing.out(Easing.cubic),
};

export const FADE_OUT_CONFIG: WithTimingConfig = {
    duration: 200,
    easing: Easing.in(Easing.cubic),
};

// Stagger delay between consecutive elements (in ms)
export const STAGGER_DELAY = 80;

// Standard translate distance for slide-up entrances
export const ENTRANCE_TRANSLATE_Y = 24;

// Horizontal shake sequence for validation errors
export function triggerShake(shakeValue: SharedValue<number>) {
    'worklet';
    shakeValue.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(0, { duration: 50 }),
    );
}
