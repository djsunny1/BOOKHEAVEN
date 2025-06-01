// Admin Sales Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if admin is logged in
    const adminLoggedIn = sessionStorage.getItem('adminLoggedIn');

    if (!adminLoggedIn || adminLoggedIn !== 'true') {
        // Redirect to login page if not logged in
        window.location.href = 'index.html';
        return;
    }

    // Set admin initials
    const adminInitialsElement = document.getElementById('adminInitials');
    const adminUsername = sessionStorage.getItem('adminUsername');
    if (adminInitialsElement) {
        // Get first two characters of username (default to 'bookshop' if not set)
        const username = adminUsername || 'bookshop';
        const initials = username.substring(0, 2).toUpperCase();
        adminInitialsElement.textContent = initials;
    }

    // Handle avatar click to navigate to settings
    const adminAvatar = document.getElementById('adminAvatar');
    if (adminAvatar) {
        adminAvatar.addEventListener('click', function() {
            window.location.href = 'settings.html';
        });
    }

    // Handle logout from sidebar
    const sidebarLogout = document.getElementById('sidebarLogout');
    if (sidebarLogout) {
        sidebarLogout.addEventListener('click', function() {
            // Clear admin session
            sessionStorage.removeItem('adminLoggedIn');
            sessionStorage.removeItem('adminUsername');

            // Redirect to login page
            window.location.href = 'index.html';
        });
    }

    // Handle sales period change
    const salesPeriod = document.getElementById('salesPeriod');
    if (salesPeriod) {
        salesPeriod.addEventListener('change', function() {
            updateSalesChart(this.value);
        });
    }

    // Initial load of orders data
    loadOrdersData();

    // Set up polling for real-time updates (every 10 seconds)
    setInterval(loadOrdersData, 10000);
});

// Global variables
let ordersData = [];
let monthlyRevenueData = {};
let paymentStatusData = {};
let orderStatusData = {};
let topSellingBooks = {};

// Global variables for charts
let paymentStatusChart = null;
let orderStatusChart = null;

// Function to load orders data
async function loadOrdersData() {
    try {
        // Show loading indicators
        document.getElementById('totalOrdersCount').innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        document.getElementById('totalRevenue').innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        document.getElementById('completedOrdersCount').innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        document.getElementById('pendingOrdersCount').innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        console.log('Fetching orders data...');

        // Fetch orders from API
        const response = await fetch('http://localhost:8002/api/orders');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse response
        const newOrdersData = await response.json();
        console.log('Orders data received:', newOrdersData);

        // Check if data has changed
        const dataChanged = JSON.stringify(ordersData) !== JSON.stringify(newOrdersData);

        // Update global data
        ordersData = newOrdersData;

        // Process orders data
        processOrdersData(ordersData);

        // Update dashboard elements
        updateDashboardSummary();

        // Always update charts on initial load or when data changes
        console.log('Updating charts...');

        // Initialize or update charts
        initializeCharts();

        // Update sales chart based on selected period
        const salesPeriod = document.getElementById('salesPeriod');
        if (salesPeriod) {
            updateSalesChart(salesPeriod.value);
        }

        // Update top selling books table
        updateTopSellingBooksTable();

        if (dataChanged && ordersData.length > 0) {
            // Show notification only if data changed and we have orders
            showNotification('Sales data updated!');
        }
    } catch (error) {
        console.error('Error loading orders data:', error);
        // Show error message with retry button
        document.getElementById('totalOrdersCount').innerHTML = 'Error <button onclick="loadOrdersData()" class="retry-btn">Retry</button>';
        document.getElementById('totalRevenue').textContent = 'Error';
        document.getElementById('completedOrdersCount').textContent = 'Error';
        document.getElementById('pendingOrdersCount').textContent = 'Error';

        // Show error notification
        showNotification('Error loading orders data. Please check the server connection.', 'error');
    }
}

// Function to show notification
function showNotification(message, type = 'success') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('salesNotification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'salesNotification';
        notification.className = 'sales-notification';
        document.body.appendChild(notification);
    }

    // Remove any existing classes
    notification.className = 'sales-notification';

    // Add type class
    if (type === 'error') {
        notification.classList.add('error');
    } else {
        notification.classList.add('success');
    }

    // Set message and show notification
    notification.textContent = message;
    notification.classList.add('show');

    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Function to process orders data
function processOrdersData(orders) {
    // Reset data objects
    monthlyRevenueData = {
        weekly: {},
        monthly: {},
        yearly: {}
    };

    paymentStatusData = {
        paid: 0,
        pending: 0,
        refunded: 0
    };

    orderStatusData = {
        completed: 0,
        pending: 0,
        cancelled: 0
    };

    topSellingBooks = {};

    // Process each order
    orders.forEach(order => {
        // Process order date for monthly revenue
        if (order.orderDate) {
            const orderDate = new Date(order.orderDate);
            const year = orderDate.getFullYear();
            const month = orderDate.getMonth();
            const dayOfWeek = orderDate.getDay();

            // Weekly data
            const weekKey = getDayName(dayOfWeek);
            if (!monthlyRevenueData.weekly[weekKey]) {
                monthlyRevenueData.weekly[weekKey] = 0;
            }
            monthlyRevenueData.weekly[weekKey] += order.totalAmount || 0;

            // Monthly data
            const monthKey = getMonthName(month);
            if (!monthlyRevenueData.monthly[monthKey]) {
                monthlyRevenueData.monthly[monthKey] = 0;
            }
            monthlyRevenueData.monthly[monthKey] += order.totalAmount || 0;

            // Yearly data
            const yearKey = year.toString();
            if (!monthlyRevenueData.yearly[yearKey]) {
                monthlyRevenueData.yearly[yearKey] = 0;
            }
            monthlyRevenueData.yearly[yearKey] += order.totalAmount || 0;
        }

        // Process payment status
        const paymentStatus = order.paymentStatus ? order.paymentStatus.toLowerCase() : 'pending';
        if (paymentStatusData.hasOwnProperty(paymentStatus)) {
            paymentStatusData[paymentStatus]++;
        } else {
            paymentStatusData.pending++;
        }

        // Process order status
        const orderStatus = order.status ? order.status.toLowerCase() : 'pending';
        if (orderStatusData.hasOwnProperty(orderStatus)) {
            orderStatusData[orderStatus]++;
        } else {
            orderStatusData.pending++;
        }

        // Process items for top selling books
        if (order.items && order.items.length > 0) {
            order.items.forEach(item => {
                const bookId = item.bookId || 'unknown';
                if (!topSellingBooks[bookId]) {
                    topSellingBooks[bookId] = {
                        id: bookId,
                        title: item.title || 'Unknown Book',
                        quantity: 0,
                        revenue: 0
                    };
                }

                topSellingBooks[bookId].quantity += item.quantity || 1;
                topSellingBooks[bookId].revenue += (item.price || 0) * (item.quantity || 1);
            });
        }
    });
}

