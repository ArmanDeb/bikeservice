import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';

interface AutocompleteInputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    options: string[];
    onSelect: (option: string) => void;
    placeholder: string;
    filterMode?: 'startsWith' | 'includes';
}

import { useTheme } from '../../context/ThemeContext';

export const AutocompleteInput = ({
    label,
    value,
    onChangeText,
    options,
    onSelect,
    placeholder,
    filterMode = 'includes'
}: AutocompleteInputProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const { isDark } = useTheme();

    const filteredOptions = value
        ? options.filter(opt =>
            filterMode === 'startsWith'
                ? opt.toLowerCase().startsWith(value.toLowerCase())
                : opt.toLowerCase().includes(value.toLowerCase())
        )
        : [];

    const showDropdown = isFocused && value.length > 0 && filteredOptions.length > 0;

    return (
        <View className="mb-3 z-10">
            <Text className={`text-xs uppercase mb-2 tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</Text>
            <TextInput
                placeholder={placeholder}
                placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                className={`p-3 rounded-xl text-lg ${showDropdown ? 'rounded-b-none border-b-0' : ''} border ${isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-gray-100 border-gray-200 text-gray-900'}`}
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
                <View className={`border border-t-0 rounded-b-xl max-h-64 overflow-hidden ${isDark ? 'bg-neutral-900 border-neutral-700' : 'bg-white border-gray-200'}`}>
                    <FlatList
                        data={filteredOptions.slice(0, 20)}
                        keyExtractor={item => item}
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled={true}
                        showsVerticalScrollIndicator={true}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => {
                                    onSelect(item);
                                    setIsFocused(false);
                                }}
                                className={`px-4 py-3 border-b ${isDark ? 'border-neutral-800' : 'border-gray-100'}`}
                            >
                                <Text className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{item}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}
        </View>
    );
};
