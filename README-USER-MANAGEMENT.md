# BookHaven User Management

This document explains how to use the user management system in the BookHaven admin dashboard.

## Prerequisites

- Node.js installed on your system
- Modern web browser (Chrome, Firefox, Edge, etc.)

## Starting the Server

Before you can manage users, you need to start the Node.js server that handles the user management API:

1. Double-click on the `start-server.bat` file in the root directory of the project
2. A command prompt window will open and display "Server running at http://localhost:8002/"
3. Keep this window open while you're managing users

Alternatively, you can start the server manually by opening a command prompt in the project directory and running:

```
node backend/server.js
```

## Managing Users

1. Log in to the admin dashboard using your admin credentials (username: bookshop, password: bookshop)
2. Navigate to the "Users" section in the sidebar
3. You should see a list of all users
4. The server status indicator at the top right will show if the server is running

### Adding a New User

1. Click the "Add New User" button
2. Fill in the required fields:
   - Full Name: The user's full name
   - Email: The user's email address
   - Password: The user's password
   - Account Created: The date when the account was created (defaults to today)
3. Click "Save User" to add the new user

### Editing a User

1. Click the edit (pencil) icon next to the user you want to edit
2. Update the fields as needed
3. Leave the password field blank to keep the current password
4. Click "Save User" to update the user

### Deleting a User

1. Click the delete (trash) icon next to the user you want to delete
2. Confirm the deletion in the confirmation dialog
3. The user will be removed from the list

## How It Works

The users are stored in the `backend/database/users.json` file. When you add, edit, or delete a user through the admin dashboard, the changes are sent to the Node.js server, which updates the JSON file in real-time.

## Troubleshooting

If you encounter issues with managing users:

1. Make sure the Node.js server is running (check the server status indicator)
2. If the server is not running, start it using the instructions above
3. Check the browser console for any error messages
4. Try refreshing the page

If you continue to experience issues, please contact the system administrator.
