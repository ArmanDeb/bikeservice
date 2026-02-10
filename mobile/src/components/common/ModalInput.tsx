import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TextInput,
    TouchableOpacity,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Keyboard
} from 'react-native';
import { X, Check, Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface ModalInputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
    secureTextEntry?: boolean;
    multiline?: boolean;
    containerStyle?: any;
    formatValue?: (text: string) => string;
}

export const ModalInput: React.FC<ModalInputProps> = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    secureTextEntry = false,
    multiline = false,
    containerStyle,
    formatValue,
}) => {
    const { isDark } = useTheme();
    const [isVisible, setIsVisible] = useState(false);
    const [tempValue, setTempValue] = useState(value);
    const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

    useEffect(() => {
        setTempValue(value);
    }, [value, isVisible]);

    const handleSave = () => {
        onChangeText(tempValue);
        setIsVisible(false);
    };

    const handleCancel = () => {
        setTempValue(value);
        setIsVisible(false);
    };

    return (
        <View style={containerStyle} className="mb-6">
            <Text className={`text-base font-work-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {label}
            </Text>

            <TouchableOpacity
                onPress={() => setIsVisible(true)}
                activeOpacity={0.7}
                className={`w-full p-4 rounded-xl border ${isDark
                    ? 'bg-neutral-800 border-neutral-700'
                    : 'bg-[#F5F5F0] border-[#E6E5E0]'
                    }`}
            >
                <Text
                    className={`text-lg font-work-regular ${value
                        ? (isDark ? 'text-white' : 'text-gray-900')
                        : (isDark ? 'text-gray-500' : 'text-gray-400')
                        }`}
                    numberOfLines={1}
                >
                    {secureTextEntry && !isPasswordVisible && value
                        ? '•'.repeat(value.length)
                        : (value || placeholder || '')}
                </Text>
            </TouchableOpacity>

            <Modal
                visible={isVisible}
                transparent
                animationType="fade"
                onRequestClose={handleCancel}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1 justify-center items-center bg-black/50 px-4"
                >
                    <Pressable
                        className="absolute inset-0"
                        onPress={handleCancel}
                    />
                    <View
                        className={`w-full max-w-sm rounded-[20px] p-6 shadow-xl ${isDark ? 'bg-neutral-900' : 'bg-white'
                            }`}
                    >
                        {/* Header */}
                        <Text
                            className={`text-center text-xl font-work-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'
                                }`}
                        >
                            {label}
                        </Text>

                        {/* Input Area */}
                        <View
                            className={`flex-row items-center rounded-xl px-4 py-3 mb-6 border ${isDark
                                ? 'bg-neutral-800 border-neutral-700'
                                : 'bg-gray-50 border-gray-200'
                                }`}
                        >
                            <TextInput
                                className={`flex-1 text-lg font-work-regular ${isDark ? 'text-white' : 'text-gray-900'
                                    } ${multiline ? 'h-32 text-top' : ''}`}
                                value={tempValue}
                                onChangeText={(text) => {
                                    setTempValue(formatValue ? formatValue(text) : text);
                                }}
                                placeholder={placeholder}
                                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                                keyboardType={keyboardType}
                                secureTextEntry={secureTextEntry && !isPasswordVisible}
                                multiline={multiline}
                                autoFocus
                                textAlignVertical={multiline ? 'top' : 'center'}
                                onSubmitEditing={!multiline ? handleSave : undefined}
                            />

                            {secureTextEntry && (
                                <TouchableOpacity
                                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                                    className="ml-3 p-1"
                                >
                                    {isPasswordVisible ? (
                                        <EyeOff size={22} color={isDark ? '#9CA3AF' : '#6B7280'} />
                                    ) : (
                                        <Eye size={22} color={isDark ? '#9CA3AF' : '#6B7280'} />
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Actions */}
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={handleCancel}
                                className={`flex-1 flex-row justify-center items-center py-4 rounded-xl border ${isDark
                                    ? 'bg-neutral-800 border-neutral-700'
                                    : 'bg-gray-100 border-gray-200'
                                    }`}
                            >
                                <X size={20} color={isDark ? '#E5E7EB' : '#374151'} />
                                <Text className={`ml-2 font-work-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'
                                    }`}>
                                    Annuler
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleSave}
                                className="flex-1 flex-row justify-center items-center py-4 rounded-xl bg-[#1C1C1E]"
                            >
                                <Check size={20} color="#FFFFFF" />
                                <Text className="ml-2 font-work-semibold text-white">
                                    Enregistrer
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};