// Function to update dashboard summary
function updateDashboardSummary() {
    // Update total orders count
    document.getElementById('totalOrdersCount').textContent = ordersData.length;

    // Calculate total revenue
    const totalRevenue = ordersData.reduce((total, order) => total + (order.totalAmount || 0), 0);
    document.getElementById('totalRevenue').textContent = `PKR ${totalRevenue.toFixed(2)}`;

    // Update completed orders count
    document.getElementById('completedOrdersCount').textContent = orderStatusData.completed;

    // Update pending orders count
    document.getElementById('pendingOrdersCount').textContent = orderStatusData.pending;
}

// Function to initialize charts
function initializeCharts() {
    // Initialize payment status chart
    initializePaymentStatusChart();

    // Initialize order status chart
    initializeOrderStatusChart();
}

// Function to initialize payment status chart
function initializePaymentStatusChart() {
    const ctx = document.getElementById('paymentStatusChart').getContext('2d');

    // Destroy existing chart if it exists
    if (paymentStatusChart) {
        paymentStatusChart.destroy();
    }

    // Create new chart
    paymentStatusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Paid', 'Pending', 'Refunded'],
            datasets: [{
                data: [
                    paymentStatusData.paid,
                    paymentStatusData.pending,
                    paymentStatusData.refunded
                ],
                backgroundColor: [
                    '#4CAF50',
                    '#FFC107',
                    '#F44336'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Function to initialize order status chart
function initializeOrderStatusChart() {
    const ctx = document.getElementById('orderStatusChart').getContext('2d');

    // Destroy existing chart if it exists
    if (orderStatusChart) {
        orderStatusChart.destroy();
    }

    // Create new chart
    orderStatusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Pending', 'Cancelled'],
            datasets: [{
                data: [
                    orderStatusData.completed,
                    orderStatusData.pending,
                    orderStatusData.cancelled
                ],
                backgroundColor: [
                    '#4CAF50',
                    '#FFC107',
                    '#F44336'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Function to update top selling books table
function updateTopSellingBooksTable() {
    const tableBody = document.getElementById('topSellingBooksTableBody');

    // Clear table body
    tableBody.innerHTML = '';

    // Convert topSellingBooks object to array and sort by quantity
    const booksArray = Object.values(topSellingBooks).sort((a, b) => b.quantity - a.quantity);

    // Display top 5 books
    const topBooks = booksArray.slice(0, 5);

    if (topBooks.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4">No data available</td></tr>';
        return;
    }

    // Add books to table
    topBooks.forEach(book => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${book.id}</td>
            <td>${book.title}</td>
            <td>${book.quantity}</td>
            <td>PKR ${book.revenue.toFixed(2)}</td>
        `;

        tableBody.appendChild(row);
    });
}

// Function to update sales chart based on selected period
function updateSalesChart(period) {
    // Get chart container
    const chartContainer = document.getElementById('monthlySalesChart');
    const labelsContainer = document.getElementById('monthlyChartLabels');

    // Clear containers
    chartContainer.innerHTML = '';
    labelsContainer.innerHTML = '';

    // Get data for selected period
    let data = {};
    let labels = [];

    if (period === 'weekly') {
        data = monthlyRevenueData.weekly;
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    } else if (period === 'monthly') {
        data = monthlyRevenueData.monthly;
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    } else if (period === 'yearly') {
        data = monthlyRevenueData.yearly;
        // Get last 7 years
        const currentYear = new Date().getFullYear();
        for (let i = 6; i >= 0; i--) {
            labels.push((currentYear - i).toString());
        }
    }

    // Find maximum value for scaling
    const values = labels.map(label => data[label] || 0);
    const maxValue = Math.max(...values, 1); // Ensure maxValue is at least 1 to avoid division by zero

    // Create chart bars
    labels.forEach((label) => {
        const value = data[label] || 0;
        const height = `${Math.round((value / maxValue) * 90)}%`; // Scale to 90% max height

        // Create bar
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        bar.style.height = height;

        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'chart-tooltip';
        tooltip.textContent = `PKR ${value.toFixed(2)}`;

        // Add tooltip to bar
        bar.appendChild(tooltip);

        // Add bar to container
        chartContainer.appendChild(bar);

        // Create label
        const labelElement = document.createElement('span');
        labelElement.textContent = label;

        // Add label to container
        labelsContainer.appendChild(labelElement);
    });
}

// Helper function to get week number
function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Helper function to get day name
function getDayName(dayIndex) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayIndex];
}

// Helper function to get month name
function getMonthName(monthIndex) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthIndex];
}
