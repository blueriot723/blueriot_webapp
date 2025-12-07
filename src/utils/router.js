/**
 * Simple SPA Router for BlueRiot Dashboard
 * Manages navigation between screens without page reloads
 */
export class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.beforeNavigate = null;
    }

    /**
     * Register a route
     * @param {string} path - Route path (e.g., 'login', 'dashboard')
     * @param {Function} handler - Function to execute when route is active
     */
    register(path, handler) {
        this.routes.set(path, handler);
    }

    /**
     * Navigate to a route
     * @param {string} path - Route path
     * @param {Object} params - Optional parameters
     */
    async navigate(path, params = {}) {
        console.log('🧭 Navigating to:', path);

        // Call beforeNavigate hook if set
        if (this.beforeNavigate) {
            const canNavigate = await this.beforeNavigate(path, params);
            if (!canNavigate) {
                console.log('❌ Navigation blocked by hook');
                return;
            }
        }

        const handler = this.routes.get(path);
        if (!handler) {
            console.error('❌ Route not found:', path);
            return;
        }

        // Hide all screens using classList (works with CSS)
        document.querySelectorAll('[data-screen]').forEach(screen => {
            screen.classList.remove('active');
        });

        // Execute route handler
        this.currentRoute = path;
        await handler(params);

        // Show the screen using classList
        const screen = document.querySelector(`[data-screen="${path}"]`);
        if (screen) {
            screen.classList.add('active');
        }
    }

    /**
     * Get current route
     * @returns {string}
     */
    getCurrent() {
        return this.currentRoute;
    }

    /**
     * Set hook to execute before navigation
     * @param {Function} fn - Hook function (return false to block navigation)
     */
    setBeforeNavigate(fn) {
        this.beforeNavigate = fn;
    }
}

// Create singleton instance
export const router = new Router();
