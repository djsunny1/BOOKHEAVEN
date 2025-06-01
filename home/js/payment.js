// Payment processing functionality

// Function to fetch payment options from the server
async function fetchPaymentOptions() {
    try {
        const response = await fetch('/backend/database/paymentoptions.json');
        return await response.json();
    } catch (error) {
        console.error('Error fetching payment options:', error);
        return [];
    }
}

// Function to show payment options modal
async function showPaymentOptionsModal() {
    // Get the cart items and total
    const cartItems = getCartItems();
    if (cartItems.length === 0) {
        alert('Your cart is empty');
        return;
    }

    // Create modal if it doesn't exist
    let paymentOptionsModal = document.getElementById('paymentOptionsModal');
    if (!paymentOptionsModal) {
        paymentOptionsModal = document.createElement('div');
        paymentOptionsModal.id = 'paymentOptionsModal';
        paymentOptionsModal.className = 'modal';

        document.body.appendChild(paymentOptionsModal);
    }

    // Fetch payment options
    const paymentOptions = await fetchPaymentOptions();

    // Create modal content
    paymentOptionsModal.innerHTML = `
        <div class="modal-content payment-options-content">
            <span class="close-modal">&times;</span>
            <h2>Select Payment Method</h2>
            <div id="paymentOptionsList" class="payment-options-list">
                ${paymentOptions.length === 0 ?
                    '<div class="no-payment-options">No payment options available</div>' :
                    paymentOptions.map(option => `
                        <div class="payment-option" data-id="${option.id}">
                            <div class="payment-option-icon">
                                <img src="${option.icon}" alt="${option.name}">
                            </div>
                            <div class="payment-option-details">
                                <div class="payment-option-name">${option.name}</div>
                                <div class="payment-option-description">${option.description}</div>
                            </div>
                        </div>
                    `).join('')
                }
            </div>
            <div class="payment-options-footer">
                <button id="cancelPaymentBtn" class="cart-btn clear-btn">Cancel</button>
            </div>
        </div>
    `;

    // Show the modal
    paymentOptionsModal.style.display = 'block';

    // Add event listeners
    const closeButton = paymentOptionsModal.querySelector('.close-modal');
    closeButton.addEventListener('click', () => {
        paymentOptionsModal.style.display = 'none';
    });

    const cancelButton = document.getElementById('cancelPaymentBtn');
    cancelButton.addEventListener('click', () => {
        paymentOptionsModal.style.display = 'none';
    });

    // Add event listeners to payment options
    const paymentOptionElements = paymentOptionsModal.querySelectorAll('.payment-option');
    paymentOptionElements.forEach(element => {
        element.addEventListener('click', () => {
            const paymentId = element.dataset.id;
            const selectedPayment = paymentOptions.find(option => option.id === paymentId);

            if (selectedPayment) {
                // Hide payment options modal
                paymentOptionsModal.style.display = 'none';

                // Show payment overview modal
                showPaymentOverviewModal(selectedPayment, cartItems);
            }
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === paymentOptionsModal) {
            paymentOptionsModal.style.display = 'none';
        }
    });
}

// Function to show payment overview modal
function showPaymentOverviewModal(paymentMethod, cartItems) {
    // Create modal if it doesn't exist
    let paymentOverviewModal = document.getElementById('paymentOverviewModal');
    if (!paymentOverviewModal) {
        paymentOverviewModal = document.createElement('div');
        paymentOverviewModal.id = 'paymentOverviewModal';
        paymentOverviewModal.className = 'modal';

        document.body.appendChild(paymentOverviewModal);
    }

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + (item.afterDiscountPrice * item.quantity), 0).toFixed(2);

    // Create modal content
    paymentOverviewModal.innerHTML = `
        <div class="modal-content payment-overview-content">
            <span class="close-modal">&times;</span>
            <h2>Payment Overview</h2>

            <div class="payment-method-details">
                <h3>Payment Method</h3>
                <div class="selected-payment-method">
                    <div class="payment-method-icon">
                        <img src="${paymentMethod.icon}" alt="${paymentMethod.name}">
                    </div>
                    <div class="payment-method-info">
                        <div class="payment-method-name">${paymentMethod.name}</div>
                        <div class="payment-method-description">${paymentMethod.description}</div>
                        <div class="payment-method-account">
                            <div><strong>Account Number:</strong> ${paymentMethod.accountNumber}</div>
                            <div><strong>Account Name:</strong> ${paymentMethod.accountName}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="order-summary">
                <h3>Order Summary</h3>
                <div class="order-items">
                    ${cartItems.map(item => `
                        <div class="order-item">
                            <div class="order-item-name">${item.name} × ${item.quantity}</div>
                            <div class="order-item-price">PKR ${(item.afterDiscountPrice * item.quantity).toFixed(2)}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="order-total">
                    <div class="order-total-label">Total:</div>
                    <div class="order-total-amount">PKR ${total}</div>
                </div>
            </div>

            <div class="payment-instructions">
                <p>Please transfer the exact amount to the account details provided above.</p>
                <p>Your order will be processed once the payment is confirmed.</p>
            </div>

            <div class="payment-overview-footer">
                <button id="backToPaymentOptionsBtn" class="cart-btn clear-btn">Back</button>
                <button id="submitOrderBtn" class="cart-btn checkout-btn">Submit Order</button>
            </div>
        </div>
    `;

    // Show the modal
    paymentOverviewModal.style.display = 'block';

    // Add event listeners
    const closeButton = paymentOverviewModal.querySelector('.close-modal');
    closeButton.addEventListener('click', () => {
        paymentOverviewModal.style.display = 'none';
    });

    const backButton = document.getElementById('backToPaymentOptionsBtn');
    backButton.addEventListener('click', () => {
        paymentOverviewModal.style.display = 'none';
        showPaymentOptionsModal();
    });

    const submitButton = document.getElementById('submitOrderBtn');
    submitButton.addEventListener('click', () => {
        submitOrder(paymentMethod, cartItems);
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === paymentOverviewModal) {
            paymentOverviewModal.style.display = 'none';
        }
    });
}

// Function to submit order
async function submitOrder(paymentMethod, cartItems) {
    // Create a new order object
    const currentUser = getCurrentUser();
    const orderId = 'ORD' + Date.now();
    const total = cartItems.reduce((sum, item) => sum + (item.afterDiscountPrice * item.quantity), 0).toFixed(2);

    // Format items for the order
    const orderItems = cartItems.map(item => ({
        bookId: item.bookId,
        title: item.name,
        quantity: item.quantity,
        price: item.afterDiscountPrice,
        discount: Math.round((1 - (item.afterDiscountPrice / item.actualPrice)) * 100) || 0,
        finalPrice: (item.afterDiscountPrice * item.quantity).toFixed(2)
    }));

    const order = {
        id: orderId,
        userId: currentUser.id,
        items: orderItems,
        totalAmount: parseFloat(total),
        status: "pending",
        paymentStatus: "pending",
        shippingAddress: "To be provided",
        orderDate: new Date().toISOString().split('T')[0],
        deliveryDate: null,
        paymentMethod: paymentMethod.name,
        transactionId: paymentMethod.id + Date.now().toString().slice(-6)
    };

    try {
        // Fetch existing orders
        const response = await fetch('/backend/database/orders.json');
        const existingOrders = await response.json();

        // Add new order to the beginning of the array
        existingOrders.unshift(order);

        // Save updated orders to the file
        await fetch('/backend/database/orders.json', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(existingOrders, null, 2)
        });

        // Close the payment overview modal
        document.getElementById('paymentOverviewModal').style.display = 'none';

        // Show success message
        document.getElementById('successMessage').textContent = 'Order Submitted!';
        document.getElementById('successDetails').textContent = `Your order has been submitted successfully. Order ID: ${orderId}`;
        document.getElementById('successModal').style.display = 'block';

        // Clear the cart
        clearCart();

        // Reload page after success
        document.getElementById('successOkBtn').addEventListener('click', () => {
            window.location.reload();
        });
    } catch (error) {
        console.error('Error saving order:', error);
        alert('There was an error processing your order. Please try again.');
    }
}
