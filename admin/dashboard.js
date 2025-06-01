// Admin Dashboard Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if admin is logged in
    const adminLoggedIn = sessionStorage.getItem('adminLoggedIn');
    const adminUsername = sessionStorage.getItem('adminUsername');

    if (!adminLoggedIn || adminLoggedIn !== 'true') {
        // Redirect to login page if not logged in
        window.location.href = 'index.html';
        return;
    }

    // Set admin initials
    const adminInitialsElement = document.getElementById('adminInitials');
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

    // Fetch all data for dashboard
    loadDashboardData();

    // Set up refresh interval (every 30 seconds)
    setInterval(loadDashboardData, 30000);
});

// Function to load all dashboard data
async function loadDashboardData() {
    try {
        // Show loading indicators
        showLoadingState();

        // Fetch all data in parallel
        const [booksData, usersData, ordersData, paymentOptionsData] = await Promise.all([
            fetchData('http://localhost:8002/api/books'),
            fetchData('http://localhost:8002/api/users'),
            fetchData('http://localhost:8002/api/orders'),
            fetchData('http://localhost:8002/api/payment-options')
        ]);

        // Update dashboard with fetched data
        updateDashboardCards(booksData, usersData, ordersData);
        updateRecentOrders(ordersData);
        updatePaymentMethods(paymentOptionsData, ordersData);
        updateUserStatistics(usersData);

        // Add event listeners for action buttons
        addActionButtonListeners();

        // Show success notification
        showNotification('Dashboard data updated successfully!', 'success');
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Failed to load dashboard data. Please try again.', 'error');
    }
}

// Helper function to fetch data from API
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        throw error;
    }
}

// Function to show loading state
function showLoadingState() {
    const cardContents = document.querySelectorAll('.admin-card-content h3');
    cardContents.forEach(content => {
        content.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    });

    const tableBody = document.querySelector('.admin-table tbody');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="loading-row">
                    <i class="fas fa-spinner fa-spin"></i> Loading data...
                </td>
            </tr>
        `;
    }
}

// Function to update dashboard cards with real data
function updateDashboardCards(booksData, usersData, ordersData) {
    // Update total books count
    const totalBooksElement = document.querySelector('.admin-card:nth-child(1) .admin-card-content h3');
    if (totalBooksElement) {
        totalBooksElement.textContent = booksData.length;
    }

    // Update total users count
    const totalUsersElement = document.querySelector('.admin-card:nth-child(2) .admin-card-content h3');
    if (totalUsersElement) {
        totalUsersElement.textContent = usersData.length;
    }

    // Update total orders count
    const totalOrdersElement = document.querySelector('.admin-card:nth-child(3) .admin-card-content h3');
    if (totalOrdersElement) {
        totalOrdersElement.textContent = ordersData.length;
    }

    // Calculate total revenue
    let totalRevenue = 0;
    ordersData.forEach(order => {
        totalRevenue += order.totalAmount || 0;
    });

    // Update total revenue
    const totalRevenueElement = document.querySelector('.admin-card:nth-child(4) .admin-card-content h3');
    if (totalRevenueElement) {
        totalRevenueElement.textContent = `PKR ${totalRevenue.toFixed(2)}`;
    }
}

// Function to update recent orders table
function updateRecentOrders(ordersData) {
    const tableBody = document.querySelector('.admin-table tbody');
    if (!tableBody) return;

    // Sort orders by date (newest first)
    const sortedOrders = [...ordersData].sort((a, b) => {
        return new Date(b.orderDate) - new Date(a.orderDate);
    });

    // Take only the 5 most recent orders
    const recentOrders = sortedOrders.slice(0, 5);

    // Clear existing table rows
    tableBody.innerHTML = '';

    // Add new rows for recent orders
    if (recentOrders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="no-data">No orders found</td>
            </tr>
        `;
        return;
    }

    recentOrders.forEach(order => {
        const row = document.createElement('tr');

        // Format date
        const orderDate = new Date(order.orderDate);
        const formattedDate = orderDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        // Determine status class
        let statusClass = '';
        switch (order.status) {
            case 'completed':
                statusClass = 'completed';
                break;
            case 'pending':
                statusClass = 'pending';
                break;
            case 'cancelled':
                statusClass = 'cancelled';
                break;
            default:
                statusClass = 'processing';
        }

        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.userId}</td>
            <td>${formattedDate}</td>
            <td>PKR ${order.totalAmount.toFixed(2)}</td>
            <td><span class="status-badge ${statusClass}">${order.status}</span></td>
            <td>
                <div class="admin-table-actions-cell">
                    <div class="admin-action-btn view" data-id="${order.id}"><i class="fas fa-eye"></i></div>
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });
}



