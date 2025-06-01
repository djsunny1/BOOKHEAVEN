const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8002;
const PAYMENT_OPTIONS_FILE = path.join(__dirname, 'database', 'paymentoptions.json');
const USERS_FILE = path.join(__dirname, 'database', 'users.json');
const BOOKS_FILE = path.join(__dirname, 'database', 'books.json');
const ORDERS_FILE = path.join(__dirname, 'database', 'orders.json');

// Create HTTP server
const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Log all requests
    console.log(`${req.method} ${req.url}`);

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Handle API endpoints
    if (pathname === '/api/payment-options' && req.method === 'GET') {
        // Get payment options
        fs.readFile(PAYMENT_OPTIONS_FILE, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading payment options file:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Failed to read payment options' }));
                return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        });
    } else if (pathname === '/api/payment-options' && req.method === 'POST') {
        // Update payment options
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                // Log received data
                console.log('Received data:', body);

                // Validate JSON
                const parsedData = JSON.parse(body);
                console.log('Parsed data:', JSON.stringify(parsedData, null, 2));

                // Format the JSON with proper indentation for the file
                const formattedJson = JSON.stringify(parsedData, null, 2);

                // Write to file
                fs.writeFile(PAYMENT_OPTIONS_FILE, formattedJson, err => {
                    if (err) {
                        console.error('Error writing payment options file:', err);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'Failed to write payment options' }));
                        return;
                    }

                    console.log('Payment options updated successfully');
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: 'Payment options updated successfully' }));
                });
            } catch (error) {
                console.error('Invalid JSON data:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Invalid JSON data' }));
            }
        });
    } else if (pathname === '/api/users' && req.method === 'GET') {
        // Get users
        fs.readFile(USERS_FILE, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading users file:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Failed to read users' }));
                return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        });
    } else if (pathname === '/api/users' && req.method === 'POST') {
        // Update users
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                // Log received data
                console.log('Received user data:', body);

                // Validate JSON
                const parsedData = JSON.parse(body);
                console.log('Parsed user data:', JSON.stringify(parsedData, null, 2));

                // Check if this is a delete operation by comparing with current data
                try {
                    const currentData = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
                    if (currentData.length > parsedData.length) {
                        console.log('Delete operation detected:');
                        console.log('Current user count:', currentData.length);
                        console.log('New user count:', parsedData.length);

                        // Find deleted user(s)
                        const deletedUsers = currentData.filter(currentUser =>
                            !parsedData.some(newUser => newUser.id === currentUser.id)
                        );

                        console.log('Deleted user(s):', JSON.stringify(deletedUsers, null, 2));
                    }
                } catch (err) {
                    console.error('Error checking for delete operation:', err);
                }

                // Format the JSON with proper indentation for the file
                const formattedJson = JSON.stringify(parsedData, null, 2);

                // Write to file
                fs.writeFile(USERS_FILE, formattedJson, err => {
                    if (err) {
                        console.error('Error writing users file:', err);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'Failed to write users' }));
                        return;
                    }

                    console.log('Users updated successfully');
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: 'Users updated successfully' }));
                });
            } catch (error) {
                console.error('Invalid JSON data:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Invalid JSON data' }));
            }
        });
    } else if (pathname.startsWith('/api/users/delete/') && req.method === 'GET') {
        // Delete a specific user by ID
        const userId = pathname.split('/').pop();
        console.log('Deleting user with ID:', userId);

        try {
            // Read current users
            fs.readFile(USERS_FILE, 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading users file:', err);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Failed to read users' }));
                    return;
                }

                try {
                    // Parse users
                    const users = JSON.parse(data);

                    // Find user index
                    const userIndex = users.findIndex(user => user.id === userId);

                    if (userIndex === -1) {
                        // User not found
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'User not found' }));
                        return;
                    }

                    // Remove user
                    const deletedUser = users.splice(userIndex, 1)[0];
                    console.log('Deleted user:', deletedUser);

                    // Save updated users
                    fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), err => {
                        if (err) {
                            console.error('Error writing users file:', err);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, error: 'Failed to write users' }));
                            return;
                        }

                        console.log('User deleted successfully');
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: 'User deleted successfully' }));
                    });
                } catch (error) {
                    console.error('Error parsing users:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Failed to parse users' }));
                }
            });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Failed to delete user' }));
        }
    } else if (pathname === '/api/books' && req.method === 'GET') {
        // Get books
        fs.readFile(BOOKS_FILE, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading books file:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Failed to read books' }));
                return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        });
    } else if (pathname === '/api/books' && req.method === 'POST') {
        // Update books
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                // Log received data
                console.log('Received book data:', body);

                // Validate JSON
                const parsedData = JSON.parse(body);
                console.log('Parsed book data:', JSON.stringify(parsedData, null, 2));

                // Format the JSON with proper indentation for the file
                const formattedJson = JSON.stringify(parsedData, null, 2);

                // Write to file
                fs.writeFile(BOOKS_FILE, formattedJson, err => {
                    if (err) {
                        console.error('Error writing books file:', err);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'Failed to write books' }));
                        return;
                    }

                    console.log('Books updated successfully');
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: 'Books updated successfully' }));
                });
            } catch (error) {
                console.error('Invalid JSON data:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Invalid JSON data' }));
            }
        });
    } else if (pathname.startsWith('/api/books/delete/') && req.method === 'GET') {
        // Delete a specific book by ID
        const bookId = pathname.split('/').pop();
        console.log('Deleting book with ID:', bookId);

        try {
            // Read current books
            fs.readFile(BOOKS_FILE, 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading books file:', err);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Failed to read books' }));
                    return;
                }

                try {
                    // Parse books
                    const books = JSON.parse(data);

                    // Find book index
                    const bookIndex = books.findIndex(book => book.bookId === bookId);

                    if (bookIndex === -1) {
                        // Book not found
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'Book not found' }));
                        return;
                    }

                    // Remove book
                    const deletedBook = books.splice(bookIndex, 1)[0];
                    console.log('Deleted book:', deletedBook);

                    // Save updated books
                    fs.writeFile(BOOKS_FILE, JSON.stringify(books, null, 2), err => {
                        if (err) {
                            console.error('Error writing books file:', err);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, error: 'Failed to write books' }));
                            return;
                        }

                        console.log('Book deleted successfully');
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: 'Book deleted successfully' }));
                    });
                } catch (error) {
                    console.error('Error parsing books:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Failed to parse books' }));
                }
            });
        } catch (error) {
            console.error('Error deleting book:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Failed to delete book' }));
        }
    } else if (pathname.startsWith('/api/books/update/') && req.method === 'POST') {
        // Update a specific book
        const bookId = pathname.split('/').pop();
        console.log('Updating book with ID:', bookId);

        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                // Log received data
                console.log('Received book update data:', body);

                // Validate JSON
                const updatedBook = JSON.parse(body);
                console.log('Parsed book update data:', JSON.stringify(updatedBook, null, 2));

                // Read current books
                fs.readFile(BOOKS_FILE, 'utf8', (err, data) => {
                    if (err) {
                        console.error('Error reading books file:', err);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'Failed to read books' }));
                        return;
                    }

                    try {
                        // Parse books
                        const books = JSON.parse(data);

                        // Find book index
                        const bookIndex = books.findIndex(book => book.bookId === bookId);

                        if (bookIndex === -1) {
                            // Book not found, add as new
                            books.push(updatedBook);
                        } else {
                            // Update existing book
                            books[bookIndex] = updatedBook;
                        }

                        // Save updated books
                        fs.writeFile(BOOKS_FILE, JSON.stringify(books, null, 2), err => {
                            if (err) {
                                console.error('Error writing books file:', err);
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ success: false, error: 'Failed to write books' }));
                                return;
                            }

                            console.log('Book updated successfully');
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: true, message: 'Book updated successfully' }));
                        });
                    } catch (error) {
                        console.error('Error parsing books:', error);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'Failed to parse books' }));
                    }
                });
            } catch (error) {
                console.error('Invalid JSON data:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Invalid JSON data' }));
            }
        });
    } else if (pathname === '/api/orders' && req.method === 'GET') {
        // Get orders
        fs.readFile(ORDERS_FILE, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading orders file:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Failed to read orders' }));
                return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        });
    } else if (pathname === '/api/orders' && req.method === 'POST') {
        // Update orders
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                // Log received data
                console.log('Received order data:', body);

                // Validate JSON
                const parsedData = JSON.parse(body);
                console.log('Parsed order data:', JSON.stringify(parsedData, null, 2));

                // Format the JSON with proper indentation for the file
                const formattedJson = JSON.stringify(parsedData, null, 2);

                // Write to file
                fs.writeFile(ORDERS_FILE, formattedJson, err => {
                    if (err) {
                        console.error('Error writing orders file:', err);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'Failed to write orders' }));
                        return;
                    }

                    console.log('Orders updated successfully');
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: 'Orders updated successfully' }));
                });
            } catch (error) {
                console.error('Invalid JSON data:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Invalid JSON data' }));
            }
        });
    } else if (pathname.startsWith('/api/orders/delete/') && req.method === 'GET') {
        // Delete a specific order by ID
        const orderId = pathname.split('/').pop();
        console.log('Deleting order with ID:', orderId);

        try {
            // Read current orders
            fs.readFile(ORDERS_FILE, 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading orders file:', err);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Failed to read orders' }));
                    return;
                }

                try {
                    // Parse orders
                    const orders = JSON.parse(data);

                    // Find order index
                    const orderIndex = orders.findIndex(order => order.id === orderId);

                    if (orderIndex === -1) {
                        // Order not found
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'Order not found' }));
                        return;
                    }

                    // Remove order
                    const deletedOrder = orders.splice(orderIndex, 1)[0];
                    console.log('Deleted order:', deletedOrder);

                    // Save updated orders
                    fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), err => {
                        if (err) {
                            console.error('Error writing orders file:', err);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, error: 'Failed to write orders' }));
                            return;
                        }

                        console.log('Order deleted successfully');
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: 'Order deleted successfully' }));
                    });
                } catch (error) {
                    console.error('Error parsing orders:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Failed to parse orders' }));
                }
            });
        } catch (error) {
            console.error('Error deleting order:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Failed to delete order' }));
        }
    } else if (pathname.startsWith('/api/orders/update/') && req.method === 'POST') {
        // Update a specific order
        const orderId = pathname.split('/').pop();
        console.log('Updating order with ID:', orderId);

        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                // Log received data
                console.log('Received order update data:', body);

                // Validate JSON
                const updatedOrder = JSON.parse(body);
                console.log('Parsed order update data:', JSON.stringify(updatedOrder, null, 2));

                // Read current orders
                fs.readFile(ORDERS_FILE, 'utf8', (err, data) => {
                    if (err) {
                        console.error('Error reading orders file:', err);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'Failed to read orders' }));
                        return;
                    }

                    try {
                        // Parse orders
                        const orders = JSON.parse(data);

                        // Find order index
                        const orderIndex = orders.findIndex(order => order.id === orderId);

                        if (orderIndex === -1) {
                            // Order not found, add as new
                            orders.push(updatedOrder);
                        } else {
                            // Update existing order
                            orders[orderIndex] = updatedOrder;
                        }

                        // Save updated orders
                        fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), err => {
                            if (err) {
                                console.error('Error writing orders file:', err);
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ success: false, error: 'Failed to write orders' }));
                                return;
                            }

                            console.log('Order updated successfully');
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: true, message: 'Order updated successfully' }));
                        });
                    } catch (error) {
                        console.error('Error parsing orders:', error);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'Failed to parse orders' }));
                    }
                });
            } catch (error) {
                console.error('Invalid JSON data:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Invalid JSON data' }));
            }
        });
    } else {
        // Not found
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Endpoint not found' }));
    }
});

// Start server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
