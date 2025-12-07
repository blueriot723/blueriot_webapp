/**
 * Authentication Manager
 * Handles Supabase auth (email + Google OAuth)
 */
import { router } from './router.js';

class AuthManager {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.currentTL = null;
    }

    /**
     * Initialize Supabase client
     */
    init() {
        try {
            const SUPABASE_URL = 'https://kvomxtzcnczvbcscybcy.supabase.co';
            const SUPABASE_ANON_KEY = 'sb_publishable_WgMzf0xMBQ6a8WMcun3fvg_sUfBQ8qC';

            if (!window.supabase) {
                console.error('❌ Supabase library not loaded');
                return;
            }

            this.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

            // Expose globally for components
            window.supabaseClient = this.supabase;

            // Setup auth state listener
            this.supabase.auth.onAuthStateChange(async (event, session) => {
                console.log('🔐 Auth state changed:', event);

                if (event === 'SIGNED_IN' && session) {
                    await this.handleSignIn(session);
                } else if (event === 'SIGNED_OUT') {
                    this.handleSignOut();
                }
            });

            console.log('✅ Auth manager initialized');
        } catch (error) {
            console.error('❌ Auth manager init failed:', error);
        }
    }

    /**
     * Handle user sign in
     */
    async handleSignIn(session) {
        console.log('✅ User signed in:', session.user.id);
        this.currentUser = session.user;

        try {
            // Load TL profile
            const { data: tlData, error } = await this.supabase
                .from('tl_users')
                .select('*')
                .eq('user_id', session.user.id)
                .single();

            if (error) throw error;

            this.currentTL = tlData;
            console.log('✅ TL profile loaded:', tlData.name);

            // Navigate to dashboard
            router.navigate('dashboard');

            // Dispatch event for components to listen
            window.dispatchEvent(new CustomEvent('user-signed-in', {
                detail: { user: this.currentUser, tl: this.currentTL }
            }));

        } catch (error) {
            console.error('❌ Error loading TL profile:', error);
            alert('Errore caricamento profilo TL');
            await this.signOut();
        }
    }

    /**
     * Handle user sign out
     */
    handleSignOut() {
        console.log('👋 User signed out');
        this.currentUser = null;
        this.currentTL = null;

        router.navigate('login');

        window.dispatchEvent(new CustomEvent('user-signed-out'));
    }

    /**
     * Sign in with email and password
     */
    async signInWithEmail(email, password) {
        if (!this.supabase) {
            throw new Error('Supabase not initialized');
        }

        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        return data;
    }

    /**
     * Sign in with Google OAuth
     */
    async signInWithGoogle() {
        if (!this.supabase) {
            throw new Error('Supabase not initialized');
        }

        const { data, error } = await this.supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + window.location.pathname
            }
        });

        if (error) throw error;
        return data;
    }

    /**
     * Sign out
     */
    async signOut() {
        if (!this.supabase) return;
        await this.supabase.auth.signOut();
    }

    /**
     * Check if user is authenticated
     */
    async checkAuth() {
        if (!this.supabase) {
            console.warn('⚠️ Supabase not initialized, skipping auth check');
            return false;
        }

        try {
            const { data: { session } } = await this.supabase.auth.getSession();

            if (session) {
                await this.handleSignIn(session);
                return true;
            }

            return false;
        } catch (error) {
            console.error('❌ Auth check failed:', error);
            return false;
        }
    }

    /**
     * Get current user
     */
    getUser() {
        return this.currentUser;
    }

    /**
     * Get current user (async version)
     */
    async getCurrentUser() {
        if (this.currentUser) return this.currentUser;

        const { data: { session } } = await this.supabase.auth.getSession();
        if (session) {
            this.currentUser = session.user;
            return session.user;
        }

        return null;
    }

    /**
     * Get current TL profile
     */
    getTL() {
        return this.currentTL;
    }

    /**
     * Get Supabase client
     */
    getClient() {
        return this.supabase;
    }
}

// Create singleton instance
export const auth = new AuthManager();
