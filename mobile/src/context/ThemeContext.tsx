import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { vars } from 'nativewind';

type Theme = 'dark' | 'paper';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@BikeService:theme';

// Define our color palettes
export const themes = {
    dark: {
        '--color-background': '#000000',
        '--color-surface': '#171717', // neutral-900
        '--color-surface-highlight': '#262626', // neutral-800
        '--color-text': '#FFFFFF',
        '--color-text-secondary': '#A3A3A3', // neutral-400
        '--color-border': '#262626', // neutral-800
    },
    paper: {
        '--color-background': '#F8F5F2', // Warm Cream
        '--color-surface': '#FFFFFF', // White
        '--color-surface-highlight': '#F3F4F6', // gray-100
        '--color-text': '#2D2A26', // Soft Charcoal
        '--color-text-secondary': '#6B7280', // gray-500
        '--color-border': '#E5E7EB', // gray-200
    }
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const deviceColorScheme = useDeviceColorScheme();
    const [theme, setThemeState] = useState<Theme>('dark');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Load saved theme or fallback to device preference (defaulting to dark if unsure)
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (savedTheme === 'dark' || savedTheme === 'paper') {
                    setThemeState(savedTheme);
                } else {
                    // Default to dark for now as it's the original design
                    setThemeState('dark');
                }
            } catch (e) {
                console.error('Failed to load theme', e);
            } finally {
                setIsReady(true);
            }
        };
        loadTheme();
    }, []);

    useEffect(() => {
        // Apply theme variables globally using NativeWind's vars
        const currentThemeVars = themes[theme];
        vars(currentThemeVars);
    }, [theme]);

    const setTheme = async (newTheme: Theme) => {
        setThemeState(newTheme);
        await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'paper' : 'dark');
    };

    if (!isReady) return null; // Or a splash screen

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isDark: theme === 'dark' }}>
            <View style={vars(themes[theme])} className="flex-1">
                {children}
            </View>
        </ThemeContext.Provider>
    );
}

// Need to import View to wrap children for variables to cascade
import { View } from 'react-native';

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
