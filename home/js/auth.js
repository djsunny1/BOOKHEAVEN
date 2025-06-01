// Simple user authentication using localStorage

// Function to handle user registration
async function registerUser(userData) {
  try {
    // Get existing users from users.json via API
    const response = await fetch('http://localhost:8002/api/users');
    const existingUsers = await response.json();

    // Check if user already exists
    const userExists = existingUsers.some(user => user.email === userData.email);
    if (userExists) {
      throw new Error('User with this email already exists');
    }

    // Generate a new user ID (format: U007, U008, etc.)
    const lastId = existingUsers.length > 0
      ? parseInt(existingUsers[existingUsers.length - 1].id.replace('U', ''))
      : 0;
    const newId = 'U' + String(lastId + 1).padStart(3, '0');

    // Format current date as DD/MM/YYYY
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const formattedDate = dd + '/' + mm + '/' + yyyy;

    // Create a new user object matching the users.json format
    const newUser = {
      id: newId,
      fullName: userData.name,
      email: userData.email,
      password: userData.password,
      accountCreated: formattedDate
    };

    // Add the new user to the array
    existingUsers.push(newUser);

    // Save the updated users array to users.json
    console.log('Saving user to API:', JSON.stringify(existingUsers));
    const saveResponse = await fetch('http://localhost:8002/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(existingUsers)
    });

    const saveResult = await saveResponse.json();
    console.log('API response:', saveResult);

    // Also save to localStorage for the current session
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const localUser = {
      id: newUser.id,
      name: newUser.fullName,
      email: newUser.email,
      password: newUser.password,
      createdAt: new Date().toISOString()
    };
    users.push(localUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Save current user info
    const currentUser = {
      id: newUser.id,
      name: newUser.fullName,
      email: newUser.email
    };

    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    return currentUser;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

// Function to handle user login
async function loginUser(credentials) {
  try {
    // Get users from users.json via API
    const response = await fetch('http://localhost:8002/api/users');
    const users = await response.json();

    // Find the user with matching email
    const user = users.find(user => user.email === credentials.email);

    // Check if user exists and password matches
    if (!user || user.password !== credentials.password) {
      throw new Error('Invalid email or password');
    }

    // Save current user info
    const currentUser = {
      id: user.id,
      name: user.fullName,
      email: user.email
    };

    // Also save to localStorage for the current session
    const localUsers = JSON.parse(localStorage.getItem('users')) || [];
    // Check if user already exists in localStorage
    const existingUserIndex = localUsers.findIndex(u => u.id === user.id);

    if (existingUserIndex === -1) {
      // Add user to localStorage if not already there
      localUsers.push({
        id: user.id,
        name: user.fullName,
        email: user.email,
        password: user.password,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('users', JSON.stringify(localUsers));
    }

    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    return currentUser;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Function to get current user
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser'));
}

// Function to logout user
function logoutUser() {
  localStorage.removeItem('currentUser');
  window.location.reload();
}

// Check if user is logged in
function isLoggedIn() {
  return localStorage.getItem('currentUser') !== null;
}

// Update UI based on authentication status
function updateAuthUI() {
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const userMenu = document.getElementById('userMenu');

  if (isLoggedIn()) {
    const user = getCurrentUser();

    if (loginBtn) loginBtn.style.display = 'none';
    if (signupBtn) signupBtn.style.display = 'none';

    // Create user menu if it doesn't exist
    if (!userMenu && document.querySelector('.header-icons')) {
      const userMenuHTML = `
        <div id="userMenu" class="user-menu">
          <div class="profile-icon" id="profileIcon">
            <i class="fas fa-user"></i>
          </div>
          <div class="dropdown-menu" id="dropdownMenu">
            <div class="dropdown-header">
              <span class="user-name">${user.name}</span>
              <span class="user-email">${user.email}</span>
            </div>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item" id="profileBtn"><i class="fas fa-user-circle"></i> Profile</a>
            <a href="#" class="dropdown-item" id="cartBtn"><i class="fas fa-shopping-cart"></i> Cart</a>
            <a href="#" class="dropdown-item" id="changePasswordBtn"><i class="fas fa-key"></i> Password</a>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</a>
          </div>
        </div>
      `;
      document.querySelector('.header-icons').innerHTML += userMenuHTML;

      // Add event listeners
      document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        logoutUser();
      });

      // Profile button
      document.getElementById('profileBtn').addEventListener('click', (e) => {
        e.preventDefault();
        showProfileModal();
      });

      // Cart button
      document.getElementById('cartBtn').addEventListener('click', (e) => {
        e.preventDefault();
        showCartModal();
      });

      // Change Password button
      document.getElementById('changePasswordBtn').addEventListener('click', (e) => {
        e.preventDefault();
        showChangePasswordModal();
      });

      // Toggle dropdown menu
      document.getElementById('profileIcon').addEventListener('click', () => {
        document.getElementById('dropdownMenu').classList.toggle('show');
      });

      // Close dropdown when clicking outside
      window.addEventListener('click', (e) => {
        if (!e.target.matches('.profile-icon') && !e.target.matches('.profile-icon *')) {
          const dropdown = document.getElementById('dropdownMenu');
          if (dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
          }
        }
      });
    }
  } else {
    if (loginBtn) loginBtn.style.display = 'block';
    if (signupBtn) signupBtn.style.display = 'block';
    if (userMenu) userMenu.style.display = 'none';
  }
}

// Initialize auth
function initAuth() {
  updateAuthUI();

  // Add event listeners to forms
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      try {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Show loading message
        document.getElementById('loginModal').innerHTML += '<div class="loading-overlay"><div class="loading-spinner"></div><p>Logging in...</p></div>';

        await loginUser({ email, password });

        // Check if there's a pending cart item
        const pendingCartItem = sessionStorage.getItem('pendingCartItem');

        if (pendingCartItem) {
          // Add the pending item to cart
          const item = JSON.parse(pendingCartItem);
          addToCart(item);

          // Clear the pending item
          sessionStorage.removeItem('pendingCartItem');

          // Show success message with cart info
          document.getElementById('successMessage').textContent = 'Login Successful!';
          document.getElementById('successDetails').textContent = `You are now logged in and "${item.name}" has been added to your cart.`;
        } else {
          // Show regular success message
          document.getElementById('successMessage').textContent = 'Login Successful!';
          document.getElementById('successDetails').textContent = 'You are now logged in.';
        }

        // Close login modal and show success modal
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('successModal').style.display = 'block';

        // Update UI
        updateAuthUI();

        // Reload page after success
        document.getElementById('successOkBtn').addEventListener('click', () => {
          window.location.reload();
        });
      } catch (error) {
        // Remove loading overlay if it exists
        const loadingOverlay = document.querySelector('.loading-overlay');
        if (loadingOverlay) {
          loadingOverlay.remove();
        }
        alert(error.message);
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      try {
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }

        // Show loading message
        document.getElementById('signupModal').innerHTML += '<div class="loading-overlay"><div class="loading-spinner"></div><p>Creating your account...</p></div>';

        await registerUser({ name, email, password });

        // Show success message
        document.getElementById('successMessage').textContent = 'Registration Successful!';
        document.getElementById('successDetails').textContent = 'Your account has been created and saved to the database.';

        // Close signup modal and show success modal
        document.getElementById('signupModal').style.display = 'none';
        document.getElementById('successModal').style.display = 'block';

        // Update UI
        updateAuthUI();

        // Reload page after success
        document.getElementById('successOkBtn').addEventListener('click', () => {
          window.location.reload();
        });
      } catch (error) {
        // Remove loading overlay if it exists
        const loadingOverlay = document.querySelector('.loading-overlay');
        if (loadingOverlay) {
          loadingOverlay.remove();
        }
        alert(error.message);
      }
    });
  }
}

