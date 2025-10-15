// Khai báo các biến toàn cục
let passengerData = {};
let flightInfo = {};
let currentSeat = "4A"; // Ghế mặc định
let currentSeatType = "economy";
let currentSurcharge = 0;
let selectedPassengers = [];
let basePrice = 1600000;
let selectedServicePrice = 0;

// Tham chiếu đến các phần tử DOM
let seatTypeCards;
let selectedSeatLabel;
let selectedSeatType;
let seatSurcharge;
let basePriceEl;
let totalPrice;
let passengerNameElement;
let seatModal;
let confirmationModal;
let passengerList;
let addPassengerBtn;
let openConfirmationBtn;
let closeBtns;

// Hàm định dạng tiền tệ
function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
}

// Hàm format thời gian từ datetime string
function formatTime(timeString) {
  if (!timeString) return "Chưa xác định";
  try {
    const date = new Date(timeString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (e) {
    return "Chưa xác định";
  }
}

// Hàm format ngày từ datetime string
function formatDate(timeString) {
  if (!timeString) return "";
  try {
    const date = new Date(timeString);
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}`;
  } catch (e) {
    return "";
  }
}

// Hàm cập nhật thông tin ghế và giá
function updateSeatInfo() {
  if (selectedSeatLabel) selectedSeatLabel.textContent = currentSeat;
  if (selectedSeatType)
    selectedSeatType.textContent =
      currentSeatType == "business"
        ? "Ghế hạng thương gia"
        : "Ghế hạng phổ thông";
  if (seatSurcharge)
    seatSurcharge.textContent = formatCurrency(currentSurcharge);

  // Tính tổng giá bao gồm tất cả hành khách đã chọn
  let totalPassengerCost = 0;
  selectedPassengers.forEach((passenger) => {
    totalPassengerCost += parseInt(passenger.price || 0);
  });

  // Tổng giá = giá vé cơ bản + phụ thu ghế hiện tại + thuế phí + tổng giá hành khách đã chọn
  const finalTotal = selectedServicePrice + totalPassengerCost;
  const servicePriceEl = document.getElementById("service-price");
  if (servicePriceEl)
    servicePriceEl.textContent = formatCurrency(selectedServicePrice);
  if (totalPrice) totalPrice.textContent = formatCurrency(finalTotal);

  // Cập nhật hiển thị loại ghế đang chọn
  // if (seatTypeCards) {
  //   seatTypeCards.forEach((card) => {
  //     card.classList.remove("active");
  //     if (card.dataset.type == currentSeatType) card.classList.add("active");
  //   });

  //   // Cập nhật tag "Đang chọn"
  //   document.querySelectorAll(".selection-tag").forEach((tag) => tag.remove());
  // }

  // Lưu vào sessionStorage
  sessionStorage.setItem(
    "selectedSeat",
    JSON.stringify({
      seat: currentSeat,
      type: currentSeatType,
      surcharge: currentSurcharge,
    })
  );

  console.log("Cập nhật giá:", {
    basePrice,
    currentSurcharge,
    taxFees,
    totalPassengerCost,
    finalTotal,
  });
}

async function fetchTicketPrice(chuyenBayId, gheId, dichVus = []) {
  try {
    console.log("Dữ liệu gửi lên API:", { chuyenBayId, gheId, dichVus });
    const response = await fetch("http://localhost:3000/api/dat-ve/tinh-gia", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chuyenBayId, gheId, dichVus }),
    });

    if (!response.ok) {
      throw new Error("Không thể lấy giá vé");
    }

    const data = await response.json();
    console.log("Giá vé từ API:", data);

    basePrice = data.giaVe || 0;
    selectedServicePrice = data.giaDichVu || 0;
    currentSurcharge = data.phuThuGhe || 0;
    updateSeatInfo();
  } catch (error) {
    console.error("Lỗi khi lấy giá vé:", error);
  }
}
// Thêm hàm này sau phần khai báo các biến
async function fetchFlightDetails(flightId) {
  try {
    // Đảm bảo flightId là một số nguyên
    if (typeof flightId == "string" && flightId.match(/^\d+$/)) {
      flightId = parseInt(flightId);
    } else if (isNaN(flightId)) {
      throw new Error("ID chuyến bay không hợp lệ");
    }

    const response = await fetch(
      `http://localhost:3000/api/chuyen-bay/${flightId}`
    );
    if (!response.ok) {
      throw new Error(`Lỗi HTTP: ${response.status}`);
    }
    const flightData = await response.json();
    console.log("Thông tin chuyến bay:", flightData);
    return flightData;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin chuyến bay:", error);
    return null;
  }
}