// Function to update payment methods statistics
function updatePaymentMethods(paymentOptionsData, ordersData) {
    // Get or create the payment methods container
    let paymentContainer = document.getElementById('paymentMethodsContainer');
    if (!paymentContainer) {
        // Create the container if it doesn't exist
        const adminContent = document.querySelector('.admin-content');
        paymentContainer = document.createElement('div');
        paymentContainer.id = 'paymentMethodsContainer';
        paymentContainer.className = 'admin-stats-container';

        paymentContainer.innerHTML = `
            <div class="admin-stats-header">
                <h2>Payment Methods</h2>
            </div>
            <div class="admin-stats-content" id="paymentMethodsContent">
                <div class="loading-indicator">
                    <i class="fas fa-spinner fa-spin"></i> Loading payment methods...
                </div>
            </div>
        `;

        // Insert after the admin cards
        const adminCards = document.querySelector('.admin-cards');
        if (adminCards && adminCards.nextSibling) {
            adminContent.insertBefore(paymentContainer, adminCards.nextSibling);
        } else {
            adminContent.appendChild(paymentContainer);
        }
    }

    // Get payment methods content container
    const paymentContent = document.getElementById('paymentMethodsContent');
    if (!paymentContent) return;

    // Count orders by payment method
    const paymentCounts = {};
    const paymentAmounts = {};

    ordersData.forEach(order => {
        const method = order.paymentMethod;
        if (method) {
            if (paymentCounts[method]) {
                paymentCounts[method]++;
                paymentAmounts[method] += order.totalAmount || 0;
            } else {
                paymentCounts[method] = 1;
                paymentAmounts[method] = order.totalAmount || 0;
            }
        }
    });

    // Clear existing content
    paymentContent.innerHTML = '';

    // Create payment methods grid
    if (Object.keys(paymentCounts).length === 0) {
        paymentContent.innerHTML = '<div class="no-data">No payment data found</div>';
        return;
    }

    const paymentGrid = document.createElement('div');
    paymentGrid.className = 'payment-methods-grid';

    // Create a card for each payment method
    paymentOptionsData.forEach(payment => {
        const count = paymentCounts[payment.name] || 0;
        const amount = paymentAmounts[payment.name] || 0;

        const paymentCard = document.createElement('div');
        paymentCard.className = 'payment-method-card';

        paymentCard.innerHTML = `
            <div class="payment-method-icon">
                <img src="${payment.icon}" alt="${payment.name}">
            </div>
            <div class="payment-method-details">
                <h3>${payment.name}</h3>
                <p>${payment.description}</p>
                <div class="payment-method-stats">
                    <div class="payment-stat">
                        <span class="payment-stat-label">Orders:</span>
                        <span class="payment-stat-value">${count}</span>
                    </div>
                    <div class="payment-stat">
                        <span class="payment-stat-label">Revenue:</span>
                        <span class="payment-stat-value">PKR ${amount.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;

        paymentGrid.appendChild(paymentCard);
    });

    paymentContent.appendChild(paymentGrid);
}

// Function to update user statistics
function updateUserStatistics(usersData) {
    // Get or create the user statistics container
    let userStatsContainer = document.getElementById('userStatsContainer');
    if (!userStatsContainer) {
        // Create the container if it doesn't exist
        const adminContent = document.querySelector('.admin-content');
        userStatsContainer = document.createElement('div');
        userStatsContainer.id = 'userStatsContainer';
        userStatsContainer.className = 'admin-stats-container';

        userStatsContainer.innerHTML = `
            <div class="admin-stats-header">
                <h2>User Statistics</h2>
            </div>
            <div class="admin-stats-content" id="userStatsContent">
                <div class="loading-indicator">
                    <i class="fas fa-spinner fa-spin"></i> Loading user statistics...
                </div>
            </div>
        `;

        // Insert after the payment methods container
        const paymentContainer = document.getElementById('paymentMethodsContainer');
        if (paymentContainer && paymentContainer.nextSibling) {
            adminContent.insertBefore(userStatsContainer, paymentContainer.nextSibling);
        } else {
            adminContent.appendChild(userStatsContainer);
        }
    }

    // Get user stats content container
    const userStatsContent = document.getElementById('userStatsContent');
    if (!userStatsContent) return;

    // Clear existing content
    userStatsContent.innerHTML = '';

    // Create user statistics
    if (usersData.length === 0) {
        userStatsContent.innerHTML = '<div class="no-data">No user data found</div>';
        return;
    }

    // Group users by registration date (year-month)
    const usersByMonth = {};
    usersData.forEach(user => {
        if (user.accountCreated) {
            // Parse date in format DD/MM/YYYY
            const parts = user.accountCreated.split('/');
            if (parts.length === 3) {
                const year = parts[2];
                const month = parts[1];
                const yearMonth = `${year}-${month}`;

                if (usersByMonth[yearMonth]) {
                    usersByMonth[yearMonth]++;
                } else {
                    usersByMonth[yearMonth] = 1;
                }
            }
        }
    });

    // Convert to array and sort by date
    const monthsArray = Object.entries(usersByMonth).map(([yearMonth, count]) => {
        const [year, month] = yearMonth.split('-');
        return {
            yearMonth,
            year: parseInt(year),
            month: parseInt(month),
            count
        };
    }).sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
    });

    // Create user growth chart
    const chartContainer = document.createElement('div');
    chartContainer.className = 'user-growth-chart';

    // Create chart header
    const chartHeader = document.createElement('div');
    chartHeader.className = 'chart-header';
    chartHeader.innerHTML = '<h3>User Growth</h3>';
    chartContainer.appendChild(chartHeader);

    // Create chart content
    const chartContent = document.createElement('div');
    chartContent.className = 'chart-content';

    // Get month names
    const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    // Create bars for each month
    monthsArray.forEach(item => {
        const monthName = monthNames[item.month - 1];
        const label = `${monthName} ${item.year}`;

        const barContainer = document.createElement('div');
        barContainer.className = 'chart-bar-container';

        barContainer.innerHTML = `
            <div class="chart-bar" style="height: ${item.count * 10}px;">
                <span class="chart-bar-value">${item.count}</span>
            </div>
            <div class="chart-bar-label">${label}</div>
        `;

        chartContent.appendChild(barContainer);
    });

    chartContainer.appendChild(chartContent);
    userStatsContent.appendChild(chartContainer);

    // Create recent users list
    const recentUsersContainer = document.createElement('div');
    recentUsersContainer.className = 'recent-users';

    // Sort users by registration date (newest first)
    const sortedUsers = [...usersData].sort((a, b) => {
        if (!a.accountCreated || !b.accountCreated) return 0;

        const partsA = a.accountCreated.split('/');
        const partsB = b.accountCreated.split('/');

        const dateA = new Date(partsA[2], partsA[1] - 1, partsA[0]);
        const dateB = new Date(partsB[2], partsB[1] - 1, partsB[0]);

        return dateB - dateA;
    });

    // Take only the 5 most recent users
    const recentUsers = sortedUsers.slice(0, 5);

    // Create recent users header
    const recentUsersHeader = document.createElement('div');
    recentUsersHeader.className = 'recent-users-header';
    recentUsersHeader.innerHTML = '<h3>Recent Users</h3>';
    recentUsersContainer.appendChild(recentUsersHeader);

    // Create recent users list
    const usersList = document.createElement('div');
    usersList.className = 'users-list';

    recentUsers.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';

        // Format date
        let formattedDate = user.accountCreated;
        if (user.accountCreated) {
            const parts = user.accountCreated.split('/');
            if (parts.length === 3) {
                const date = new Date(parts[2], parts[1] - 1, parts[0]);
                formattedDate = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            }
        }

        userItem.innerHTML = `
            <div class="user-avatar">
                <span>${user.fullName.substring(0, 2).toUpperCase()}</span>
            </div>
            <div class="user-details">
                <div class="user-name">${user.fullName}</div>
                <div class="user-email">${user.email}</div>
                <div class="user-date">Joined: ${formattedDate}</div>
            </div>
        `;

        usersList.appendChild(userItem);
    });

    recentUsersContainer.appendChild(usersList);
    userStatsContent.appendChild(recentUsersContainer);
}

// Function to add event listeners for action buttons
function addActionButtonListeners() {
    // View buttons
    const viewButtons = document.querySelectorAll('.admin-action-btn.view');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.getAttribute('data-id');
            // Navigate to orders page with the specific order ID
            window.location.href = `orders.html?id=${orderId}`;
        });
    });
}

// Function to show notification
function showNotification(message, type = 'success') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('dashboardNotification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'dashboardNotification';
        notification.className = 'dashboard-notification';
        document.body.appendChild(notification);
    }

    // Set notification type
    notification.className = `dashboard-notification ${type}`;

    // Set message
    notification.textContent = message;

    // Show notification
    notification.classList.add('show');

    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}