// Show profile modal
function showProfileModal() {
  const user = getCurrentUser();
  if (!user) return;

  // Populate profile data
  document.getElementById('profileName').textContent = user.name;
  document.getElementById('profileEmail').textContent = user.email;

  // Get user creation date from localStorage
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const userDetails = users.find(u => u.id === user.id);

  if (userDetails && userDetails.createdAt) {
    const createdDate = new Date(userDetails.createdAt);
    document.getElementById('profileCreated').textContent = createdDate.toLocaleDateString();
  } else {
    document.getElementById('profileCreated').textContent = 'Not available';
  }

  // Show modal
  document.getElementById('profileModal').style.display = 'block';

  // Close button functionality
  document.getElementById('profileCloseBtn').addEventListener('click', () => {
    document.getElementById('profileModal').style.display = 'none';
  });
}

// Show cart modal
function showCartModal() {
  // These functions are defined in cart.js
  if (typeof getCartItems !== 'function' ||
      typeof updateCartItemQuantity !== 'function' ||
      typeof removeFromCart !== 'function' ||
      typeof clearCart !== 'function' ||
      typeof getCartTotal !== 'function') {
    console.error('Cart functions not available');
    return;
  }

  const cartItems = getCartItems();
  const cartItemsContainer = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');

  // Clear previous items
  cartItemsContainer.innerHTML = '';

  if (cartItems.length === 0) {
    // Show empty cart message
    cartItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
    cartTotal.textContent = 'PKR 0.00';
  } else {
    // Populate cart items
    cartItems.forEach(item => {
      const itemTotal = (item.afterDiscountPrice * item.quantity).toFixed(2);

      const itemHTML = `
        <div class="cart-item" data-id="${item.bookId}">
          <div class="cart-item-image">
            <img src="${item.pic}" alt="${item.name}">
          </div>
          <div class="cart-item-details">
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-author">by ${item.author}</div>
            <div class="cart-item-price">PKR ${item.afterDiscountPrice} × ${item.quantity} = PKR ${itemTotal}</div>
            <div class="cart-item-quantity">
              <button class="decrease-quantity">-</button>
              <span>${item.quantity}</span>
              <button class="increase-quantity">+</button>
              <button class="cart-item-remove" title="Remove item"><i class="fas fa-trash-alt"></i></button>
            </div>
          </div>
        </div>
      `;

      cartItemsContainer.innerHTML += itemHTML;
    });

    // Update total
    cartTotal.textContent = 'PKR ' + getCartTotal();

    // Add event listeners for quantity buttons
    document.querySelectorAll('.decrease-quantity').forEach(button => {
      button.addEventListener('click', function() {
        const cartItem = this.closest('.cart-item');
        const bookId = cartItem.dataset.id;
        const currentQuantity = parseInt(cartItem.querySelector('.cart-item-quantity span').textContent);

        if (currentQuantity > 1) {
          updateCartItemQuantity(bookId, currentQuantity - 1);
          // Refresh cart display
          showCartModal();
        }
      });
    });

    document.querySelectorAll('.increase-quantity').forEach(button => {
      button.addEventListener('click', function() {
        const cartItem = this.closest('.cart-item');
        const bookId = cartItem.dataset.id;
        const currentQuantity = parseInt(cartItem.querySelector('.cart-item-quantity span').textContent);

        updateCartItemQuantity(bookId, currentQuantity + 1);
        // Refresh cart display
        showCartModal();
      });
    });

    document.querySelectorAll('.cart-item-remove').forEach(button => {
      button.addEventListener('click', function() {
        const cartItem = this.closest('.cart-item');
        const bookId = cartItem.dataset.id;

        removeFromCart(bookId);
        // Refresh cart display
        showCartModal();
      });
    });
  }

  // Clear cart button
  document.getElementById('clearCartBtn').addEventListener('click', () => {
    clearCart();
    showCartModal();
  });

  // Checkout button
  document.getElementById('checkoutBtn').addEventListener('click', () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty');
    } else {
      // Show payment options modal
      showPaymentOptionsModal();
      // Hide cart modal
      document.getElementById('cartModal').style.display = 'none';
    }
  });

  // Show modal
  document.getElementById('cartModal').style.display = 'block';
}