// Hàm lấy danh sách ghế trống
async function loadAvailableSeats() {
  if (!flightInfo || !flightInfo.ID_ChuyenBay) {
    console.error("Không có ID chuyến bay để tìm ghế trống");
    return;
  }

  try {
    console.log(
      "Đang gọi API ghế trống cho chuyến bay:",
      flightInfo.ID_ChuyenBay
    );
    const response = await fetch(
      `http://localhost:3000/api/ghe/ghe-trong/${flightInfo.ID_ChuyenBay}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const availableSeats = await response.json();
    console.log("Ghế trống từ API:", availableSeats);

    // Đánh dấu ghế đã đặt
    if (availableSeats && Array.isArray(availableSeats)) {
      markAvailableSeats(availableSeats);
    } else {
      throw new Error("Dữ liệu ghế không hợp lệ");
    }
  } catch (error) {
    console.error("Lỗi khi tải ghế trống:", error);
    // Fallback khi API thất bại
    createMockAvailableSeats();
  }
}

// Hàm đánh dấu ghế trống dựa trên dữ liệu API
function markAvailableSeats(availableSeats) {
  const allSeats = document.querySelectorAll(".seat");
  console.log("Tổng số ghế trên UI:", allSeats.length);

  if (!allSeats || allSeats.length == 0) {
    console.error("Không tìm thấy ghế nào trên UI");
    return;
  }

  // Đánh dấu tất cả ghế là không có sẵn trước
  allSeats.forEach((seat) => {
    seat.classList.add("unavailable");
  });

  // Thử kiểm tra định dạng mã ghế từ database và định dạng mã ghế trên UI
  if (availableSeats.length > 0) {
    const dbSeatFormat =
      availableSeats[0].MaGhe || availableSeats[0].SoGhe || "unknown";
    const uiSeatFormat =
      allSeats.length > 0 ? allSeats[0].dataset.seat : "unknown";
    console.log(
      "So sánh định dạng mã ghế - Database:",
      dbSeatFormat,
      "UI:",
      uiSeatFormat
    );

    let matchedSeats = 0;

    // Chỉ các ghế trống mới available
    availableSeats.forEach((availableSeat) => {
      // Thử tất cả các khả năng về tên trường mã ghế
      const seatCode =
        availableSeat.MaGhe || availableSeat.SoGhe || availableSeat.ID_Ghe;
      if (seatCode) {
        // Thử cả hai cách: ghép ID_Ghe + SoGhe hoặc sử dụng trực tiếp mã ghế
        const directSelector = `.seat[data-seat="${seatCode}"]`;
        const composedSelector =
          availableSeat.Hang && availableSeat.SoGhe
            ? `.seat[data-seat="${availableSeat.Hang}${availableSeat.SoGhe}"]`
            : null;

        // Thử tìm ghế theo mã trực tiếp
        let seatElement = document.querySelector(directSelector);

        // Nếu không tìm thấy, thử tìm theo mã ghép
        if (!seatElement && composedSelector) {
          seatElement = document.querySelector(composedSelector);
        }

        if (seatElement) {
          seatElement.classList.remove("unavailable");
          seatElement.dataset.idGhe = availableSeat.ID_Ghe;
          matchedSeats++;
        }
      }
    });

    console.log(
      `Đã đánh dấu ${matchedSeats}/${availableSeats.length} ghế trống`
    );

    if (matchedSeats == 0) {
      console.warn("Không tìm thấy ghế nào khớp với dữ liệu từ database");
      console.warn("Có thể có vấn đề về định dạng mã ghế không khớp");
      createMockAvailableSeats();
    }
  } else {
    console.warn("Không có ghế trống trả về từ API");
    createMockAvailableSeats();
  }

  console.log("Chi tiết ghế đầu tiên:", availableSeats[0]);
}

// Tạo dữ liệu ghế trống mẫu
function createMockAvailableSeats() {
  console.log("Đang tạo dữ liệu ghế trống mẫu");
  const allSeats = document.querySelectorAll(".seat");

  if (!allSeats || allSeats.length == 0) {
    console.error("Không tìm thấy ghế nào trên UI để tạo dữ liệu mẫu");
    return;
  }

  // Đặt tất cả ghế về trạng thái available
  allSeats.forEach((seat) => {
    // Xóa trạng thái unavailable (làm cho tất cả ghế có sẵn)
    seat.classList.remove("unavailable");
  });

  // Đếm và hiển thị số lượng ghế trống theo loại
  const businessSeats = document.querySelectorAll(".seat.business").length;
  const economySeats = document.querySelectorAll(".seat.economy").length;

  console.log(
    `Đã tạo ${allSeats.length} ghế trống mẫu (${businessSeats} ghế thương gia, ${economySeats} ghế phổ thông)`
  );

  // Cập nhật số ghế còn lại trên giao diện
  const businessRemainingEl = document.querySelector(
    '.seat-type-card[data-type="business"] .seats-remaining'
  );
  const economyRemainingEl = document.querySelector(
    '.seat-type-card[data-type="economy"] .seats-remaining'
  );

  if (businessRemainingEl) {
    businessRemainingEl.textContent = `Còn ${businessSeats} ghế`;
  }

  if (economyRemainingEl) {
    economyRemainingEl.textContent = `Còn ${economySeats} ghế`;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Lấy dữ liệu chuyến bay đã enrich từ sessionStorage
  flightInfo = JSON.parse(sessionStorage.getItem("selectedFlightInfo") || "{}");

  // Lấy dữ liệu từ sessionStorage
  passengerData = JSON.parse(sessionStorage.getItem("passengerData") || "{}");

  // Lấy thêm thông tin địa chỉ từ searchFlightData
  const searchFlightData = JSON.parse(
    sessionStorage.getItem("searchFlightData") || "{}"
  );

  // Gắn thông tin thành phố vào flightInfo nếu có
  if (searchFlightData.departureCity && !flightInfo.departureCity) {
    flightInfo.departureCity = searchFlightData.departureCity;
  }

  if (searchFlightData.arrivalCity && !flightInfo.arrivalCity) {
    flightInfo.arrivalCity = searchFlightData.arrivalCity;
  }

  // Lưu lại flightInfo đã cập nhật
  sessionStorage.setItem("selectedFlightInfo", JSON.stringify(flightInfo));

  // Tham chiếu đến các phần tử DOM
  seatTypeCards = document.querySelectorAll(".seat-type-card");
  selectedSeatLabel = document.getElementById("selected-seat-label");
  selectedSeatType = document.getElementById("selected-seat-type");
  seatSurcharge = document.getElementById("seat-surcharge");
  basePriceEl = document.getElementById("base-price");
  totalPrice = document.getElementById("total-price");
  passengerNameElement = document.querySelector(".passenger-name");
  seatModal = document.getElementById("seat-modal");
  confirmationModal = document.getElementById("confirmation-modal");
  passengerList = document.getElementById("passenger-list");
  addPassengerBtn = document.getElementById("add-passenger-btn");
  openConfirmationBtn = document.getElementById("open-confirmation-modal");
  closeBtns = document.querySelectorAll(
    ".close-btn, .confirmation-close, #modal-cancel"
  );

  // Kiểm tra nếu flightInfo trống hoặc không có ID_ChuyenBay, tạo một flightInfo mặc định để test
  if (!flightInfo || !flightInfo.ID_ChuyenBay) {
    console.warn("Không có thông tin chuyến bay, sử dụng dữ liệu mẫu để test");
    const defaultFlightInfo = {
      ID_ChuyenBay: "VN123",
      ID_SanBayDi: "SGN",
      ID_SanBayDen: "HAN",
      ID_MayBay: "VNA01",
      ThoiGianKhoiHanh: "2023-08-10T08:30:00",
      GiaCoSo: 1500000,
      departureCity: "TP. Hồ Chí Minh",
      arrivalCity: "Hà Nội",
      airlineName: "Vietnam Airlines",
      airlineLogo: "/TripMa/assets/logo/vietnamairlines.png",
    };
    sessionStorage.setItem(
      "selectedFlightInfo",
      JSON.stringify(defaultFlightInfo)
    );
    Object.assign(flightInfo, defaultFlightInfo);
  }

  console.log("Thông tin chuyến bay:", flightInfo);

  // Hiển thị ID chuyến bay trong console để kiểm tra
  console.log("ID chuyến bay được sử dụng:", flightInfo.ID_ChuyenBay);

  // Kiểm tra nếu chưa nhập thông tin hành khách chính, chuyển về trang thông tin hành khách
  if (
    !passengerData.lastName ||
    !passengerData.firstName ||
    !passengerData.middleName
  ) {
    // Tạm thời vô hiệu hóa điều hướng để test
    console.warn(
      "Thông tin hành khách chưa đầy đủ, nhưng vẫn cho phép chọn ghế để test"
    );
    // alert('Vui lòng nhập thông tin hành khách chính trước khi chọn ghế');
    // window.location.href = 'passenger-info.html';
    // return;
  }

  // Cập nhật thông tin chuyến bay ở header
  updateFlightHeader(flightInfo);

  // Nếu thiếu thông tin thành phố, gọi API để lấy
  if (!flightInfo.departureCity || !flightInfo.arrivalCity) {
    fetch("http://localhost:3000/api/san-bay")
      .then((res) => res.json())
      .then((airports) => {
        if (!flightInfo.departureCity && flightInfo.ID_SanBayDi) {
          const airport = airports.find(
            (a) => a.ID_SanBay == flightInfo.ID_SanBayDi
          );
          if (airport) {
            flightInfo.departureCity = airport.ThanhPho;
            updateFlightHeader(flightInfo);
          }
        }
        if (!flightInfo.arrivalCity && flightInfo.ID_SanBayDen) {
          const airport = airports.find(
            (a) => a.ID_SanBay == flightInfo.ID_SanBayDen
          );
          if (airport) {
            flightInfo.arrivalCity = airport.ThanhPho;
            updateFlightHeader(flightInfo);
          }
        }
        // Lưu lại vào sessionStorage nếu có cập nhật
        sessionStorage.setItem(
          "selectedFlightInfo",
          JSON.stringify(flightInfo)
        );
      });
  }

  // Cập nhật số chuyến bay
  const flightNumberEl = document.getElementById("flight-number");
  if (flightNumberEl && flightInfo.ID_ChuyenBay) {
    flightNumberEl.textContent = flightInfo.ID_ChuyenBay;
  }

  // Xử lý nút quay lại
  const backButton = document.getElementById("back-button");
  if (backButton) {
    backButton.addEventListener("click", function () {
      window.history.back();
    });
  }

  // Các giá trị cố định
  basePrice = flightInfo.GiaCoSo ? parseInt(flightInfo.GiaCoSo) : 1600000;
  taxFees = 250000;

  // Cập nhật giá vé cơ bản
  if (basePriceEl) {
    basePriceEl.textContent = formatCurrency(basePrice);
  }

  // Hiển thị tên hành khách chính
  console.log("=== BẮT ĐẦU CẬP NHẬT THÔNG TIN HÀNH KHÁCH ===");

  // Lấy các elements trước
  const passengerAvatar = document.getElementById("passenger-avatar");
  const passengerUsername = document.getElementById("passenger-username");
  const passengerEmail = document.getElementById("passenger-email");
  const passengerPhone = document.getElementById("passenger-phone");
  passengerNameElement = document.querySelector(".passenger-name");

  console.log("Elements found:", {
    passengerNameElement: !!passengerNameElement,
    passengerAvatar: !!passengerAvatar,
    passengerUsername: !!passengerUsername,
    passengerEmail: !!passengerEmail,
    passengerPhone: !!passengerPhone,
  });

  if (passengerNameElement) {
    console.log("Dữ liệu hành khách:", passengerData);

    // Lấy thông tin user đã đăng nhập từ localStorage
    let currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    // Xử lý cấu trúc dữ liệu user có thể là { user: {...} } hoặc trực tiếp {...}
    if (currentUser && currentUser.user) {
      currentUser = currentUser.user;
    }

    console.log("Thông tin user đã đăng nhập:", currentUser);

    // Nếu có user đăng nhập, sử dụng thông tin của họ
    if (currentUser && (currentUser.hoTen || currentUser.HoTen)) {
      const userFullName = currentUser.hoTen || currentUser.HoTen || "";
      const userEmail = currentUser.email || currentUser.Email || "";
      const userPhone = currentUser.sdt || currentUser.SDT || "";

      console.log("Dữ liệu user:", { userFullName, userEmail, userPhone });

      // Cập nhật thông tin hành khách chính từ user đã đăng nhập
      passengerData = {
        lastName: userFullName.split(" ")[0] || "",
        firstName: userFullName.split(" ").slice(-1)[0] || "",
        middleName: userFullName.split(" ").slice(1, -1).join(" ") || "",
        contactPhone: userPhone,
        contactEmail: userEmail,
        fullName: userFullName,
      };

      // Lưu dữ liệu user vào sessionStorage
      sessionStorage.setItem("passengerData", JSON.stringify(passengerData));

      // Cập nhật giao diện
      passengerNameElement.textContent = userFullName;

      // Cập nhật avatar với chữ cái đầu
      if (passengerAvatar) {
        const firstLetter = userFullName.charAt(0).toUpperCase();
        passengerAvatar.textContent = firstLetter;
      }

      // Cập nhật username từ email
      if (passengerUsername && userEmail) {
        const username = userEmail.split("@")[0];
        passengerUsername.textContent = username;
      }

      // Cập nhật email
      if (passengerEmail) {
        passengerEmail.textContent = userEmail || "Chưa có email";
      }

      // Cập nhật số điện thoại
      if (passengerPhone) {
        passengerPhone.textContent = userPhone || "Chưa có số điện thoại";
      }

      console.log("✅ Đã cập nhật thông tin user:", userFullName);
    } else {
      console.log("❌ Không có user đăng nhập, sử dụng dữ liệu mẫu");

      // Nếu không có user đăng nhập, sử dụng dữ liệu từ sessionStorage hoặc mẫu
      if (!passengerData || !passengerData.lastName) {
        console.warn(
          "Không có user đăng nhập và không có dữ liệu hành khách, sử dụng dữ liệu mẫu"
        );
        passengerData = {
          lastName: "Nguyễn",
          firstName: "Văn",
          middleName: "A",
          birthDate: "1990-01-01",
          contactPhone: "0123456789",
          contactEmail: "example@email.com",
        };
        // Lưu dữ liệu mẫu vào sessionStorage để các phần khác của trang sử dụng
        sessionStorage.setItem("passengerData", JSON.stringify(passengerData));
      }

      const fullName = `${passengerData.lastName || ""} ${
        passengerData.firstName || ""
      } ${passengerData.middleName || ""}`.trim();
      passengerNameElement.textContent = fullName || "Nguyễn Văn A";

      // Cập nhật giao diện với dữ liệu mẫu
      if (passengerAvatar) {
        passengerAvatar.textContent = "N";
      }

      if (passengerUsername) {
        passengerUsername.textContent = "nguyenvana";
      }

      if (passengerEmail) {
        passengerEmail.textContent =
          passengerData.contactEmail || "example@email.com";
      }

      if (passengerPhone) {
        passengerPhone.textContent = passengerData.contactPhone || "0123456789";
      }

      console.log("✅ Đã cập nhật dữ liệu mẫu:", fullName);
    }
  } else {
    console.error("❌ Không tìm thấy element .passenger-name");
  }

  console.log("=== KẾT THÚC CẬP NHẬT THÔNG TIN HÀNH KHÁCH ===");

  // Hàm cập nhật thông tin chuyến bay trong banner
  function updateFlightHeader(flightInfo) {
    if (!flightInfo) return;

    // Tên sân bay
    const departureAirportName = document.getElementById(
      "departure-airport-name"
    );
    const arrivalAirportName = document.getElementById("arrival-airport-name");
    // Thành phố
    const departureCity = document.querySelector(
      ".flight-route .airport:first-child .airport-city"
    );
    const arrivalCity = document.querySelector(
      ".flight-route .airport:last-child .airport-city"
    );

    // Thời gian đi/đến
    const departureTimeLabel = document.getElementById("departure-time-label");
    const arrivalTimeLabel = document.getElementById("arrival-time-label");

    // Lấy tên sân bay từ flightInfo nếu có, nếu không thì fetch từ API
    if (flightInfo.departureAirportName) {
      if (departureAirportName)
        departureAirportName.textContent = flightInfo.departureAirportName;
    } else if (flightInfo.ID_SanBayDi) {
      fetch("http://localhost:3000/api/san-bay")
        .then((res) => res.json())
        .then((airports) => {
          const airport = airports.find(
            (a) => a.ID_SanBay == flightInfo.ID_SanBayDi
          );
          if (airport && departureAirportName) {
            departureAirportName.textContent = airport.TenSanBay;
            flightInfo.departureAirportName = airport.TenSanBay;
            sessionStorage.setItem(
              "selectedFlightInfo",
              JSON.stringify(flightInfo)
            );
          }
        });
    }
    if (flightInfo.arrivalAirportName) {
      if (arrivalAirportName)
        arrivalAirportName.textContent = flightInfo.arrivalAirportName;
    } else if (flightInfo.ID_SanBayDen) {
      fetch("http://localhost:3000/api/san-bay")
        .then((res) => res.json())
        .then((airports) => {
          const airport = airports.find(
            (a) => a.ID_SanBay == flightInfo.ID_SanBayDen
          );
          if (airport && arrivalAirportName) {
            arrivalAirportName.textContent = airport.TenSanBay;
            flightInfo.arrivalAirportName = airport.TenSanBay;
            sessionStorage.setItem(
              "selectedFlightInfo",
              JSON.stringify(flightInfo)
            );
          }
        });
    }

    // Thành phố
    if (departureCity) {
      departureCity.textContent = flightInfo.departureCity
        ? flightInfo.departureCity + ", Việt Nam"
        : "";
    }
    if (arrivalCity) {
      arrivalCity.textContent = flightInfo.arrivalCity
        ? flightInfo.arrivalCity + ", Việt Nam"
        : "";
    }

    // Thời gian đi/đến
    if (departureTimeLabel) {
      const depTime =
        flightInfo.formattedDepartureTime ||
        formatTime(flightInfo.ThoiGianKhoiHanh);
      const depDate =
        flightInfo.departureDate || formatDate(flightInfo.ThoiGianKhoiHanh);
      if (depDate && depTime !== "Chưa xác định") {
        departureTimeLabel.textContent = `${depDate} • ${depTime}`;
      } else if (depTime !== "Chưa xác định") {
        departureTimeLabel.textContent = depTime;
      } else {
        departureTimeLabel.textContent = "Chưa xác định";
      }
    }
    if (arrivalTimeLabel) {
      const arrTime =
        flightInfo.formattedArrivalTime ||
        formatTime(flightInfo.ThoiGianHaCanh);
      const arrDate =
        flightInfo.arrivalDate || formatDate(flightInfo.ThoiGianHaCanh);
      if (arrDate && arrTime !== "Chưa xác định") {
        arrivalTimeLabel.textContent = `${arrDate} • ${arrTime}`;
      } else if (arrTime !== "Chưa xác định") {
        arrivalTimeLabel.textContent = arrTime;
      } else {
        arrivalTimeLabel.textContent = "Chưa xác định";
      }
    }

    // Logo và tên hãng bay
    const airlineLogoEl = document.getElementById("airline-logo");
    const airlineNameEl = document.getElementById("airline-name");
    if (airlineLogoEl && flightInfo.airlineLogo) {
      airlineLogoEl.src = flightInfo.airlineLogo;
      airlineLogoEl.onerror = function () {
        this.src = "assets/logo/default-airline.png";
      };
    }
    if (airlineNameEl && flightInfo.airlineName) {
      airlineNameEl.textContent = flightInfo.airlineName;
    }
  }

  // Hàm gọi API lấy chi tiết sân bay
  async function loadAirportDetails() {
    try {
      const response = await fetch("http://localhost:3000/api/san-bay", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const airports = await response.json();

      // Cập nhật tên thành phố
      const departureCity = document.querySelector(
        ".flight-route .airport:first-child .airport-city"
      );
      const destinationCity = document.querySelector(
        ".flight-route .airport:last-child .airport-city"
      );

      if (departureCity && flightInfo.ID_SanBayDi) {
        const airport = airports.find(
          (a) => a.ID_SanBay == flightInfo.ID_SanBayDi
        );
        if (airport) {
          departureCity.textContent = `${airport.ThanhPho}, Việt Nam`;
        }
      }

      if (destinationCity && flightInfo.ID_SanBayDen) {
        const airport = airports.find(
          (a) => a.ID_SanBay == flightInfo.ID_SanBayDen
        );
        if (airport) {
          destinationCity.textContent = `${airport.ThanhPho}, Việt Nam`;
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin sân bay:", error);
    }
  }

  // Hàm lấy danh sách loại ghế
  async function loadSeatTypes() {
    try {
      console.log("Đang gọi API loại ghế");
      const response = await fetch("http://localhost:3000/api/loai-ghe", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const seatTypes = await response.json();
      console.log("Loại ghế:", seatTypes);

      // Cập nhật thông tin số ghế còn trống
      const economySeatsEl = document.querySelector(
        '.seat-type-card[data-type="economy"] .seats-remaining'
      );
      const businessSeatsEl = document.querySelector(
        '.seat-type-card[data-type="business"] .seats-remaining'
      );

      // Giả sử là có 2 loại ghế trong DB: PT (Phổ thông) và TG (Thương gia)
      const economyType = seatTypes.find((type) => type.ID_LoaiGhe == "PT");
      const businessType = seatTypes.find((type) => type.ID_LoaiGhe == "TG");

      if (economySeatsEl && economyType) {
        const availableEconomy = 120; // Lấy số ghế còn trống từ API thực tế
        economySeatsEl.textContent = `Còn ${availableEconomy} ghế`;
      }

      if (businessSeatsEl && businessType) {
        const availableBusiness = 24; // Lấy số ghế còn trống từ API thực tế
        businessSeatsEl.textContent = `Còn ${availableBusiness} ghế`;
      }
    } catch (error) {
      console.error("Lỗi khi tải loại ghế:", error);

      // Cung cấp dữ liệu mẫu khi API thất bại
      console.warn("Sử dụng dữ liệu loại ghế mẫu");

      // Cập nhật thông tin số ghế còn trống
      const economySeatsEl = document.querySelector(
        '.seat-type-card[data-type="economy"] .seats-remaining'
      );
      const businessSeatsEl = document.querySelector(
        '.seat-type-card[data-type="business"] .seats-remaining'
      );

      if (economySeatsEl) {
        economySeatsEl.textContent = `Còn 120 ghế`;
      }

      if (businessSeatsEl) {
        businessSeatsEl.textContent = `Còn 24 ghế`;
      }
    }
  }

  // Gọi API để lấy thông tin máy bay và ghế
  async function loadAircraftDetails() {
    if (!flightInfo || !flightInfo.ID_MayBay) {
      console.error("Không có ID máy bay");
      return;
    }

    try {
      console.log("Đang gọi API chi tiết máy bay:", flightInfo.ID_MayBay);
      const response = await fetch(
        `http://localhost:3000/api/may-bay/${flightInfo.ID_MayBay}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const aircraftDetails = await response.json();
      console.log("Chi tiết máy bay:", aircraftDetails);

      // Cập nhật thông tin hãng bay
      const airlineLogoEl = document.getElementById("airline-logo");
      const airlineNameEl = document.getElementById("airline-name");

      if (airlineLogoEl) {
        // Sử dụng đường dẫn tương đối cho logo
        const logoPath =
          aircraftDetails.LogoURL || "assets/logo/vietnamairlines.png";
        // Đảm bảo đường dẫn đúng, không có dấu / ở đầu
        airlineLogoEl.src = logoPath.startsWith("http")
          ? logoPath
          : logoPath.replace(/^\//, "");

        console.log("Đường dẫn logo đã thiết lập:", airlineLogoEl.src);
      }

      if (airlineNameEl) {
        airlineNameEl.textContent =
          aircraftDetails.HangHangKhong || "Chưa có thông tin";
      }

      // Lấy thông tin ghế của máy bay
      const seatsResponse = await fetch(
        `http://localhost:3000/api/ghe/may-bay/${flightInfo.ID_MayBay}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!seatsResponse.ok) {
        throw new Error(`HTTP error! status: ${seatsResponse.status}`);
      }

      const seatsData = await seatsResponse.json();
      console.log("Ghế của máy bay:", seatsData);

      // Có thể cập nhật UI dựa trên seatsData
    } catch (error) {
      console.error("Lỗi khi tải thông tin máy bay:", error);

      // Cung cấp dữ liệu mẫu khi API thất bại
      console.warn("Sử dụng dữ liệu máy bay mẫu");

      // Cập nhật thông tin hãng bay nếu có từ flightInfo
      const airlineLogoEl = document.getElementById("airline-logo");
      const airlineNameEl = document.getElementById("airline-name");

      if (airlineLogoEl) {
        // Sử dụng đường dẫn tương đối
        // const logoPath = flightInfo.airlineLogo || 'TripMa/assets/logo/vietnamairlines.png';
        // Đảm bảo đường dẫn đúng, không có dấu / ở đầu
        airlineLogoEl.src = logoPath.startsWith("http")
          ? logoPath
          : logoPath.replace(/^\//, "");

        console.log("Fallback logo path:", airlineLogoEl.src);
      }

      if (airlineNameEl) {
        airlineNameEl.textContent =
          flightInfo.airlineName || "Vietnam Airlines";
      }
    }
  }

  // Khởi tạo thông tin ban đầu
  updateSeatInfo();

  // Gọi các API để lấy thông tin
  loadAirportDetails();
  loadSeatTypes();

  // Sinh nhiều hàng ghế tự động
  console.log("Bắt đầu tạo ghế...");
  const cabin = document.getElementById("cabin");
  if (!cabin) {
    console.error("Không tìm thấy phần tử cabin!");
    return;
  }

  // Xóa nội dung hiện có
  cabin.innerHTML = "";

  const exitRows = [6, 15, 20]; // các hàng có exit row
  for (let i = 1; i <= 24; i++) {
    // Exit row
    if (exitRows.includes(i)) {
      const exit = document.createElement("div");
      exit.className = "exit-row";
      exit.innerHTML = '<div class="exit-label">Exit row</div>';
      cabin.appendChild(exit);
    }
    // Hàng ghế
    const row = document.createElement("div");
    row.className = "seats-grid";
    // 3 ghế trái
    for (let col of ["A", "B", "C"]) {
      const seat = document.createElement("div");
      seat.className = i <= 5 ? "seat business" : "seat economy";
      seat.dataset.seat = `${i}${col}`;
      seat.dataset.type = i <= 5 ? "business" : "economy";
      seat.innerText = `${i}${col}`;
      row.appendChild(seat);
    }
    // Số hàng
    const rowNum = document.createElement("div");
    rowNum.className = "row-number";
    rowNum.textContent = i;
    row.appendChild(rowNum);
    // 3 ghế phải
    for (let col of ["D", "E", "F"]) {
      const seat = document.createElement("div");
      seat.className = i <= 5 ? "seat business" : "seat economy";
      seat.dataset.seat = `${i}${col}`;
      seat.dataset.type = i <= 5 ? "business" : "economy";
      seat.innerText = `${i}${col}`;
      row.appendChild(seat);
    }
    cabin.appendChild(row);
  }

  console.log("Đã tạo xong ghế");

  // Sau khi tạo tất cả ghế, đánh dấu ghế trống và đính kèm sự kiện
  loadAvailableSeats();
  setTimeout(function () {
    attachSeatEventListeners();

    // Nạp danh sách hành khách đã lưu và hiển thị passenger list
    loadPassengersAndSetupForm();
  }, 500);
  const serviceSelect = document.getElementById("dichvu-method");
  if (serviceSelect) {
    serviceSelect.addEventListener("change", async function () {
      const serviceId = this.value;
      if (!serviceId) {
        selectedServicePrice = 0;
        updateSeatInfo();
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:3000/api/dich-vu/${serviceId}`
        );
        if (!response.ok) throw new Error("Lỗi khi lấy thông tin dịch vụ");
        const service = await response.json();
        selectedServicePrice = service.GiaDichVu || 0;
      } catch (e) {
        selectedServicePrice = 0;
      }
      updateSeatInfo();
    });
  }
  loadServiceOptions();
});

