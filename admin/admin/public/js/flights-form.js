// Flight Form JavaScript

// Load form data on page load
async function loadFormData() {
    try {
        // Load airlines, airports, and aircraft data
        const [airlines, airports, aircraft] = await Promise.all([
            apiCall('/airlines'),
            apiCall('/airports'),
            apiCall('/aircraft')
        ]);
        
        // Populate airline select
        const airlineSelect = document.getElementById('airlinerId');
        airlines.forEach(airline => {
            const option = document.createElement('option');
            option.value = airline.id;
            option.textContent = `${airline.name} (${airline.code})`;
            airlineSelect.appendChild(option);
        });
        
        // Populate airport selects
        const startFromSelect = document.getElementById('startFrom');
        const destinationSelect = document.getElementById('destination');
        
        airports.forEach(airport => {
            // Add to origin select
            const originOption = document.createElement('option');
            originOption.value = airport.id;
            originOption.textContent = `${airport.name} (${airport.code}) - ${airport.city}`;
            startFromSelect.appendChild(originOption);
            
            // Add to destination select
            const destOption = document.createElement('option');
            destOption.value = airport.id;
            destOption.textContent = `${airport.name} (${airport.code}) - ${airport.city}`;
            destinationSelect.appendChild(destOption);
        });
        
        // Populate aircraft select
        const aircraftSelect = document.getElementById('aircraftId');
        aircraft.forEach(plane => {
            const option = document.createElement('option');
            option.value = plane.id;
            option.textContent = `${plane.model} - ${plane.registration} (${plane.capacity} seats)`;
            aircraftSelect.appendChild(option);
        });
        
    } catch (error) {
        showNotification('Error loading form data', 'error');
    }
}

// Handle form submission
document.getElementById('flightForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        code: document.getElementById('flightCode').value.toUpperCase(),
        airliner_id: document.getElementById('airlinerId').value,
        aircraft_id: document.getElementById('aircraftId').value,
        type: document.getElementById('flightType').value,
        takeoff_time: document.getElementById('takeoffTime').value,
        landing_time: document.getElementById('landingTime').value,
        start_from: document.getElementById('startFrom').value,
        destination: document.getElementById('destination').value,
        economy_price: parseFloat(document.getElementById('economyPrice').value),
        business_price: parseFloat(document.getElementById('businessPrice').value),
        economy_seats: parseInt(document.getElementById('economySeats').value),
        business_seats: parseInt(document.getElementById('businessSeats').value),
        status: document.getElementById('flightStatus').value,
        gate: document.getElementById('gate').value,
        notes: document.getElementById('notes').value
    };
    
    // Validate times
    if (new Date(formData.landing_time) <= new Date(formData.takeoff_time)) {
        showNotification('Landing time must be after takeoff time', 'error');
        return;
    }
    
    // Validate origin and destination
    if (formData.start_from === formData.destination) {
        showNotification('Origin and destination cannot be the same', 'error');
        return;
    }
    
    try {
        // Check if we're editing or creating
        const urlParams = new URLSearchParams(window.location.search);
        const flightId = urlParams.get('id');
        
        if (flightId) {
            // Update existing flight
            await apiCall(`/flights/${flightId}`, 'PUT', formData);
            showNotification('Flight updated successfully');
        } else {
            // Create new flight
            await apiCall('/flights', 'POST', formData);
            showNotification('Flight created successfully');
        }
        
        // Redirect to flights list
        setTimeout(() => {
            window.location.href = 'flights.html';
        }, 1000);
        
    } catch (error) {
        showNotification('Error saving flight: ' + error.message, 'error');
    }
});

// Load flight data if editing
async function loadFlightData() {
    const urlParams = new URLSearchParams(window.location.search);
    const flightId = urlParams.get('id');
    
    if (flightId) {
        try {
            const flight = await apiCall(`/flights/${flightId}`);
            
            // Populate form fields
            document.getElementById('flightCode').value = flight.code || '';
            document.getElementById('airlinerId').value = flight.airliner_id || '';
            document.getElementById('aircraftId').value = flight.aircraft_id || '';
            document.getElementById('flightType').value = flight.type || 'domestic';
            document.getElementById('takeoffTime').value = formatDateTimeLocal(flight.takeoff_time);
            document.getElementById('landingTime').value = formatDateTimeLocal(flight.landing_time);
            document.getElementById('startFrom').value = flight.start_from || '';
            document.getElementById('destination').value = flight.destination || '';
            document.getElementById('economyPrice').value = flight.economy_price || '';
            document.getElementById('businessPrice').value = flight.business_price || '';
            document.getElementById('economySeats').value = flight.economy_seats || '';
            document.getElementById('businessSeats').value = flight.business_seats || '';
            document.getElementById('flightStatus').value = flight.status || 'scheduled';
            document.getElementById('gate').value = flight.gate || '';
            document.getElementById('notes').value = flight.notes || '';
            
            // Update page title
            document.querySelector('.page-title').textContent = 'Edit Flight';
            document.querySelector('.page-header h2').textContent = 'Edit Flight: ' + flight.code;
            
        } catch (error) {
            showNotification('Error loading flight data', 'error');
        }
    }
}

// Format date for datetime-local input
function formatDateTimeLocal(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Reset form
function resetForm() {
    if (confirm('Are you sure you want to reset all fields?')) {
        document.getElementById('flightForm').reset();
    }
}

// Calculate flight duration
function calculateDuration() {
    const takeoffTime = document.getElementById('takeoffTime').value;
    const landingTime = document.getElementById('landingTime').value;
    
    if (takeoffTime && landingTime) {
        const start = new Date(takeoffTime);
        const end = new Date(landingTime);
        const duration = end - start;
        
        if (duration > 0) {
            const hours = Math.floor(duration / (1000 * 60 * 60));
            const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
            
            const durationText = `${hours}h ${minutes}m`;
            // You can display this duration somewhere in the UI
            console.log('Flight duration:', durationText);
        }
    }
}

// Add event listeners for time changes
document.getElementById('takeoffTime').addEventListener('change', calculateDuration);
document.getElementById('landingTime').addEventListener('change', calculateDuration);

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    await loadFormData();
    await loadFlightData();
});