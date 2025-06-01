// Admin Payment Options Functionality
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

    // Payment option modal elements
    const paymentOptionModal = document.getElementById('paymentOptionModal');
    const closePaymentOptionModal = document.getElementById('closePaymentOptionModal');
    const addPaymentOptionBtn = document.getElementById('addPaymentOptionBtn');
    const paymentOptionForm = document.getElementById('paymentOptionForm');
    const cancelPaymentOption = document.getElementById('cancelPaymentOption');

    // Delete confirmation modal elements
    const deleteConfirmationModal = document.getElementById('deleteConfirmationModal');
    const closeDeleteConfirmationModal = document.getElementById('closeDeleteConfirmationModal');
    const cancelDelete = document.getElementById('cancelDelete');
    const confirmDelete = document.getElementById('confirmDelete');

    let paymentOptionToDelete = null;

    // Open payment option modal for adding new payment option
    if (addPaymentOptionBtn) {
        addPaymentOptionBtn.addEventListener('click', function() {
            // Reset form
            paymentOptionForm.reset();
            document.getElementById('paymentOptionId').value = '';
            document.getElementById('paymentOptionModalTitle').textContent = 'Add New Payment Option';

            // Show modal
            paymentOptionModal.style.display = 'block';
        });
    }

    // Close payment option modal
    if (closePaymentOptionModal) {
        closePaymentOptionModal.addEventListener('click', function() {
            paymentOptionModal.style.display = 'none';
        });
    }

    // Cancel button in payment option modal
    if (cancelPaymentOption) {
        cancelPaymentOption.addEventListener('click', function() {
            paymentOptionModal.style.display = 'none';
        });
    }

    // Close delete confirmation modal
    if (closeDeleteConfirmationModal) {
        closeDeleteConfirmationModal.addEventListener('click', function() {
            deleteConfirmationModal.style.display = 'none';
        });
    }

    // Cancel button in delete confirmation modal
    if (cancelDelete) {
        cancelDelete.addEventListener('click', function() {
            deleteConfirmationModal.style.display = 'none';
        });
    }

    // Confirm delete button
    if (confirmDelete) {
        confirmDelete.addEventListener('click', async function() {
            if (paymentOptionToDelete) {
                try {
                    // Delete the payment option from the JSON file
                    const success = await deletePaymentOption(paymentOptionToDelete);

                    if (success) {
                        // Show success message
                        alert('Payment option deleted successfully');

                        // Remove from table
                        const row = document.querySelector(`tr[data-id="${paymentOptionToDelete}"]`);
                        if (row) {
                            row.remove();
                        }
                    } else {
                        alert('Failed to delete payment option');
                    }

                    // Close modal
                    deleteConfirmationModal.style.display = 'none';

                    // Reset paymentOptionToDelete
                    paymentOptionToDelete = null;
                } catch (error) {
                    console.error('Error deleting payment option:', error);
                    alert('An error occurred while deleting the payment option');
                }
            }
        });
    }

    // Handle form submission
    if (paymentOptionForm) {
        paymentOptionForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Get form values
            const id = document.getElementById('paymentOptionId').value;
            const name = document.getElementById('paymentOptionName').value;
            const description = document.getElementById('paymentOptionDescription').value;
            const icon = document.getElementById('paymentOptionIcon').value;
            const accountNumber = document.getElementById('paymentOptionAccountNumber').value;
            const accountName = document.getElementById('paymentOptionAccountName').value;

            // Create payment option object
            const paymentOption = {
                id: id || generatePaymentOptionId(),
                name,
                description,
                icon,
                accountNumber,
                accountName
            };

            try {
                if (id) {
                    // Update existing payment option
                    updatePaymentOptionInTable(paymentOption);
                    alert('Payment option updated successfully');
                } else {
                    // Add new payment option
                    addPaymentOptionToTable(paymentOption);
                    alert('Payment option added successfully');
                }

                // Close modal
                paymentOptionModal.style.display = 'none';
            } catch (error) {
                console.error('Error saving payment option:', error);
                alert('An error occurred while saving the payment option');
            }
        });
    }

    // Load payment options
    loadPaymentOptions();

    // Add event listeners for action buttons
    addActionButtonListeners();
});