// Hàm đính kèm event listener cho tất cả ghế
function attachSeatEventListeners() {
  console.log("Đang đính kèm event listener cho ghế");
  const seats = document.querySelectorAll(".seat");

  seats.forEach((seat) => {
    // Xóa event listeners cũ (nếu có)
    seat.replaceWith(seat.cloneNode(true));
  });

  // Lấy lại danh sách ghế mới sau khi clone
  const updatedSeats = document.querySelectorAll(".seat");

  // Đính kèm event hover
  updatedSeats.forEach((seat) => {
    seat.addEventListener("mouseover", function () {
      if (
        !this.classList.contains("locked") &&
        !this.classList.contains("unavailable")
      ) {
        this.classList.add("selected-preview");
      }
    });

    seat.addEventListener("mouseout", function () {
      this.classList.remove("selected-preview");
    });

    // Đính kèm event click
    seat.addEventListener("click", async function () {
      console.log(
        "Đã click ghế:",
        this.dataset.seat,
        "Trạng thái:",
        this.classList.contains("unavailable") ? "không có sẵn" : "có sẵn"
      );

      if (this.classList.contains("locked")) {
        alert("Ghế này đã được chọn bởi hành khách khác!");
        return;
      }

      if (this.classList.contains("unavailable")) {
        alert("Ghế này không có sẵn!");
        return;
      }

      currentSeat = this.dataset.seat;
      currentSeatId = this.dataset.idGhe;
      currentSeatType = this.dataset.type;

      // Chỉ cập nhật phụ thu ghế khi modal được xác nhận
      currentSurcharge = currentSeatType === "business";

      try {
        // Gọi API để lấy giá vé và phụ thu ghế
        await fetchTicketPrice(flightInfo.ID_ChuyenBay, currentSeatId);

        // Hiển thị modal để nhập thông tin hành khách
        seatModal.style.display = "flex";
        document.getElementById("modal-seat-label").textContent = currentSeat;
        document.getElementById("modal-seat-type").value =
          currentSeatType === "business" ? "Thương gia" : "Phổ thông";
        document.getElementById("modal-seat-price").value =
          basePrice.toLocaleString() + " VND";
        seatModal.dataset.seat = currentSeat;
        seatModal.dataset.idGhe = currentSeatId;
        seatModal.dataset.type = currentSeatType;
        seatModal.dataset.price = basePrice;

        console.log("ID_Ghe gửi lên:", seatModal.dataset.idGhe);
      } catch (error) {
        console.error("Lỗi khi lấy giá vé:", error);
      }
    });
  });

  console.log(`Đã đính kèm event listener cho ${updatedSeats.length} ghế`);

  // // Xử lý sự kiện chọn loại ghế
  // if (seatTypeCards) {
  //   seatTypeCards.forEach((card) => {
  //     card.addEventListener("click", function () {
  //       if (currentSeat) {
  //         currentSeatType = this.dataset.type;
  //         currentSurcharge =
  //           currentSeatType == "business" ? businessSurcharge : 0;
  //         updateSeatInfo();
  //       }
  //     });
  //   });
  // }

  // Xử lý nút "Thêm hành khách"
  if (addPassengerBtn) {
    addPassengerBtn.onclick = function () {
      // Tìm ghế còn trống đầu tiên
      let availableSeat = null;

      // Lấy tất cả các ghế
      const allSeats = document.querySelectorAll(".seat");
      console.log("Tổng số ghế:", allSeats.length);

      // Đếm số ghế có sẵn và không có sẵn
      let availCount = 0;
      let unavailCount = 0;

      allSeats.forEach((seat) => {
        if (seat.classList.contains("unavailable")) {
          unavailCount++;
        } else if (seat.classList.contains("locked")) {
          unavailCount++;
        } else {
          availCount++;
          if (!availableSeat) {
            availableSeat = seat;
          }
        }
      });

      console.log("Số ghế có sẵn:", availCount);
      console.log("Số ghế không có sẵn:", unavailCount);

      if (!availableSeat) {
        // Nếu thực sự không có ghế nào, thử tạo ghế mẫu và tìm lại
        console.warn("Không tìm thấy ghế trống, thử tạo ghế mẫu...");
        createMockAvailableSeats();

        // Tìm lại ghế trống sau khi tạo mẫu
        allSeats.forEach((seat) => {
          if (
            !seat.classList.contains("unavailable") &&
            !seat.classList.contains("locked") &&
            !availableSeat
          ) {
            availableSeat = seat;
          }
        });

        if (!availableSeat) {
          alert("Không còn ghế trống!");
          return;
        }
      }

      // Hiện modal và điền sẵn thông tin ghế đầu tiên còn trống
      const seatCode = availableSeat.dataset.seat;
      const seatType = availableSeat.dataset.type;
      const price = seatType == "business" ? basePrice : basePrice;

      console.log("Chọn ghế trống:", seatCode, "loại:", seatType);

      seatModal.style.display = "flex";
      document.getElementById("modal-seat-label").textContent = seatCode;
      document.getElementById("modal-seat-type").value =
        seatType == "business" ? "Thương gia" : "Phổ thông";
      document.getElementById("modal-seat-price").value =
        price.toLocaleString() + " VND";
      document.getElementById("modal-fullname").value = "";
      document.getElementById("modal-passenger-type").value = "adult";
      document.getElementById("modal-id-number").value = "";
      document.getElementById("modal-dob").value = "";
      seatModal.dataset.seat = seatCode;
      seatModal.dataset.type = seatType;
      seatModal.dataset.price = price;
    };
  }

  // Xử lý đóng modal
  if (closeBtns) {
    closeBtns.forEach((btn) => {
      btn.onclick = () => {
        if (seatModal) {
          seatModal.style.display = "none";
          currentSurcharge = 0; // Reset phụ thu ghế
          updateSeatInfo(); // Cập nhật lại giá
        }
        if (confirmationModal) confirmationModal.style.display = "none";
      };
    });
  }
}

