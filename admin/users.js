// Admin Users Management Functionality
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

    // User modal elements
    const userModal = document.getElementById('userModal');
    const closeUserModal = document.getElementById('closeUserModal');
    const addUserBtn = document.getElementById('addUserBtn');
    const cancelUserBtn = document.getElementById('cancelUserBtn');
    const userForm = document.getElementById('userForm');
    const userModalTitle = document.getElementById('userModalTitle');

    // Open modal when Add New User button is clicked
    if (addUserBtn) {
        addUserBtn.addEventListener('click', function() {
            userModalTitle.textContent = 'Add New User';
            userForm.reset();
            document.getElementById('userId').value = '';
            document.getElementById('userPassword').required = true;
            userModal.style.display = 'block';
        });
    }

    // Close modal when X button is clicked
    if (closeUserModal) {
        closeUserModal.addEventListener('click', function() {
            userModal.style.display = 'none';
        });
    }

    // Close modal when Cancel button is clicked
    if (cancelUserBtn) {
        cancelUserBtn.addEventListener('click', function() {
            userModal.style.display = 'none';
        });
    }

    // Close modal when clicking outside the modal
    window.addEventListener('click', function(event) {
        if (event.target === userModal) {
            userModal.style.display = 'none';
        }
    });

    // Handle user form submission
    if (userForm) {
        userForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Get form values
            const userId = document.getElementById('userId').value;
            const name = document.getElementById('userName').value;
            const email = document.getElementById('userEmail').value;
            const password = document.getElementById('userPassword').value;

            // Get current date for new users
            const today = new Date();

            // Format date for display (DD/MM/YYYY)
            const formattedDate = `${(today.getDate()).toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

            // Get account created date from form or use current date
            let accountCreated;
            const dateInput = document.getElementById('userCreated').value;

            if (dateInput) {
                // Convert from YYYY-MM-DD (HTML date input) to DD/MM/YYYY (our display format)
                const dateParts = dateInput.split('-');
                if (dateParts.length === 3) {
                    accountCreated = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
                } else {
                    accountCreated = formattedDate;
                }
            } else {
                accountCreated = formattedDate;
            }

            try {
                // Get current users
                const users = window.allUsers || [];
                let updatedUsers = [...users];

                if (userId) {
                    // Edit existing user
                    const index = users.findIndex(u => u.id === userId);
                    if (index !== -1) {
                        // Update user data
                        const updatedUser = {
                            ...users[index],
                            fullName: name,
                            email: email,
                            accountCreated: accountCreated
                        };

                        // Only update password if provided
                        if (password) {
                            updatedUser.password = password;
                        }

                        updatedUsers[index] = updatedUser;
                    }

                    // Save updated users
                    await saveUsersToServer(updatedUsers);

                    alert(`User "${name}" updated successfully!`);
                } else {
                    // Generate new user ID
                    let highestId = 0;
                    users.forEach(user => {
                        if (user.id && user.id.startsWith('U')) {
                            const idNum = parseInt(user.id.substring(1));
                            if (!isNaN(idNum) && idNum > highestId) {
                                highestId = idNum;
                            }
                        }
                    });

                    const newId = 'U' + (highestId + 1).toString().padStart(3, '0');

                    // Create new user object
                    const newUser = {
                        id: newId,
                        fullName: name,
                        email: email,
                        password: password,
                        accountCreated: accountCreated
                    };

                    // Add to users array
                    updatedUsers.push(newUser);

                    // Save updated users
                    await saveUsersToServer(updatedUsers);

                    alert(`User "${name}" added successfully with ID: ${newId}!`);
                }

                // Close modal
                userModal.style.display = 'none';

                // Refresh users table
                loadUsers();
            } catch (error) {
                console.error('Error saving user:', error);
                alert('An error occurred while saving the user. Please try again.');
            }
        });
    }

    // Function to save users to server
    async function saveUsersToServer(users) {
        try {
            // Try to save using the Node.js server
            try {
                const response = await fetch('http://localhost:8002/api/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(users)
                });

                if (!response.ok) {
                    throw new Error('Server returned error: ' + response.status);
                }

                const result = await response.json();
                console.log('Save result:', result);

                if (!result.success) {
                    throw new Error(result.message || 'Failed to save users');
                }

                return true;
            } catch (serverError) {
                console.warn('Could not save using Node.js server:', serverError);
                alert('Warning: The Node.js server is not running. Changes may not be saved permanently.');
                return false;
            }
        } catch (error) {
            console.error('Error saving users:', error);
            throw error;
        }
    }

    // Load users data
    loadUsers();
});

// Function to load users data
async function loadUsers() {
    const usersTableBody = document.getElementById('usersTableBody');

    try {
        // Try to load from the Node.js server first
        let users = [];
        try {
            const response = await fetch('http://localhost:8002/api/users');
            if (response.ok) {
                users = await response.json();
            } else {
                throw new Error('Server returned error: ' + response.status);
            }
        } catch (serverError) {
            console.warn('Could not connect to Node.js server, falling back to direct file access:', serverError);
            // Fallback to direct file access
            const response = await fetch('/backend/database/users.json');
            if (!response.ok) {
                throw new Error('Failed to load users');
            }
            users = await response.json();
        }

        // Store users in global variable for later use
        window.allUsers = users;

        // Clear table body
        usersTableBody.innerHTML = '';

        // Add users to table
        users.forEach(user => {
            const row = document.createElement('tr');

            // Set status class for existing users with status field
            let statusClass = 'completed'; // Default to active/completed
            let status = 'Active'; // Default status

            if (user.status) {
                status = user.status;
                if (user.status === 'Active') {
                    statusClass = 'completed';
                } else if (user.status === 'Inactive') {
                    statusClass = 'pending';
                } else if (user.status === 'Suspended') {
                    statusClass = 'cancelled';
                }
            }

            // Format the user ID
            const userId = user.id.toString().padStart(3, '0');

            // Use fullName if available, otherwise use name
            const displayName = user.fullName || user.name || 'Unknown';

            // Use role if available, otherwise set as Customer
            const role = user.role || 'Customer';

            // Use joinedDate if available, otherwise use current date
            const joinedDate = user.joinedDate || new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            // Use accountCreated if available, otherwise use joinedDate
            const createdDate = user.accountCreated || joinedDate;

            row.innerHTML = `
                <td>${user.id}</td>
                <td>${displayName}</td>
                <td>${user.email}</td>
                <td>${createdDate}</td>
                <td>
                    <div class="admin-table-actions-cell">
                        <div class="admin-action-btn view" data-id="${user.id}"><i class="fas fa-eye"></i></div>
                        <div class="admin-action-btn edit" data-id="${user.id}"><i class="fas fa-edit"></i></div>
                        <div class="admin-action-btn delete" data-id="${user.id}"><i class="fas fa-trash"></i></div>
                    </div>
                </td>
            `;

            usersTableBody.appendChild(row);
        });

        // Add event listeners for action buttons
        addActionButtonListeners(users);
    } catch (error) {
        console.error('Error loading users:', error);
        usersTableBody.innerHTML = '<tr><td colspan="7">Error loading users. Please try again later.</td></tr>';
    }
}

// Function to add event listeners for action buttons
function addActionButtonListeners(users) {
    // View buttons
    const viewButtons = document.querySelectorAll('.admin-action-btn.view');
    const viewUserModal = document.getElementById('viewUserModal');
    const closeViewUserModal = document.getElementById('closeViewUserModal');
    const closeViewUserBtn = document.getElementById('closeViewUserBtn');
    const editUserFromViewBtn = document.getElementById('editUserFromViewBtn');

    // Close view modal when X button is clicked
    if (closeViewUserModal) {
        closeViewUserModal.addEventListener('click', function() {
            viewUserModal.style.display = 'none';
        });
    }

    // Close view modal when Close button is clicked
    if (closeViewUserBtn) {
        closeViewUserBtn.addEventListener('click', function() {
            viewUserModal.style.display = 'none';
        });
    }

    // Close view modal when clicking outside the modal
    window.addEventListener('click', function(event) {
        if (event.target === viewUserModal) {
            viewUserModal.style.display = 'none';
        }
    });

    // Handle edit button in view modal
    if (editUserFromViewBtn) {
        editUserFromViewBtn.addEventListener('click', function() {
            // Get user ID from the view modal
            const userId = document.getElementById('viewUserId').textContent;
            const user = users.find(u => u.id.toString() === userId.toString());

            if (user) {
                // Close view modal
                viewUserModal.style.display = 'none';

                // Set form values for edit
                document.getElementById('userId').value = user.id;
                document.getElementById('userName').value = user.fullName || user.name || '';
                document.getElementById('userEmail').value = user.email || '';
                document.getElementById('userPassword').value = '';
                document.getElementById('userPassword').required = false;

                // Set account created date if available
                const userCreated = document.getElementById('userCreated');
                if (userCreated && user.accountCreated) {
                    // Convert from DD/MM/YYYY to YYYY-MM-DD for the date input
                    const dateParts = user.accountCreated.split('/');
                    if (dateParts.length === 3) {
                        // Format as YYYY-MM-DD for HTML date input
                        userCreated.value = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                    } else {
                        userCreated.value = '';
                    }
                } else if (userCreated) {
                    userCreated.value = '';
                }

                // Set modal title
                document.getElementById('userModalTitle').textContent = 'Edit User';

                // Show edit modal
                userModal.style.display = 'block';
            }
        });
    }

    // View button click handler
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            const user = users.find(u => u.id.toString() === userId.toString());

            if (user) {
                const displayName = user.fullName || user.name || 'Unknown';
                const createdDate = user.accountCreated || '';

                // Set user details in view modal
                document.getElementById('viewUserId').textContent = user.id;
                document.getElementById('viewUserName').textContent = displayName;
                document.getElementById('viewUserEmail').textContent = user.email;
                document.getElementById('viewUserCreated').textContent = createdDate;

                // Show view modal
                viewUserModal.style.display = 'block';
            }
        });
    });

    // Edit buttons
    const editButtons = document.querySelectorAll('.admin-action-btn.edit');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            const user = users.find(u => u.id.toString() === userId.toString());

            if (user) {
                // Set form values
                document.getElementById('userId').value = user.id;
                document.getElementById('userName').value = user.fullName || user.name || '';
                document.getElementById('userEmail').value = user.email || '';
                document.getElementById('userPassword').value = '';
                document.getElementById('userPassword').required = false;

                // Set account created date if available
                const userCreated = document.getElementById('userCreated');
                if (userCreated && user.accountCreated) {
                    // Convert from DD/MM/YYYY to YYYY-MM-DD for the date input
                    const dateParts = user.accountCreated.split('/');
                    if (dateParts.length === 3) {
                        // Format as YYYY-MM-DD for HTML date input
                        userCreated.value = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                    } else {
                        userCreated.value = '';
                    }
                } else if (userCreated) {
                    userCreated.value = '';
                }

                // Set modal title
                document.getElementById('userModalTitle').textContent = 'Edit User';

                // Show modal
                document.getElementById('userModal').style.display = 'block';
            }
        });
    });

    // Delete buttons
    const deleteButtons = document.querySelectorAll('.admin-action-btn.delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');

            // Find the user in the global users array
            const user = window.allUsers.find(u => u.id === userId);

            if (user) {
                const displayName = user.fullName || user.name || 'Unknown';

                // Confirm deletion
                if (confirm(`Are you sure you want to delete user "${displayName}"?`)) {
                    // Debug logs
                    console.log('Deleting user with ID:', userId);

                    // Use the direct delete endpoint
                    fetch(`http://localhost:8002/api/users/delete/${userId}`, {
                        method: 'GET'
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Server returned error: ' + response.status);
                        }
                        return response.json();
                    })
                    .then(result => {
                        if (result.success) {
                            // Show success message
                            alert(`User "${displayName}" deleted successfully!`);

                            // Refresh the users table
                            loadUsers();
                        } else {
                            throw new Error(result.message || 'Failed to delete user');
                        }
                    })
                    .catch(error => {
                        console.error('Error deleting user:', error);
                        alert('An error occurred while deleting the user. Please try again.');
                    });
                }
            } else {
                console.error('User not found with ID:', userId);
                alert('User not found. Please refresh the page and try again.');
            }
        });
    });
}