// Function to load payment options
async function loadPaymentOptions() {
    try {
        const response = await fetch('/backend/api/payment-options.php');
        if (!response.ok) {
            throw new Error('Failed to load payment options');
        }
        
        const paymentOptions = await response.json();
        renderPaymentOptions(paymentOptions);
    } catch (error) {
        console.error('Error loading payment options:', error);
        alert('Error loading payment options: ' + error.message);
    }
}

// Function to render payment options in the table
function renderPaymentOptions(paymentOptions) {
    const tbody = document.querySelector('#paymentOptionsTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    paymentOptions.forEach(option => {
        const iconDisplay = option.icon ? 
            `<img src="${option.icon}" alt="${option.name}" style="height: 40px; max-width: 100px;">` : 
            '<span class="text-muted">No icon</span>';
        
        const row = document.createElement('tr');
        row.setAttribute('data-id', option.id);
        row.innerHTML = `
            <td>${option.id}</td>
            <td>${option.name}</td>
            <td>${iconDisplay}</td>
            <td>${option.description}</td>
            <td>${option.accountNumber}</td>
            <td>${option.accountName}</td>
            <td>
                <div class="admin-table-actions-cell">
                    <div class="admin-action-btn view" data-id="${option.id}"><i class="fas fa-eye"></i></div>
                    <div class="admin-action-btn edit" data-id="${option.id}"><i class="fas fa-edit"></i></div>
                    <div class="admin-action-btn delete" data-id="${option.id}"><i class="fas fa-trash"></i></div>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });

    // Add event listeners for action buttons
    addActionButtonListeners();
}

// Function to add event listeners for action buttons
function addActionButtonListeners() {
    // View buttons
    const viewButtons = document.querySelectorAll('.admin-action-btn.view');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            viewPaymentOption(id);
        });
    });

    // Edit buttons
    const editButtons = document.querySelectorAll('.admin-action-btn.edit');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            editPaymentOption(id);
        });
    });

    // Delete buttons
    const deleteButtons = document.querySelectorAll('.admin-action-btn.delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            showDeleteConfirmation(id);
        });
    });
}

// Function to view payment option details
async function viewPaymentOption(id) {
    try {
        const response = await fetch('/backend/database/paymentoptions.json');
        const paymentOptions = await response.json();

        const paymentOption = paymentOptions.find(option => option.id === id);

        if (paymentOption) {
            // In a real application, you would show a modal with the payment option details
            alert(`
                Payment Option Details:
                ID: ${paymentOption.id}
                Name: ${paymentOption.name}
                Description: ${paymentOption.description}
                Account Number: ${paymentOption.accountNumber}
                Account Name: ${paymentOption.accountName}
                Icon URL: ${paymentOption.icon}
            `);
        }
    } catch (error) {
        console.error('Error viewing payment option:', error);
    }
}

// Function to edit payment option
async function editPaymentOption(id) {
    try {
        const response = await fetch('/backend/database/paymentoptions.json');
        const paymentOptions = await response.json();

        const paymentOption = paymentOptions.find(option => option.id === id);

        if (paymentOption) {
            // Set form values
            document.getElementById('paymentOptionId').value = paymentOption.id;
            document.getElementById('paymentOptionName').value = paymentOption.name;
            document.getElementById('paymentOptionDescription').value = paymentOption.description;
            document.getElementById('paymentOptionIcon').value = paymentOption.icon;
            document.getElementById('paymentOptionAccountNumber').value = paymentOption.accountNumber;
            document.getElementById('paymentOptionAccountName').value = paymentOption.accountName;

            // Update modal title
            document.getElementById('paymentOptionModalTitle').textContent = 'Edit Payment Option';

            // Show modal
            document.getElementById('paymentOptionModal').style.display = 'block';
        }
    } catch (error) {
        console.error('Error editing payment option:', error);
    }
}

// Function to show delete confirmation
function showDeleteConfirmation(id) {
    paymentOptionToDelete = id;
    document.getElementById('deleteConfirmationModal').style.display = 'block';
}

// Function to generate a new payment option ID
function generatePaymentOptionId() {
    // Get all existing payment options
    const rows = document.querySelectorAll('#paymentOptionsTable tbody tr');

    // Find the highest ID number
    let highestNum = 0;
    rows.forEach(row => {
        const id = row.getAttribute('data-id');
        if (id && id.startsWith('P')) {
            const num = parseInt(id.substring(1));
            if (!isNaN(num) && num > highestNum) {
                highestNum = num;
            }
        }
    });

    // Generate new ID
    const newNum = highestNum + 1;
    return `P${newNum.toString().padStart(3, '0')}`;
}

// Function to save payment option to JSON file
async function savePaymentOption(paymentOption, isNew = false) {
    try {
        const response = await fetch('/backend/api/payment-options.php', {
            method: isNew ? 'POST' : 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentOption)
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || 'Failed to save payment option');
        }

        // Reload the payment options immediately after save
        await loadPaymentOptions();
        return true;
    } catch (error) {
        console.error('Error saving payment option:', error);
        alert('Error saving payment option: ' + error.message);
        return false;
    }
}

// Function to delete payment option from JSON file
async function deletePaymentOption(id) {
    try {
        // Use the PHP API to delete the payment option
        const response = await fetch('/backend/api/update-payment-options.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'delete',
                id: id
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to delete payment option');
        }

        // Reload the payment options
        await loadPaymentOptions();

        return true;
    } catch (error) {
        console.error('Error deleting payment option:', error);
        return false;
    }
}

// Function to add a new payment option to the table
function addPaymentOptionToTable(paymentOption) {
    const tableBody = document.querySelector('#paymentOptionsTable tbody');
    if (tableBody) {
        const row = document.createElement('tr');
        row.setAttribute('data-id', paymentOption.id);

        // Create icon display with image
        const iconDisplay = paymentOption.icon ?
            `<img src="${paymentOption.icon}" alt="${paymentOption.name}" style="height: 40px; max-width: 100px;">` :
            '<span class="text-muted">No icon</span>';

        row.innerHTML = `
            <td>${paymentOption.id}</td>
            <td>${paymentOption.name}</td>
            <td>${iconDisplay}</td>
            <td>${paymentOption.description}</td>
            <td>${paymentOption.accountNumber}</td>
            <td>${paymentOption.accountName}</td>
            <td>
                <div class="admin-table-actions-cell">
                    <div class="admin-action-btn view" data-id="${paymentOption.id}"><i class="fas fa-eye"></i></div>
                    <div class="admin-action-btn edit" data-id="${paymentOption.id}"><i class="fas fa-edit"></i></div>
                    <div class="admin-action-btn delete" data-id="${paymentOption.id}"><i class="fas fa-trash"></i></div>
                </div>
            </td>
        `;

        tableBody.appendChild(row);

        // Add event listeners for action buttons
        addActionButtonListeners();

        // Save to JSON file
        savePaymentOption(paymentOption, true);
    }
}

// Function to update an existing payment option in the table
function updatePaymentOptionInTable(paymentOption) {
    const row = document.querySelector(`tr[data-id="${paymentOption.id}"]`);
    if (row) {
        // Create icon display with image
        const iconDisplay = paymentOption.icon ?
            `<img src="${paymentOption.icon}" alt="${paymentOption.name}" style="height: 40px; max-width: 100px;">` :
            '<span class="text-muted">No icon</span>';

        row.innerHTML = `
            <td>${paymentOption.id}</td>
            <td>${paymentOption.name}</td>
            <td>${iconDisplay}</td>
            <td>${paymentOption.description}</td>
            <td>${paymentOption.accountNumber}</td>
            <td>${paymentOption.accountName}</td>
            <td>
                <div class="admin-table-actions-cell">
                    <div class="admin-action-btn view" data-id="${paymentOption.id}"><i class="fas fa-eye"></i></div>
                    <div class="admin-action-btn edit" data-id="${paymentOption.id}"><i class="fas fa-edit"></i></div>
                    <div class="admin-action-btn delete" data-id="${paymentOption.id}"><i class="fas fa-trash"></i></div>
                </div>
            </td>
        `;

        // Add event listeners for action buttons
        addActionButtonListeners();

        // Save to JSON file
        savePaymentOption(paymentOption, false);
    }
}
