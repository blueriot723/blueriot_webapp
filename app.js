// ===== BLUERIOT WEBAPP - DASHBOARD & TOURS =====
import { supabase } from ‘./auth.js’;

// Global state
let currentUser = null;
let currentTL = null;

// DOM elements
const toursGrid = document.getElementById(‘toursGrid’);
const newTourBtn = document.getElementById(‘newTourBtn’);
const newTourModal = document.getElementById(‘newTourModal’);
const newTourForm = document.getElementById(‘newTourForm’);
const closeModal = document.getElementById(‘closeModal’);
const cancelTour = document.getElementById(‘cancelTour’);
const tourError = document.getElementById(‘tourError’);

// Listen for login event
window.addEventListener(‘userLoggedIn’, (e) => {
currentUser = e.detail.user;
currentTL = e.detail.tlData;
loadTours();
});

// Load tours
async function loadTours() {
if (!currentTL || !currentTL.id) {
toursGrid.innerHTML = ‘<p class="loading" style="color: #FF4757;">Errore: Profilo TL non caricato</p>’;
return;
}

```
try {
    toursGrid.innerHTML = '<p class="loading">Caricamento tour...</p>';
    
    const { data: tours, error } = await supabase
        .from('tours')
        .select('*')
        .eq('tl_id', currentTL.id)
        .order('start_date', { ascending: false });
    
    if (error) {
        console.error('Error loading tours:', error);
        toursGrid.innerHTML = '<p class="loading" style="color: #FF4757;">Errore nel caricamento dei tour</p>';
        return;
    }
    
    if (!tours || tours.length === 0) {
        toursGrid.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #8B9DC3;">
                <h2 style="font-size: 24px; margin-bottom: 16px; color: #00F0FF;">Nessun tour ancora</h2>
                <p style="font-size: 16px; margin-bottom: 24px;">Clicca su "+ Nuovo Tour" per creare il tuo primo tour!</p>
            </div>
        `;
    } else {
        displayTours(tours);
    }
} catch (error) {
    console.error('Load tours error:', error);
    toursGrid.innerHTML = '<p class="loading" style="color: #FF4757;">Errore nel caricamento dei tour</p>';
}
```

}

// Display tours
function displayTours(tours) {
toursGrid.innerHTML = tours.map(tour => `<div class="tour-card"> <span class="tour-code">${tour.code}</span> <h3 class="tour-name">${tour.name}</h3> <div class="tour-meta"> <div>📅 ${formatDate(tour.start_date)} - ${formatDate(tour.end_date)}</div> <div>🏢 ${tour.operator || 'N/A'}</div> <div>📊 ${tour.status === 'active' ? 'Attivo' : 'Archiviato'}</div> </div> </div>`).join(’’);
}

// Format date
function formatDate(dateString) {
return new Date(dateString).toLocaleDateString(‘it-IT’, {
day: ‘2-digit’,
month: ‘2-digit’,
year: ‘numeric’
});
}

// Open new tour modal
newTourBtn.addEventListener(‘click’, () => {
newTourModal.classList.add(‘active’);
newTourForm.reset();
hideTourError();
});

// Close modal
closeModal.addEventListener(‘click’, () => {
newTourModal.classList.remove(‘active’);
});

cancelTour.addEventListener(‘click’, () => {
newTourModal.classList.remove(‘active’);
});

// Close modal on outside click
newTourModal.addEventListener(‘click’, (e) => {
if (e.target === newTourModal) {
newTourModal.classList.remove(‘active’);
}
});

// Create new tour
newTourForm.addEventListener(‘submit’, async (e) => {
e.preventDefault();
hideTourError();

```
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
    newTourModal.classList.remove('active');
    newTourForm.reset();
    loadTours();
    
} catch (error) {
    console.error('Create tour error:', error);
    
    if (error.code === '23505') {
        showTourError('Codice tour già esistente. Usa un codice diverso.');
    } else {
        showTourError(error.message || 'Errore nella creazione del tour');
    }
}
```

});

// Error handling
function showTourError(message) {
tourError.textContent = message;
tourError.classList.add(‘show’);
}

function hideTourError() {
tourError.classList.remove(‘show’);
}