// Show change password modal
function showChangePasswordModal() {
  // Show modal
  document.getElementById('changePasswordModal').style.display = 'block';

  // Form submission
  const form = document.getElementById('changePasswordForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    // Validate passwords
    if (newPassword !== confirmNewPassword) {
      alert('New passwords do not match');
      return;
    }

    // Get current user
    const user = getCurrentUser();
    if (!user) return;

    try {
      // Get users from users.json via API
      const response = await fetch('http://localhost:8002/api/users');
      const users = await response.json();
      const userIndex = users.findIndex(u => u.id === user.id);

      if (userIndex === -1) {
        alert('User not found');
        return;
      }

      // Verify current password
      if (users[userIndex].password !== currentPassword) {
        alert('Current password is incorrect');
        return;
      }

      // Update password in users.json
      users[userIndex].password = newPassword;

      // Save updated users to users.json via API
      console.log('Saving updated password to API:', JSON.stringify(users));
      const saveResponse = await fetch('http://localhost:8002/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(users)
      });

      const saveResult = await saveResponse.json();
      console.log('API response for password change:', saveResult);

      // Also update in localStorage
      const localUsers = JSON.parse(localStorage.getItem('users')) || [];
      const localUserIndex = localUsers.findIndex(u => u.id === user.id);

      if (localUserIndex !== -1) {
        localUsers[localUserIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(localUsers));
      }
    } catch (error) {
      console.error('Error updating password:', error);
      alert('There was an error updating your password. Please try again.');
      return;
    }

    // Show success message
    document.getElementById('successMessage').textContent = 'Password Updated!';
    document.getElementById('successDetails').textContent = 'Your password has been successfully changed.';

    // Close change password modal and show success modal
    document.getElementById('changePasswordModal').style.display = 'none';
    document.getElementById('successModal').style.display = 'block';

    // Clear form
    form.reset();
  });
}

// Add event listeners to close buttons for all modals
document.addEventListener('DOMContentLoaded', () => {
  initAuth();

  // Add event listeners to all close buttons
  document.querySelectorAll('.close-modal').forEach(button => {
    button.addEventListener('click', function() {
      const modal = this.closest('.modal');
      modal.style.display = 'none';
    });
  });

  // Close modals when clicking outside
  window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
      event.target.style.display = 'none';
    }
  });
});
