// Admin Settings Functionality
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

    // Set current username in the form
    const adminUsernameInput = document.getElementById('adminUsername');
    if (adminUsernameInput && adminUsername) {
        adminUsernameInput.value = adminUsername;
    }

    // Handle account settings form submission
    const accountSettingsForm = document.getElementById('accountSettingsForm');
    if (accountSettingsForm) {
        accountSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form values
            const newUsername = document.getElementById('adminUsername').value;
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Validate current password (in a real app, this would be checked against the database)
            if (currentPassword !== 'bookshop') {
                alert('Current password is incorrect!');
                return;
            }

            // Validate new password
            if (newPassword !== confirmPassword) {
                alert('New passwords do not match!');
                return;
            }

            // Update username and password in session storage
            sessionStorage.setItem('adminUsername', newUsername);

            // Update admin name in the header
            if (adminNameElement) {
                adminNameElement.textContent = newUsername;
            }

            // Show success message
            alert('Account settings updated successfully!');

            // Clear password fields
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
        });
    }
});
