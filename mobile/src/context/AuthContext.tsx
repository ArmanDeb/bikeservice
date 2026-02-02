import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/Supabase';
import { database } from '../database';

type AuthContextType = {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            // 1. Check active session
            const { data: { session: initialSession } } = await supabase.auth.getSession();

            if (initialSession?.user) {
                const storedUserId = await AsyncStorage.getItem('last_user_id');
                if (storedUserId && storedUserId !== initialSession.user.id) {
                    console.log('🧹 New user detected. Wiping local database...');
                    try {
                        await database.write(async () => {
                            await database.unsafeResetDatabase();
                        });
                        console.log('✨ Database wiped successfully.');
                    } catch (e) {
                        console.error('❌ Failed to wipe database:', e);
                    }
                }
                await AsyncStorage.setItem('last_user_id', initialSession.user.id);
            } else {
                // No user logged in, but we might have lingering data from a forced close
                // Let's be safe and wipe if we thought we had a user
                const storedUserId = await AsyncStorage.getItem('last_user_id');
                if (storedUserId) {
                    console.log('🧹 No active session but found old user ID. Wiping local database...');
                    try {
                        await database.write(async () => {
                            await database.unsafeResetDatabase();
                        });
                        await AsyncStorage.removeItem('last_user_id');
                        console.log('✨ Cleanup complete.');
                    } catch (e) {
                        console.error('❌ Cleanup failed:', e);
                    }
                }
            }

            setSession(initialSession);
            setUser(initialSession?.user ?? null);
            setIsLoading(false);
        };

        initializeAuth();

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`Auth Event: ${event}`);

            if (event === 'SIGNED_OUT') {
                try {
                    console.log('🧹 Wiping local database on Sign Out...');
                    await database.write(async () => {
                        await database.unsafeResetDatabase();
                    });
                    await AsyncStorage.removeItem('last_user_id');
                    console.log('✨ Database wiped successfully.');
                } catch (e) {
                    // Ignore concurrent sync errors during logout
                    console.log('Warning during logout wipe:', e);
                }
            } else if (event === 'SIGNED_IN' && session?.user) {
                const storedUserId = await AsyncStorage.getItem('last_user_id');
                if (storedUserId && storedUserId !== session.user.id) {
                    console.log('🧹 User switched. Wiping local database...');
                    try {
                        await database.write(async () => {
                            await database.unsafeResetDatabase();
                        });
                        console.log('✨ Database wiped successfully.');
                    } catch (e) {
                        console.error('❌ Failed to wipe database on switch:', e);
                    }
                }
                await AsyncStorage.setItem('last_user_id', session.user.id);
            }

            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        // Trigger localized wipe here later if needed, but onAuthStateChange handles most
    };

    return (
        <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
