import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { vars } from 'nativewind';
import { View } from 'react-native';

type Theme = 'dark' | 'paper' | 'system';

interface ThemeContextType {
    theme: Theme;
    resolvedTheme: 'dark' | 'paper';
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
    const [theme, setThemeState] = useState<Theme>('system');
    const [isReady, setIsReady] = useState(false);

    // Resolve 'system' to actual theme
    const resolvedTheme = theme === 'system'
        ? (deviceColorScheme === 'dark' ? 'dark' : 'paper')
        : theme;

    useEffect(() => {
        // Load saved theme or fallback to system
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (savedTheme === 'dark' || savedTheme === 'paper' || savedTheme === 'system') {
                    setThemeState(savedTheme as Theme);
                } else {
                    // Default to system if nothing saved
                    setThemeState('system');
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
        const currentThemeVars = themes[resolvedTheme];
        vars(currentThemeVars);
    }, [resolvedTheme]);

    const setTheme = async (newTheme: Theme) => {
        setThemeState(newTheme);
        await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    };

    const toggleTheme = () => {
        // Simple toggle for header button behavior: if dark -> paper, if paper -> dark
        // behavior for 'system' depends on what it currently resolves to
        const next = resolvedTheme === 'dark' ? 'paper' : 'dark';
        setTheme(next);
    };

    if (!isReady) return null;

    return (
        <ThemeContext.Provider value={{
            theme,
            resolvedTheme,
            toggleTheme,
            setTheme,
            isDark: resolvedTheme === 'dark'
        }}>
            <View style={vars(themes[resolvedTheme])} className="flex-1">
                {children}
            </View>
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
