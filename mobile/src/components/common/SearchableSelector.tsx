import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    Modal,
    FlatList,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Search, X, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

interface SearchableSelectorProps {
    label: string;
    value: string;
    onSelect: (value: string) => void;
    options: string[];
    placeholder?: string;
    searchPlaceholder?: string;
    containerStyle?: any;
    inputStyle?: any;
    labelStyle?: any;
    placeholderTextColor?: string;
}

export const SearchableSelector: React.FC<SearchableSelectorProps> = ({
    label,
    value,
    onSelect,
    options,
    placeholder,
    searchPlaceholder,
    containerStyle,
    inputStyle,
    labelStyle,
    placeholderTextColor = '#9CA3AF'
}) => {
    const { isDark } = useTheme();
    const { t } = useLanguage();
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredOptions = useMemo(() => {
        if (!searchQuery) return options;
        return options.filter(option =>
            option.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [options, searchQuery]);

    const handleSelect = (item: string) => {
        onSelect(item);
        setModalVisible(false);
        setSearchQuery('');
    };

    const handleClose = () => {
        setModalVisible(false);
        setSearchQuery('');
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Text style={[styles.label, isDark && styles.labelDark, labelStyle]}>
                    {label}
                </Text>
            )}

            <Pressable
                onPress={() => setModalVisible(true)}
                style={[
                    styles.selectorField,
                    isDark ? styles.selectorFieldDark : styles.selectorFieldLight,
                    inputStyle
                ]}
            >
                <Text
                    style={[
                        styles.selectedValue,
                        isDark ? styles.textDark : styles.textLight,
                        !value && { color: placeholderTextColor }
                    ]}
                    numberOfLines={1}
                >
                    {value || placeholder || t('common.select') || 'Select...'}
                </Text>
                <ChevronRight size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </Pressable>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={false}
                onRequestClose={handleClose}
            >
                <SafeAreaView style={[styles.modalContainer, isDark ? styles.modalContainerDark : styles.modalContainerLight]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, isDark ? styles.textDark : styles.textLight]}>
                            {label}
                        </Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <X size={24} color={isDark ? '#FFFFFF' : '#000000'} />
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.searchContainer, isDark ? styles.searchContainerDark : styles.searchContainerLight]}>
                        <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
                        <TextInput
                            style={[styles.searchInput, isDark ? styles.textDark : styles.textLight]}
                            placeholder={searchPlaceholder || t('common.search') || 'Search...'}
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                            autoCorrect={false}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <X size={18} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>

                    <FlatList
                        data={filteredOptions}
                        keyExtractor={(item, index) => `${item}-${index}`}
                        keyboardShouldPersistTaps="always"
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.optionItem, isDark ? styles.borderDark : styles.borderLight]}
                                onPress={() => handleSelect(item)}
                            >
                                <Text style={[styles.optionText, isDark ? styles.textDark : styles.textLight, item === value && styles.selectedOptionText]}>
                                    {item}
                                </Text>
                                {item === value && (
                                    <View style={styles.selectionDot} />
                                )}
                            </TouchableOpacity>
                        )}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={[styles.emptyText, isDark ? styles.textSubDark : styles.textSubLight]}>
                                    {t('common.no_results') || 'No results found'}
                                </Text>
                            </View>
                        }
                    />
                </SafeAreaView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    label: {
        fontSize: 12,
        textTransform: 'uppercase',
        marginBottom: 8,
        letterSpacing: 0.5,
        fontFamily: 'Outfit_700Bold',
        color: '#6B7280',
    },
    labelDark: {
        color: '#9CA3AF',
    },
    selectorField: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 18,
        borderRadius: 14,
        borderWidth: 1,
    },
    selectorFieldLight: {
        backgroundColor: '#FDFCF8',
        borderColor: '#E6E5E0',
    },
    selectorFieldDark: {
        backgroundColor: '#1C1C1E',
        borderColor: '#3A3A3C',
    },
    selectedValue: {
        fontSize: 16,
        fontFamily: 'WorkSans_400Regular',
        flex: 1,
    },
    textLight: {
        color: '#1C1C1E',
    },
    textDark: {
        color: '#E5E5E0',
    },
    textSubLight: {
        color: '#666660',
    },
    textSubDark: {
        color: '#A1A1AA',
    },
    modalContainer: {
        flex: 1,
    },
    modalContainerLight: {
        backgroundColor: '#FDFCF8',
    },
    modalContainerDark: {
        backgroundColor: '#1C1C1E',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: Platform.OS === 'ios' ? 0 : 0.5,
        borderBottomColor: '#3A3A3C',
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'Outfit_700Bold',
    },
    closeButton: {
        padding: 5,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginVertical: 15,
        paddingHorizontal: 15,
        paddingVertical: Platform.OS === 'ios' ? 12 : 5,
        borderRadius: 12,
        borderWidth: 1,
    },
    searchContainerLight: {
        backgroundColor: '#F5F5F0',
        borderColor: '#E6E5E0',
    },
    searchContainerDark: {
        backgroundColor: '#2C2C2E',
        borderColor: '#3A3A3C',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'WorkSans_400Regular',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    optionItem: {
        paddingVertical: 18,
        borderBottomWidth: 0.5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    borderLight: {
        borderBottomColor: '#E6E5E0',
    },
    borderDark: {
        borderBottomColor: '#3A3A3C',
    },
    optionText: {
        fontSize: 16,
        fontFamily: 'WorkSans_400Regular',
    },
    selectedOptionText: {
        fontFamily: 'WorkSans_600SemiBold',
        color: '#BA4444', // Highlight selected
    },
    selectionDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#BA4444',
    },
    emptyContainer: {
        paddingTop: 50,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        fontFamily: 'WorkSans_400Regular',
    }
});
