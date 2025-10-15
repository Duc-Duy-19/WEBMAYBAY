const flightSelectionScript = document.createElement('script');
flightSelectionScript.src = 'javascript/flight-selection.js';
flightSelectionScript.type = 'text/javascript';
flightSelectionScript.onerror = () => {
    console.error('Không thể tải script flight-selection.js');
    alert('Có lỗi khi tải danh sách chuyến bay. Vui lòng thử lại!');
};
document.body.appendChild(flightSelectionScript);