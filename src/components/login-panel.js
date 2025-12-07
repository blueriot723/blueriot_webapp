/**
 * Login Panel Component - Cyberpunk TRON Design
 * 20% sidebar (logos + language) + 80% login area
 */
import { auth } from '../utils/auth.js';

export class LoginPanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.currentLang = 'it';
        this.emailFormExpanded = false;
        this.render();
    }

    connectedCallback() {
        this.setupEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap">
            <style>
                /* CSS Variables - must be defined here for Shadow DOM */
                :host {
                    --neon-cyan: #00eaff;
                    --neon-blue: #00C8FF;
                    --neon-pink: #ff4fd8;
                    --neon-fuchsia: #ff4fd8;
                    --bg-pure-dark: #050505;
                    --bg-sidebar: #0c0f13;
                    --bg-card: #0D1117;
                    --bg-input: #0A0E13;
                    --text-primary: #FFFFFF;
                    --text-secondary: #8B9DC3;
                    --text-muted: #525866;
                    --error: #FF4757;

                    display: block;
                    min-height: 100vh;
                    background: var(--bg-pure-dark);
                }

                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                .login-container {
                    display: flex;
                    width: 100%;
                    min-height: 100vh;
                    background: var(--bg-pure-dark);
                }

                /* ===== SIDEBAR 20% ===== */
                .login-sidebar {
                    width: 20%;
                    min-width: 260px;
                    background: var(--bg-sidebar);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: space-between;
                    padding: 48px 24px;
                    border-right: 1px solid rgba(0, 234, 255, 0.15);
                }

                .logo-section {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 24px;
                }

                .logo-container {
                    background: white;
                    padding: 20px;
                    border-radius: 12px;
                    box-shadow:
                        0 0 20px rgba(255, 255, 255, 0.3),
                        0 0 40px rgba(255, 255, 255, 0.1);
                }

                .blueriot-logo {
                    width: 180px;
                    height: auto;
                    display: block;
                }

                .matrix-logo {
                    width: 140px;
                    height: auto;
                    margin-top: 16px;
                    filter: drop-shadow(0 0 12px rgba(0, 234, 255, 0.6));
                }

                /* ===== LANGUAGE BUTTONS with 45deg neon ===== */
                .language-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    width: 100%;
                    max-width: 140px;
                }

                .lang-btn {
                    position: relative;
                    width: 100%;
                    height: 48px;
                    background: rgba(10, 14, 39, 0.9);
                    border: none;
                    color: var(--text-primary);
                    font-family: 'Share Tech Mono', monospace;
                    font-size: 16px;
                    font-weight: 700;
                    letter-spacing: 2px;
                    cursor: pointer;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    /* 45 degree cut on right side */
                    clip-path: polygon(0 0, 100% 0, 100% 70%, 92% 100%, 0 100%);
                }

                .lang-btn::before {
                    content: '';
                    position: absolute;
                    right: 0;
                    top: 0;
                    width: 4px;
                    height: 50%;
                    background: linear-gradient(180deg,
                        var(--neon-cyan) 0%,
                        var(--neon-cyan) 80%,
                        transparent 100%
                    );
                    box-shadow: 0 0 12px var(--neon-cyan), 0 0 24px var(--neon-cyan);
                }

                .lang-btn.active::before,
                .lang-btn:hover::before {
                    background: linear-gradient(180deg,
                        var(--neon-fuchsia) 0%,
                        var(--neon-fuchsia) 80%,
                        transparent 100%
                    );
                    box-shadow: 0 0 12px var(--neon-fuchsia), 0 0 24px var(--neon-fuchsia);
                }

                .lang-btn.active {
                    background: rgba(255, 79, 216, 0.1);
                }

                /* ===== MAIN LOGIN AREA 80% ===== */
                .login-main {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 48px;
                    background: var(--bg-pure-dark);
                    position: relative;
                }

                /* Top neon border line */
                .login-main::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: linear-gradient(90deg,
                        transparent 0%,
                        var(--neon-cyan) 20%,
                        var(--neon-cyan) 80%,
                        transparent 100%
                    );
                    box-shadow: 0 0 10px var(--neon-cyan), 0 0 20px var(--neon-cyan);
                }

                .login-content {
                    width: 100%;
                    max-width: 450px;
                }

                /* ===== LOGIN OPTIONS with left neon 45deg ===== */
                .login-option {
                    position: relative;
                    background: rgba(10, 14, 39, 0.7);
                    padding: 24px;
                    margin-bottom: 20px;
                    /* 45 degree cut on left side */
                    clip-path: polygon(8% 0, 100% 0, 100% 100%, 0 100%, 0 30%);
                }

                .login-option::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 4px;
                    height: 50%;
                    background: linear-gradient(180deg,
                        transparent 0%,
                        var(--neon-cyan) 20%,
                        var(--neon-cyan) 100%
                    );
                    box-shadow: 0 0 12px var(--neon-cyan), 0 0 24px var(--neon-cyan);
                }

                .login-option:hover::before,
                .login-option:focus-within::before,
                .login-option.active::before {
                    background: linear-gradient(180deg,
                        transparent 0%,
                        var(--neon-fuchsia) 20%,
                        var(--neon-fuchsia) 100%
                    );
                    box-shadow: 0 0 12px var(--neon-fuchsia), 0 0 24px var(--neon-fuchsia);
                }

                /* ===== GOOGLE BUTTON - Official Style ===== */
                .google-signin-btn {
                    width: 100%;
                    height: 50px;
                    background: white;
                    color: #444;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-family: 'Roboto', sans-serif;
                    font-size: 16px;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    transition: all 0.2s ease;
                }

                .google-signin-btn:hover {
                    background: #f8f8f8;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                }

                .google-signin-btn svg {
                    flex-shrink: 0;
                }

                /* ===== EMAIL TOGGLE BUTTON ===== */
                .email-toggle-btn {
                    width: 100%;
                    height: 50px;
                    background: rgba(10, 14, 39, 0.9);
                    border: 1px solid rgba(0, 234, 255, 0.3);
                    color: var(--text-primary);
                    border-radius: 4px;
                    font-family: 'Share Tech Mono', monospace;
                    font-size: 16px;
                    font-weight: 600;
                    letter-spacing: 1px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    transition: all 0.3s ease;
                }

                .email-toggle-btn:hover {
                    border-color: var(--neon-cyan);
                    box-shadow: 0 0 15px rgba(0, 234, 255, 0.3);
                }

                .email-toggle-btn.expanded {
                    border-color: var(--neon-fuchsia);
                    box-shadow: 0 0 15px rgba(255, 79, 216, 0.3);
                }

                .toggle-icon {
                    transition: transform 0.3s ease;
                }

                .toggle-icon.rotated {
                    transform: rotate(180deg);
                }

                /* ===== EMAIL FORM ===== */
                .email-form {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.3s ease, margin-top 0.3s ease;
                }

                .email-form.expanded {
                    max-height: 200px;
                    margin-top: 20px;
                }

                .login-input {
                    width: 100%;
                    height: 48px;
                    background: rgba(10, 14, 39, 0.9);
                    border: 1px solid rgba(0, 234, 255, 0.2);
                    border-radius: 4px;
                    padding: 0 16px;
                    color: var(--text-primary);
                    font-family: 'Share Tech Mono', monospace;
                    font-size: 15px;
                    margin-bottom: 12px;
                    transition: all 0.2s ease;
                }

                .login-input::placeholder {
                    color: var(--text-muted);
                }

                .login-input:focus {
                    outline: none;
                    border-color: var(--neon-cyan);
                    box-shadow: 0 0 10px rgba(0, 234, 255, 0.2);
                }

                .login-submit-btn {
                    width: 100%;
                    height: 48px;
                    background: var(--neon-cyan);
                    border: none;
                    border-radius: 4px;
                    color: #000;
                    font-family: 'Share Tech Mono', monospace;
                    font-size: 16px;
                    font-weight: 700;
                    letter-spacing: 1px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .login-submit-btn:hover {
                    box-shadow: 0 0 20px rgba(0, 234, 255, 0.5);
                }

                /* ===== ERROR MESSAGE ===== */
                .error-message {
                    display: none;
                    padding: 12px;
                    background: rgba(255, 71, 87, 0.1);
                    border: 1px solid rgba(255, 71, 87, 0.3);
                    border-radius: 4px;
                    color: var(--error);
                    font-size: 14px;
                    margin-top: 16px;
                }

                .error-message.show {
                    display: block;
                }

                /* ===== MOBILE RESPONSIVE ===== */
                @media (max-width: 768px) {
                    .login-container {
                        flex-direction: column;
                    }

                    .login-sidebar {
                        width: 100%;
                        min-width: 100%;
                        padding: 24px;
                        flex-direction: row;
                        justify-content: space-between;
                    }

                    .logo-section {
                        flex-direction: row;
                        gap: 16px;
                    }

                    .logo-container {
                        padding: 12px;
                    }

                    .blueriot-logo {
                        width: 100px;
                    }

                    .matrix-logo {
                        width: 80px;
                        margin-top: 0;
                    }

                    .language-buttons {
                        flex-direction: row;
                        flex-wrap: wrap;
                        max-width: none;
                        gap: 8px;
                    }

                    .lang-btn {
                        width: 60px;
                        height: 40px;
                        font-size: 14px;
                    }

                    .login-main {
                        padding: 24px;
                    }
                }
            </style>

            <div class="login-container">
                <!-- Sidebar 20% -->
                <div class="login-sidebar">
                    <div class="logo-section">
                        <div class="logo-container">
                            <img src="blueriot-logo.png" alt="BlueRiot" class="blueriot-logo">
                        </div>
                        <img src="matrix.png" alt="Matrix" class="matrix-logo">
                    </div>

                    <div class="language-buttons">
                        <button class="lang-btn active" data-lang="it">IT</button>
                        <button class="lang-btn" data-lang="en">EN</button>
                        <button class="lang-btn" data-lang="es">ES</button>
                        <button class="lang-btn" data-lang="de">DE</button>
                        <button class="lang-btn" data-lang="fr">FR</button>
                    </div>
                </div>

                <!-- Main Login Area 80% -->
                <div class="login-main">
                    <div class="login-content">
                        <!-- Google Sign-In -->
                        <div class="login-option" id="googleOption">
                            <button class="google-signin-btn" id="googleSigninBtn">
                                <svg width="20" height="20" viewBox="0 0 18 18">
                                    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                                    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                                    <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z"/>
                                    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
                                </svg>
                                Sign in with Google
                            </button>
                        </div>

                        <!-- Email Login Expandable -->
                        <div class="login-option" id="emailOption">
                            <button class="email-toggle-btn" id="emailToggleBtn">
                                <span class="toggle-icon" id="emailToggleIcon">&#9660;</span>
                                EMAIL LOGIN
                            </button>

                            <div class="email-form" id="emailForm">
                                <input type="email" id="emailInput" placeholder="email@example.com" class="login-input" required>
                                <input type="password" id="passwordInput" placeholder="Password" class="login-input" required>
                                <button class="login-submit-btn" id="emailLoginBtn">ACCEDI</button>
                            </div>

                            <div class="error-message" id="errorMessage"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Language buttons
        this.shadowRoot.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentLang = btn.dataset.lang;
                this.shadowRoot.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Email toggle
        const emailToggleBtn = this.shadowRoot.getElementById('emailToggleBtn');
        const emailForm = this.shadowRoot.getElementById('emailForm');
        const emailToggleIcon = this.shadowRoot.getElementById('emailToggleIcon');
        const emailOption = this.shadowRoot.getElementById('emailOption');

        emailToggleBtn.addEventListener('click', () => {
            this.emailFormExpanded = !this.emailFormExpanded;
            emailForm.classList.toggle('expanded', this.emailFormExpanded);
            emailToggleBtn.classList.toggle('expanded', this.emailFormExpanded);
            emailToggleIcon.classList.toggle('rotated', this.emailFormExpanded);
            emailOption.classList.toggle('active', this.emailFormExpanded);
        });

        // Google Sign-in
        const googleBtn = this.shadowRoot.getElementById('googleSigninBtn');
        const googleOption = this.shadowRoot.getElementById('googleOption');

        googleBtn.addEventListener('click', async () => {
            googleOption.classList.add('active');
            googleBtn.disabled = true;
            googleBtn.textContent = 'Reindirizzamento...';

            try {
                await auth.signInWithGoogle();
            } catch (error) {
                console.error('Google login error:', error);
                this.showError(error.message || 'Errore Google login');
                googleBtn.disabled = false;
                googleBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                    <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z"/>
                    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
                </svg> Sign in with Google`;
                googleOption.classList.remove('active');
            }
        });

        // Email login
        const emailLoginBtn = this.shadowRoot.getElementById('emailLoginBtn');
        emailLoginBtn.addEventListener('click', async () => {
            const email = this.shadowRoot.getElementById('emailInput').value;
            const password = this.shadowRoot.getElementById('passwordInput').value;

            if (!email || !password) {
                this.showError('Inserisci email e password');
                return;
            }

            emailLoginBtn.disabled = true;
            emailLoginBtn.textContent = 'ACCESSO...';

            try {
                await auth.signInWithEmail(email, password);
            } catch (error) {
                console.error('Email login error:', error);
                this.showError(error.message || 'Errore login');
                emailLoginBtn.disabled = false;
                emailLoginBtn.textContent = 'ACCEDI';
            }
        });
    }

    showError(message) {
        const errorEl = this.shadowRoot.getElementById('errorMessage');
        errorEl.textContent = message;
        errorEl.classList.add('show');
        setTimeout(() => {
            errorEl.classList.remove('show');
        }, 5000);
    }
}

customElements.define('login-panel', LoginPanel);
