// Admin Books Management Functionality
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

    // Book modal elements
    const bookModal = document.getElementById('bookModal');
    const closeBookModal = document.getElementById('closeBookModal');
    const addBookBtn = document.getElementById('addBookBtn');
    const cancelBookBtn = document.getElementById('cancelBookBtn');
    const bookForm = document.getElementById('bookForm');
    const bookModalTitle = document.getElementById('bookModalTitle');

    // View book modal elements
    const viewBookModal = document.getElementById('viewBookModal');
    const closeViewBookModal = document.getElementById('closeViewBookModal');
    const closeViewBookBtn = document.getElementById('closeViewBookBtn');
    const editBookFromViewBtn = document.getElementById('editBookFromViewBtn');

    // Open modal when Add New Book button is clicked
    if (addBookBtn) {
        addBookBtn.addEventListener('click', function() {
            bookModalTitle.textContent = 'Add New Book';
            bookForm.reset();
            document.getElementById('bookId').value = '';
            bookModal.style.display = 'block';
        });
    }

    // Close modal when X button is clicked
    if (closeBookModal) {
        closeBookModal.addEventListener('click', function() {
            bookModal.style.display = 'none';
        });
    }

    // Close modal when Cancel button is clicked
    if (cancelBookBtn) {
        cancelBookBtn.addEventListener('click', function() {
            bookModal.style.display = 'none';
        });
    }

    // Close view book modal when X button is clicked
    if (closeViewBookModal) {
        closeViewBookModal.addEventListener('click', function() {
            viewBookModal.style.display = 'none';
        });
    }

    // Close view book modal when Close button is clicked
    if (closeViewBookBtn) {
        closeViewBookBtn.addEventListener('click', function() {
            viewBookModal.style.display = 'none';
        });
    }

    // Handle Edit button click in view book modal
    if (editBookFromViewBtn) {
        editBookFromViewBtn.addEventListener('click', function() {
            // Get the book ID from the view modal
            const bookId = document.getElementById('viewBookId').getAttribute('data-id');

            // Close view modal
            viewBookModal.style.display = 'none';

            // Trigger edit for this book
            const editButton = document.querySelector(`.admin-action-btn.edit[data-id="${bookId}"]`);
            if (editButton) {
                editButton.click();
            }
        });
    }

    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === bookModal) {
            bookModal.style.display = 'none';
        }
        if (event.target === viewBookModal) {
            viewBookModal.style.display = 'none';
        }
    });

    // Handle book form submission
    if (bookForm) {
        bookForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form values
            const bookId = document.getElementById('bookId').value;
            console.log('Form submitted with book ID index:', bookId);
            const title = document.getElementById('bookTitle').value;
            const author = document.getElementById('bookAuthor').value;
            const categories = document.getElementById('bookCategory').value;
            const actualPrice = document.getElementById('bookActualPrice').value;
            const discountPercentage = document.getElementById('bookDiscount').value;
            const afterDiscountPrice = document.getElementById('bookFinalPrice').value;
            const stock = document.getElementById('bookStock').value;
            const rating = document.getElementById('bookRating').value;
            const location = document.getElementById('bookLocation').value;
            const releaseDate = document.getElementById('bookReleaseDate').value;
            const description = document.getElementById('bookDescription').value;
            const imageUrl = document.getElementById('bookImage').value;

            // Create book object with all details
            const bookData = {
                name: title,
                author: author,
                categories: categories,
                actualPrice: parseFloat(actualPrice),
                discountPercentage: parseInt(discountPercentage),
                afterDiscountPrice: parseFloat(afterDiscountPrice),
                pieces: parseInt(stock),
                rating: parseFloat(rating),
                location: location,
                releaseDate: releaseDate,
                shortDescription: description,
                pic: imageUrl
            };

            // Check if adding new book or editing existing book
            if (bookId) {
                // Edit existing book
                console.log('Updating book:', bookData);

                // Add bookId to the data
                const bookIdValue = booksData[parseInt(bookId)].bookId;
                bookData.bookId = bookIdValue;

                console.log('Book ID for update:', bookIdValue);

                // Send update request to server
                fetch(`http://localhost:8002/api/books/update/${bookIdValue}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(bookData)
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        alert(`Book "${title}" updated successfully!`);
                        // Close modal
                        bookModal.style.display = 'none';
                        // Refresh books table
                        loadBooks();
                    } else {
                        alert(`Error updating book: ${result.error || 'Unknown error'}`);
                    }
                })
                .catch(error => {
                    console.error('Error updating book:', error);
                    alert(`Error updating book: ${error.message}`);
                });
            } else {
                // Add new book
                console.log('Adding new book:', bookData);

                // Generate a new book ID
                let highestId = 0;
                booksData.forEach(book => {
                    if (book.bookId && book.bookId.startsWith('B')) {
                        const idNum = parseInt(book.bookId.substring(1));
                        if (!isNaN(idNum) && idNum > highestId) {
                            highestId = idNum;
                        }
                    }
                });

                bookData.bookId = `B${(highestId + 1).toString().padStart(3, '0')}`;

                // Add the new book to the array
                booksData.push(bookData);

                // Send the updated array to the server
                fetch('http://localhost:8002/api/books', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(booksData)
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        alert(`Book "${title}" added successfully!`);
                        // Close modal
                        bookModal.style.display = 'none';
                        // Refresh books table
                        loadBooks();
                    } else {
                        alert(`Error adding book: ${result.error || 'Unknown error'}`);
                    }
                })
                .catch(error => {
                    console.error('Error adding book:', error);
                    alert(`Error adding book: ${error.message}`);
                });
            }
        });
    }

    // Handle image URL input change to update preview
    const bookImageInput = document.getElementById('bookImage');
    if (bookImageInput) {
        bookImageInput.addEventListener('input', function() {
            const imageUrl = this.value.trim();
            const bookImagePreview = document.getElementById('bookImagePreview');

            if (imageUrl) {
                bookImagePreview.src = imageUrl;
            } else {
                bookImagePreview.src = 'https://via.placeholder.com/200x300?text=No+Image';
            }
        });
    }

    // Auto-calculate final price based on actual price and discount
    const actualPriceInput = document.getElementById('bookActualPrice');
    const discountInput = document.getElementById('bookDiscount');
    const finalPriceInput = document.getElementById('bookFinalPrice');

    function calculateFinalPrice() {
        const actualPrice = parseFloat(actualPriceInput.value) || 0;
        const discount = parseFloat(discountInput.value) || 0;

        if (actualPrice > 0) {
            const finalPrice = actualPrice - (actualPrice * discount / 100);
            finalPriceInput.value = finalPrice.toFixed(2);
        }
    }

    if (actualPriceInput && discountInput) {
        actualPriceInput.addEventListener('input', calculateFinalPrice);
        discountInput.addEventListener('input', calculateFinalPrice);
    }

    // Load books data
    loadBooks();
});

// Function to load books data
async function loadBooks() {
    const booksTableBody = document.getElementById('booksTableBody');

    try {
        const response = await fetch('http://localhost:8002/api/books');
        const booksData = await response.json();

        // Clear table body
        booksTableBody.innerHTML = '';

        // Add books to table
        booksData.forEach((book, index) => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${book.bookId || `B${(index + 1).toString().padStart(3, '0')}`}</td>
                <td><img src="${book.pic || 'https://via.placeholder.com/50x70?text=No+Image'}" alt="${book.name}" class="book-thumbnail"></td>
                <td>${book.name}</td>
                <td>${book.author}</td>
                <td>${book.categories || 'undefined'}</td>
                <td>PKR ${book.afterDiscountPrice || 'undefined'}</td>
                <td>${book.pieces || 0}</td>
                <td>
                    <div class="admin-table-actions-cell">
                        <div class="admin-action-btn view" data-id="${index}"><i class="fas fa-eye"></i></div>
                        <div class="admin-action-btn edit" data-id="${index}"><i class="fas fa-edit"></i></div>
                        <div class="admin-action-btn delete" data-id="${index}"><i class="fas fa-trash"></i></div>
                    </div>
                </td>
            `;

            booksTableBody.appendChild(row);
        });

        // Add event listeners for action buttons
        addActionButtonListeners(booksData);

    } catch (error) {
        console.error('Error loading books:', error);
        booksTableBody.innerHTML = '<tr><td colspan="8">Error loading books. Please try again later.</td></tr>';
    }
}

