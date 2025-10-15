document.addEventListener("DOMContentLoaded", () => {
  const signupBtn = document.querySelector(".btn-signup");
  if (signupBtn) {
    signupBtn.addEventListener("click", () => {
      loadRegisterForm();
    });
  }
});
document.addEventListener('DOMContentLoaded', () => {
  console.log('TripMa application initialized');
  
  // Store initial flight data in session storage 
  // (if not already populated from flight-results.js)
  if (!sessionStorage.getItem('selectedFlightInfo')) {
      const defaultFlightInfo = {
          airlineName: 'VietJet Air',
          flightNumber: 'VJ456',
          departureTime: '5:00 chiều',
          arrivalTime: '6:15 chiều',
          duration: '1 giờ 15 phút',
          price: '1.300.000',
          airlineLogo: 'assets/logo/vietjetair.png'
      };
      sessionStorage.setItem('selectedFlightInfo', JSON.stringify(defaultFlightInfo));
  }
});