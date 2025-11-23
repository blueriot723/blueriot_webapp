// ===== BLUERIOT WEBAPP - DASHBOARD & TOURS =====
import { supabase } from ‘./auth.js’;

// Global state
let currentUser = null;
let currentTL = null;

// DOM elements - will be initialized when DOM is ready
let toursGrid, newTourBtn, newTourModal, newTourForm, closeModal, cancelTour, tourError;

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    // Initialize DOM elements
    toursGrid = document.getElementById('toursGrid');
    newTourBtn = document.getElementById('newTourBtn');
    newTourModal = document.getElementById('newTourModal');
    newTourForm = document.getElementById('newTourForm');
    closeModal = document.getElementById('closeModal');
    cancelTour = document.getElementById('cancelTour');
    tourError = document.getElementById('tourError');

    // Set up event listeners
    setupEventListeners();
}

// Listen for login event
window.addEventListener('userLoggedIn', (e) => {
    currentUser = e.detail.user;
    currentTL = e.detail.tlData;
    loadTours();
});

// Load tours
async function loadTours() {
    if (!currentTL || !currentTL.id) {
        if (toursGrid) {
            toursGrid.innerHTML = '<p class="loading" style="color: #FF4757;">Errore: Profilo TL non caricato</p>';
        }
        return;
    }

    try {
        if (toursGrid) {
            toursGrid.innerHTML = '<p class="loading">Caricamento tour...</p>';
        }

        const { data: tours, error } = await supabase
            .from('tours')
            .select('*')
            .eq('tl_id', currentTL.id)
            .order('start_date', { ascending: false });

        if (error) {
            console.error('Error loading tours:', error);
            if (toursGrid) {
                toursGrid.innerHTML = '<p class="loading" style="color: #FF4757;">Errore nel caricamento dei tour</p>';
            }
            return;
        }

        if (!tours || tours.length === 0) {
            if (toursGrid) {
                toursGrid.innerHTML = `
                    <div style="text-align: center; padding: 60px 20px; color: #8B9DC3;">
                        <h2 style="font-size: 24px; margin-bottom: 16px; color: #00F0FF;">Nessun tour ancora</h2>
                        <p style="font-size: 16px; margin-bottom: 24px;">Clicca su "+ Nuovo Tour" per creare il tuo primo tour!</p>
                    </div>
                `;
            }
        } else {
            displayTours(tours);
        }
    } catch (error) {
        console.error('Load tours error:', error);
        if (toursGrid) {
            toursGrid.innerHTML = '<p class="loading" style="color: #FF4757;">Errore nel caricamento dei tour</p>';
        }
    }
}

// Display tours
function displayTours(tours) {
    if (!toursGrid) return;

    toursGrid.innerHTML = tours.map(tour => `
        <div class="tour-card">
            <span class="tour-code">${tour.code}</span>
            <h3 class="tour-name">${tour.name}</h3>
            <div class="tour-meta">
                <div>📅 ${formatDate(tour.start_date)} - ${formatDate(tour.end_date)}</div>
                <div>🏢 ${tour.operator || 'N/A'}</div>
                <div>📊 ${tour.status === 'active' ? 'Attivo' : 'Archiviato'}</div>
            </div>
        </div>
    `).join('');
}

// Format date
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Set up all event listeners
function setupEventListeners() {
    // Open new tour modal
    if (newTourBtn) {
        newTourBtn.addEventListener('click', () => {
            if (newTourModal) newTourModal.classList.add('active');
            if (newTourForm) newTourForm.reset();
            hideTourError();
        });
    }

    // Close modal
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            if (newTourModal) newTourModal.classList.remove('active');
        });
    }

    if (cancelTour) {
        cancelTour.addEventListener('click', () => {
            if (newTourModal) newTourModal.classList.remove('active');
        });
    }

    // Close modal on outside click
    if (newTourModal) {
        newTourModal.addEventListener('click', (e) => {
            if (e.target === newTourModal) {
                newTourModal.classList.remove('active');
            }
        });
    }

    // Create new tour
    if (newTourForm) {
        newTourForm.addEventListener('submit', handleCreateTour);
    }
}

// Handle tour creation
async function handleCreateTour(e) {
    e.preventDefault();
    hideTourError();

    const tourData = {
        tl_id: currentTL.id,
        code: document.getElementById('tourCode').value.toUpperCase(),
        name: document.getElementById('tourName').value,
        operator: document.getElementById('tourOperator').value,
        start_date: document.getElementById('startDate').value,
        end_date: document.getElementById('endDate').value,
        status: 'active'
    };

    // Validate dates
    if (new Date(tourData.end_date) < new Date(tourData.start_date)) {
        showTourError('La data di fine deve essere successiva alla data di inizio');
        return;
    }

    try {
        const { error } = await supabase
            .from('tours')
            .insert([tourData]);

        if (error) throw error;

        // Success
        if (newTourModal) newTourModal.classList.remove('active');
        if (newTourForm) newTourForm.reset();
        loadTours();

    } catch (error) {
        console.error('Create tour error:', error);

        if (error.code === '23505') {
            showTourError('Codice tour già esistente. Usa un codice diverso.');
        } else {
            showTourError(error.message || 'Errore nella creazione del tour');
        }
    }
}

// Error handling
function showTourError(message) {
    if (tourError) {
        tourError.textContent = message;
        tourError.classList.add('show');
    } else {
        alert('Errore: ' + message);
    }
}

function hideTourError() {
    if (tourError) {
        tourError.classList.remove('show');
    }
}