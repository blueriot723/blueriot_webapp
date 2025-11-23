// ===== BLUERIOT WEBAPP - AUTHENTICATION =====
import { createClient } from ‘https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm’;

// Supabase configuration
const SUPABASE_URL = ‘https://kvomxtzcnczvbcscybcy.supabase.co’;
const SUPABASE_ANON_KEY = ‘eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2b214dHpjbmN6dmJjc2N5YmN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0OTIwOTMsImV4cCI6MjA3OTA2ODA5M30.2fd-urmPrcuWrDdZtR6lNaRsfyNQW64fwEvJv2KI9AE’;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM elements
const loginScreen = document.getElementById(‘loginScreen’);
const dashboardScreen = document.getElementById(‘dashboardScreen’);
const loginForm = document.getElementById(‘loginForm’);
const loginError = document.getElementById(‘loginError’);
const loginBtn = document.getElementById(‘loginBtn’);
const logoutBtn = document.getElementById(‘logoutBtn’);
const userEmail = document.getElementById(‘userEmail’);

// Check if user is already logged in
checkAuth();

async function checkAuth() {
try {
const { data: { session } } = await supabase.auth.getSession();

```
    if (session) {
        // User is logged in, verify TL profile
        const { data: tlData, error: tlError } = await supabase
            .from('tl_users')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
        
        if (tlError || !tlData) {
            console.error('TL profile not found:', tlError);
            showError('Profilo Tour Leader non trovato');
            await supabase.auth.signOut();
            return;
        }
        
        showDashboard(session.user, tlData);
    }
} catch (error) {
    console.error('Auth check error:', error);
}
```

}

// Login form handler
loginForm.addEventListener(‘submit’, async (e) => {
e.preventDefault();

```
const email = document.getElementById('email').value;
const password = document.getElementById('password').value;

// Disable button and show loading
loginBtn.disabled = true;
loginBtn.innerHTML = '<span class="btn-text">Caricamento...</span>';
hideError();

try {
    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    
    if (error) throw error;
    
    // Check if TL profile exists
    const { data: tlData, error: tlError } = await supabase
        .from('tl_users')
        .select('*')
        .eq('user_id', data.user.id)
        .single();
    
    if (tlError || !tlData) {
        throw new Error('Profilo Tour Leader non trovato');
    }
    
    // Login successful
    showDashboard(data.user, tlData);
    
} catch (error) {
    console.error('Login error:', error);
    showError(error.message || 'Errore durante il login');
    loginBtn.disabled = false;
    loginBtn.innerHTML = '<span class="btn-text">Accedi</span>';
}
```

});

// Logout handler
logoutBtn.addEventListener(‘click’, async () => {
await supabase.auth.signOut();
location.reload();
});

// Show dashboard
function showDashboard(user, tlData) {
loginScreen.classList.remove(‘active’);
dashboardScreen.classList.add(‘active’);
userEmail.textContent = user.email;

```
// Dispatch event for app.js to load tours
window.dispatchEvent(new CustomEvent('userLoggedIn', { 
    detail: { user, tlData } 
}));
```

}

// Error handling
function showError(message) {
loginError.textContent = message;
loginError.classList.add(‘show’);
}

function hideError() {
loginError.classList.remove(‘show’);
}