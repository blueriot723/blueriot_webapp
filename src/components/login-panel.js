/**
 * Login Panel Component - New Cyberpunk Design
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
            <style>
                @import url('../styles/base.css');
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

                :host {
                    display: block;
                    min-height: 100vh;
                }

                .login-container {
                    display: flex;
                    width: 100%;
                    min-height: 100vh;
                }

                /* Sidebar 20% */
                .login-sidebar {
                    width: 20%;
                    min-width: 260px;
                    background: var(--bg-sidebar);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: space-between;
                    padding: var(--spacing-2xl) var(--spacing-lg);
                    border-right: 1px solid rgba(0, 240, 255, 0.1);
                }

                .logo-section {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: var(--spacing-lg);
                }

                .blueriot-logo {
                    width: 150px;
                    height: auto;
                    background: white;
                    padding: 10px;
                    border-radius: 8px;
                    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
                }

                .syndicate-text {
                    color: white;
                    font-size: 14px;
                    font-weight: 700;
                    letter-spacing: 3px;
                    text-align: center;
                    text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
                }

                .matrix-logo {
                    width: 120px;
                    height: auto;
                    margin-top: 20px;
                    filter: drop-shadow(0 0 8px rgba(0, 240, 255, 0.6));
                }

                .language-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    width: 100%;
                    max-width: 140px;
                }

                .lang-btn {
                    position: relative;
                    width: 120px;
                    height: 50px;
                    background: rgba(10, 14, 39, 0.8);
                    border: none;
                    color: var(--text-primary);
                    font-size: 18px;
                    font-weight: 700;
                    cursor: pointer;
                    clip-path: polygon(0 0, 100% 0, 95% 15%, 95% 85%, 100% 100%, 0 100%);
                    overflow: hidden;
                    transition: all 0.3s ease;
                }

                .lang-btn::before {
                    content: '';
                    position: absolute;
                    right: 0;
                    top: 0;
                    bottom: 0;
                    width: 4px;
                    background: linear-gradient(180deg,
                        rgba(0, 240, 255, 1) 0%,
                        rgba(0, 240, 255, 1) 50%,
                        rgba(0, 240, 255, 0) 100%
                    );
                    box-shadow: 0 0 10px rgba(0, 240, 255, 0.8);
                }

                .lang-btn.active::before {
                    background: linear-gradient(180deg,
                        rgba(255, 0, 255, 1) 0%,
                        rgba(255, 0, 255, 1) 50%,
                        rgba(255, 0, 255, 0) 100%
                    );
                    box-shadow: 0 0 15px rgba(255, 0, 255, 1);
                }

                .lang-btn:hover::before {
                    box-shadow: 0 0 20px currentColor;
                }

                /* Main Login Area 80% */
                .login-main {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: var(--spacing-2xl);
                    background: var(--bg-pure-dark);
                }

                .login-content {
                    width: 100%;
                    max-width: 500px;
                }

                .login-option {
                    position: relative;
                    background: rgba(10, 14, 39, 0.6);
                    border-radius: 12px;
                    padding: 24px;
                    margin-bottom: 20px;
                    clip-path: polygon(5% 0, 100% 0, 100% 100%, 0 100%, 0 15%);
                }

                .neon-left::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 4px;
                    background: linear-gradient(180deg,
                        rgba(0, 240, 255, 0) 0%,
                        rgba(0, 240, 255, 1) 25%,
                        rgba(0, 240, 255, 1) 75%,
                        rgba(0, 240, 255, 0) 100%
                    );
                    box-shadow: 0 0 15px rgba(0, 240, 255, 0.8);
                }

                .login-option:hover::before,
                .login-option:focus-within::before {
                    background: linear-gradient(180deg,
                        rgba(255, 0, 255, 0) 0%,
                        rgba(255, 0, 255, 1) 25%,
                        rgba(255, 0, 255, 1) 75%,
                        rgba(255, 0, 255, 0) 100%
                    );
                    box-shadow: 0 0 20px rgba(255, 0, 255, 1);
                }

                .google-signin-btn {
                    width: 100%;
                    height: 50px;
                    background: white;
                    color: #444;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 16px;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.2s;
                }

                .google-signin-btn:hover {
                    background: #f8f8f8;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                }

                .divider {
                    text-align: center;
                    margin: 24px 0;
                    color: var(--text-muted);
                    font-size: 14px;
                    position: relative;
                }

                .divider::before,
                .divider::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    width: 40%;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.3), transparent);
                }

                .divider::before {
                    left: 0;
                }

                .divider::after {
                    right: 0;
                }

                .email-toggle-btn {
                    width: 100%;
                    height: 50px;
                    background: rgba(0, 240, 255, 0.1);
                    border: 1px solid rgba(0, 240, 255, 0.3);
                    color: var(--neon-cyan);
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }

                .email-toggle-btn:hover {
                    background: rgba(0, 240, 255, 0.2);
                    border-color: rgba(0, 240, 255, 0.6);
                }

                .email-form {
                    display: none;
                    margin-top: 20px;
                }

                .email-form.expanded {
                    display: block;
                }

                .login-input {
                    width: 100%;
                    height: 45px;
                    background: rgba(26, 31, 58, 0.8);
                    border: 1px solid var(--border-color);
                    border-radius: 6px;
                    padding: 0 16px;
                    color: var(--text-primary);
                    font-size: 15px;
                    margin-bottom: 12px;
                    transition: all 0.2s;
                }

                .login-input:focus {
                    outline: none;
                    border-color: var(--neon-cyan);
                    box-shadow: 0 0 0 3px rgba(0, 240, 255, 0.1);
                }

                .login-submit-btn {
                    width: 100%;
                    height: 50px;
                    background: var(--neon-cyan);
                    border: none;
                    border-radius: 8px;
                    color: var(--bg-pure-dark);
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    margin-top: 8px;
                    transition: all 0.2s;
                }

                .login-submit-btn:hover {
                    background: rgba(0, 240, 255, 0.9);
                    box-shadow: 0 0 20px rgba(0, 240, 255, 0.4);
                }

                .error-message {
                    display: none;
                    padding: 12px;
                    background: rgba(255, 71, 87, 0.1);
                    border: 1px solid rgba(255, 71, 87, 0.3);
                    border-radius: 6px;
                    color: var(--error);
                    font-size: 14px;
                    margin-top: 16px;
                }

                .error-message.show {
                    display: block;
                }

                /* Mobile responsive */
                @media (max-width: 768px) {
                    .login-container {
                        flex-direction: column;
                    }

                    .login-sidebar {
                        width: 100%;
                        min-width: 100%;
                        padding: var(--spacing-lg);
                    }

                    .logo-section {
                        flex-direction: row;
                        justify-content: space-around;
                        width: 100%;
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
                        max-width: 100%;
                        justify-content: center;
                    }

                    .lang-btn {
                        width: 70px;
                        height: 40px;
                        font-size: 14px;
                    }

                    .login-main {
                        padding: var(--spacing-lg);
                    }
                }
            </style>

            <div class="login-container">
                <!-- Sidebar 20% -->
                <div class="login-sidebar">
                    <div class="logo-section">
                        <div>
                            <img src="blueriot-logo.png" alt="BlueRiot Logo" class="blueriot-logo">
                            <div class="syndicate-text">SYNDICATE</div>
                        </div>
                        <img src="matrix.svg" alt="Matrix" class="matrix-logo">
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
                        <div class="login-option neon-left">
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

                        <div class="divider">
                            <span>oppure</span>
                        </div>

                        <!-- Email Login Expandable -->
                        <div class="login-option neon-left">
                            <button class="email-toggle-btn" id="emailToggleBtn">
                                <span id="emailToggleIcon">▼</span>
                                Email Login
                            </button>

                            <div class="email-form" id="emailForm">
                                <input type="email" id="emailInput" placeholder="user@email.com" class="login-input" required>
                                <input type="password" id="passwordInput" placeholder="Password" class="login-input" required>
                                <button class="login-submit-btn" id="emailLoginBtn">Accedi</button>
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

        emailToggleBtn.addEventListener('click', () => {
            this.emailFormExpanded = !this.emailFormExpanded;
            if (this.emailFormExpanded) {
                emailForm.classList.add('expanded');
                emailToggleIcon.textContent = '▲';
            } else {
                emailForm.classList.remove('expanded');
                emailToggleIcon.textContent = '▼';
            }
        });

        // Google Sign-in
        const googleBtn = this.shadowRoot.getElementById('googleSigninBtn');
        googleBtn.addEventListener('click', async () => {
            googleBtn.disabled = true;
            googleBtn.textContent = 'Reindirizzamento a Google...';

            try {
                await auth.signInWithGoogle();
            } catch (error) {
                console.error('Google login error:', error);
                this.showError(error.message || 'Errore Google login');
                googleBtn.disabled = false;
                googleBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 18 18">...</svg> Sign in with Google';
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
            emailLoginBtn.textContent = 'Accesso in corso...';

            try {
                await auth.signInWithEmail(email, password);
            } catch (error) {
                console.error('Email login error:', error);
                this.showError(error.message || 'Errore login');
                emailLoginBtn.disabled = false;
                emailLoginBtn.textContent = 'Accedi';
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
