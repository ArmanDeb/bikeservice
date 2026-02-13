import { AuthError } from '@supabase/supabase-js';

export const getAuthErrorMessage = (error: AuthError | null): string => {
    if (!error) return '';

    // Log the error for debugging purposes
    console.log('Auth Error:', error.message, error.code);

    const message = error.message.toLowerCase();

    // Mapping based on error messages or codes
    if (message.includes('invalid login credentials') || message.includes('invalid_grant')) {
        return 'auth.error.invalid_credentials';
    }
    if (message.includes('user not found') || message.includes('email not confirmed')) {
        return 'auth.error.user_not_found';
    }
    if (message.includes('already registered') || message.includes('user already exists')) {
        return 'auth.error.email_taken';
    }
    if (message.includes('password should be at least') || message.includes('weak_password')) {
        return 'auth.error.weak_password';
    }
    if (message.includes('rate limit') || message.includes('too many requests')) {
        return 'auth.error.rate_limit';
    }

    // Default fallback
    return 'auth.error.generic';
};
