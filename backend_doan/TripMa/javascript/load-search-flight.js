// load-search-flight.js
fetch("html/search-flight/search-flight.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("search-flight-placeholder").innerHTML = data;

    // Khởi tạo dropdown hành khách
    const dropdown = document.querySelector(".passenger-dropdown");
    const summary = document.getElementById("passenger-summary");
    const dropdownContent = document.getElementById(
      "passenger-dropdown-content"
    );
    const closeBtn = document.getElementById("close-passenger-dropdown");

    let counts = { adult: 1, child: 0, senior: 0 };

    function updateInput(type, value) {
      document.getElementById(type + "-count").textContent = value;
      document.getElementById(type + "-input").value = value;
      updateSummary();
    }

    function clamp(val, min, max) {
      return Math.max(min, Math.min(max, val));
    }

    function updateSummary() {
      let total = counts.adult + counts.child + counts.senior;
      if (total > 0) {
        summary.textContent = ` ${total} hành khách`;
        let arr = [];
        if (counts.adult > 0) arr.push(`${counts.adult} người lớn`);
        if (counts.child > 0) arr.push(`${counts.child} trẻ em`);
        if (counts.senior > 0) arr.push(`${counts.senior} người già`);
        summary.title = arr.join(", ");
      } else {
        summary.textContent = "Chọn hành khách";
        summary.title = "";
      }
    }

    // Event listeners cho tăng/giảm
    dropdownContent.querySelectorAll(".btn-minus").forEach((btn) => {
      btn.addEventListener("click", function () {
        const type = this.getAttribute("data-type");
        let min = type == "adult" ? 1 : 0;
        counts[type] = clamp(counts[type] - 1, min, 9);
        updateInput(type, counts[type]);
      });
    });

    dropdownContent.querySelectorAll(".btn-plus").forEach((btn) => {
      btn.addEventListener("click", function () {
        const type = this.getAttribute("data-type");
        counts[type] = clamp(counts[type] + 1, 0, 9);
        updateInput(type, counts[type]);
      });
    });

    // Mở/đóng dropdown
    summary.onclick = function (e) {
      dropdown.classList.add("open");
      e.stopPropagation();
    };

    closeBtn.onclick = function () {
      dropdown.classList.remove("open");
    };

    document.addEventListener("click", function (e) {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove("open");
      }
    });

    updateSummary();

    const form = document.querySelector(".search-flight-form");
    if (!form) return;

    const departureSelect = document.getElementById("departure");
    const destinationSelect = document.getElementById("destination");
    const dateInput = document.getElementById("departure-date");

    // Load danh sách sân bay
    loadAirports();

    async function loadAirports() {
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
        console.log("Airports loaded:", airports);

        // Clear và thêm airports
        departureSelect.innerHTML =
          '<option value="" disabled selected>Tới từ?</option>';
        destinationSelect.innerHTML =
          '<option value="" disabled selected>Điểm đến?</option>';

        airports.forEach((airport) => {
          const depOption = document.createElement("option");
          depOption.value = airport.ID_SanBay;
          depOption.textContent = `${airport.TenSanBay} (${airport.ThanhPho})`;
          departureSelect.appendChild(depOption);

          const destOption = document.createElement("option");
          destOption.value = airport.ID_SanBay;
          destOption.textContent = `${airport.TenSanBay} (${airport.ThanhPho})`;
          destinationSelect.appendChild(destOption);
        });

        syncSelectOptions();
      } catch (error) {
        console.error("Lỗi khi tải danh sách sân bay:", error);
      }
    }

    // Tải danh sách máy bay và hãng hàng không
    async function loadAirlines() {
      try {
        const response = await fetch("http://localhost:3000/api/may-bay", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const aircraft = await response.json();
        console.log("Aircraft info loaded:", aircraft);
        return aircraft;
      } catch (error) {
        console.error("Lỗi khi tải thông tin máy bay:", error);
        return [];
      }
    }

    function syncSelectOptions() {
      const depValue = departureSelect.value;
      const desValue = destinationSelect.value;

      Array.from(departureSelect.options).forEach((opt) => {
        opt.disabled = opt.value && opt.value == desValue;
      });
      Array.from(destinationSelect.options).forEach((opt) => {
        opt.disabled = opt.value && opt.value == depValue;
      });
    }

    departureSelect.addEventListener("change", syncSelectOptions);
    destinationSelect.addEventListener("change", syncSelectOptions);

    syncSelectOptions();

    // Set minimum date
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const minDate = `${yyyy}-${mm}-${dd}`;
    dateInput.setAttribute("min", minDate);

    // Form submission handler
    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      // Validate form
      if (
        !departureSelect.value ||
        !destinationSelect.value ||
        !dateInput.value
      ) {
        console.log("Vui lòng điền đầy đủ thông tin!");
        return;
      }

      // Prepare search parameters
      const searchParams = {
        idSanBayDi: departureSelect.value,
        idSanBayDen: destinationSelect.value,
        ngayKhoiHanh: dateInput.value,
      };

      try {
        const submitBtn = form.querySelector(".btn-search");
        submitBtn.disabled = true;
        submitBtn.textContent = "Đang tìm kiếm...";

        // Log để debug
        console.log("Search params:", searchParams);

        const queryParams = new URLSearchParams(searchParams);
        // Đường dẫn API chính xác, quay lại dùng endpoint cũ vì mới gây lỗi 500
        const searchUrl = `http://localhost:3000/api/dat-ve/tim-chuyen-bay?${queryParams}`;
        console.log("Search URL:", searchUrl);

        // Tải thông tin máy bay để bổ sung vào kết quả
        const aircraftList = await loadAirlines();

        const response = await fetch(searchUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const searchResults = await response.json();
        console.log("Kết quả tìm kiếm:", searchResults);

        // Bổ sung thông tin hãng hàng không vào kết quả
        const enhancedResults = searchResults.map((flight) => {
          const aircraft =
            aircraftList.find((a) => a.ID_MayBay == flight.ID_MayBay) || {};
          return {
            ...flight,
            airlineName: aircraft.HangHangKhong || "Chưa xác định",
            airlineCode: aircraft.MaHang || "",
            airlineLogo:
              aircraft.LogoURL || `/TripMa/assets/logo/vietnamairlines.png`,
          };
        });

        // Tải thông tin sân bay
        const airportsResponse = await fetch(
          "http://localhost:3000/api/san-bay",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const airports = await airportsResponse.json();
        const departureAirport =
          airports.find((a) => a.ID_SanBay == searchParams.idSanBayDi) || {};
        const arrivalAirport =
          airports.find((a) => a.ID_SanBay == searchParams.idSanBayDen) || {};

        // Lưu vào sessionStorage với đầy đủ thông tin
        const searchDataForSelection = {
          departure: departureSelect.value,
          destination: destinationSelect.value,
          date: dateInput.value,
          adult: searchParams.soNguoiLon,
          child: searchParams.soTreEm,
          senior: searchParams.soNguoiGia,
          departureText:
            departureSelect.options[departureSelect.selectedIndex]?.text || "",
          destinationText:
            destinationSelect.options[destinationSelect.selectedIndex]?.text ||
            "",
          departureCity: departureAirport.ThanhPho || "",
          arrivalCity: arrivalAirport.ThanhPho || "",
          passengers:
            `${searchParams.soNguoiLon} người lớn` +
            (searchParams.soTreEm > 0
              ? `, ${searchParams.soTreEm} trẻ em`
              : "") +
            (searchParams.soNguoiGia > 0
              ? `, ${searchParams.soNguoiGia} người già`
              : ""),
        };

        sessionStorage.setItem(
          "searchFlightData",
          JSON.stringify(searchDataForSelection)
        );
        sessionStorage.setItem(
          "searchFlightResults",
          JSON.stringify(enhancedResults)
        );
        sessionStorage.setItem(
          "flightResults",
          JSON.stringify(enhancedResults)
        ); // Tương thích với code cũ

        if (searchResults.length > 0) {
          console.log(`Tìm thấy ${searchResults.length} chuyến bay phù hợp!`);
          // Chuyển sang trang chọn chuyến bay
          window.location.href =
            "html/body/danhsachchuyenbay/flight-selection.html";
        } else {
          console.log(
            "Không tìm thấy chuyến bay phù hợp. Vui lòng thử lại với tiêu chí khác!"
          );
        }
      } catch (error) {
        console.error("Lỗi:", error);
        console.log("Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại!");
      } finally {
        const submitBtn = form.querySelector(".btn-search");
        submitBtn.disabled = false;
        submitBtn.textContent = "Tìm kiếm";
      }
    });
  });
