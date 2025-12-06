/**
 * Gesture Navigation Manager
 * Swipe-to-go-back and other touch gestures
 */
class GestureManager {
    constructor() {
        this.startX = 0;
        this.startY = 0;
        this.endX = 0;
        this.endY = 0;
        this.minSwipeDistance = 50;
        this.maxVerticalDistance = 100;
        this.enabled = true;
    }

    init() {
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: true });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });

        console.log('✅ Gesture navigation initialized');
    }

    handleTouchStart(e) {
        if (!this.enabled) return;
        
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
    }

    handleTouchMove(e) {
        if (!this.enabled) return;

        this.endX = e.touches[0].clientX;
        this.endY = e.touches[0].clientY;
    }

    handleTouchEnd(e) {
        if (!this.enabled) return;

        const deltaX = this.endX - this.startX;
        const deltaY = Math.abs(this.endY - this.startY);

        // Swipe right (back gesture)
        if (deltaX > this.minSwipeDistance && deltaY < this.maxVerticalDistance) {
            // Only trigger if swipe started from left edge
            if (this.startX < 50) {
                this.handleSwipeRight();
            }
        }

        // Swipe left (forward gesture)
        if (deltaX < -this.minSwipeDistance && deltaY < this.maxVerticalDistance) {
            // Only trigger if swipe started from right edge
            const screenWidth = window.innerWidth;
            if (this.startX > screenWidth - 50) {
                this.handleSwipeLeft();
            }
        }

        // Reset
        this.startX = 0;
        this.startY = 0;
        this.endX = 0;
        this.endY = 0;
    }

    handleSwipeRight() {
        // Go back in history
        if (window.history.length > 1) {
            window.history.back();
            console.log('👈 Swipe right: go back');
        }
    }

    handleSwipeLeft() {
        // Go forward in history
        if (window.history.length > 1) {
            window.history.forward();
            console.log('👉 Swipe left: go forward');
        }
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }
}

export const gestures = new GestureManager();
