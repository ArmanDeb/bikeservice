import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Switch, StatusBar, Alert, Linking, Modal, FlatList, StyleSheet, Pressable } from 'react-native'
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage, Language } from '../../src/context/LanguageContext';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { LAST_SYNC_KEY } from '../../src/services/SyncService';
import { database } from '../../src/database';
import { ConfirmationModal } from '../../src/components/common/ConfirmationModal';
import { sync } from '../../src/services/SyncService';
import {
    User, Globe, Moon, Sun, BookOpen, LogOut, Bug, Lightbulb, Trash2, Check, Cloud, Bell, ChevronRight, Info,
    Shield, FileText, RefreshCw
} from 'lucide-react-native';

export default function SettingsScreen() {
    const { user, signOut, deleteAccount } = useAuth();
    const { theme, toggleTheme, isDark, setTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const router = useRouter();
    const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [languageModalVisible, setLanguageModalVisible] = useState(false);
    const [themeModalVisible, setThemeModalVisible] = useState(false);

    // Alert state
    const [alertVisible, setAlertVisible] = useState(false)
    const [alertTitle, setAlertTitle] = useState('')
    const [alertMessage, setAlertMessage] = useState('')
    const [alertOnConfirm, setAlertOnConfirm] = useState<(() => void) | undefined>()
    const [alertConfirmText, setAlertConfirmText] = useState<string | undefined>()
    const [alertVariant, setAlertVariant] = useState<'default' | 'danger'>('default')
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            await sync();
            const now = Date.now();
            setLastSyncTime(now);
            await AsyncStorage.setItem(LAST_SYNC_KEY, now.toString());
        } catch (error: any) {
            showAlert(t('alert.error'), t('settings.sync_error') + ': ' + error.message);
        } finally {
            setIsSyncing(false);
        }
    };

    const openLink = async (url: string) => {
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                showAlert(t('alert.error'), t('settings.link_error'));
            }
        } catch (error) {
            showAlert(t('alert.error'), t('settings.link_error'));
        }
    };

    const showAlert = (
        title: string,
        message: string,
        options?: {
            onConfirm?: () => void;
            confirmText?: string;
            variant?: 'default' | 'danger';
        }
    ) => {
        setAlertTitle(title)
        setAlertMessage(message)
        setAlertOnConfirm(() => options?.onConfirm || (() => setAlertVisible(false)))
        setAlertConfirmText(options?.confirmText)
        setAlertVariant(options?.variant || 'default')
        setAlertVisible(true)
    }

    // Load last sync time on mount and refresh periodically
    useEffect(() => {
        const loadLastSync = async () => {
            const stored = await AsyncStorage.getItem(LAST_SYNC_KEY);
            if (stored) {
                setLastSyncTime(parseInt(stored, 10));
            }
        };

        loadLastSync();

        // Refresh every 30 seconds to update relative time display
        const interval = setInterval(loadLastSync, 30000);
        return () => clearInterval(interval);
    }, []);

    const iconColor = isDark ? '#E5E5E0' : '#1C1C1E';
    const chevronColor = isDark ? '#525252' : '#9CA3AF';

    /**
     * Formats a timestamp into a human-readable relative date string
     */
    function formatLastSync(timestamp: number | null): string {
        if (!timestamp) return t('settings.sync.never');

        const now = new Date();
        const syncDate = new Date(timestamp);
        const diffMs = now.getTime() - syncDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        const timeStr = syncDate.toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: language === 'en'
        });

        if (diffMins < 1) {
            return t('settings.sync.just_now');
        } else if (diffMins < 60) {
            return t('settings.sync.minutes', { n: diffMins });
        } else if (diffHours < 24 && syncDate.getDate() === now.getDate()) {
            return t('settings.sync.today', { t: timeStr });
        } else if (diffDays === 1 || (diffHours < 48 && syncDate.getDate() === now.getDate() - 1)) {
            return t('settings.sync.yesterday', { t: timeStr });
        } else {
            const dateStr = syncDate.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                day: 'numeric',
                month: 'short'
            });
            return `${dateStr} à ${timeStr}`;
        }
    }

    const languages: { code: Language; label: string; icon: string }[] = [
        { code: 'fr', label: 'Français', icon: 'FR' },
        { code: 'en', label: 'English', icon: 'EN' },
    ];

    const currentLanguageObj = languages.find(l => l.code === language) || languages[0];

    const styles = StyleSheet.create({
        container: {
            backgroundColor: isDark ? '#1C1C1E' : '#FDFCF8',
        },
        title: {
            fontSize: 32,
            fontFamily: 'Outfit_700Bold',
            color: isDark ? '#FDFCF8' : '#1C1C1E',
            marginBottom: 32,
        },
        sectionTitle: {
            fontSize: 12,
            fontFamily: 'Outfit_700Bold',
            color: isDark ? '#9CA3AF' : '#666660',
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 12,
        },
        sectionCard: {
            backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
            borderRadius: 16,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: isDark ? '#3A3A3C' : '#E6E5E0',
            overflow: 'hidden',
        },
        menuItem: {
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        menuItemBorder: {
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#3A3A3C' : '#E6E5E0',
        },
        iconContainer: {
            width: 40,
            height: 40,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
            backgroundColor: isDark ? '#3A3A3C' : '#F5F5F0',
        },
        iconContainerGreen: {
            backgroundColor: 'rgba(34, 197, 94, 0.1)', // green-500/10
        },
        iconContainerActive: {
            backgroundColor: isDark ? '#FDFCF8' : '#1C1C1E',
        },
        dangerItem: {
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isDark ? 'rgba(186, 68, 68, 0.1)' : '#FEF2F2',
        },
        dangerZoneCard: {
            borderColor: '#BA4444',
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(28, 28, 30, 0.4)',
            justifyContent: 'flex-end',
        },
        modalContent: {
            backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            padding: 24,
            width: '100%',
            borderWidth: 1,
            borderColor: isDark ? '#3A3A3C' : '#E6E5E0',
        },
        languageItem: {
            padding: 16,
            borderRadius: 14,
            marginBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderWidth: 1,
            backgroundColor: isDark ? '#323234' : '#F5F5F0',
            borderColor: isDark ? '#3A3A3C' : '#E6E5E0',
        },
        languageItemActive: {
            backgroundColor: isDark ? '#3A3A3C' : '#FFFFFF',
            borderColor: isDark ? '#FDFCF8' : '#1C1C1E',
        },
        cancelButton: {
            marginTop: 16,
            padding: 12,
            alignItems: 'center'
        },
        badgeAuto: {
            backgroundColor: '#F0FDF4',
            borderColor: '#BBF7D0',
            borderWidth: 1,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
        },
        menuText: {
            fontFamily: 'Outfit_700Bold',
            fontSize: 16,
            color: isDark ? '#FDFCF8' : '#1C1C1E',
        },
        menuSubText: {
            fontFamily: 'WorkSans_400Regular',
            fontSize: 14,
            color: isDark ? '#9CA3AF' : '#666660',
        }
    });

    return (
        <SafeAreaView style={{ flex: 1, ...styles.container }} edges={['top']}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>{t('settings.title')}</Text>

                {/* Account Section */}
                <View style={{ marginBottom: 0 }}>
                    <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
                    <View style={styles.sectionCard}>
                        <View style={[styles.menuItem, styles.menuItemBorder]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={styles.iconContainer}>
                                    <User size={20} color={iconColor} />
                                </View>
                                <View>
                                    <Text style={styles.menuText}>{t('settings.user')}</Text>
                                    <Text style={styles.menuSubText}>{user?.email}</Text>
                                </View>
                            </View>
                        </View>

                        <Pressable
                            onPress={signOut}
                            style={styles.menuItem}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <LogOut size={20} color="#BA4444" style={{ marginRight: 16 }} />
                                <Text style={[styles.menuText, { color: '#BA4444' }]}>{t('settings.logout')}</Text>
                            </View>
                            <ChevronRight size={20} color={chevronColor} />
                        </Pressable>
                    </View>
                </View>

                {/* Appearance Section */}
                <View style={{ marginBottom: 0, marginTop: 8 }}>
                    <Text style={styles.sectionTitle}>{t('settings.appearance')}</Text>
                    <View style={styles.sectionCard}>
                        <Pressable
                            onPress={() => setThemeModalVisible(true)}
                            style={styles.menuItem}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={[styles.iconContainer, theme === 'paper' && styles.iconContainerActive]}>
                                    {theme === 'dark' ? (
                                        <Moon size={20} color={iconColor} />
                                    ) : theme === 'paper' ? (
                                        <BookOpen size={20} color='#FFFFFF' />
                                    ) : (
                                        <Sun size={20} color={iconColor} />
                                    )}
                                </View>
                                <View>
                                    <Text style={styles.menuText}>{t('settings.readingMode')}</Text>
                                    <Text style={styles.menuSubText}>
                                        {theme === 'system'
                                            ? t('settings.readingMode.system')
                                            : (theme === 'paper' ? t('settings.readingMode.on') : t('settings.readingMode.off'))
                                        }
                                    </Text>
                                </View>
                            </View>
                            <ChevronRight size={20} color={chevronColor} style={{ transform: [{ rotate: '90deg' }] }} />
                        </Pressable>
                    </View>
                </View>

                {/* Language Section (Updated to Dropdown/List) */}
                <View style={{ marginBottom: 0, marginTop: 8 }}>
                    <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
                    <View style={styles.sectionCard}>
                        <Pressable
                            onPress={() => setLanguageModalVisible(true)}
                            style={styles.menuItem}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={styles.iconContainer}>
                                    <Globe size={20} color={iconColor} />
                                </View>
                                <View>
                                    <Text style={styles.menuText}>
                                        {currentLanguageObj.label}
                                    </Text>
                                    <Text style={styles.menuSubText}>
                                        {t('settings.language.current')}
                                    </Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, borderWidth: 1, marginRight: 8, backgroundColor: isDark ? '#323234' : '#F5F5F0', borderColor: isDark ? '#3A3A3C' : '#E6E5E0' }}>
                                    <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 12, color: isDark ? '#FDFCF8' : '#1C1C1E' }}>{language.toUpperCase()}</Text>
                                </View>
                                <ChevronRight size={20} color={chevronColor} style={{ transform: [{ rotate: '90deg' }] }} />
                            </View>
                        </Pressable>
                    </View>
                </View>

                {/* Sync Section */}
                <View style={{ marginBottom: 0, marginTop: 8 }}>
                    <Text style={styles.sectionTitle}>{t('settings.data')}</Text>
                    <View style={styles.sectionCard}>
                        <Pressable
                            style={styles.menuItem}
                            onPress={handleSync}
                            disabled={isSyncing}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={[styles.iconContainer, styles.iconContainerGreen]}>
                                    {isSyncing ? (
                                        <RefreshCw size={20} color="#22c55e" style={{ opacity: 0.5 }} />
                                    ) : (
                                        <Cloud size={20} color="#22c55e" />
                                    )}
                                </View>
                                <View>
                                    <Text style={styles.menuText}>
                                        {isSyncing ? t('settings.syncing') : t('settings.sync')}
                                    </Text>
                                    <Text style={styles.menuSubText}>
                                        {isSyncing ? t('common.loading') : formatLastSync(lastSyncTime)}
                                    </Text>
                                </View>
                            </View>
                            {isSyncing ? (
                                <View style={styles.badgeAuto}>
                                    <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 10, color: '#166534' }}>SYNCING</Text>
                                </View>
                            ) : (
                                <RefreshCw size={20} color={chevronColor} />
                            )}
                        </Pressable>
                    </View>
                </View>

                {/* Notifications Section */}
                <View style={{ marginBottom: 0, marginTop: 8 }}>
                    <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>
                    <View style={styles.sectionCard}>
                        <View style={styles.menuItem}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 16 }}>
                                <View style={[styles.iconContainer, notificationsEnabled && styles.iconContainerActive]}>
                                    <Bell size={20} color={notificationsEnabled ? (isDark ? '#1C1C1E' : '#FFFFFF') : iconColor} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.menuText}>{t('settings.maintenance_reminders')}</Text>
                                    <Text style={styles.menuSubText}>{t('settings.maintenance_reminders_desc')}</Text>
                                </View>
                            </View>
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={setNotificationsEnabled}
                                trackColor={{ false: '#E6E5E0', true: '#1C1C1E' }}
                                thumbColor={'#FFFFFF'}
                            />
                        </View>
                    </View>
                </View>

                {/* Support Section */}
                <View style={{ marginBottom: 0, marginTop: 8 }}>
                    <Text style={styles.sectionTitle}>{t('settings.support')}</Text>
                    <View style={styles.sectionCard}>
                        <Pressable
                            onPress={() => openLink('mailto:support@bikeservice.app?subject=Bug Report')}
                            style={styles.menuItem}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={styles.iconContainer}>
                                    <Bug size={20} color={iconColor} />
                                </View>
                                <View>
                                    <Text style={styles.menuText}>{t('settings.report_bug')}</Text>
                                </View>
                            </View>
                            <ChevronRight size={20} color={chevronColor} />
                        </Pressable>
                    </View>
                </View>

                {/* Legal Section */}
                <View style={{ marginBottom: 0, marginTop: 8 }}>
                    <Text style={styles.sectionTitle}>{t('settings.legal')}</Text>
                    <View style={styles.sectionCard}>
                        <Pressable
                            onPress={() => router.push('/legal/privacy')}
                            style={[styles.menuItem, styles.menuItemBorder]}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={styles.iconContainer}>
                                    <Shield size={20} color={iconColor} />
                                </View>
                                <View>
                                    <Text style={styles.menuText}>{t('settings.privacy_policy')}</Text>
                                </View>
                            </View>
                            <ChevronRight size={20} color={chevronColor} />
                        </Pressable>

                        <Pressable
                            onPress={() => router.push('/legal/terms')}
                            style={styles.menuItem}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={styles.iconContainer}>
                                    <FileText size={20} color={iconColor} />
                                </View>
                                <View>
                                    <Text style={styles.menuText}>{t('settings.terms_of_service')}</Text>
                                </View>
                            </View>
                            <ChevronRight size={20} color={chevronColor} />
                        </Pressable>
                    </View>
                </View>

                {/* App Info */}
                <View style={{ marginTop: 8 }}>
                    <View style={[styles.sectionCard, { padding: 20 }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={styles.menuText}>BikeService</Text>
                            <Text style={[styles.menuSubText, { marginLeft: 8 }]}>v1.0.0 (Alpha)</Text>
                        </View>
                    </View>
                </View>

                {/* Danger Zone */}
                <View style={{ marginTop: 24, marginBottom: 40 }}>
                    <Text style={[styles.sectionTitle, { color: '#BA4444' }]}>{t('settings.danger_zone')}</Text>
                    <View style={[styles.sectionCard, styles.dangerZoneCard]}>
                        <Pressable
                            onPress={() => {
                                showAlert(
                                    t('settings.danger_zone'),
                                    t('settings.delete_account_desc'),
                                    {
                                        confirmText: t('settings.delete_account'),
                                        variant: 'danger',
                                        onConfirm: async () => {
                                            try {
                                                await deleteAccount();
                                                setAlertVisible(false)
                                            } catch (e: any) {
                                                setAlertVisible(false) // Close confirmation
                                                setTimeout(() => {
                                                    // Simple error alert uses just 2 args (options is optional)
                                                    // But typescript might complain if options is mandatory? No, options?: ...
                                                    showAlert(t('alert.error'), e.message)
                                                }, 500)
                                            }
                                        }
                                    }
                                )
                            }}
                            style={styles.dangerItem}
                        >
                            <Trash2 size={20} color="#BA4444" style={{ marginRight: 8 }} />
                            <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 18, color: '#BA4444' }}>{t('settings.delete_account')}</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Theme Selection Modal */}
                <Modal visible={themeModalVisible} transparent animationType="slide">
                    <Pressable
                        style={styles.modalOverlay}
                        onPress={() => setThemeModalVisible(false)}
                    >
                        <Pressable onPress={(e) => e.stopPropagation()} style={styles.modalContent}>
                            <Text style={[styles.title, { fontSize: 24, textAlign: 'center' }]}>{t('settings.appearance')}</Text>
                            <FlatList
                                data={[
                                    { code: 'system', label: t('settings.readingMode.system'), icon: <BookOpen size={24} color={isDark ? "#FDFCF8" : "#1C1C1E"} /> }, // Using BookOpen as generic icon or maybe something else
                                    { code: 'dark', label: t('settings.readingMode.off'), icon: <Moon size={24} color={isDark ? "#FDFCF8" : "#1C1C1E"} /> },
                                    { code: 'paper', label: t('settings.readingMode.on'), icon: <Sun size={24} color={isDark ? "#FDFCF8" : "#1C1C1E"} /> }
                                ]}
                                keyExtractor={item => item.code}
                                renderItem={({ item }) => (
                                    <Pressable
                                        onPress={() => {
                                            setTheme(item.code as any);
                                            setThemeModalVisible(false);
                                        }}
                                        style={[
                                            styles.languageItem,
                                            theme === item.code && (isDark ? styles.languageItemActive : styles.languageItemActive)
                                        ]}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <View style={{ width: 40, alignItems: 'center' }}>
                                                {item.icon}
                                            </View>
                                            <Text style={[styles.menuText, theme !== item.code && { fontFamily: 'WorkSans_400Regular' }]}>
                                                {item.label}
                                            </Text>
                                        </View>
                                        {theme === item.code && (
                                            <Check size={24} color={isDark ? "#FDFCF8" : "#1C1C1E"} />
                                        )}
                                    </Pressable>
                                )}
                            />
                            <Pressable
                                onPress={() => setThemeModalVisible(false)}
                                style={styles.cancelButton}
                            >
                                <Text style={styles.menuSubText}>{t('common.cancel')}</Text>
                            </Pressable>
                        </Pressable>
                    </Pressable>
                </Modal>

                {/* Language Selection Modal */}
                <Modal visible={languageModalVisible} transparent animationType="slide">
                    <Pressable
                        style={styles.modalOverlay}
                        onPress={() => setLanguageModalVisible(false)}
                    >
                        <Pressable onPress={(e) => e.stopPropagation()} style={styles.modalContent}>
                            <Text style={[styles.title, { fontSize: 24, textAlign: 'center' }]}>{t('settings.language')}</Text>
                            <FlatList
                                data={languages}
                                keyExtractor={item => item.code}
                                renderItem={({ item }) => (
                                    <Pressable
                                        onPress={() => {
                                            setLanguage(item.code);
                                            setLanguageModalVisible(false);
                                        }}
                                        style={[
                                            styles.languageItem,
                                            language === item.code && (isDark ? styles.languageItemActive : styles.languageItemActive)
                                        ]}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={{ fontSize: 24, marginRight: 16 }}>{item.icon}</Text>
                                            <Text style={[styles.menuText, language !== item.code && { fontFamily: 'WorkSans_400Regular' }]}>
                                                {item.label}
                                            </Text>
                                        </View>
                                        {language === item.code && (
                                            <Check size={24} color={isDark ? "#FDFCF8" : "#1C1C1E"} />
                                        )}
                                    </Pressable>
                                )}
                            />
                            <Pressable
                                onPress={() => setLanguageModalVisible(false)}
                                style={styles.cancelButton}
                            >
                                <Text style={styles.menuSubText}>{t('common.cancel')}</Text>
                            </Pressable>
                        </Pressable>
                    </Pressable>
                </Modal>

            </ScrollView>

            <ConfirmationModal
                visible={alertVisible}
                title={alertTitle}
                description={alertMessage}
                onConfirm={alertOnConfirm || (() => setAlertVisible(false))}
                onCancel={() => setAlertVisible(false)}
                confirmText={alertConfirmText || t('common.ok')}
                variant={alertVariant}
            />
        </SafeAreaView>
    );
}
