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
            console.log('🗑️ Starting account deletion process...');

            // 1. Fetch user's vehicles to target documents and logs specifically
            // We need to know which vehicles belong to the user to clean up their dependencies
            const { data: userVehicles, error: fetchError } = await supabase
                .from('vehicles')
                .select('id')
                .eq('user_id', user.id);

            if (fetchError) {
                console.error('Error fetching vehicles for deletion:', fetchError);
                // Fallback: If we can't fetch by user_id, we might rely on RLS, but explicit is better.
                // If this fails, we probably can't proceed safely.
                throw new Error('Failed to prepare account deletion: ' + fetchError.message);
            }

            const vehicleIds = userVehicles?.map(v => v.id) || [];
            console.log(`Found ${vehicleIds.length} vehicles to clean up.`);

            if (vehicleIds.length > 0) {
                // 2. Delete Documents linked to these vehicles
                const { error: dError } = await supabase
                    .from('documents')
                    .delete()
                    .in('vehicle_id', vehicleIds);

                if (dError) {
                    console.error('Error deleting documents:', dError);
                    throw new Error('Failed to delete documents: ' + dError.message);
                }
                console.log('✅ Documents deleted');

                // 3. Delete Maintenance Logs linked to these vehicles
                const { error: lError } = await supabase
                    .from('maintenance_logs')
                    .delete()
                    .in('vehicle_id', vehicleIds);

                if (lError) {
                    console.error('Error deleting logs:', lError);
                    throw new Error('Failed to delete maintenance logs: ' + lError.message);
                }
                console.log('✅ Logs deleted');

                // 4. Delete Vehicles
                const { error: vError } = await supabase
                    .from('vehicles')
                    .delete()
                    .in('id', vehicleIds);

                if (vError) {
                    console.error('Error deleting vehicles:', vError);
                    throw new Error('Failed to delete vehicles: ' + vError.message);
                }
                console.log('✅ Vehicles deleted');
            } else {
                console.log('No vehicles found to delete, or RLS hid them.');

                // Even if we didn't find vehicles, we should try to cleanup any orphaned items if RLS allows, 
                // but checking vehicleIds is safer to avoid deleting shared data if that were possible.
            }

            // 5. Delete Auth Account (via RPC)
            const { error: uError } = await supabase.rpc('delete_user');
            if (uError) {
                console.error('Error deleting auth user:', uError);
                throw new Error('Failed to delete user account: ' + uError.message);
            }
            console.log('✅ User account deleted');

            // 6. Sign Out (triggers local wipe)
            await signOut();

        } catch (e: any) {
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
