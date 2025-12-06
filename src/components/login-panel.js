/**
 * Login Panel Component
 * Handles both email/password and Google OAuth login
 */
import { auth } from '../utils/auth.js';

export class LoginPanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
    }

    connectedCallback() {
        this.setupEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #000;
                }

                .login-container {
                    width: 100%;
                    max-width: 400px;
                    padding: 24px;
                }

                .login-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .logo {
                    width: 120px;
                    height: 120px;
                    margin-bottom: 16px;
                }

                h1 {
                    font-size: 28px;
                    color: #fff;
                    margin-bottom: 8px;
                }

                .subtitle {
                    color: #8B9DC3;
                    font-size: 14px;
                }

                .login-form {
                    background: #13182E;
                    border: 1px solid #1E2749;
                    border-radius: 12px;
                    padding: 24px;
                }

                .form-group {
                    margin-bottom: 16px;
                }

                label {
                    display: block;
                    margin-bottom: 8px;
                    color: #8B9DC3;
                    font-size: 14px;
                    font-weight: 600;
                }

                input {
                    width: 100%;
                    padding: 12px 16px;
                    background: #0A0E27;
                    border: 2px solid #1E2749;
                    border-radius: 8px;
                    color: #fff;
                    font-size: 16px;
                    font-family: inherit;
                    transition: border-color 0.15s ease;
                }

                input:focus {
                    outline: none;
                    border-color: #00F0FF;
                }

                input::placeholder {
                    color: #8B9DC3;
                    opacity: 0.5;
                }

                .btn {
                    width: 100%;
                    padding: 12px 24px;
                    border: 2px solid transparent;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .btn-primary {
                    background: #00F0FF;
                    color: #000;
                    border-color: #00F0FF;
                }

                .btn-primary:hover:not(:disabled) {
                    background: transparent;
                    color: #00F0FF;
                }

                .btn-google {
                    background: white;
                    color: #333;
                    border-color: white;
                    margin-top: 16px;
                }

                .btn-google:hover:not(:disabled) {
                    background: #f5f5f5;
                }

                .divider {
                    text-align: center;
                    margin: 24px 0;
                    color: #8B9DC3;
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
                    background: #1E2749;
                }

                .divider::before { left: 0; }
                .divider::after { right: 0; }

                .error-message {
                    color: #FF4757;
                    font-size: 14px;
                    margin-top: 16px;
                    padding: 12px;
                    background: rgba(255, 71, 87, 0.1);
                    border: 1px solid #FF4757;
                    border-radius: 8px;
                    display: none;
                }

                .error-message.active {
                    display: block;
                }

                .login-footer {
                    text-align: center;
                    margin-top: 24px;
                    color: #8B9DC3;
                    font-size: 14px;
                }

                .login-footer a {
                    color: #00F0FF;
                    text-decoration: none;
                }
            </style>

            <div class="login-container">
                <div class="login-header">
                    <h1>🔷 BlueRiot TL Dashboard</h1>
                    <p class="subtitle">Accedi con le tue credenziali</p>
                </div>

                <div class="login-form">
                    <form id="emailLoginForm">
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" required placeholder="tuo@email.com">
                        </div>

                        <div class="form-group">
                            <label for="password">Password</label>
                            <input type="password" id="password" required placeholder="••••••••">
                        </div>

                        <button type="submit" class="btn btn-primary" id="loginBtn">
                            Accedi
                        </button>

                        <div class="error-message" id="errorMessage"></div>
                    </form>

                    <div class="divider">oppure</div>

                    <button type="button" class="btn btn-google" id="googleLoginBtn">
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
        `;
    }

    setupEventListeners() {
        const form = this.shadowRoot.getElementById('emailLoginForm');
        const googleBtn = this.shadowRoot.getElementById('googleLoginBtn');
        const loginBtn = this.shadowRoot.getElementById('loginBtn');
        const errorMessage = this.shadowRoot.getElementById('errorMessage');

        // Email login
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = this.shadowRoot.getElementById('email').value;
            const password = this.shadowRoot.getElementById('password').value;

            loginBtn.disabled = true;
            loginBtn.textContent = 'Accesso in corso...';
            errorMessage.classList.remove('active');

            try {
                await auth.signInWithEmail(email, password);
            } catch (error) {
                console.error('Login error:', error);
                errorMessage.textContent = error.message || 'Errore durante il login';
                errorMessage.classList.add('active');
            } finally {
                loginBtn.disabled = false;
                loginBtn.textContent = 'Accedi';
            }
        });

        // Google login
        googleBtn.addEventListener('click', async () => {
            googleBtn.disabled = true;
            googleBtn.textContent = 'Reindirizzamento a Google...';
            errorMessage.classList.remove('active');

            try {
                await auth.signInWithGoogle();
            } catch (error) {
                console.error('Google login error:', error);
                errorMessage.textContent = error.message || 'Errore Google login';
                errorMessage.classList.add('active');
                googleBtn.disabled = false;
                googleBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 18 18">...</svg> Accedi con Google';
            }
        });
    }
}

customElements.define('login-panel', LoginPanel);
