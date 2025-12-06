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
        const SUPABASE_URL = 'https://wnplvbbubjkumikbejog.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InducGx2YmJ1YmprdW1pa2Jlam9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM1OTIxMzYsImV4cCI6MjA0OTE2ODEzNn0.aMLuCG3Js9BbOQsP7SdZDl3tRDlGaIaZlFx8IaV-k9M';

        this.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
        await this.supabase.auth.signOut();
    }

    /**
     * Check if user is authenticated
     */
    async checkAuth() {
        const { data: { session } } = await this.supabase.auth.getSession();

        if (session) {
            await this.handleSignIn(session);
            return true;
        }

        return false;
    }

    /**
     * Get current user
     */
    getUser() {
        return this.currentUser;
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
