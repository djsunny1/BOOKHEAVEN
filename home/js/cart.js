// Shopping cart functionality

// Initialize cart in localStorage if it doesn't exist
function initCart() {
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
}

// Get cart items
function getCartItems() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

// Add item to cart
function addToCart(item) {
    const cart = getCartItems();
    
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(cartItem => cartItem.bookId === item.bookId);
    
    if (existingItemIndex !== -1) {
        // Increment quantity if item already exists
        cart[existingItemIndex].quantity += 1;
    } else {
        // Add new item with quantity 1
        cart.push({
            ...item,
            quantity: 1
        });
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Return the updated cart
    return cart;
}

// Remove item from cart
function removeFromCart(bookId) {
    let cart = getCartItems();
    cart = cart.filter(item => item.bookId !== bookId);
    localStorage.setItem('cart', JSON.stringify(cart));
    return cart;
}

// Update item quantity in cart
function updateCartItemQuantity(bookId, quantity) {
    const cart = getCartItems();
    const itemIndex = cart.findIndex(item => item.bookId === bookId);
    
    if (itemIndex !== -1) {
        if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            return removeFromCart(bookId);
        } else {
            // Update quantity
            cart[itemIndex].quantity = quantity;
            localStorage.setItem('cart', JSON.stringify(cart));
        }
    }
    
    return cart;
}

// Get cart total
function getCartTotal() {
    const cart = getCartItems();
    return cart.reduce((total, item) => total + (item.afterDiscountPrice * item.quantity), 0).toFixed(2);
}

// Get cart item count
function getCartItemCount() {
    const cart = getCartItems();
    return cart.reduce((count, item) => count + item.quantity, 0);
}

// Clear cart
function clearCart() {
    localStorage.setItem('cart', JSON.stringify([]));
    return [];
}

// Initialize cart when script loads
initCart();
