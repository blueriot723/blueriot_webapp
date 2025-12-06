/**
 * Dashboard Frame Component - TRON Design
 * 20% sidebar (logo + menu) + 80% main content area
 */
import { auth } from '../utils/auth.js';
import { router } from '../utils/router.js';

export class DashboardFrame extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.currentView = 'tastes';
        this.user = null;
        this.render();
    }

    async connectedCallback() {
        // Get user info
        this.user = await auth.getCurrentUser();
        this.updateUserInfo();
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

                .app-container {
                    display: flex;
                    width: 100%;
                    min-height: 100vh;
                }

                /* Sidebar 20% */
                .sidebar {
                    width: 20%;
                    min-width: 240px;
                    max-width: 320px;
                    height: 100vh;
                    position: fixed;
                    left: 0;
                    top: 0;
                    background: var(--bg-sidebar);
                    border-right: 1px solid rgba(255, 79, 216, 0.2);
                    display: flex;
                    flex-direction: column;
                    overflow-y: auto;
                    box-shadow: 0 0 24px rgba(255, 79, 216, 0.15);
                }

                .sidebar-logo {
                    padding: var(--spacing-2xl) var(--spacing-lg);
                    text-align: center;
                    border-bottom: 1px solid rgba(255, 79, 216, 0.1);
                }

                .logo-img {
                    max-width: 100px;
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

                .sidebar-menu {
                    flex: 1;
                    padding: var(--spacing-lg) 0;
                }

                .sidebar-menu-item {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-md);
                    padding: var(--spacing-md) var(--spacing-lg);
                    margin: var(--spacing-xs) var(--spacing-md);
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    font-size: 14px;
                    font-weight: 600;
                    letter-spacing: 1px;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: all var(--transition-normal);
                    border: 1px solid transparent;
                    background: transparent;
                    width: calc(100% - 32px);
                }

                .sidebar-menu-item:hover {
                    color: var(--neon-fuchsia);
                    background: rgba(255, 79, 216, 0.05);
                    border-color: rgba(255, 79, 216, 0.2);
                }

                .sidebar-menu-item.active {
                    color: var(--neon-pink);
                    background: rgba(255, 79, 216, 0.1);
                    border-color: rgba(255, 79, 216, 0.4);
                    box-shadow:
                        0 0 12px rgba(255, 79, 216, 0.4),
                        inset 0 0 16px rgba(255, 79, 216, 0.1);
                    text-shadow:
                        0 0 6px var(--neon-pink),
                        0 0 16px var(--neon-pink);
                }

                .sidebar-menu-icon {
                    font-size: 18px;
                    width: 24px;
                    text-align: center;
                }

                /* Matrix Label Style */
                .matrixLabel {
                    font-family: 'Share Tech Mono', monospace;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                }

                /* Sub-menu items (indented) */
                .sidebar-menu-item.sub-item {
                    margin-left: var(--spacing-2xl);
                    font-size: 13px;
                    padding-left: var(--spacing-lg);
                    border-left: 2px solid rgba(255, 79, 216, 0.2);
                }

                .sidebar-menu-item.sub-item::before {
                    content: '└─';
                    margin-right: var(--spacing-sm);
                    color: var(--neon-pink);
                    opacity: 0.5;
                }

                .sidebar-footer {
                    padding: var(--spacing-lg);
                    border-top: 1px solid rgba(255, 79, 216, 0.1);
                }

                .sidebar-user {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm);
                    padding: var(--spacing-sm);
                    background: rgba(255, 79, 216, 0.05);
                    border-radius: var(--radius-md);
                    margin-bottom: var(--spacing-md);
                }

                .sidebar-user-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--neon-cyan), var(--neon-fuchsia));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 16px;
                    color: #000;
                }

                .sidebar-user-info {
                    flex: 1;
                    min-width: 0;
                }

                .sidebar-user-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-primary);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .sidebar-user-role {
                    font-size: 12px;
                    color: var(--text-muted);
                }

                .btn-logout {
                    width: 100%;
                    padding: var(--spacing-sm) var(--spacing-md);
                    background: transparent;
                    border: 1px solid rgba(255, 79, 216, 0.3);
                    border-radius: var(--radius-md);
                    color: var(--neon-fuchsia);
                    font-size: 13px;
                    font-weight: 600;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }

                .btn-logout:hover {
                    background: rgba(255, 79, 216, 0.1);
                    box-shadow: 0 0 12px rgba(255, 79, 216, 0.4);
                }

                /* Main Content 80% */
                .main-content {
                    margin-left: 20%;
                    min-width: 0;
                    flex: 1;
                    padding: var(--spacing-2xl);
                    background: var(--bg-pure-dark);
                    min-height: 100vh;
                }

                .breadcrumb {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm);
                    margin-bottom: var(--spacing-xl);
                    font-size: 14px;
                    color: var(--text-muted);
                }

                .breadcrumb-separator {
                    color: var(--neon-cyan);
                }

                .breadcrumb-current {
                    color: var(--neon-cyan);
                    font-weight: 600;
                    text-transform: uppercase;
                    text-shadow: 0 0 8px rgba(0, 234, 255, 0.6);
                }

                .content-wrapper {
                    background: var(--bg-card);
                    border: 1px solid rgba(0, 234, 255, 0.3);
                    border-radius: var(--radius-lg);
                    padding: var(--spacing-2xl);
                    box-shadow:
                        0 0 12px rgba(0, 234, 255, 0.5),
                        0 0 32px rgba(0, 234, 255, 0.25),
                        inset 0 0 16px rgba(0, 234, 255, 0.25);
                    position: relative;
                }

                /* TRON corner cuts */
                .content-wrapper::before,
                .content-wrapper::after {
                    content: '';
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    border: 1px solid var(--neon-cyan);
                }

                .content-wrapper::before {
                    top: -1px;
                    left: -1px;
                    border-right: none;
                    border-bottom: none;
                    box-shadow: -2px -2px 8px rgba(0, 234, 255, 0.4);
                }

                .content-wrapper::after {
                    bottom: -1px;
                    right: -1px;
                    border-left: none;
                    border-top: none;
                    box-shadow: 2px 2px 8px rgba(0, 234, 255, 0.4);
                }

                .page-title {
                    font-size: 32px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: var(--neon-cyan);
                    margin-bottom: var(--spacing-lg);
                    text-shadow: 0 0 16px var(--neon-cyan);
                }

                /* Mobile responsive */
                @media (max-width: 768px) {
                    .sidebar {
                        transform: translateX(-100%);
                        transition: transform var(--transition-normal);
                        z-index: 1000;
                    }

                    .sidebar.open {
                        transform: translateX(0);
                    }

                    .main-content {
                        margin-left: 0;
                        padding: var(--spacing-lg);
                    }

                    .menu-toggle {
                        display: flex;
                    }
                }

                .menu-toggle {
                    position: fixed;
                    top: var(--spacing-lg);
                    left: var(--spacing-lg);
                    z-index: 1001;
                    display: none;
                    width: 48px;
                    height: 48px;
                    background: var(--bg-sidebar);
                    border: 1px solid rgba(255, 79, 216, 0.3);
                    border-radius: var(--radius-md);
                    color: var(--neon-fuchsia);
                    font-size: 24px;
                    cursor: pointer;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 0 12px rgba(255, 79, 216, 0.4);
                }
            </style>

            <div class="app-container">
                <!-- Mobile Menu Toggle -->
                <button class="menu-toggle" id="menuToggle">☰</button>

                <!-- Sidebar 20% -->
                <aside class="sidebar" id="sidebar">
                    <div class="sidebar-logo">
                        <img src="blueriot-logo.png" alt="BlueRiot Logo" class="logo-img">
                        <div class="logo-text">BLUERIOT</div>
                    </div>

                    <nav class="sidebar-menu">
                        <button class="sidebar-menu-item active" data-view="tastes">
                            <span class="sidebar-menu-icon">🍽️</span>
                            <span class="matrixLabel">ΤΔSΤΞ5</span>
                        </button>
                        <button class="sidebar-menu-item" data-view="routes">
                            <span class="sidebar-menu-icon">🗺️</span>
                            <span class="matrixLabel">R0UT35</span>
                        </button>
                        <button class="sidebar-menu-item" data-view="stay">
                            <span class="sidebar-menu-icon">🏨</span>
                            <span class="matrixLabel">SΤΔΥ</span>
                        </button>
                        <button class="sidebar-menu-item" data-view="node">
                            <span class="sidebar-menu-icon">📍</span>
                            <span class="matrixLabel">NODΞ</span>
                        </button>
                        <button class="sidebar-menu-item sub-item" data-view="pdfocr">
                            <span class="sidebar-menu-icon">📄</span>
                            <span>PDF OCR</span>
                        </button>
                    </nav>

                    <div class="sidebar-footer">
                        <div class="sidebar-user">
                            <div class="sidebar-user-avatar" id="userAvatar">?</div>
                            <div class="sidebar-user-info">
                                <div class="sidebar-user-name" id="userName">Loading...</div>
                                <div class="sidebar-user-role">Team Leader</div>
                            </div>
                        </div>
                        <button class="btn-logout" id="logoutBtn">Logout</button>
                    </div>
                </aside>

                <!-- Main Content 80% -->
                <main class="main-content">
                    <div class="breadcrumb">
                        <span>Dashboard</span>
                        <span class="breadcrumb-separator">▸</span>
                        <span class="breadcrumb-current" id="breadcrumbCurrent">ΤΔSΤΞ5</span>
                    </div>

                    <div class="content-wrapper">
                        <h1 class="page-title" id="pageTitle">ΤΔSΤΞ5</h1>
                        <div id="contentArea">
                            <!-- Dynamic content will be loaded here -->
                            <p style="color: var(--text-secondary);">Loading content...</p>
                        </div>
                    </div>
                </main>
            </div>
        `;
    }

    setupEventListeners() {
        // Menu navigation
        this.shadowRoot.querySelectorAll('.sidebar-menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const view = item.dataset.view;
                this.navigateTo(view);
            });
        });

        // Logout
        const logoutBtn = this.shadowRoot.getElementById('logoutBtn');
        logoutBtn.addEventListener('click', async () => {
            await auth.signOut();
            await router.navigate('login');
        });

        // Mobile menu toggle
        const menuToggle = this.shadowRoot.getElementById('menuToggle');
        const sidebar = this.shadowRoot.getElementById('sidebar');
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    async updateUserInfo() {
        if (!this.user) return;

        const userName = this.shadowRoot.getElementById('userName');
        const userAvatar = this.shadowRoot.getElementById('userAvatar');

        const email = this.user.email || 'User';
        userName.textContent = email;

        // Get initials for avatar
        const initials = email.charAt(0).toUpperCase();
        userAvatar.textContent = initials;
    }

    async navigateTo(view) {
        this.currentView = view;

        // Update active menu item
        this.shadowRoot.querySelectorAll('.sidebar-menu-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.view === view) {
                item.classList.add('active');
            }
        });

        // Matrix labels mapping
        const matrixLabels = {
            'tastes': 'ΤΔSΤΞ5',
            'routes': 'R0UT35',
            'stay': 'SΤΔΥ',
            'node': 'NODΞ',
            'pdfocr': 'PDF OCR'
        };

        // Update breadcrumb
        const breadcrumb = this.shadowRoot.getElementById('breadcrumbCurrent');
        breadcrumb.textContent = matrixLabels[view] || view.toUpperCase();

        // Update page title
        const pageTitle = this.shadowRoot.getElementById('pageTitle');
        pageTitle.textContent = matrixLabels[view] || view.toUpperCase();

        // Load content component
        const contentArea = this.shadowRoot.getElementById('contentArea');
        contentArea.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: var(--spacing-2xl);">Loading...</p>';

        try {
            if (view === 'tastes') {
                await import('./tastes-panel-v2.js');
                contentArea.innerHTML = '<tastes-panel-v2></tastes-panel-v2>';
            } else if (view === 'routes') {
                await import('./routes-panel.js');
                contentArea.innerHTML = '<routes-panel></routes-panel>';
            } else if (view === 'stay') {
                await import('./stay-panel.js');
                contentArea.innerHTML = '<stay-panel></stay-panel>';
            } else if (view === 'node') {
                await import('./node-panel.js');
                contentArea.innerHTML = '<node-panel></node-panel>';
            } else if (view === 'pdfocr') {
                await import('./pdf-ocr-panel.js');
                contentArea.innerHTML = '<pdf-ocr-panel></pdf-ocr-panel>';
            } else {
                contentArea.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: var(--spacing-2xl);">Unknown view</p>';
            }
        } catch (error) {
            console.error('Error loading component:', error);
            contentArea.innerHTML = '<p style="color: var(--error); text-align: center; padding: var(--spacing-2xl);">Error loading component</p>';
        }

        // Dispatch event for content loading
        this.dispatchEvent(new CustomEvent('view-change', {
            detail: { view },
            bubbles: true,
            composed: true
        }));

        // Close mobile menu if open
        const sidebar = this.shadowRoot.getElementById('sidebar');
        sidebar.classList.remove('open');
    }
}

customElements.define('dashboard-frame', DashboardFrame);