// Hàm để nạp danh sách hành khách đã lưu và thiết lập form
function loadPassengersAndSetupForm() {
  // Xử lý lưu thông tin hành khách khi submit form modal
  const passengerForm = document.getElementById("passenger-form");
  if (passengerForm) {
    passengerForm.onsubmit = async function (e) {
      e.preventDefault();
      if (selectedPassengers.some((p) => p.seat == seatModal.dataset.seat)) {
        alert("Ghế này đã có người chọn!");
        return;
      }

      // Lấy thông tin từ form
      const fullname = document.getElementById("modal-fullname").value.trim();
      const idNumber = document.getElementById("modal-id-number").value.trim();
      const dob = document.getElementById("modal-dob").value;
      const phone = document.getElementById("modal-phone").value.trim();
      const email = document.getElementById("modal-email").value.trim();
      const gender = document.getElementById("modal-gender").value;
      const address = document.getElementById("modal-address").value.trim();

      // Validate thông tin
      if (!fullname) {
        alert("Vui lòng nhập họ tên hành khách!");
        return;
      }

      // Validate CCCD/CMND
      if (idNumber && !/^\d{9}$|^\d{12}$/.test(idNumber)) {
        alert("Số CMND/CCCD phải gồm 9 hoặc 12 chữ số!");
        return;
      }

      // Validate số điện thoại
      if (phone && !/^0\d{9}$/.test(phone)) {
        alert("Số điện thoại phải gồm 10 số và bắt đầu bằng số 0!");
        return;
      }

      // Thêm vào danh sách hành khách đã chọn
      const passengerInfo = {
        seat: seatModal.dataset.seat,
        idGhe: seatModal.dataset.idGhe,
        fullname: fullname,
        idNumber: idNumber,
        dob: dob,
        phone: phone,
        seatType: seatModal.dataset.type,
        price: basePrice,
      };

      const userId =
        localStorage.getItem("userId") || sessionStorage.getItem("userId");
      let savedPassenger = null;
      try {
        // Lưu thông tin hành khách vào backend
        const res = await fetch("http://localhost:3000/api/hanhkhach/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hoTen: fullname,
            ngaySinh: dob,
            gioiTinh: gender,
            soHoChieu_CCCD: idNumber,
            sdt: phone,
            email: email,
            diaChi: address,
            idUser: userId ? parseInt(userId) : null,
          }),
        });

        if (!res.ok) {
          savedPassenger = await res.json(); // Gán giá trị cho savedPassenger
          console.log("Đã lưu hành khách vào database:", savedPassenger);
          const errorData = await res.json();
          console.error("Lỗi lưu hành khách:", errorData);
          // Vẫn cho phép tiếp tục nếu API lỗi (để demo vẫn hoạt động)
          console.warn("Tiếp tục mặc dù API lỗi");
        } else {
          const savedPassenger = await res.json();
          console.log("Đã lưu hành khách vào database:", savedPassenger);
          passengerInfo.idHanhKhach = savedPassenger.ID_HanhKhach;
        }
      } catch (error) {
        console.error("Lỗi kết nối API hành khách:", error);
        // Vẫn cho phép tiếp tục nếu API lỗi
      }

      // Thêm vào danh sách đã chọn
      selectedPassengers.push(passengerInfo);

      // Khóa ghế đã chọn
      const seatEl = document.querySelector(
        `.seat[data-seat="${seatModal.dataset.seat}"]`
      );
      if (seatEl) seatEl.classList.add("locked");

      seatModal.style.display = "none";
      renderPassengerList();
      sessionStorage.setItem(
        "selectedPassengers",
        JSON.stringify(selectedPassengers)
      );
      loadAvailableSeats(); // Reload lại ghế trống
    };
  }

  // Nạp danh sách hành khách đã lưu
  const savedPassengers = JSON.parse(
    sessionStorage.getItem("selectedPassengers") || "[]"
  );
  if (savedPassengers.length > 0) {
    selectedPassengers = savedPassengers;
    selectedPassengers.forEach((p) => {
      const seatEl = document.querySelector(`.seat[data-seat="${p.seat}"]`);
      if (seatEl) seatEl.classList.add("locked");
    });
    renderPassengerList();
  }

  // Xử lý nút "Xác nhận ghế"
  if (openConfirmationBtn) {
    openConfirmationBtn.onclick = function () {
      if (selectedPassengers.length == 0) {
        alert("Vui lòng chọn ít nhất một hành khách!");
        return;
      }

      const seatsCountEl = document.getElementById("seats-count");
      const passengersCountEl = document.getElementById("passengers-count");
      const confirmationPassengerListEl = document.getElementById(
        "confirmation-passenger-list"
      );
      const confirmationTotalPriceEl = document.getElementById(
        "confirmation-total-price"
      );

      if (seatsCountEl) seatsCountEl.textContent = selectedPassengers.length;
      if (passengersCountEl)
        passengersCountEl.textContent = selectedPassengers.length;

      let total = 0;
      let html = "";
      selectedPassengers.forEach((p) => {
        const passengerTotal = parseInt(p.price); // Giá vé cơ bản + phụ thu ghế
        total += passengerTotal;
        html += `<div>${p.fullname} - Ghế: ${p.seat} - ${
          p.seatType == "business"
            ? "Thương gia"
            : "Phổ thông"
        } - ${passengerTotal.toLocaleString()} VND</div>`;
      });

      // Cộng thêm giá dịch vụ
      total += selectedServicePrice;

      if (confirmationPassengerListEl)
        confirmationPassengerListEl.innerHTML = html;
      if (confirmationTotalPriceEl)
        confirmationTotalPriceEl.textContent = total.toLocaleString() + " VND";

      if (confirmationModal) confirmationModal.style.display = "flex";
    };
  }

  // Xử lý nút xác nhận đặt vé cuối cùng
  const confirmBookingBtn = document.getElementById("confirm-booking");
  if (confirmBookingBtn) {
    confirmBookingBtn.onclick = async function () {
      const serviceSelect = document.getElementById("dichvu-method");
      const selectedServiceId = serviceSelect ? serviceSelect.value : null;
      // Kiểm tra nếu không có hành khách nào
      if (selectedPassengers.length == 0) {
        alert("Vui lòng chọn ít nhất một hành khách!");
        return;
      }

      // Gửi thông tin đặt vé lên server
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        console.log("Token gửi lên:", token);

        // Tạo object dữ liệu đặt vé
        const paymentSelect = document.getElementById("payment-method");
        const idPhuongThuc = paymentSelect
          ? parseInt(paymentSelect.value)
          : null;

        const user = JSON.parse(localStorage.getItem("user") || "{}");

        // Xử lý cấu trúc dữ liệu user có thể là { user: {...} } hoặc trực tiếp {...}
        let currentUser = user;
        if (user && user.user) {
          currentUser = user.user;
        }

        console.log("User data for booking:", currentUser);

        const bookingData = {
          chuyenBayId: parseInt(flightInfo.ID_ChuyenBay) || 0,
          idNguoiDung: currentUser.ID_NguoiDung || currentUser.id || null,
          hanhKhach: {
            ho: passengerData.lastName || "",
            ten: passengerData.firstName || "",
            tenDem: passengerData.middleName || "",
            ngaySinh: passengerData.birthDate || "",
            sdt: passengerData.contactPhone || "",
            email: passengerData.contactEmail || "",
          },
          dsVe: selectedPassengers.map((p) => ({
            idGhe: parseInt(p.idGhe),
            idHanhKhach: p.idHanhKhach,
            loaiGhe: p.seatType == "business" ? "TG" : "PT",
            giaVe: parseInt(p.price),
            thongTinHanhKhach: {
              hoTen: p.fullname,
              loai: p.type,
              soCCCD: p.idNumber || "",
              ngaySinh: p.dob || "",
            },
          })),
          idPhuongThuc,
          dichVus: selectedServiceId
            ? [{ idDichVu: parseInt(selectedServiceId) }]
            : [],
        };

        console.log("Dữ liệu đặt vé gửi lên server:", bookingData);

        // Gửi API đặt vé
        const headers = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = "Bearer " + token;
        }

        const response = await fetch(
          "http://localhost:3000/api/dat-ve/dat-ve",
          {
            method: "POST",
            headers: headers,
            body: JSON.stringify(bookingData),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Có lỗi xảy ra khi đặt vé");
        }

        const result = await response.json();
        console.log("Kết quả đặt vé:", result);

        // Handle response based on payment method
        if (idPhuongThuc === 1) { // MoMo
          if (result.payUrl) {
            window.location.href = result.payUrl; // Chuyển hướng đến trang thanh toán MoMo
          } else {
            alert("Không thể lấy URL thanh toán MoMo.");
          }
        } else if (idPhuongThuc === 2) { // Cash
          // Assuming a successful response for cash means the booking was saved.
          // You might want to check for a specific success field in `result` if the backend provides one.

          // Clear session storage before redirect
          sessionStorage.removeItem("selectedPassengers");
          sessionStorage.removeItem("selectedSeat");
          // Add other relevant session storage items to clear if needed

          alert("Đặt vé và thanh toán tiền mặt thành công!");
          // Redirect to my tickets page or show booking details
          window.location.href = "http://127.0.0.1:5501/TripMa/html/body/vedadat/my-tickets.html"; // Update with your actual my-tickets page URL
        } else {
           alert("Phương thức thanh toán không xác định.");
           console.error("Unknown payment method ID:", idPhuongThuc);
        }
      } catch (error) {
        console.error("Lỗi khi đặt vé:", error);
        alert("Có lỗi xảy ra khi đặt vé: " + error.message);
        if (error.message && error.message.includes("Ghế này đã được đặt")) {
          loadAvailableSeats(); // Tải lại danh sách ghế trống
        }
      }
    };
  }

  // Trong openConfirmationBtn.onclick hoặc khi mở modal xác nhận
  loadPaymentMethods().then((methods) => {
    const paymentSelect = document.getElementById("payment-method");
    if (paymentSelect) {
      paymentSelect.innerHTML = "";
      methods.forEach((m) => {
        const opt = document.createElement("option");
        opt.value = m.ID_PhuongThuc;
        opt.textContent = m.TenPhuongThuc;
        paymentSelect.appendChild(opt);
      });
    }
  });
}

