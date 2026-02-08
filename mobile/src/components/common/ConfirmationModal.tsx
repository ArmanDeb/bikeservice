import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

interface ConfirmationModalProps {
    visible: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel?: () => void;
    onSecondary?: () => void;
    confirmText?: string;
    cancelText?: string;
    secondaryText?: string;
    variant?: 'danger' | 'default';
}

export const ConfirmationModal = ({
    visible,
    title,
    description,
    onConfirm,
    onCancel,
    onSecondary,
    confirmText,
    cancelText,
    secondaryText,
    variant = 'default'
}: ConfirmationModalProps) => {
    const { isDark } = useTheme();
    const { t } = useLanguage();

    const handleCancel = () => {
        if (onCancel) onCancel();
    }

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
            <Pressable style={styles.overlay} onPress={handleCancel}>
                <Pressable onPress={e => e.stopPropagation()} style={[
                    styles.content,
                    isDark ? styles.contentDark : styles.contentLight
                ]}>
                    <Text style={[
                        styles.title,
                        isDark ? styles.titleDark : styles.titleLight
                    ]}>
                        {title}
                    </Text>
                    <Text style={[
                        styles.description,
                        isDark ? styles.descriptionDark : styles.descriptionLight
                    ]}>
                        {description}
                    </Text>

                    <View style={[
                        styles.actionsContainer,
                        onSecondary ? styles.actionsVertical : styles.actionsHorizontal
                    ]}>
                        {onCancel && (
                            <Pressable onPress={onCancel} style={[styles.button, onSecondary && styles.buttonVertical]}>
                                <Text style={[
                                    styles.buttonText,
                                    isDark ? styles.textDark : styles.textLight
                                ]}>
                                    {cancelText || t('common.cancel')}
                                </Text>
                            </Pressable>
                        )}
                        {onSecondary && (
                            <Pressable onPress={onSecondary} style={[styles.button, styles.buttonVertical]}>
                                <Text style={[
                                    styles.buttonText,
                                    isDark ? styles.textDark : styles.textLight
                                ]}>
                                    {secondaryText}
                                </Text>
                            </Pressable>
                        )}
                        <Pressable
                            onPress={onConfirm}
                            style={[styles.button, onSecondary && styles.buttonVertical]}
                        >
                            <Text style={[
                                styles.buttonText,
                                variant === 'danger' ? styles.dangerText : (isDark ? styles.textDark : styles.textLight)
                            ]}>
                                {confirmText || t('common.confirm')}
                            </Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    content: {
        width: '100%',
        borderRadius: 20,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    contentLight: {
        backgroundColor: '#FFFFFF',
    },
    contentDark: {
        backgroundColor: '#2C2C2E',
    },
    title: {
        fontSize: 20,
        fontFamily: 'Outfit_700Bold',
        marginBottom: 8,
        textAlign: 'right',
    },
    titleLight: {
        color: '#1C1C1E',
    },
    titleDark: {
        color: '#E5E5E0',
    },
    description: {
        fontSize: 16,
        fontFamily: 'WorkSans_400Regular',
        marginBottom: 24,
        lineHeight: 22,
        textAlign: 'right',
    },
    descriptionLight: {
        color: '#666660',
    },
    descriptionDark: {
        color: '#9CA3AF',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 24,
        flexWrap: 'wrap',
    },
    actionsContainer: {
        width: '100%',
    },
    actionsHorizontal: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 24,
        flexWrap: 'wrap',
    },
    actionsVertical: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 12,
    },
    button: {
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    buttonVertical: {
        alignSelf: 'flex-end',
    },
    buttonText: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 16,
        textAlign: 'right',
    },
    textLight: {
        color: '#1C1C1E',
    },
    textDark: {
        color: '#E5E5E0',
    },
    dangerText: {
        color: '#EF4444',
    }
});

