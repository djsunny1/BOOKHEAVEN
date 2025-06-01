# BookHaven Payment Options Management

This document explains how to use the payment options management system in the BookHaven admin dashboard.

## Prerequisites

- Node.js installed on your system
- Modern web browser (Chrome, Firefox, Edge, etc.)

## Starting the Server

Before you can manage payment options, you need to start the Node.js server that handles the payment options API:

1. Double-click on the `start-server.bat` file in the root directory of the project
2. A command prompt window will open and display "Server running at http://localhost:8002/"
3. Keep this window open while you're managing payment options

Alternatively, you can start the server manually by opening a command prompt in the project directory and running:

```
node backend/server.js
```

## Managing Payment Options

1. Log in to the admin dashboard using your admin credentials (username: bookshop, password: bookshop)
2. Navigate to the "Payment Options" section in the sidebar
3. You should see a list of available payment options
4. The server status indicator at the top right will show if the server is running

### Adding a New Payment Option

1. Click the "Add New Payment Option" button
2. Fill in the required fields:
   - Name: The name of the payment method
   - Description: A brief description of the payment method
   - Icon URL: A URL to an image representing the payment method
   - Account Number: The account number for the payment method
   - Account Name: The account name for the payment method
3. Click "Save" to add the new payment option

### Editing a Payment Option

1. Click the edit (pencil) icon next to the payment option you want to edit
2. Update the fields as needed
3. Click "Save" to update the payment option

### Deleting a Payment Option

1. Click the delete (trash) icon next to the payment option you want to delete
2. Confirm the deletion in the confirmation dialog
3. The payment option will be removed from the list

## How It Works

The payment options are stored in the `backend/database/paymentoptions.json` file. When you add, edit, or delete a payment option through the admin dashboard, the changes are sent to the Node.js server, which updates the JSON file in real-time.

## Troubleshooting

If you encounter issues with managing payment options:

1. Make sure the Node.js server is running (check the server status indicator)
2. If the server is not running, start it using the instructions above
3. Check the browser console for any error messages
4. Try refreshing the page

If you continue to experience issues, please contact the system administrator.
