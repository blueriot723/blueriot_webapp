/**
 * Dashboard Frame Component
 * Main container for the authenticated user area
 */
import { auth } from '../utils/auth.js';

export class DashboardFrame extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
    }

    connectedCallback() {
        this.setupEventListeners();
        this.loadUserInfo();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    min-height: 100vh;
                    background: #000;
                }

                .navbar {
                    background: #0A0E27;
                    border-bottom: 1px solid #1E2749;
                    padding: 16px 24px;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }

                .navbar-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .navbar-brand {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #fff;
                    font-weight: 700;
                    font-size: 18px;
                }

                .navbar-user {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .user-name {
                    color: #8B9DC3;
                    font-size: 14px;
                }

                .btn-logout {
                    padding: 8px 16px;
                    background: transparent;
                    border: 2px solid #1E2749;
                    border-radius: 8px;
                    color: #8B9DC3;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .btn-logout:hover {
                    border-color: #FF4757;
                    color: #FF4757;
                }

                .main-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 24px;
                }

                .welcome-card {
                    background: #13182E;
                    border: 1px solid #1E2749;
                    border-radius: 12px;
                    padding: 32px;
                    text-align: center;
                    margin-top: 48px;
                }

                .welcome-card h1 {
                    color: #00F0FF;
                    font-size: 32px;
                    margin-bottom: 16px;
                }

                .welcome-card p {
                    color: #8B9DC3;
                    font-size: 16px;
                }

                .status {
                    margin-top: 24px;
                    padding: 16px;
                    background: rgba(0, 255, 136, 0.1);
                    border: 1px solid #00FF88;
                    border-radius: 8px;
                    color: #00FF88;
                }
            </style>

            <div class="navbar">
                <div class="navbar-content">
                    <div class="navbar-brand">
                        🔷 BlueRiot TL Dashboard
                    </div>
                    <div class="navbar-user">
                        <span class="user-name" id="userName">Caricamento...</span>
                        <button class="btn-logout" id="logoutBtn">Esci</button>
                    </div>
                </div>
            </div>

            <div class="main-content">
                <div class="welcome-card">
                    <h1>✅ Login Funzionante!</h1>
                    <p>Benvenuto nella nuova architettura modulare BlueRiot</p>
                    <div class="status">
                        🎉 Sistema di autenticazione funzionante con Web Components
                    </div>
                    <p style="margin-top: 24px; color: #8B9DC3; font-size: 14px;">
                        I componenti per gestire tour, ristoranti e hotel verranno migrati gradualmente
                    </p>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const logoutBtn = this.shadowRoot.getElementById('logoutBtn');

        logoutBtn.addEventListener('click', async () => {
            if (confirm('Sicuro di voler uscire?')) {
                await auth.signOut();
            }
        });
    }

    loadUserInfo() {
        const tl = auth.getTL();
        if (tl) {
            const userName = this.shadowRoot.getElementById('userName');
            userName.textContent = tl.name || tl.email || 'Tour Leader';
        }
    }
}

customElements.define('dashboard-frame', DashboardFrame);
