import React from 'react';
import { View, Text, Modal, ActivityIndicator, StyleSheet, Image, Dimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

const { width } = Dimensions.get('window');

interface LoadingModalProps {
    visible: boolean;
    message?: string;
}

export const LoadingModal: React.FC<LoadingModalProps> = ({ visible, message }) => {
    const { isDark } = useTheme();
    const { language } = useLanguage();

    const defaultMessage = language === 'fr'
        ? 'Analyse de votre facture...'
        : 'Analyzing your invoice...';

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={[styles.container, isDark && styles.containerDark]}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../../assets/logo.png')}
                            style={styles.logo}
                        />
                    </View>

                    <ActivityIndicator size="large" color="#FAC902" />

                    <Text style={[styles.message, isDark && styles.messageDark]}>
                        {message || defaultMessage}
                    </Text>
                    <Text style={[styles.subtext, isDark && styles.subtextDark]}>
                        {language === 'fr'
                            ? 'L\'IA extrait les données pour vous'
                            : 'AI is extracting data for you'}
                    </Text>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(28, 28, 30, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        backgroundColor: '#FDFCF8',
        padding: 30,
        borderRadius: 32,
        alignItems: 'center',
        width: '85%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    containerDark: {
        backgroundColor: '#1C1C1E',
    },
    logoContainer: {
        width: width * 0.3,
        height: width * 0.3,
        backgroundColor: '#1C1C1E',
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2C2C2E',
    },
    logo: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    message: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 20,
        color: '#1C1C1E',
        marginTop: 10,
        textAlign: 'center',
    },
    messageDark: {
        color: '#FDFCF8',
    },
    subtext: {
        fontFamily: 'WorkSans_400Regular',
        fontSize: 14,
        color: '#666660',
        marginTop: 8,
        textAlign: 'center',
    },
    subtextDark: {
        color: '#9CA3AF',
    },
});