// Global variable to store books data
let booksData = [];

// Function to add event listeners for action buttons
function addActionButtonListeners(books) {
    // Update global booksData
    booksData = books;
    // View buttons
    const viewButtons = document.querySelectorAll('.admin-action-btn.view');
    const viewBookModal = document.getElementById('viewBookModal');

    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bookId = this.getAttribute('data-id');
            const book = booksData[bookId];

            // Set book details in view modal
            document.getElementById('viewBookId').textContent = book.bookId || `B${(parseInt(bookId) + 1).toString().padStart(3, '0')}`;
            document.getElementById('viewBookId').setAttribute('data-id', bookId);
            document.getElementById('viewBookTitle').textContent = book.name;
            document.getElementById('viewBookAuthor').textContent = book.author;
            document.getElementById('viewBookCategory').textContent = book.categories || 'Not specified';
            document.getElementById('viewBookDescription').textContent = book.shortDescription || 'No description available';
            document.getElementById('viewBookActualPrice').textContent = `PKR ${book.actualPrice || 'N/A'}`;
            document.getElementById('viewBookDiscount').textContent = `${book.discountPercentage || 0}%`;
            document.getElementById('viewBookFinalPrice').textContent = `PKR ${book.afterDiscountPrice || book.actualPrice || 'N/A'}`;
            document.getElementById('viewBookReleaseDate').textContent = book.releaseDate || 'Not specified';
            document.getElementById('viewBookLocation').textContent = book.location || 'Not specified';
            document.getElementById('viewBookStock').textContent = book.pieces || Math.floor(Math.random() * 100) + 1;
            document.getElementById('viewBookRating').textContent = `${book.rating || 'N/A'} / 5`;

            // Set book image
            const bookImage = document.getElementById('viewBookImage');
            if (book.pic) {
                bookImage.src = book.pic;
                bookImage.alt = book.name;
            } else {
                // Default image if no pic is available
                bookImage.src = 'https://via.placeholder.com/200x300?text=No+Image';
                bookImage.alt = 'No Image Available';
            }

            // Show view modal
            viewBookModal.style.display = 'block';
        });
    });

    // Edit buttons
    const editButtons = document.querySelectorAll('.admin-action-btn.edit');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bookId = this.getAttribute('data-id');
            console.log('Edit button clicked for book ID index:', bookId);
            const book = booksData[bookId];
            console.log('Book data for editing:', book);

            // Set form values
            document.getElementById('bookId').value = bookId;
            document.getElementById('bookTitle').value = book.name || '';
            document.getElementById('bookAuthor').value = book.author || '';
            document.getElementById('bookCategory').value = book.categories || '';
            document.getElementById('bookActualPrice').value = book.actualPrice || '';
            document.getElementById('bookDiscount').value = book.discountPercentage || 0;
            document.getElementById('bookFinalPrice').value = book.afterDiscountPrice || '';
            document.getElementById('bookStock').value = book.pieces || 0;
            document.getElementById('bookRating').value = book.rating || 4.0;
            document.getElementById('bookLocation').value = book.location || '';
            document.getElementById('bookReleaseDate').value = book.releaseDate || '';
            document.getElementById('bookDescription').value = book.shortDescription || 'No description available.';

            // Set book image
            const bookImageInput = document.getElementById('bookImage');
            const bookImagePreview = document.getElementById('bookImagePreview');

            if (book.pic) {
                bookImageInput.value = book.pic;
                bookImagePreview.src = book.pic;
                bookImagePreview.alt = book.name;
            } else {
                bookImageInput.value = '';
                bookImagePreview.src = 'https://via.placeholder.com/200x300?text=No+Image';
                bookImagePreview.alt = 'No Image Available';
            }

            // Set modal title
            document.getElementById('bookModalTitle').textContent = 'Edit Book';

            // Show modal
            document.getElementById('bookModal').style.display = 'block';
        });
    });

    // Delete buttons
    const deleteButtons = document.querySelectorAll('.admin-action-btn.delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bookId = this.getAttribute('data-id');
            const book = booksData[bookId];

            if (confirm(`Are you sure you want to delete "${book.name}"?`)) {
                // Send delete request to server
                fetch(`http://localhost:8002/api/books/delete/${book.bookId}`, {
                    method: 'GET'
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        alert(`Book "${book.name}" deleted successfully!`);
                        // Refresh the books table
                        loadBooks();
                    } else {
                        alert(`Error deleting book: ${result.error || 'Unknown error'}`);
                    }
                })
                .catch(error => {
                    console.error('Error deleting book:', error);
                    alert(`Error deleting book: ${error.message}`);
                });
            }
        });
    });
}
