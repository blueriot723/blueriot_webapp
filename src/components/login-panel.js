/**
 * Login Panel Component - TRON Design
 * 20% sidebar (logo + language) + 80% login form
 */
import { auth } from '../utils/auth.js';

export class LoginPanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.currentLang = 'it';
        this.render();
    }

    connectedCallback() {
        this.setupEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                @import url('../styles/base.css');
                @import url('../styles/layout.css');
                @import url('../styles/components.css');

                :host {
                    display: block;
                    min-height: 100vh;
                }

                .login-container {
                    display: flex;
                    width: 100%;
                    min-height: 100vh;
                }

                .login-sidebar {
                    width: 20%;
                    min-width: 240px;
                    background: var(--bg-sidebar);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: var(--spacing-2xl) var(--spacing-lg);
                    border-right: 1px solid rgba(255, 79, 216, 0.2);
                    box-shadow: 0 0 24px rgba(255, 79, 216, 0.15);
                }

                .login-logo {
                    text-align: center;
                    margin-bottom: var(--spacing-2xl);
                }

                .logo-img {
                    max-width: 120px;
                    height: auto;
                    margin-bottom: var(--spacing-md);
                    filter: drop-shadow(0 0 16px rgba(0, 234, 255, 0.8));
                }

                .logo-text {
                    font-size: 18px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    color: var(--neon-cyan);
                    text-shadow: 0 0 8px var(--neon-cyan);
                }

                .logo-subtitle {
                    font-size: 12px;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .login-main {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: var(--spacing-2xl);
                    background: var(--bg-pure-dark);
                }

                .login-card {
                    width: 100%;
                    max-width: 480px;
                }

                .login-header {
                    margin-bottom: var(--spacing-2xl);
                }

                .login-title {
                    font-size: 32px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: var(--spacing-sm);
                    color: var(--neon-cyan);
                    text-shadow: 0 0 16px var(--neon-cyan);
                }

                .login-subtitle {
                    color: var(--text-secondary);
                    font-size: 16px;
                }

                .login-form {
                    background: var(--bg-card);
                    border: 1px solid rgba(0, 200, 255, 0.3);
                    border-radius: var(--radius-lg);
                    padding: var(--spacing-2xl);
                    box-shadow:
                        0 0 24px rgba(0, 200, 255, 0.4),
                        0 0 48px rgba(0, 200, 255, 0.2),
                        inset 0 0 32px rgba(0, 200, 255, 0.1);
                }

                .login-footer {
                    margin-top: var(--spacing-xl);
                    text-align: center;
                    color: var(--text-muted);
                    font-size: 14px;
                }

                .login-footer a {
                    color: var(--neon-cyan);
                    text-decoration: none;
                }

                .language-selector {
                    display: flex;
                    flex-wrap: wrap;
                    gap: var(--spacing-sm);
                    justify-content: center;
                    width: 100%;
                    max-width: 200px;
                }

                .language-btn {
                    flex: 0 0 auto;
                    min-width: 50px;
                    padding: 10px 14px;
                    background: transparent;
                    border: 1px solid rgba(255, 79, 216, 0.3);
                    border-radius: var(--radius-sm);
                    color: var(--text-secondary);
                    font-size: 13px;
                    font-weight: 600;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }

                .language-btn:hover {
                    border-color: var(--neon-fuchsia);
                    color: var(--neon-fuchsia);
                    box-shadow: 0 0 8px rgba(255, 79, 216, 0.4);
                }

                .language-btn.active {
                    background: rgba(255, 79, 216, 0.1);
                    border-color: var(--neon-fuchsia);
                    color: var(--neon-fuchsia);
                    box-shadow: 0 0 12px rgba(255, 79, 216, 0.5);
                }

                @media (max-width: 768px) {
                    .login-sidebar {
                        display: none;
                    }

                    .login-container {
                        flex-direction: column;
                    }

                    .login-main {
                        width: 100%;
                        padding: var(--spacing-lg);
                    }
                }

                @media (min-width: 769px) and (max-width: 1024px) {
                    .login-sidebar {
                        width: 25%;
                    }

                    .logo-img {
                        max-width: 100px;
                    }

                    .language-selector {
                        max-width: 180px;
                    }

                    .language-btn {
                        min-width: 45px;
                        padding: 8px 10px;
                        font-size: 12px;
                    }
                }
            </style>

            <div class="login-container">
                <!-- Sidebar 20% -->
                <div class="login-sidebar">
                    <div class="login-logo">
                        <img src="blueriot-logo.png" alt="BlueRiot Logo" class="logo-img">
                        <div class="logo-text">BLUERIOT</div>
                    </div>

                    <div class="language-selector">
                        <button class="language-btn ${this.currentLang === 'it' ? 'active' : ''}" data-lang="it">IT</button>
                        <button class="language-btn ${this.currentLang === 'en' ? 'active' : ''}" data-lang="en">EN</button>
                        <button class="language-btn ${this.currentLang === 'es' ? 'active' : ''}" data-lang="es">ES</button>
                        <button class="language-btn ${this.currentLang === 'de' ? 'active' : ''}" data-lang="de">DE</button>
                        <button class="language-btn ${this.currentLang === 'fr' ? 'active' : ''}" data-lang="fr">FR</button>
                    </div>
                </div>

                <!-- Main Content 80% -->
                <div class="login-main">
                    <div class="login-card">
                        <div class="login-header">
                            <h1 class="login-title">TL Dashboard</h1>
                            <p class="login-subtitle">Accedi con le tue credenziali</p>
                        </div>

                        <div class="login-form">
                            <form id="emailLoginForm">
                                <div class="form-group">
                                    <label class="form-label">Email</label>
                                    <input type="email" id="email" class="form-input" required placeholder="tuo@email.com">
                                </div>

                                <div class="form-group">
                                    <label class="form-label">Password</label>
                                    <input type="password" id="password" class="form-input" required placeholder="••••••••">
                                </div>

                                <button type="submit" class="btn btn-primary btn-block" id="loginBtn">
                                    Accedi
                                </button>

                                <div class="alert alert-error" id="errorMessage" style="display: none; margin-top: 16px;"></div>
                            </form>

                            <div class="divider">oppure</div>

                            <button type="button" class="btn btn-google btn-block" id="googleLoginBtn">
                                <svg width="18" height="18" viewBox="0 0 18 18">
                                    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                                    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                                    <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z"/>
                                    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
                                </svg>
                                Accedi con Google
                            </button>
                        </div>

                        <div class="login-footer">
                            <p>Problemi di accesso? Contatta <a href="https://t.me/blueriot">@blueriot</a></p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const form = this.shadowRoot.getElementById('emailLoginForm');
        const googleBtn = this.shadowRoot.getElementById('googleLoginBtn');
        const loginBtn = this.shadowRoot.getElementById('loginBtn');
        const errorMessage = this.shadowRoot.getElementById('errorMessage');

        // Language selector
        this.shadowRoot.querySelectorAll('.language-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentLang = btn.dataset.lang;
                this.shadowRoot.querySelectorAll('.language-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                // TODO: Update text based on language
            });
        });

        // Email login
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = this.shadowRoot.getElementById('email').value;
            const password = this.shadowRoot.getElementById('password').value;

            loginBtn.disabled = true;
            loginBtn.textContent = 'Accesso in corso...';
            errorMessage.style.display = 'none';

            try {
                await auth.signInWithEmail(email, password);
            } catch (error) {
                console.error('Login error:', error);
                errorMessage.textContent = error.message || 'Errore durante il login';
                errorMessage.style.display = 'block';
            } finally {
                loginBtn.disabled = false;
                loginBtn.textContent = 'Accedi';
            }
        });

        // Google login
        googleBtn.addEventListener('click', async () => {
            googleBtn.disabled = true;
            googleBtn.textContent = 'Reindirizzamento a Google...';
            errorMessage.style.display = 'none';

            try {
                await auth.signInWithGoogle();
            } catch (error) {
                console.error('Google login error:', error);
                errorMessage.textContent = error.message || 'Errore Google login';
                errorMessage.style.display = 'block';
                googleBtn.disabled = false;
                googleBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 18 18">...</svg> Accedi con Google';
            }
        });
    }
}

customElements.define('login-panel', LoginPanel);
