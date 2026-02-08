import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { SecureStorageAdapter } from '../services/SecureStorage';
import { supabase } from '../services/Supabase';
import { database } from '../database';

type AuthContextType = {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
    deleteAccount: () => Promise<void>;
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
                const storedUserId = await SecureStorageAdapter.getItem('last_user_id');
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
                await SecureStorageAdapter.setItem('last_user_id', initialSession.user.id);
            } else {
                // No user logged in, but we might have lingering data from a forced close
                // Let's be safe and wipe if we thought we had a user
                const storedUserId = await SecureStorageAdapter.getItem('last_user_id');
                if (storedUserId) {
                    console.log('🧹 No active session but found old user ID. Wiping local database...');
                    try {
                        await database.write(async () => {
                            await database.unsafeResetDatabase();
                        });
                        await SecureStorageAdapter.removeItem('last_user_id');
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
                    await SecureStorageAdapter.removeItem('last_user_id');
                    console.log('✨ Database wiped successfully.');
                } catch (e) {
                    // Ignore concurrent sync errors during logout
                    console.log('Warning during logout wipe:', e);
                }
            } else if (event === 'SIGNED_IN' && session?.user) {
                const storedUserId = await SecureStorageAdapter.getItem('last_user_id');
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
                await SecureStorageAdapter.setItem('last_user_id', session.user.id);
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

    const deleteAccount = async () => {
        if (!user) return;

        try {
            // 1. Delete Documents first (references both Vehicles and Logs)
            // We use neq '0' to match all rows visible to this user via RLS
            const { error: dError } = await supabase
                .from('documents')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000');

            if (dError) console.error('Error deleting documents:', dError);

            // 2. Delete Maintenance Logs (references Vehicles)
            const { error: lError } = await supabase
                .from('maintenance_logs')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000');

            if (lError) console.error('Error deleting logs:', lError);

            // 3. Delete Vehicles (Root)
            const { error: vError } = await supabase
                .from('vehicles')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000');

            if (vError) {
                console.error('Error deleting vehicles:', vError);
                throw new Error(vError.message);
            }

            // 4. Delete Auth Account (via RPC)
            const { error: uError } = await supabase.rpc('delete_user');
            if (uError) {
                console.error('Error deleting auth user:', uError);
                throw new Error('Failed to delete user account: ' + uError.message);
            }

            // 5. Sign Out (triggers local wipe)
            await signOut();

        } catch (e) {
            console.error('Delete account failed', e);
            throw e;
        }
    };

    return (
        <AuthContext.Provider value={{ user, session, isLoading, signOut, deleteAccount }}>
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
