import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface ModalInputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad' | 'number-pad';
    secureTextEntry?: boolean;
    multiline?: boolean;
    containerStyle?: any;
    labelStyle?: any;
    inputStyle?: any;
    formatValue?: (text: string) => string;
    maxLength?: number;
    error?: boolean;
}

export const ModalInput: React.FC<ModalInputProps> = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    secureTextEntry = false,
    multiline = false,
    containerStyle,
    labelStyle,
    inputStyle,
    formatValue,
    maxLength,
    error = false,
}) => {
    const { isDark } = useTheme();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const handleChangeText = (text: string) => {
        onChangeText(formatValue ? formatValue(text) : text);
    };

    return (
        <View style={[styles.container, containerStyle]}>
            <Text style={[
                styles.label,
                isDark && styles.labelDark,
                labelStyle,
                error && { color: '#EF4444' }
            ]}>
                {label}
            </Text>

            <View style={[
                styles.inputWrapper,
                isDark && styles.inputWrapperDark,
                inputStyle,
                error && { borderColor: '#EF4444', borderWidth: 1 }
            ]}>

                <TextInput
                    style={[
                        styles.input,
                        isDark && styles.inputDark,
                        multiline && styles.inputMultiline,
                    ]}
                    value={value}
                    onChangeText={handleChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    secureTextEntry={secureTextEntry && !isPasswordVisible}
                    multiline={multiline}
                    textAlignVertical={multiline ? 'top' : 'center'}
                    maxLength={maxLength}
                />

                {secureTextEntry && (
                    <Pressable
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        style={styles.eyeButton}
                        hitSlop={8}
                    >
                        {isPasswordVisible ? (
                            <EyeOff size={22} color={isDark ? '#9CA3AF' : '#6B7280'} />
                        ) : (
                            <Eye size={22} color={isDark ? '#9CA3AF' : '#6B7280'} />
                        )}
                    </Pressable>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontFamily: 'WorkSans_500Medium',
        color: '#374151',
        marginBottom: 8,
    },
    labelDark: {
        color: '#D1D5DB',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F0',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E6E5E0',
        paddingHorizontal: 16,
    },
    inputWrapperDark: {
        backgroundColor: '#262626',
        borderColor: '#404040',
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'WorkSans_400Regular',
        color: '#111827',
        paddingVertical: 14,
    },
    inputDark: {
        color: '#FFFFFF',
    },
    inputMultiline: {
        minHeight: 120,
        textAlignVertical: 'top',
        paddingTop: 14,
    },
    eyeButton: {
        marginLeft: 12,
        padding: 4,
    },
});
