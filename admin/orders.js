// Admin Orders Management Functionality
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

    // Order modal elements
    const orderModal = document.getElementById('orderModal');
    const closeOrderModal = document.getElementById('closeOrderModal');
    const closeOrderDetailsBtn = document.getElementById('closeOrderDetailsBtn');
    const cancelOrderBtn = document.getElementById('cancelOrderBtn');
    const orderForm = document.getElementById('orderForm');
    const addItemBtn = document.getElementById('addItemBtn');
    const viewOrderModal = document.getElementById('viewOrderModal');
    const closeViewOrderModal = document.getElementById('closeViewOrderModal');
    const closeViewOrderBtn = document.getElementById('closeViewOrderBtn');
    const editOrderFromViewBtn = document.getElementById('editOrderFromViewBtn');

    // Close order modal when X button is clicked
    if (closeOrderModal) {
        closeOrderModal.addEventListener('click', function() {
            orderModal.style.display = 'none';
        });
    }

    // Close order modal when Cancel button is clicked
    if (cancelOrderBtn) {
        cancelOrderBtn.addEventListener('click', function() {
            orderModal.style.display = 'none';
        });
    }

    // Close view order modal when X button is clicked
    if (closeViewOrderModal) {
        closeViewOrderModal.addEventListener('click', function() {
            viewOrderModal.style.display = 'none';
        });
    }

    // Close view order modal when Close button is clicked
    if (closeViewOrderBtn) {
        closeViewOrderBtn.addEventListener('click', function() {
            viewOrderModal.style.display = 'none';
        });
    }

    // Edit order from view modal
    if (editOrderFromViewBtn) {
        editOrderFromViewBtn.addEventListener('click', function() {
            const orderId = document.getElementById('viewOrderId').textContent;

            // Fetch the order data
            fetch('http://localhost:8002/api/orders')
                .then(response => response.json())
                .then(orders => {
                    const order = orders.find(o => o.id === orderId);
                    if (order) {
                        // Close view modal
                        viewOrderModal.style.display = 'none';

                        // Show edit form
                        showEditOrderForm(order);
                    }
                })
                .catch(error => {
                    console.error('Error fetching order:', error);
                    alert('Error fetching order details. Please try again.');
                });
        });
    }

    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === orderModal) {
            orderModal.style.display = 'none';
        }
        if (event.target === viewOrderModal) {
            viewOrderModal.style.display = 'none';
        }
    });

    // Add Item button
    if (addItemBtn) {
        addItemBtn.addEventListener('click', function() {
            // Get the current number of items
            const orderItems = document.querySelectorAll('.order-item');
            const newIndex = orderItems.length;

            // Add a new empty item
            addOrderItemToForm({}, newIndex);
        });
    }

    // Handle order form submission
    if (orderForm) {
        orderForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Get form values
            const orderId = document.getElementById('orderId').value;
            const userId = document.getElementById('orderUserId').value;
            const status = document.getElementById('orderStatus').value;
            const paymentStatus = document.getElementById('orderPaymentStatus').value;
            const paymentMethod = document.getElementById('orderPaymentMethod').value;
            const orderDate = document.getElementById('orderDate').value;
            const deliveryDate = document.getElementById('orderDeliveryDate').value;
            const shippingAddress = document.getElementById('orderShippingAddress').value;
            const transactionId = document.getElementById('orderTransactionId').value;
            const totalAmount = parseFloat(document.getElementById('orderTotalAmount').value);

            // Get order items
            const orderItemElements = document.querySelectorAll('.order-item');
            const items = [];

            orderItemElements.forEach((itemElement, index) => {
                const bookId = document.getElementById(`orderItemBookId_${itemElement.dataset.index}`).value;
                const title = document.getElementById(`orderItemTitle_${itemElement.dataset.index}`).value;
                const price = parseFloat(document.getElementById(`orderItemPrice_${itemElement.dataset.index}`).value);
                const quantity = parseInt(document.getElementById(`orderItemQuantity_${itemElement.dataset.index}`).value);

                items.push({
                    bookId,
                    title,
                    price,
                    quantity
                });
            });

            // Create order object
            const orderData = {
                id: orderId || `ORD-${Date.now().toString().substring(6)}`,
                userId,
                status,
                paymentStatus,
                paymentMethod,
                orderDate,
                deliveryDate: deliveryDate || null,
                shippingAddress,
                transactionId,
                totalAmount,
                items
            };

            try {
                if (orderId) {
                    // Update existing order
                    const response = await fetch(`http://localhost:8002/api/orders/update/${orderId}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(orderData)
                    });

                    const result = await response.json();

                    if (result.success) {
                        alert(`Order ${orderId} updated successfully!`);
                        orderModal.style.display = 'none';
                        loadOrders(); // Refresh the orders table
                    } else {
                        alert(`Error updating order: ${result.error || 'Unknown error'}`);
                    }
                } else {
                    // Add new order
                    // First get all orders
                    const ordersResponse = await fetch('http://localhost:8002/api/orders');
                    const orders = await ordersResponse.json();

                    // Add new order to the array
                    orders.push(orderData);

                    // Save the updated array
                    const response = await fetch('http://localhost:8002/api/orders', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(orders)
                    });

                    const result = await response.json();

                    if (result.success) {
                        alert(`Order ${orderData.id} added successfully!`);
                        orderModal.style.display = 'none';
                        loadOrders(); // Refresh the orders table
                    } else {
                        alert(`Error adding order: ${result.error || 'Unknown error'}`);
                    }
                }
            } catch (error) {
                console.error('Error saving order:', error);
                alert(`Error saving order: ${error.message}`);
            }
        });
    }

    // Load orders data
    loadOrders();
});

// Function to load orders data
async function loadOrders() {
    const ordersTableBody = document.getElementById('ordersTableBody');

    try {
        // Show loading message
        ordersTableBody.innerHTML = '<tr><td colspan="7">Loading orders...</td></tr>';

        // Fetch orders from API
        const response = await fetch('http://localhost:8002/api/orders');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const orders = await response.json();

        // Clear table body
        ordersTableBody.innerHTML = '';

        if (orders.length === 0) {
            ordersTableBody.innerHTML = '<tr><td colspan="7">No orders found</td></tr>';
            return;
        }

        // Add orders to table
        orders.forEach(order => {
            const row = document.createElement('tr');

            // Get customer name from userId if available
            const customerName = order.userId || 'Unknown';

            // Format date
            const orderDate = order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A';

            // Calculate total amount
            const totalAmount = order.totalAmount || 0;

            // Get status with proper capitalization
            const status = order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending';

            // Get payment status with proper capitalization
            const paymentStatus = order.paymentStatus ? order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1) : 'Pending';

            row.innerHTML = `
                <td>${order.id || 'Unknown'}</td>
                <td>${customerName}</td>
                <td>PKR ${totalAmount.toFixed(2)}</td>
                <td><span class="status-badge ${status.toLowerCase()}">${status}</span></td>
                <td><span class="status-badge ${paymentStatus.toLowerCase()}">${paymentStatus}</span></td>
                <td>${orderDate}</td>
                <td>
                    <div class="admin-table-actions-cell">
                        <div class="admin-action-btn view" data-id="${order.id}"><i class="fas fa-eye"></i></div>
                        <div class="admin-action-btn edit" data-id="${order.id}"><i class="fas fa-edit"></i></div>
                        <div class="admin-action-btn delete" data-id="${order.id}"><i class="fas fa-trash"></i></div>
                    </div>
                </td>
            `;

            ordersTableBody.appendChild(row);
        });

        // Add event listeners for action buttons
        addActionButtonListeners(orders);
    } catch (error) {
        console.error('Error loading orders:', error);
        ordersTableBody.innerHTML = '<tr><td colspan="7">Error loading orders. Please try again later.</td></tr>';
    }
}

// Function to add event listeners for action buttons
function addActionButtonListeners(orders) {
    // View buttons
    const viewButtons = document.querySelectorAll('.admin-action-btn.view');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.getAttribute('data-id');
            const order = orders.find(o => o.id === orderId);

            if (order) {
                showOrderDetails(order);
            }
        });
    });

    // Edit buttons
    const editButtons = document.querySelectorAll('.admin-action-btn.edit');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.getAttribute('data-id');
            const order = orders.find(o => o.id === orderId);

            if (order) {
                showEditOrderForm(order);
            }
        });
    });

    // Delete buttons
    const deleteButtons = document.querySelectorAll('.admin-action-btn.delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.getAttribute('data-id');
            const order = orders.find(o => o.id === orderId);

            if (order && confirm(`Are you sure you want to delete order ${order.id}?`)) {
                deleteOrder(order.id);
            }
        });
    });

    // Add new order button
    const addOrderBtn = document.getElementById('addOrderBtn');
    if (addOrderBtn) {
        addOrderBtn.addEventListener('click', function() {
            showAddOrderForm();
        });
    }
}

// Function to show the edit order form
function showEditOrderForm(order) {
    // Set modal title
    document.getElementById('orderModalTitle').textContent = `Edit Order ${order.id}`;

    // Set form values
    document.getElementById('orderId').value = order.id;
    document.getElementById('orderUserId').value = order.userId || '';
    document.getElementById('orderStatus').value = order.status || 'pending';
    document.getElementById('orderPaymentStatus').value = order.paymentStatus || 'pending';
    document.getElementById('orderPaymentMethod').value = order.paymentMethod || '';
    document.getElementById('orderDate').value = order.orderDate ? new Date(order.orderDate).toISOString().split('T')[0] : '';
    document.getElementById('orderDeliveryDate').value = order.deliveryDate ? new Date(order.deliveryDate).toISOString().split('T')[0] : '';
    document.getElementById('orderShippingAddress').value = order.shippingAddress || '';
    document.getElementById('orderTransactionId').value = order.transactionId || '';
    document.getElementById('orderTotalAmount').value = order.totalAmount || 0;

    // Clear order items
    const orderItemsContainer = document.getElementById('orderItems');
    orderItemsContainer.innerHTML = '';

    // Add order items
    if (order.items && order.items.length > 0) {
        order.items.forEach((item, index) => {
            addOrderItemToForm(item, index);
        });
    } else {
        // Add an empty item if no items exist
        addOrderItemToForm({}, 0);
    }

    // Show modal
    document.getElementById('orderModal').style.display = 'block';
}

// Function to show the add order form
function showAddOrderForm() {
    // Set modal title
    document.getElementById('orderModalTitle').textContent = 'Add New Order';

    // Clear form values
    document.getElementById('orderId').value = '';
    document.getElementById('orderUserId').value = '';
    document.getElementById('orderStatus').value = 'pending';
    document.getElementById('orderPaymentStatus').value = 'pending';
    document.getElementById('orderPaymentMethod').value = '';
    document.getElementById('orderDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('orderDeliveryDate').value = '';
    document.getElementById('orderShippingAddress').value = '';
    document.getElementById('orderTransactionId').value = '';
    document.getElementById('orderTotalAmount').value = 0;

    // Clear order items
    const orderItemsContainer = document.getElementById('orderItems');
    orderItemsContainer.innerHTML = '';

    // Add an empty item
    addOrderItemToForm({}, 0);

    // Show modal
    document.getElementById('orderModal').style.display = 'block';
}

// Function to add an order item to the form
function addOrderItemToForm(item, index) {
    const orderItemsContainer = document.getElementById('orderItems');

    const itemDiv = document.createElement('div');
    itemDiv.className = 'order-item';
    itemDiv.dataset.index = index;

    itemDiv.innerHTML = `
        <div class="admin-form-row">
            <div class="admin-form-group">
                <label for="orderItemBookId_${index}">Book ID</label>
                <input type="text" id="orderItemBookId_${index}" value="${item.bookId || ''}" required>
            </div>
            <div class="admin-form-group">
                <label for="orderItemTitle_${index}">Title</label>
                <input type="text" id="orderItemTitle_${index}" value="${item.title || ''}" required>
            </div>
        </div>
        <div class="admin-form-row">
            <div class="admin-form-group">
                <label for="orderItemPrice_${index}">Price</label>
                <input type="number" id="orderItemPrice_${index}" value="${item.price || 0}" step="0.01" min="0" required>
            </div>
            <div class="admin-form-group">
                <label for="orderItemQuantity_${index}">Quantity</label>
                <input type="number" id="orderItemQuantity_${index}" value="${item.quantity || 1}" min="1" required>
            </div>
            <div class="admin-form-group">
                <button type="button" class="admin-btn admin-btn-danger remove-item-btn" data-index="${index}">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        </div>
        <hr>
    `;

    orderItemsContainer.appendChild(itemDiv);

    // Add event listener for remove button
    const removeBtn = itemDiv.querySelector('.remove-item-btn');
    removeBtn.addEventListener('click', function() {
        itemDiv.remove();
    });
}

// Function to delete an order
async function deleteOrder(orderId) {
    try {
        const response = await fetch(`http://localhost:8002/api/orders/delete/${orderId}`, {
            method: 'GET'
        });

        const result = await response.json();

        if (result.success) {
            alert(`Order ${orderId} deleted successfully!`);
            loadOrders(); // Refresh the orders table
        } else {
            alert(`Error deleting order: ${result.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error deleting order:', error);
        alert(`Error deleting order: ${error.message}`);
    }
}

// Function to show order details
function showOrderDetails(order) {
    // Get status with proper capitalization
    const status = order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending';
    const paymentStatus = order.paymentStatus ? order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1) : 'Pending';

    // Format dates
    const orderDate = order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A';
    const deliveryDate = order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'N/A';

    // Set order details
    document.getElementById('viewOrderId').textContent = order.id || 'Unknown';
    document.getElementById('viewOrderUserId').textContent = order.userId || 'Unknown';
    document.getElementById('viewOrderStatus').textContent = status;
    document.getElementById('viewOrderPaymentStatus').textContent = paymentStatus;
    document.getElementById('viewOrderTotalAmount').textContent = `PKR ${(order.totalAmount || 0).toFixed(2)}`;
    document.getElementById('viewOrderDate').textContent = orderDate;
    document.getElementById('viewOrderDeliveryDate').textContent = deliveryDate;
    document.getElementById('viewOrderShippingAddress').textContent = order.shippingAddress || 'Not provided';
    document.getElementById('viewOrderPaymentMethod').textContent = order.paymentMethod || 'Not specified';
    document.getElementById('viewOrderTransactionId').textContent = order.transactionId || 'N/A';

    // Clear order items table
    const orderItemsTableBody = document.getElementById('viewOrderItemsTableBody');
    orderItemsTableBody.innerHTML = '';

    // Add order items to table
    if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
            const row = document.createElement('tr');
            const quantity = item.quantity || 1;
            const price = item.price || 0;
            const discount = item.discount || 0;
            const finalPrice = price * quantity;

            row.innerHTML = `
                <td>${item.bookId || 'Unknown'}</td>
                <td>${item.title || 'Unknown'}</td>
                <td>${quantity}</td>
                <td>PKR ${price.toFixed(2)}</td>
                <td>${discount}%</td>
                <td>PKR ${finalPrice.toFixed(2)}</td>
            `;

            orderItemsTableBody.appendChild(row);
        });
    } else {
        orderItemsTableBody.innerHTML = '<tr><td colspan="6">No items found</td></tr>';
    }

    // Show modal
    document.getElementById('viewOrderModal').style.display = 'block';
}