async function loadServiceOptions() {
  try {
    const res = await fetch("http://localhost:3000/api/dich-vu");
    const services = await res.json();
    const serviceSelect = document.getElementById("dichvu-method");
    if (serviceSelect) {
      serviceSelect.innerHTML = '<option value="">Chọn dịch vụ</option>';
      services.forEach((s) => {
        const opt = document.createElement("option");
        opt.value = s.ID_DichVu;
        opt.textContent =
          s.TenDichVu +
          (s.GiaDichVu ? ` (+${s.GiaDichVu.toLocaleString()} VND)` : "");
        serviceSelect.appendChild(opt);
      });
    }
  } catch (err) {
    console.error("Không thể load dịch vụ:", err);
  }
}

// Hiển thị danh sách hành khách
function renderPassengerList() {
  if (!passengerList) return;

  passengerList.innerHTML = "";
  selectedPassengers.forEach((p, idx) => {
    passengerList.innerHTML += `
            <div class="passenger-item" data-id="passenger-${idx + 1}">
                <div class="passenger-item-header">
                    <div class="passenger-item-name">${p.fullname}</div>
                    <button class="btn btn-delete-passenger" 
        data-index="${idx}" 
        data-id="${p.idHanhKhach || ""}" 
        title="Xóa hành khách">&times;</button>
                </div>
                <div class="selected-seat-info">
                    <div class="seat-label">${p.seat}</div>
                    <div class="seat-info">
                        <div class="seat-type">${
                          p.seatType == "business"
                            ? "Ghế hạng thương gia"
                            : "Ghế hạng phổ thông"
                        }</div>
                        <div class="seat-extra">
                            ${p.idNumber ? "CMND: " + p.idNumber : ""}
                            ${p.dob ? " - Ngày sinh: " + p.dob : ""}
                            ${p.phone ? " - SĐT: " + p.phone : ""}
                        </div>
                        <div class="seat-address">${
                          flightInfo.departureCity
                            ? "Địa chỉ: " + flightInfo.departureCity
                            : ""
                        }</div>
                    </div>
                </div>
            </div>
        `;
  });

  const deletePassengerButtons = document.querySelectorAll(".btn-delete-passenger");
  deletePassengerButtons.forEach((button) => {
    button.onclick = async function () {
      const index = this.getAttribute("data-index");
      const idHanhKhach = this.getAttribute("data-id");

      if (index !== null && idHanhKhach !== null) {
        try {
          const response = await fetch("http://localhost:3000/api/hanhkhach/" + idHanhKhach, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            selectedPassengers.splice(parseInt(index), 1);
            renderPassengerList();
            updateSeatInfo();
          } else {
            console.error("Lỗi khi gọi API xóa hành khách:", response.statusText);
            alert("Có lỗi xảy ra khi xóa hành khách. Vui lòng thử lại!");
          }
        } catch (error) {
          console.error("Lỗi khi gọi API xóa hành khách:", error);
          alert("Có lỗi xảy ra khi xóa hành khách. Vui lòng thử lại!");
        }
      }
    };
  });
}

async function loadPaymentMethods() {
  try {
    const res = await fetch("http://localhost:3000/api/phuong-thuc");
    const methods = await res.json();
    return methods;
  } catch (err) {
    console.error("Lỗi khi lấy phương thức thanh toán:", err);
    return [];
  }
}