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
            <Text className="text-text-secondary text-xs uppercase mb-2 tracking-wider">{label}</Text>
            <TextInput
                placeholder={placeholder}
                placeholderTextColor="#9CA3AF"
                className={`bg-surface-highlight text-text p-3 rounded-xl text-lg ${showDropdown ? 'rounded-b-none border-b-0' : ''} border border-border`}
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
                <View className="bg-surface border border-border border-t-0 rounded-b-xl max-h-64 overflow-hidden">
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
                                className="px-4 py-3 border-b border-border/50"
                            >
                                <Text className="text-text text-base">{item}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}
        </View>
    );
};
