import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleProp, ViewStyle, TextStyle, Platform } from 'react-native';

interface AutocompleteInputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    options: string[];
    onSelect: (option: string) => void;
    placeholder: string;
    filterMode?: 'startsWith' | 'includes';
    containerStyle?: StyleProp<ViewStyle>;
    inputStyle?: StyleProp<TextStyle>;
    labelStyle?: StyleProp<TextStyle>;
    placeholderTextColor?: string;
}

import { useTheme } from '../../context/ThemeContext';

export const AutocompleteInput = ({
    label,
    value,
    onChangeText,
    options,
    onSelect,
    placeholder,
    filterMode = 'includes',
    containerStyle,
    inputStyle,
    labelStyle,
    placeholderTextColor
}: AutocompleteInputProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const { isDark } = useTheme();
    const inputRef = React.useRef<TextInput>(null); // Use ref to control focus

    const filteredOptions = value
        ? options.filter(opt =>
            filterMode === 'startsWith'
                ? opt.toLowerCase().startsWith(value.toLowerCase())
                : opt.toLowerCase().includes(value.toLowerCase())
        )
        : [];

    const showDropdown = isFocused && value.length > 0 && filteredOptions.length > 0;

    return (
        <View
            className="mb-3"
            style={[
                containerStyle,
                { zIndex: showDropdown ? 50 : 0 } // Keep zIndex for iOS on parent to allow absolute child to overflow
            ]}
        >
            <Text
                className={`text-xs uppercase mb-2 tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                style={labelStyle}
            >
                {label}
            </Text>
            <TextInput
                ref={inputRef}
                placeholder={placeholder}
                placeholderTextColor={placeholderTextColor || (isDark ? "#6B7280" : "#9CA3AF")}
                className={`p-3 rounded-xl text-lg ${showDropdown ? 'rounded-b-none border-b-0' : ''} border ${isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-gray-100 border-gray-200 text-gray-900'}`}
                style={inputStyle}
                value={value}
                onChangeText={(text) => {
                    onChangeText(text);
                    if (text.length > 0 && !isFocused) {
                        setIsFocused(true);
                    }
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            />
            {showDropdown && (
                <View
                    className={`absolute top-full left-0 right-0 border border-t-0 rounded-b-xl max-h-64 overflow-hidden ${isDark ? 'bg-neutral-900 border-neutral-700' : 'bg-white border-gray-200'}`}
                    style={Platform.select({
                        ios: {
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.2,
                            shadowRadius: 8,
                            zIndex: 100 // Ensure it's very high
                        },
                        android: {
                            elevation: 50, // High elevation for Android
                            zIndex: 50
                        }
                    })}
                >
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled={true}
                        showsVerticalScrollIndicator={true}
                    >
                        {filteredOptions.slice(0, 20).map((item) => (
                            <TouchableOpacity
                                key={item}
                                onPress={() => {
                                    onSelect(item);
                                    // Delay hiding slightly to prevent touch-through to underlying elements
                                    // AND force blur to ensure keyboard dismisses and focus doesn't jump
                                    inputRef.current?.blur();
                                    setTimeout(() => setIsFocused(false), 50);
                                }}
                                className={`px-4 py-3 border-b ${isDark ? 'border-neutral-800' : 'border-gray-100'}`}
                            >
                                <Text className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};
