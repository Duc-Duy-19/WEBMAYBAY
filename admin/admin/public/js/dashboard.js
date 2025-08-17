// Dashboard JavaScript

// Load dashboard data
async function loadDashboardData() {
  try {
    const stats = await apiCall("/dashboard/stats");

    // Update doanhthu
    document.querySelector(".stat-card:nth-child(1) .stat-number").textContent =
      stats.totalFlights;
    document.querySelector(".stat-card:nth-child(2) .stat-number").textContent =
      stats.totalPassengers;
    document.querySelector(".stat-card:nth-child(3) .stat-number").textContent =
      stats.totalAirlines;
    document.querySelector(
      ".stat-card:nth-child(4) .stat-number"
    ).textContent = `$${stats.totalRevenue}`;

    // Load chart data
    loadFlightChart();
    loadRecentActivities();
  } catch (error) {
    showNotification("Error loading dashboard data", "error");
  }
}

// Load flight chart
async function loadFlightChart() {
  try {
    const chartData = await apiCall("/dashboard/flight-stats");

    const ctx = document.getElementById("flightChart").getContext("2d");
    new Chart(ctx, {
      type: "line",
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: "Number of Flights",
            data: chartData.data,
            borderColor: "#3498db",
            backgroundColor: "rgba(52, 152, 219, 0.1)",
            borderWidth: 2,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error loading chart data:", error);
  }
}

// Load recent activities
async function loadRecentActivities() {
  try {
    const activities = await apiCall("/dashboard/recent-activities");

    const activityList = document.querySelector(".activity-list");
    activityList.innerHTML = "";

    activities.forEach((activity) => {
      const li = document.createElement("li");
      li.innerHTML = `
                <span class="activity-icon"><i class="fas ${activity.icon}"></i></span>
                <span class="activity-text">${activity.text}</span>
                <span class="activity-time">${activity.time}</span>
            `;
      activityList.appendChild(li);
    });
  } catch (error) {
    console.error("Error loading recent activities:", error);
  }
}

// Initialize dashboard
document.addEventListener("DOMContentLoaded", () => {
  loadDashboardData();

  // Refresh data every 30 seconds
  setInterval(loadDashboardData, 30000);
});
