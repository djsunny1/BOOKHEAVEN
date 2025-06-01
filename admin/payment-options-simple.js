// Simple Payment Options Management
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
    if (adminInitialsElement) {
        const username = sessionStorage.getItem('adminUsername') || 'bookshop';
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
            sessionStorage.removeItem('adminLoggedIn');
            sessionStorage.removeItem('adminUsername');
            window.location.href = 'index.html';
        });
    }

    // Global variables
    let paymentOptions = [];
    let paymentOptionToDelete = null;

    // DOM elements
    const paymentOptionModal = document.getElementById('paymentOptionModal');
    const closePaymentOptionModal = document.getElementById('closePaymentOptionModal');
    const addPaymentOptionBtn = document.getElementById('addPaymentOptionBtn');
    const paymentOptionForm = document.getElementById('paymentOptionForm');
    const cancelPaymentOption = document.getElementById('cancelPaymentOption');
    const deleteConfirmationModal = document.getElementById('deleteConfirmationModal');
    const closeDeleteConfirmationModal = document.getElementById('closeDeleteConfirmationModal');
    const cancelDelete = document.getElementById('cancelDelete');
    const confirmDelete = document.getElementById('confirmDelete');

    // Load payment options
    loadPaymentOptions();

    // Event listeners
    if (addPaymentOptionBtn) {
        addPaymentOptionBtn.addEventListener('click', function() {
            resetForm();
            paymentOptionModal.style.display = 'block';
        });
    }

    if (closePaymentOptionModal) {
        closePaymentOptionModal.addEventListener('click', function() {
            paymentOptionModal.style.display = 'none';
        });
    }

    if (cancelPaymentOption) {
        cancelPaymentOption.addEventListener('click', function() {
            paymentOptionModal.style.display = 'none';
        });
    }

    if (closeDeleteConfirmationModal) {
        closeDeleteConfirmationModal.addEventListener('click', function() {
            deleteConfirmationModal.style.display = 'none';
        });
    }

    if (cancelDelete) {
        cancelDelete.addEventListener('click', function() {
            deleteConfirmationModal.style.display = 'none';
        });
    }

    if (confirmDelete) {
        confirmDelete.addEventListener('click', function() {
            if (paymentOptionToDelete) {
                deletePaymentOption(paymentOptionToDelete);
                deleteConfirmationModal.style.display = 'none';
            }
        });
    }

    if (paymentOptionForm) {
        paymentOptionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            savePaymentOption();
        });
    }

    // Functions
    function resetForm() {
        paymentOptionForm.reset();
        document.getElementById('paymentOptionId').value = '';
        document.getElementById('paymentOptionModalTitle').textContent = 'Add New Payment Option';
    }

    async function loadPaymentOptions() {
        try {
            // Try to load from the Node.js server first
            try {
                const response = await fetch('http://localhost:8002/api/payment-options');
                if (response.ok) {
                    paymentOptions = await response.json();
                    renderPaymentOptions();
                    return;
                }
            } catch (serverError) {
                console.warn('Could not connect to Node.js server, falling back to direct file access:', serverError);
            }

            // Fallback to direct file access
            const response = await fetch('/backend/database/paymentoptions.json');
            if (!response.ok) {
                throw new Error('Failed to load payment options');
            }

            paymentOptions = await response.json();
            renderPaymentOptions();
        } catch (error) {
            console.error('Error loading payment options:', error);
            alert('Failed to load payment options');
        }
    }

    function renderPaymentOptions() {
        const tableBody = document.querySelector('#paymentOptionsTable tbody');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        paymentOptions.forEach(option => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', option.id);

            const iconDisplay = option.icon ?
                `<img src="${option.icon}" alt="${option.name}" style="height: 40px; max-width: 100px;">` :
                '<span class="text-muted">No icon</span>';

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

            tableBody.appendChild(row);
        });

        addActionButtonListeners();
    }

    function addActionButtonListeners() {
        // View buttons
        document.querySelectorAll('.admin-action-btn.view').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                viewPaymentOption(id);
            });
        });

        // Edit buttons
        document.querySelectorAll('.admin-action-btn.edit').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                editPaymentOption(id);
            });
        });

        // Delete buttons
        document.querySelectorAll('.admin-action-btn.delete').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                showDeleteConfirmation(id);
            });
        });
    }

    function viewPaymentOption(id) {
        const option = paymentOptions.find(opt => opt.id === id);
        if (option) {
            alert(`
                Payment Option Details:
                ID: ${option.id}
                Name: ${option.name}
                Description: ${option.description}
                Account Number: ${option.accountNumber}
                Account Name: ${option.accountName}
                Icon URL: ${option.icon}
            `);
        }
    }

    function editPaymentOption(id) {
        const option = paymentOptions.find(opt => opt.id === id);
        if (option) {
            document.getElementById('paymentOptionId').value = option.id;
            document.getElementById('paymentOptionName').value = option.name;
            document.getElementById('paymentOptionDescription').value = option.description;
            document.getElementById('paymentOptionIcon').value = option.icon;
            document.getElementById('paymentOptionAccountNumber').value = option.accountNumber;
            document.getElementById('paymentOptionAccountName').value = option.accountName;

            document.getElementById('paymentOptionModalTitle').textContent = 'Edit Payment Option';
            paymentOptionModal.style.display = 'block';
        }
    }

    function showDeleteConfirmation(id) {
        paymentOptionToDelete = id;
        deleteConfirmationModal.style.display = 'block';
    }

    function deletePaymentOption(id) {
        const index = paymentOptions.findIndex(opt => opt.id === id);
        if (index !== -1) {
            paymentOptions.splice(index, 1);
            savePaymentOptionsToFile();
            renderPaymentOptions();
            alert('Payment option deleted successfully');
        }
    }

    function savePaymentOption() {
        const id = document.getElementById('paymentOptionId').value;
        const name = document.getElementById('paymentOptionName').value;
        const description = document.getElementById('paymentOptionDescription').value;
        const icon = document.getElementById('paymentOptionIcon').value;
        const accountNumber = document.getElementById('paymentOptionAccountNumber').value;
        const accountName = document.getElementById('paymentOptionAccountName').value;

        const paymentOption = {
            id: id || generatePaymentOptionId(),
            name,
            description,
            icon,
            accountNumber,
            accountName
        };

        if (id) {
            // Update existing option
            const index = paymentOptions.findIndex(opt => opt.id === id);
            if (index !== -1) {
                paymentOptions[index] = paymentOption;
            } else {
                paymentOptions.push(paymentOption);
            }
            alert('Payment option updated successfully');
        } else {
            // Add new option
            paymentOptions.push(paymentOption);
            alert('Payment option added successfully');
        }

        savePaymentOptionsToFile();
        renderPaymentOptions();
        paymentOptionModal.style.display = 'none';
    }

    function generatePaymentOptionId() {
        let highestNum = 0;
        paymentOptions.forEach(option => {
            if (option.id && option.id.startsWith('P')) {
                const num = parseInt(option.id.substring(1));
                if (!isNaN(num) && num > highestNum) {
                    highestNum = num;
                }
            }
        });

        const newNum = highestNum + 1;
        return `P${newNum.toString().padStart(3, '0')}`;
    }

    async function savePaymentOptionsToFile() {
        try {
            // Try to save using the Node.js server
            try {
                const response = await fetch('http://localhost:8002/api/payment-options', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(paymentOptions)
                });

                if (!response.ok) {
                    throw new Error('Server returned error: ' + response.status);
                }

                const result = await response.json();
                console.log('Save result:', result);

                if (!result.success) {
                    throw new Error(result.message || 'Failed to save payment options');
                }

                return;
            } catch (serverError) {
                console.warn('Could not save using Node.js server, falling back to direct file access:', serverError);
            }

            // Fallback to direct file access (this will likely fail in a browser environment due to security restrictions)
            alert('Warning: The Node.js server is not running. Changes may not be saved permanently.');

            // We'll still update the UI to show the changes, even though they might not be saved to the file
            console.log('UI updated with new payment options, but file may not be updated');
        } catch (error) {
            console.error('Error saving payment options:', error);
            alert('Failed to save payment options to file. Please try again.');
        }
    }
});
