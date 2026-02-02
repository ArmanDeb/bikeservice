import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Switch, StatusBar, Alert, Linking, Modal, FlatList, StyleSheet, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage, Language } from '../../src/context/LanguageContext';
import { User, Globe, Moon, Sun, BookOpen, LogOut, Bug, Lightbulb, Trash2, Check, Cloud, Bell, ChevronRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LAST_SYNC_KEY } from '../../src/services/SyncService';
import { database } from '../../src/database';

export default function SettingsScreen() {
    const { user, signOut } = useAuth();
    const { theme, toggleTheme, isDark } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [languageModalVisible, setLanguageModalVisible] = useState(false);

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

    const iconColor = isDark ? '#ffffff' : '#2D2A26';
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
        menuItem: {
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        dangerItem: {
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(239, 68, 68, 0.1)', // bg-red-500/10
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContent: {
            // Styles handled by tailwind classes + this for safety if needed
        },
        languageItem: {
            padding: 16,
            borderRadius: 12,
            marginBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderWidth: 1,
        },
        languageItemActive: {
            backgroundColor: 'rgba(59, 130, 246, 0.2)', // bg-primary/20
            borderColor: 'rgba(59, 130, 246, 0.5)',
        },
        languageItemInactive: {
            backgroundColor: isDark ? '#27272a' : '#f1f5f9', // bg-surface-highlight approx
            borderColor: isDark ? '#3f3f46' : '#e2e8f0', // border-border
        },
        cancelButton: {
            marginTop: 16,
            padding: 8,
            alignItems: 'center'
        }
    });

    return (
        <SafeAreaView className="flex-1 bg-background">
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <ScrollView contentContainerStyle={{ padding: 24 }}>
                <Text className="text-4xl font-heading text-text mb-8">{t('settings.title')}</Text>

                {/* Account Section */}
                <View className="mb-8">
                    <Text className="text-text-secondary font-heading uppercase tracking-wider text-sm mb-4">{t('settings.account')}</Text>
                    <View className="bg-surface rounded-xl overflow-hidden shadow-sm border border-border/50">
                        <View className="p-4 border-b border-border/50 flex-row items-center">
                            <View className="bg-surface-highlight w-10 h-10 rounded-full items-center justify-center mr-4">
                                <User size={24} color={iconColor} />
                            </View>
                            <View>
                                <Text className="text-text font-heading text-lg">{t('settings.user')}</Text>
                                <Text className="text-text-secondary font-body">{user?.email}</Text>
                            </View>
                        </View>

                        <Pressable
                            onPress={signOut}
                            style={styles.menuItem}
                        >
                            <View className="flex-row items-center">
                                <LogOut size={20} color="#ef4444" style={{ marginRight: 12 }} />
                                <Text className="text-red-500 font-heading text-lg">{t('settings.logout')}</Text>
                            </View>
                            <ChevronRight size={20} color={chevronColor} />
                        </Pressable>
                    </View>
                </View>

                {/* Appearance Section */}
                <View className="mb-8">
                    <Text className="text-text-secondary font-heading uppercase tracking-wider text-sm mb-4">{t('settings.appearance')}</Text>
                    <View className="bg-surface rounded-xl overflow-hidden shadow-sm border border-border/50">
                        <Pressable
                            onPress={toggleTheme}
                            style={styles.menuItem}
                        >
                            <View className="flex-row items-center">
                                <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${theme === 'paper' ? 'bg-primary/20' : 'bg-surface-highlight'}`}>
                                    {theme === 'dark' ? (
                                        <Moon size={20} color={iconColor} />
                                    ) : theme === 'paper' ? (
                                        <BookOpen size={20} color='#CA8A04' />
                                    ) : (
                                        <Sun size={20} color={iconColor} />
                                    )}
                                </View>
                                <View>
                                    <Text className="text-text font-heading text-lg">{t('settings.readingMode')}</Text>
                                    <Text className="text-text-secondary font-body text-sm">
                                        {theme === 'paper' ? t('settings.readingMode.on') : t('settings.readingMode.off')}
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={theme === 'paper'}
                                onValueChange={toggleTheme}
                                trackColor={{ false: '#525252', true: '#FACC15' }}
                                thumbColor={theme === 'paper' ? '#FFFFFF' : '#f4f3f4'}
                            />
                        </Pressable>
                    </View>
                </View>

                {/* Language Section (Updated to Dropdown/List) */}
                <View className="mb-8">
                    <Text className="text-text-secondary font-heading uppercase tracking-wider text-sm mb-4">{t('settings.language')}</Text>
                    <View className="bg-surface rounded-xl overflow-hidden shadow-sm border border-border/50">
                        <Pressable
                            onPress={() => setLanguageModalVisible(true)}
                            style={styles.menuItem}
                        >
                            <View className="flex-row items-center">
                                <View className="bg-surface-highlight w-10 h-10 rounded-full items-center justify-center mr-4">
                                    <Globe size={20} color={iconColor} />
                                </View>
                                <View>
                                    <Text className="text-text font-heading text-lg">
                                        {currentLanguageObj.label}
                                    </Text>
                                    <Text className="text-text-secondary font-body text-sm">
                                        {t('settings.language.current')}
                                    </Text>
                                </View>
                            </View>
                            <View className="flex-row items-center">
                                <View className="bg-surface-highlight px-3 py-1 rounded-full border border-border mr-2">
                                    <Text className="text-text font-heading">{language.toUpperCase()}</Text>
                                </View>
                                <ChevronRight size={20} color={chevronColor} style={{ transform: [{ rotate: '90deg' }] }} />
                            </View>
                        </Pressable>
                    </View>
                </View>

                {/* Sync Section */}
                <View className="mb-8">
                    <Text className="text-text-secondary uppercase tracking-wider text-sm mb-4">{t('settings.data')}</Text>
                    <View className="bg-surface rounded-xl overflow-hidden shadow-sm">
                        <View className="p-4 flex-row items-center justify-between">
                            <View className="flex-row items-center">
                                <View className="bg-green-500/20 w-10 h-10 rounded-full items-center justify-center mr-4">
                                    <Cloud size={20} color="#22c55e" />
                                </View>
                                <View>
                                    <Text className="text-text font-heading">{t('settings.sync')}</Text>
                                    <Text className="text-text-secondary font-body text-sm">{formatLastSync(lastSyncTime)}</Text>
                                </View>
                            </View>
                            {lastSyncTime && (
                                <View className="bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                                    <Text className="text-green-600 text-xs font-bold">AUTO</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Notifications Section */}
                <View className="mb-8">
                    <Text className="text-text-secondary uppercase tracking-wider text-sm mb-4">{t('settings.notifications')}</Text>
                    <View className="bg-surface rounded-xl overflow-hidden shadow-sm">
                        <View className="p-4 flex-row items-center justify-between">
                            <View className="flex-row items-center">
                                <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${notificationsEnabled ? 'bg-primary/20' : 'bg-surface-highlight'}`}>
                                    <Bell size={20} color={notificationsEnabled ? '#FACC15' : iconColor} />
                                </View>
                                <View>
                                    <Text className="text-text font-heading text-lg">{t('settings.maintenance_reminders')}</Text>
                                    <Text className="text-text-secondary font-body text-sm">{t('settings.maintenance_reminders_desc')}</Text>
                                </View>
                            </View>
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={setNotificationsEnabled}
                                trackColor={{ false: '#525252', true: '#FACC15' }}
                                thumbColor={notificationsEnabled ? '#FFFFFF' : '#f4f3f4'}
                            />
                        </View>
                    </View>
                </View>

                {/* Support Section */}
                <View className="mb-8">
                    <Text className="text-text-secondary font-heading uppercase tracking-wider text-sm mb-4">{t('settings.support')}</Text>
                    <View className="bg-surface rounded-xl overflow-hidden shadow-sm border border-border/50">
                        <Pressable
                            onPress={() => Linking.openURL('mailto:support@bikeservice.app?subject=Bug Report')}
                            style={[styles.menuItem, { borderBottomWidth: 1, borderBottomColor: isDark ? '#3f3f46' : '#e2e8f0' }]}
                        >
                            <View className="flex-row items-center">
                                <View className="bg-surface-highlight w-10 h-10 rounded-full items-center justify-center mr-4">
                                    <Bug size={20} color={iconColor} />
                                </View>
                                <View>
                                    <Text className="text-text font-heading text-lg">{t('settings.report_bug')}</Text>
                                </View>
                            </View>
                            <ChevronRight size={20} color={chevronColor} />
                        </Pressable>

                        <Pressable
                            onPress={() => Linking.openURL('mailto:support@bikeservice.app?subject=Feature Request')}
                            style={styles.menuItem}
                        >
                            <View className="flex-row items-center">
                                <View className="bg-surface-highlight w-10 h-10 rounded-full items-center justify-center mr-4">
                                    <Lightbulb size={20} color={iconColor} />
                                </View>
                                <View>
                                    <Text className="text-text font-heading text-lg">{t('settings.suggest_idea')}</Text>
                                </View>
                            </View>
                            <ChevronRight size={20} color={chevronColor} />
                        </Pressable>
                    </View>
                </View>

                {/* App Info */}
                <View>
                    <Text className="text-text-secondary font-heading uppercase tracking-wider text-sm mb-4">{t('settings.about')}</Text>
                    <View className="bg-surface rounded-xl p-4 shadow-sm border border-border/50">
                        <View className="flex-row justify-between py-2 border-b border-border/50">
                            <Text className="text-text font-body">{t('common.version')}</Text>
                            <Text className="text-text-secondary font-body">1.0.0 (Alpha)</Text>
                        </View>
                        <View className="flex-row justify-between py-2">
                            <Text className="text-text font-body">{t('common.powered_by')}</Text>
                            <Text className="text-text-secondary font-body">Antigravity Kit ⚡</Text>
                        </View>
                    </View>
                </View>

                {/* Danger Zone */}
                <View className="mt-8 mb-12">
                    <Text className="text-red-500 font-heading uppercase tracking-wider text-sm mb-4">{t('settings.danger_zone')}</Text>
                    <View className="bg-surface rounded-xl overflow-hidden shadow-sm border border-red-500/20">
                        <Pressable
                            onPress={() => {
                                Alert.alert(
                                    t('alert.confirm'),
                                    t('settings.reset_data_desc'),
                                    [
                                        { text: t('alert.cancel'), style: "cancel" },
                                        {
                                            text: t('settings.reset_data'),
                                            style: "destructive",
                                            onPress: async () => {
                                                try {
                                                    await database.write(async () => {
                                                        await database.unsafeResetDatabase()
                                                    })
                                                    Alert.alert(t('alert.success'), t('settings.reset_data_success'))
                                                } catch (e: any) {
                                                    Alert.alert(t('alert.error'), e.message)
                                                }
                                            }
                                        }
                                    ]
                                )
                            }}
                            style={styles.dangerItem}
                        >
                            <Trash2 size={20} color="#ef4444" style={{ marginRight: 8 }} />
                            <Text className="text-red-500 font-heading text-lg">{t('settings.reset_data')}</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Language Selection Modal */}
                <Modal visible={languageModalVisible} transparent animationType="fade">
                    <Pressable
                        style={styles.modalOverlay}
                        onPress={() => setLanguageModalVisible(false)}
                    >
                        <View className="bg-surface rounded-3xl p-6 w-[80%] border border-border">
                            <Text className="text-2xl font-bold text-text mb-6 text-center">{t('settings.language')}</Text>
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
                                            language === item.code ? styles.languageItemActive : styles.languageItemInactive
                                        ]}
                                    >
                                        <View className="flex-row items-center">
                                            <Text className="text-lg font-bold mr-4 text-text">{item.icon}</Text>
                                            <Text className={`text-lg font-medium ${language === item.code ? 'text-primary-dark font-bold' : 'text-text'}`}>
                                                {item.label}
                                            </Text>
                                        </View>
                                        {language === item.code && (
                                            <Check size={24} color={isDark ? "#FACC15" : "#CA8A04"} />
                                        )}
                                    </Pressable>
                                )}
                            />
                            <Pressable
                                onPress={() => setLanguageModalVisible(false)}
                                style={styles.cancelButton}
                            >
                                <Text className="text-text-secondary font-heading text-lg">{t('common.cancel')}</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Modal>

            </ScrollView>
        </SafeAreaView>
    );
}
