// File: javascript/load-flight-selection.js
// Phiên bản đã loại bỏ thanh toán và chọn ghế

async function loadAirlineInfo(aircraftId) {
    if (!aircraftId) {
        console.error("Không có ID máy bay để tìm thông tin hãng hàng không");
        return null;
    }
    
    try {
        // Cập nhật đường dẫn API cho đúng với controller
        const response = await fetch(`http://localhost:3000/api/may-bay/${aircraftId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const aircraftInfo = await response.json();
        console.log("Thông tin máy bay:", aircraftInfo);
        return aircraftInfo;
        
    } catch (error) {
        console.error("Lỗi khi tải thông tin máy bay:", error);
        return null;
    }
}

// HÀM MỚI: Hiển thị thông báo thành công
function showSuccessMessage(bookingData) {
    // Tạo overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `;

    // Tạo modal thông báo
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 10px;
        text-align: center;
        max-width: 400px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;

    // Tải thông tin hãng hàng không trước khi hiển thị modal
    loadAirlineInfo(bookingData.flight.ID_MayBay).then(airlineInfo => {
        const airlineName = airlineInfo ? airlineInfo.HangHangKhong : 'Chưa xác định';
        
        const departureTime = new Date(bookingData.flight.ThoiGianKhoiHanh).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        
        const arrivalTime = new Date(bookingData.flight.ThoiGianHaCanh).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

    modal.innerHTML = `
        <h2 style="color: #4CAF50; margin-bottom: 20px;">✓ Lưu thông tin thành công!</h2>
        <p style="margin-bottom: 20px;">Thông tin của bạn đã được lưu thành công.</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; text-align: left;">
            <strong>Thông tin đặt vé:</strong><br>
                Hành khách: ${bookingData.passenger.lastName} ${bookingData.passenger.middleName} ${bookingData.passenger.firstName}<br>
                Chuyến bay: ${bookingData.flight.ID_ChuyenBay}<br>
                Hãng hàng không: ${airlineName}<br>
                Thời gian: ${departureTime} - ${arrivalTime}<br>
                Giá vé: ${parseInt(bookingData.flight.GiaCoSo).toLocaleString()} VND
        </div>
        <button id="success-btn" style="
            background: #ff5c00;
            color: white;
            padding: 10px 30px;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
        ">Xác nhận</button>
            <button id="choose-seat-btn" style="
                background: #4a4a9e;
                color: white;
                padding: 10px 30px;
                border: none;
                border-radius: 5px;
                font-size: 16px;
                cursor: pointer;
                margin-left: 10px;
            ">Chọn ghế ngồi</button>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Xử lý nút xác nhận
    document.getElementById('success-btn').addEventListener('click', function() {
        document.body.removeChild(overlay);
        
        // Có thể reset form hoặc quay về danh sách chuyến bay
        if (confirm('Bạn có muốn đặt thêm vé khác?')) {
            // Reset form
            document.querySelectorAll('input').forEach(input => {
                if (input.type !== 'checkbox' && input.type !== 'radio') {
                    input.value = '';
                }
            });
            
            // Ẩn form thông tin hành khách, hiện lại danh sách chuyến bay
            const flightResultsPlaceholder = document.getElementById('flight-results-placeholder');
            
            if (flightResultsPlaceholder) {
                flightResultsPlaceholder.style.display = 'block';
            }
            window.scrollTo(0, 0);
        }
    });
        
        // Xử lý nút chọn ghế ngồi
        document.getElementById('choose-seat-btn').addEventListener('click', function() {
            document.body.removeChild(overlay);
            window.location.href = '../chonghechuyenbay/choose-flight-seat.html';
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('LOADING FLIGHT SELECTION PAGE');
    
    // Lấy lại thông tin tìm kiếm
    const searchData = JSON.parse(sessionStorage.getItem('searchFlightData') || '{}');
    
    // Không cần tải danh sách sân bay vì form tìm kiếm đã bị xóa
    
    // Lấy kết quả tìm kiếm từ sessionStorage
    const flights = JSON.parse(sessionStorage.getItem('searchFlightResults') || '[]');
    const flightList = document.querySelector('.flight-list');
    if (!flightList) return;

    flightList.innerHTML = '';

    if (!flights.length) {
        flightList.innerHTML = '<div class="no-flights">Không có chuyến bay nào phù hợp.</div>';
        return;
    }

    // Tải thông tin máy bay và hiển thị danh sách chuyến bay
    loadAndDisplayFlights(flights, flightList);
});

// Helper function to fix logo path
function fixLogoPath(logoPath) {
    if (!logoPath) return 'TripMa/assets/logo/vietnamairlines.png';
    
    // If it's a full URL, return as is
    if (logoPath.startsWith('http')) return logoPath;
    
    // Remove leading slash if present
    return logoPath.replace(/^\//, '');
}

// Hàm mới: Tải thông tin máy bay và hiển thị danh sách chuyến bay
async function loadAndDisplayFlights(flights, flightList) {
    try {
        // Xóa danh sách chuyến bay hiện tại
        flightList.innerHTML = '';
        
        if (!flights || flights.length == 0) {
            flightList.innerHTML = '<div class="no-flights">Không tìm thấy chuyến bay nào phù hợp với tiêu chí tìm kiếm.</div>';
            return;
        }
        
        console.log("Số chuyến bay tìm thấy:", flights.length);
        
        // Dữ liệu máy bay
        let aircraftList = [];
        try {
            const aircraftResponse = await fetch("http://localhost:3000/api/may-bay", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            
            if (aircraftResponse.ok) {
                aircraftList = await aircraftResponse.json();
                console.log("Dữ liệu máy bay:", aircraftList);
            } else {
                console.error("Lỗi khi lấy thông tin máy bay");
            }
        } catch (error) {
            console.error("Lỗi khi gọi API máy bay:", error);
        }
        
        // Dữ liệu sân bay
        let airportList = [];
        try {
            const airportResponse = await fetch("http://localhost:3000/api/san-bay", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            
            if (airportResponse.ok) {
                airportList = await airportResponse.json();
                console.log("Dữ liệu sân bay:", airportList);
            } else {
                console.error("Lỗi khi lấy thông tin sân bay");
            }
        } catch (error) {
            console.error("Lỗi khi gọi API sân bay:", error);
        }
        
        // Tạo DOM elements cho từng chuyến bay
        flights.forEach(flight => {
            console.log('flight:', flight);
            console.log('ThoiGianKhoiHanh:', flight.ThoiGianKhoiHanh);
            console.log('ThoiGianHaCanh:', flight.ThoiGianHaCanh);
            // Tìm thông tin máy bay
            const aircraft = aircraftList.find(a => a.ID_MayBay == flight.ID_MayBay) || {};
            // Tìm thông tin sân bay
            const fromAirport = airportList.find(a => a.ID_SanBay == flight.ID_SanBayDi) || {};
            const toAirport = airportList.find(a => a.ID_SanBay == flight.ID_SanBayDen) || {};
            
            // Format thông tin thời gian (dùng hàm formatFlightTime)
            const departureTime = formatFlightTime(flight.ThoiGianKhoiHanh);
            const arrivalTime = formatFlightTime(flight.ThoiGianHaCanh);
            const duration = calculateDuration(flight.ThoiGianKhoiHanh, flight.ThoiGianHaCanh);
            const durationText = formatDuration(duration);
            
            // Tạo element mới
            const item = document.createElement('div');
            item.className = 'flight-item';
            
            // Chuẩn hóa đường dẫn logo
            const logoPath = fixLogoPath(aircraft.LogoURL || 'TripMa/assets/logo/vietnamairlines.png');
            console.log("Logo path for flight:", flight.ID_ChuyenBay, logoPath);
            
            item.innerHTML = `
                <div class="flight-card" data-id="${flight.ID_ChuyenBay}">
                    <div class="airline-info">
                        <img src="${logoPath}" 
                        alt="${aircraft.HangHangKhong || 'Airline'} Logo" 
                        class="airline-logo">
                        <div class="airline-name">${aircraft.HangHangKhong || "Hãng hàng không"}</div>
                        <div class="flight-number">Chuyến bay: ${flight.ID_ChuyenBay || "N/A"}</div>
                    </div>
                    <div class="flight-time">
                        <div class="time-details">
                            <div class="departure-time">
                                <span class="time">${formatFlightTime(flight.ThoiGianKhoiHanh)}</span>
                                <div class="airport-code">${fromAirport.MaSanBay || fromAirport.ThanhPho || flight.ID_SanBayDi}</div>
                            </div>
                            <div class="duration">
                                <div class="duration-line"></div>
                                <div class="duration-time">${durationText}</div>
                            </div>
                            <div class="arrival-time">
                                <span class="time">${formatFlightTime(flight.ThoiGianHaCanh)}</span>
                                <div class="airport-code">${toAirport.MaSanBay || toAirport.ThanhPho || flight.ID_SanBayDen}</div>
                            </div>
                        </div>
                    </div>
                    <div class="flight-price">
                        <div class="price-amount">${Number(flight.GiaCoSo).toLocaleString()} VND</div>
                        <div class="price-type">Khứ hồi</div>
                    </div>
                    <a href="#" class="flight-details-link" data-id="${flight.ID_ChuyenBay}">Chi tiết hành trình →</a>
                    <button class="btn-choose">Chọn</button>
                </div>
            `;
            
            // Sau khi thêm HTML, tìm và thêm event listener cho nút Chọn
            const chooseButton = item.querySelector('.btn-choose');
            if (chooseButton) {
                chooseButton.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const depDateObj = parseDateTimeString(flight.ThoiGianKhoiHanh);
                    const arrDateObj = parseDateTimeString(flight.ThoiGianHaCanh);
                    const depDateStr = depDateObj ? `${depDateObj.getDate().toString().padStart(2, '0')}/${(depDateObj.getMonth()+1).toString().padStart(2, '0')}` : '';
                    const arrDateStr = arrDateObj ? `${arrDateObj.getDate().toString().padStart(2, '0')}/${(arrDateObj.getMonth()+1).toString().padStart(2, '0')}` : '';

                    const enhancedFlight = {
                        ...flight,
                        airlineName: aircraft.HangHangKhong || 'Hãng hàng không',
                        airlineCode: aircraft.MaHang || '',
                        airlineLogo: logoPath,
                        departureCity: fromAirport.ThanhPho || '',
                        departureCode: fromAirport.MaSanBay || fromAirport.ID_SanBay || flight.ID_SanBayDi,
                        arrivalCity: toAirport.ThanhPho || '',
                        arrivalCode: toAirport.MaSanBay || toAirport.ID_SanBay || flight.ID_SanBayDen,
                        formattedDepartureTime: departureTime,
                        formattedArrivalTime: arrivalTime,
                        departureDate: depDateStr,
                        arrivalDate: arrDateStr,
                        duration: durationText
                    };
                    sessionStorage.setItem('selectedFlightInfo', JSON.stringify(enhancedFlight));
                    window.location.href = '../chonghechuyenbay/choose-flight-seat.html';
                });
            }
            
            flightList.appendChild(item);
        });
        
        // Sau khi render xong danh sách chuyến bay, gọi attachFlightDetailEvents()
        attachFlightDetailEvents();
        
    } catch (error) {
        console.error("Lỗi khi hiển thị danh sách chuyến bay:", error);
        flightList.innerHTML = '<div class="error-message">Đã xảy ra lỗi khi tải dữ liệu chuyến bay.</div>';
    }
}

const selectedSeatLabel = document.getElementById('selected-seat-label');
const selectedSeatType = document.getElementById('selected-seat-type');
const seatSurcharge = document.getElementById('seat-surcharge');
const totalPrice = document.getElementById('total-price');

// Format flight time from datetime string
function formatFlightTime(timeString) {
    if (!timeString) return '00:00';
    if (timeString.includes(' ')) {
        return timeString.split(' ')[1].slice(0, 5);
    }
    return timeString;
}

function parseDateTimeString(str) {
    if (!str) return null;
    if (str.includes(' ')) {
        const [datePart, timePart] = str.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hour, minute] = timePart.split(':').map(Number);
        return new Date(year, month - 1, day, hour, minute);
    }
    return new Date(str);
}

function calculateDuration(startTime, endTime) {
    if (!startTime || !endTime) return 120;
    try {
        const start = parseDateTimeString(startTime);
        const end = parseDateTimeString(endTime);
        const durationMinutes = Math.round((end - start) / 60000);
        if (durationMinutes < 0) return 120;
        return durationMinutes;
    } catch (e) {
        return 120;
    }
}

// Format duration from minutes to human readable string
function formatDuration(durationMinutes) {
    if (!durationMinutes || isNaN(durationMinutes)) {
        return '2h 0m'; // Default
    }
    
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

// Thay attachFlightDetailEvents bằng event delegation cho .flight-list
const flightList = document.querySelector('.flight-list');
if (flightList) {
  flightList.addEventListener('click', function(e) {
    const link = e.target.closest('.flight-details-link');
    if (link) {
      e.preventDefault();
      const id = link.dataset.id;
      if (!id) {
        alert('Không tìm thấy ID chuyến bay!');
        return;
      }
      fetch(`http://localhost:3000/api/chuyenbay/${id}`)
        .then(res => res.json())
        .then(data => {
          showFlightDetailModal(data);
        })
        .catch(err => alert('Không lấy được chi tiết chuyến bay!'));
    }
  });
}

function showFlightDetailModal(chuyenBay) {
  // Tạo modal hoặc section hiển thị thông tin  
  const modal = document.createElement('div');
  modal.className = 'flight-detail-modal';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 9999;`;
  modal.innerHTML = `
    <div style="background: #fff; padding: 30px 40px; border-radius: 10px; min-width: 320px; max-width: 90vw; box-shadow: 0 4px 16px rgba(0,0,0,0.15); position: relative;">
      <h3 style='margin-bottom: 16px;'>Chi tiết chuyến bay</h3>
      <p><b>Mã chuyến bay:</b> ${chuyenBay.ID_ChuyenBay}</p>
      <p><b>Đi từ (ID):</b> ${chuyenBay.ID_SanBayDi}</p>
      <p><b>Đến (ID):</b> ${chuyenBay.ID_SanBayDen}</p>
      <p><b>Thời gian khởi hành:</b> ${formatFlightTime(chuyenBay.ThoiGianKhoiHanh)}</p>
      <p><b>Thời gian hạ cánh:</b> ${formatFlightTime(chuyenBay.ThoiGianHaCanh)}</p>
      <p><b>Giá cơ sở:</b> ${Number(chuyenBay.GiaCoSo).toLocaleString()} VND</p>
      <button id="close-flight-detail-modal" style="margin-top: 20px; padding: 8px 24px; background: #5a56f3; color: #fff; border: none; border-radius: 6px; cursor: pointer;">Đóng</button>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('close-flight-detail-modal').onclick = function() {
    document.body.removeChild(modal);
  };
}

function updateFlightHeader(flightInfo) {
    if (!flightInfo) return;

    // Mã sân bay
    const departureCode = document.querySelector('.flight-route .airport:first-child .airport-code');
    const destinationCode = document.querySelector('.flight-route .airport:last-child .airport-code');
    const departureCity = document.querySelector('.flight-route .airport:first-child .airport-city');
    const destinationCity = document.querySelector('.flight-route .airport:last-child .airport-city');

    if (departureCode) {
        departureCode.textContent = flightInfo.departureCode || flightInfo.ID_SanBayDi || '';
    }
    if (destinationCode) {
        destinationCode.textContent = flightInfo.arrivalCode || flightInfo.ID_SanBayDen || '';
    }
    if (departureCity) {
        departureCity.textContent = (flightInfo.departureCity ? flightInfo.departureCity + ', Việt Nam' : '');
    }
    if (destinationCity) {
        destinationCity.textContent = (flightInfo.arrivalCity ? flightInfo.arrivalCity + ', Việt Nam' : '');
    }

    // Thời gian khởi hành/hạ cánh
    const departureDate = document.querySelector('.flight-details .flight-date:first-child .date');
    if (departureDate) {
        if (flightInfo.formattedDepartureTime && flightInfo.departureDate) {
            departureDate.textContent = `${flightInfo.departureDate} • ${flightInfo.formattedDepartureTime}`;
        } else if (flightInfo.formattedDepartureTime) {
            departureDate.textContent = flightInfo.formattedDepartureTime;
        } else {
            departureDate.textContent = 'Chưa xác định';
        }
    }
    const arrivalDate = document.querySelector('.flight-details .flight-date:last-child .date');
    if (arrivalDate) {
        if (flightInfo.formattedArrivalTime && flightInfo.arrivalDate) {
            arrivalDate.textContent = `${flightInfo.arrivalDate} • ${flightInfo.formattedArrivalTime}`;
        } else if (flightInfo.formattedArrivalTime) {
            arrivalDate.textContent = flightInfo.formattedArrivalTime;
        } else {
            arrivalDate.textContent = 'Chưa xác định';
        }
    }

    // Logo và tên hãng bay
    const airlineLogoEl = document.getElementById('airline-logo');
    const airlineNameEl = document.getElementById('airline-name');
    if (airlineLogoEl && flightInfo.airlineLogo) {
        airlineLogoEl.src = flightInfo.airlineLogo;
        airlineLogoEl.onerror = function() {
            this.src = 'assets/logo/default-airline.png';
        };
    }
    if (airlineNameEl && flightInfo.airlineName) {
        airlineNameEl.textContent = flightInfo.airlineName;
    }
}