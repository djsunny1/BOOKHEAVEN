// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Modal functionality
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const successModal = document.getElementById('successModal');
    const closeButtons = document.querySelectorAll('.close-modal');
    const switchToSignup = document.getElementById('switchToSignup');
    const switchToLogin = document.getElementById('switchToLogin');
    const successOkBtn = document.getElementById('successOkBtn');

    // Function to open modal
    function openModal(modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    // Function to close modal
    function closeModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';

        // Clear login message if closing login modal
        if (modal.id === 'loginModal') {
            const loginMessage = document.getElementById('loginMessage');
            if (loginMessage) {
                loginMessage.style.display = 'none';
                loginMessage.textContent = '';
            }
        }
    }

    // Open login modal
    loginBtn.addEventListener('click', function() {
        openModal(loginModal);
    });

    // Open signup modal
    signupBtn.addEventListener('click', function() {
        openModal(signupModal);
    });

    // Close modals when clicking close button
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target);
        }
    });

    // Switch between login and signup
    switchToSignup.addEventListener('click', function(e) {
        e.preventDefault();
        closeModal(loginModal);
        openModal(signupModal);
    });

    switchToLogin.addEventListener('click', function(e) {
        e.preventDefault();
        closeModal(signupModal);
        openModal(loginModal);
    });

    // Login and signup form submissions are now handled in auth.js

    // Close success modal
    successOkBtn.addEventListener('click', function() {
        closeModal(successModal);
    });
    // Add to basket functionality
    const addToBasketButtons = document.querySelectorAll('.add-to-basket');

    addToBasketButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get book information
            const bookCard = this.closest('.book-card');
            const bookTitle = bookCard.querySelector('h3').textContent;
            const bookPrice = bookCard.querySelector('.price').textContent.split(' ')[0];

            // Show confirmation message
            alert(`Added "${bookTitle}" to your basket (${bookPrice})`);

            // Change button text temporarily
            const originalText = this.textContent;
            this.textContent = 'Added to Basket';
            this.style.backgroundColor = '#4CAF50';
            this.style.color = 'white';

            // Reset button after 2 seconds
            setTimeout(() => {
                this.textContent = originalText;
                this.style.backgroundColor = '';
                this.style.color = '';
            }, 2000);
        });
    });

    // Scroll Down button functionality
    const scrollDownBtns = document.querySelectorAll('.scroll-down-btn');
    scrollDownBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Scroll to the browse books section
            const browseSection = document.querySelector('.browse-books');
            if (browseSection) {
                browseSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Subscribe button functionality for newsletter
    const subscribeButtons = document.querySelectorAll('.subscribe-form button');

    subscribeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const emailInput = document.querySelector('.subscribe-form input');

            if (emailInput && emailInput.value) {
                alert(`Thank you for subscribing with: ${emailInput.value}`);
                emailInput.value = '';
            } else {
                alert('Please enter your email to subscribe to our newsletter!');
            }
        });
    });

    // Menu button functionality (for mobile)
    const menuButton = document.querySelector('.menu-btn');

    if (menuButton) {
        menuButton.addEventListener('click', function() {
            alert('Menu functionality would open a navigation drawer here');
        });
    }

    // Book browsing functionality
    const bookGrid = document.getElementById('book-grid');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const showLessBtn = document.getElementById('show-less-btn');
    const clearFiltersBtn = document.getElementById('clear-filters');

    // Filter elements
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    const ratingFilter = document.getElementById('rating-filter');
    const authorFilter = document.getElementById('author-filter');
    const locationFilter = document.getElementById('location-filter');

    let booksData = [];
    let filteredBooks = [];
    let currentlyDisplayed = 0;
    const booksPerPage = 12; // 4 columns x 3 rows
    let hasLoadedMore = false;

    // Fetch books data
    async function fetchBooks() {
        try {
            const response = await fetch('/backend/database/books.json');
            booksData = await response.json();
            filteredBooks = [...booksData]; // Initialize filtered books with all books

            // Populate filter dropdowns
            populateFilterOptions();

            // Display initial books
            displayBooks(0, booksPerPage);

            // Load random books for the slider
            loadRandomBooksForSlider();
        } catch (error) {
            console.error('Error fetching books:', error);
            bookGrid.innerHTML = '<p>Error loading books. Please try again later.</p>';
        }
    }

    // Function to load random books for the slider
    function loadRandomBooksForSlider() {
        if (!booksData || booksData.length === 0) return;

        const sliderSections = document.querySelectorAll('.releases-slide');

        sliderSections.forEach(section => {
            const booksContainer = section.querySelector('.new-releases-books');
            if (booksContainer) {
                // Clear existing books
                booksContainer.innerHTML = '';

                // Get 2 random books for each slider section
                const randomBooks = getRandomBooks(2);

                // Add books to the slider
                randomBooks.forEach(book => {
                    const bookCover = document.createElement('div');
                    bookCover.className = 'book-cover';

                    const img = document.createElement('img');
                    img.src = book.pic;
                    img.alt = book.name;

                    bookCover.appendChild(img);
                    booksContainer.appendChild(bookCover);
                });
            }
        });
    }

    // Function to get random books from the data
    function getRandomBooks(count) {
        const shuffled = [...booksData].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    // Populate filter options from book data
    function populateFilterOptions() {
        // For categories
        const categories = new Set();
        booksData.forEach(book => {
            if (book.categories && Array.isArray(book.categories)) {
                book.categories.forEach(category => categories.add(category));
            }
        });

        const sortedCategories = Array.from(categories).sort();
        sortedCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });

        // For authors
        const authors = new Set();
        booksData.forEach(book => {
            if (book.author) {
                authors.add(book.author);
            }
        });

        const sortedAuthors = Array.from(authors).sort();
        sortedAuthors.forEach(author => {
            const option = document.createElement('option');
            option.value = author;
            option.textContent = author;
            authorFilter.appendChild(option);
        });

        // For locations
        const locations = new Set();
        booksData.forEach(book => {
            if (book.location) {
                locations.add(book.location);
            }
        });

        const sortedLocations = Array.from(locations).sort();
        sortedLocations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            locationFilter.appendChild(option);
        });

        // Add change event listeners to all filter dropdowns
        categoryFilter.addEventListener('change', applyFilters);
        priceFilter.addEventListener('change', applyFilters);
        ratingFilter.addEventListener('change', applyFilters);
        authorFilter.addEventListener('change', applyFilters);
        locationFilter.addEventListener('change', applyFilters);
    }

    // Apply filters to books
    function applyFilters() {
        const categoryValue = categoryFilter.value;
        const priceValue = priceFilter.value;
        const ratingValue = ratingFilter.value;
        const authorValue = authorFilter.value;
        const locationValue = locationFilter.value;

        // Reset filtered books
        filteredBooks = [...booksData];

        // Apply category filter
        if (categoryValue) {
            filteredBooks = filteredBooks.filter(book =>
                book.categories &&
                Array.isArray(book.categories) &&
                book.categories.includes(categoryValue)
            );
        }

        // Apply price filter
        if (priceValue) {
            filteredBooks = filteredBooks.filter(book => {
                const price = book.afterDiscountPrice;

                if (priceValue === '0-10') {
                    return price < 10;
                } else if (priceValue === '10-15') {
                    return price >= 10 && price < 15;
                } else if (priceValue === '15-20') {
                    return price >= 15 && price < 20;
                } else if (priceValue === '20+') {
                    return price >= 20;
                }

                return true;
            });
        }

        // Apply rating filter
        if (ratingValue) {
            filteredBooks = filteredBooks.filter(book => {
                const rating = book.rating;

                if (ratingValue === '4.5+') {
                    return rating >= 4.5;
                } else if (ratingValue === '4-4.5') {
                    return rating >= 4 && rating < 4.5;
                } else if (ratingValue === '3.5-4') {
                    return rating >= 3.5 && rating < 4;
                } else if (ratingValue === '3.5-') {
                    return rating < 3.5;
                }

                return true;
            });
        }

        // Apply author filter
        if (authorValue) {
            filteredBooks = filteredBooks.filter(book => book.author === authorValue);
        }

        // Apply location filter
        if (locationValue) {
            filteredBooks = filteredBooks.filter(book => book.location === locationValue);
        }

        // Reset display and show filtered books
        bookGrid.innerHTML = '';
        currentlyDisplayed = 0;
        hasLoadedMore = false;

        if (filteredBooks.length === 0) {
            bookGrid.innerHTML = '<p class="no-results">No books match your filter criteria. Please try different filters.</p>';
            loadMoreBtn.style.display = 'none';
            showLessBtn.style.display = 'none';
        } else {
            displayBooks(0, booksPerPage);
        }
    }

    // Clear all filters
    function clearFilters() {
        categoryFilter.value = '';
        priceFilter.value = '';
        ratingFilter.value = '';
        authorFilter.value = '';
        locationFilter.value = '';

        filteredBooks = [...booksData];
        bookGrid.innerHTML = '';
        currentlyDisplayed = 0;
        hasLoadedMore = false;

        displayBooks(0, booksPerPage);
    }

    // Display books in the grid
    function displayBooks(start, count) {
        const booksToShow = filteredBooks.slice(start, start + count);

        const booksHTML = booksToShow.map(book => {
            return `
                <div class="book-card">
                    <div class="book-image">
                        <img src="${book.pic}" alt="${book.name}">
                        <div class="view-details" data-book-id="${book.bookId}">
                            <i class="fas fa-eye"></i>
                        </div>
                    </div>
                    <div class="book-info">
                        <h3>${book.name}</h3>
                        <p class="author">${book.author}</p>
                        <p class="price">PKR ${book.afterDiscountPrice} <span class="original-price">PKR ${book.actualPrice}</span></p>
                        <button class="add-to-basket">Add to Basket</button>
                    </div>
                </div>
            `;
        }).join('');

        if (start === 0) {
            bookGrid.innerHTML = booksHTML;
        } else {
            bookGrid.innerHTML += booksHTML;
        }

        currentlyDisplayed = start + booksToShow.length;

        // Update "Add to Basket" button functionality for new books
        updateAddToBasketButtons();

        // Update button visibility
        updateButtonVisibility();
    }

    // Update button visibility based on current state
    function updateButtonVisibility() {
        // Hide "Load More" button if all filtered books are displayed
        if (currentlyDisplayed >= filteredBooks.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-block';
        }

        // Show "Show Less" button only if more books have been loaded
        if (hasLoadedMore) {
            showLessBtn.style.display = 'inline-block';
        } else {
            showLessBtn.style.display = 'none';
        }
    }

    // Update "Add to Basket" button functionality
    function updateAddToBasketButtons() {
        const addToBasketButtons = document.querySelectorAll('.add-to-basket');
        const viewDetailsButtons = document.querySelectorAll('.view-details');
        const bookDetailsModal = document.getElementById('bookDetailsModal');
        const closeBookDetails = document.getElementById('closeBookDetails');
        const bookDetailsContent = document.getElementById('bookDetailsContent');

        // Close book details modal when clicking the close button
        if (closeBookDetails) {
            closeBookDetails.addEventListener('click', function() {
                bookDetailsModal.style.display = 'none';
            });
        }

        // Close book details modal when clicking outside the modal
        window.addEventListener('click', function(event) {
            if (event.target === bookDetailsModal) {
                bookDetailsModal.style.display = 'none';
            }
        });

        // Add event listeners to view details buttons
        viewDetailsButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const bookId = this.getAttribute('data-book-id');

                // Find the book in the data
                const book = booksData.find(b => b.bookId === bookId);

                if (book) {
                    // Format categories for display
                    const categoriesHtml = book.categories && book.categories.length > 0
                        ? book.categories.map(cat => `<span class="category-tag">${cat}</span>`).join('')
                        : '<span class="category-tag">Uncategorized</span>';

                    // Calculate discount percentage if not provided
                    const discountPercentage = book.discountPercentage ||
                        Math.round((1 - (book.afterDiscountPrice / book.actualPrice)) * 100);

                    // Format date for display
                    const releaseDate = book.releaseDate ? new Date(book.releaseDate).toLocaleDateString() : 'Unknown';

                    // Create HTML for book details
                    const detailsHtml = `
                        <div class="book-details-container">
                            <div class="book-details-image">
                                <img src="${book.pic}" alt="${book.name}">
                            </div>
                            <div class="book-details-info">
                                <h2 class="book-details-title">${book.name}</h2>
                                <p class="book-details-author">by ${book.author}</p>
                                <p class="book-details-price">PKR ${book.afterDiscountPrice} <span class="book-details-original">PKR ${book.actualPrice}</span></p>
                                <p class="book-details-description">${book.shortDescription || 'No description available.'}</p>

                                <div class="book-details-meta">
                                    <div class="book-meta-item">
                                        <span class="meta-label">Release Date</span>
                                        <span class="meta-value">${releaseDate}</span>
                                    </div>
                                    <div class="book-meta-item">
                                        <span class="meta-label">Rating</span>
                                        <span class="meta-value">${book.rating} / 5</span>
                                    </div>
                                    <div class="book-meta-item">
                                        <span class="meta-label">Discount</span>
                                        <span class="meta-value">${discountPercentage}%</span>
                                    </div>
                                    <div class="book-meta-item">
                                        <span class="meta-label">Available</span>
                                        <span class="meta-value">${book.pieces} copies</span>
                                    </div>
                                    <div class="book-meta-item">
                                        <span class="meta-label">Location</span>
                                        <span class="meta-value">${book.location || 'Unknown'}</span>
                                    </div>
                                </div>

                                <div class="book-details-categories">
                                    ${categoriesHtml}
                                </div>

                                <div class="book-details-actions">
                                    <button class="add-to-cart-btn" data-book-id="${book.bookId}">Add to Basket</button>
                                </div>
                            </div>
                        </div>
                    `;

                    // Update modal content and display it
                    bookDetailsContent.innerHTML = detailsHtml;
                    bookDetailsModal.style.display = 'block';

                    // Add event listener to the Add to Cart button in the modal
                    const addToCartBtn = bookDetailsContent.querySelector('.add-to-cart-btn');
                    if (addToCartBtn) {
                        addToCartBtn.addEventListener('click', function() {
                            // Check if user is logged in
                            if (isLoggedIn()) {
                                // Add to cart if logged in
                                addToCart(book);

                                // Show confirmation message
                                const cartCount = getCartItemCount();

                                // Show success message
                                document.getElementById('successMessage').textContent = 'Added to Cart!';
                                document.getElementById('successDetails').textContent = `"${book.name}" has been added to your cart. You now have ${cartCount} item(s) in your cart.`;
                                document.getElementById('successModal').style.display = 'block';

                                // Close the book details modal
                                bookDetailsModal.style.display = 'none';
                            } else {
                                // Store the book in session storage to add after login
                                sessionStorage.setItem('pendingCartItem', JSON.stringify(book));

                                // Close the book details modal
                                bookDetailsModal.style.display = 'none';

                                // Show login modal if not logged in
                                openModal(loginModal);

                                // Add message to login modal
                                const loginMessage = document.getElementById('loginMessage');
                                if (loginMessage) {
                                    loginMessage.textContent = 'Please log in to add items to your cart.';
                                    loginMessage.style.display = 'block';
                                }
                            }
                        });
                    }
                }
            });
        });

        // Add event listeners to Add to Basket buttons
        addToBasketButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Get book information
                const bookCard = this.closest('.book-card');
                const bookTitle = bookCard.querySelector('h3').textContent;
                const bookAuthor = bookCard.querySelector('.author').textContent;
                const bookPrice = bookCard.querySelector('.price').textContent.split(' ')[0];
                const priceValue = parseFloat(bookPrice.replace('$', ''));
                const originalPrice = bookCard.querySelector('.original-price').textContent.replace('$', '');
                const bookImage = bookCard.querySelector('.book-image img').src;
                const bookId = bookCard.querySelector('.view-details').getAttribute('data-book-id');

                // Find the book in the data or create a new object
                let book;
                if (bookId) {
                    book = booksData.find(b => b.bookId === bookId);
                }

                // If book not found in data, create a new object
                if (!book) {
                    book = {
                        bookId: bookId || ('B' + Date.now().toString().slice(-6)), // Generate a simple ID if not found
                        name: bookTitle,
                        author: bookAuthor,
                        afterDiscountPrice: priceValue,
                        actualPrice: parseFloat(originalPrice),
                        pic: bookImage
                    };
                }

                // Check if user is logged in
                if (isLoggedIn()) {
                    // Add to cart if logged in
                    addToCart(book);

                    // Show confirmation message
                    const cartCount = getCartItemCount();

                    // Show success message
                    document.getElementById('successMessage').textContent = 'Added to Cart!';
                    document.getElementById('successDetails').textContent = `"${bookTitle}" has been added to your cart. You now have ${cartCount} item(s) in your cart.`;
                    document.getElementById('successModal').style.display = 'block';

                    // Change button text temporarily
                    const originalText = this.textContent;
                    this.textContent = 'Added to Basket';
                    this.style.backgroundColor = '#4CAF50';
                    this.style.color = 'white';

                    // Reset button after 2 seconds
                    setTimeout(() => {
                        this.textContent = originalText;
                        this.style.backgroundColor = '';
                        this.style.color = '';
                    }, 2000);
                } else {
                    // Store the book in session storage to add after login
                    sessionStorage.setItem('pendingCartItem', JSON.stringify(book));

                    // Show login modal if not logged in
                    openModal(loginModal);

                    // Add message to login modal
                    const loginMessage = document.getElementById('loginMessage');
                    if (loginMessage) {
                        loginMessage.textContent = 'Please log in to add items to your cart.';
                        loginMessage.style.display = 'block';
                    }
                }
            });
        });
    }

    // Load more books when button is clicked
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            hasLoadedMore = true;
            displayBooks(currentlyDisplayed, booksPerPage);
        });
    }

    // Show less books when button is clicked
    if (showLessBtn) {
        showLessBtn.addEventListener('click', function() {
            // Reset to initial state (first page only)
            bookGrid.innerHTML = '';
            displayBooks(0, booksPerPage);
            hasLoadedMore = false;
            updateButtonVisibility();
        });
    }

    // Add CSS for no results message
    const style = document.createElement('style');
    style.textContent = `
        .no-results {
            text-align: center;
            padding: 30px;
            color: #666;
            font-size: 1.1rem;
            background-color: #f9f9f9;
            border-radius: 10px;
            margin: 20px 0;
        }
    `;
    document.head.appendChild(style);

    // Add event listener for clear filters button
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }

    // Initialize book display
    fetchBooks();

    // New Releases Slider Functionality
    const releasesSlides = document.querySelectorAll('.releases-slide');
    const sliderDots = document.querySelectorAll('.slider-dot');
    let currentReleaseSlide = 0;
    let releasesInterval;

    // Function to show a specific slide
    function showReleaseSlide(index) {
        // Hide all slides
        releasesSlides.forEach(slide => {
            slide.classList.remove('active');
        });

        // Remove active class from all dots
        sliderDots.forEach(dot => {
            dot.classList.remove('active');
        });

        // Show the selected slide and activate its dot
        releasesSlides[index].classList.add('active');
        sliderDots[index].classList.add('active');

        // Update current slide index
        currentReleaseSlide = index;
    }

    // Function to show the next slide
    function nextReleaseSlide() {
        let nextIndex = currentReleaseSlide + 1;
        if (nextIndex >= releasesSlides.length) {
            nextIndex = 0;
        }
        showReleaseSlide(nextIndex);
    }

    // Start automatic slideshow
    function startReleasesSlider() {
        releasesInterval = setInterval(nextReleaseSlide, 5000);
    }

    // Stop automatic slideshow
    function stopReleasesSlider() {
        clearInterval(releasesInterval);
    }

    // Add click event listeners to dots
    sliderDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showReleaseSlide(index);
            stopReleasesSlider();
            startReleasesSlider();
        });
    });

    // Start the slider if there are slides
    if (releasesSlides.length > 0) {
        startReleasesSlider();
    }

    // Book Carousel Functionality (for backward compatibility)
    const carouselSlides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    let carouselInterval;

    // Function to show a specific slide
    function showSlide(index) {
        if (carouselSlides.length === 0) return;

        // Hide all slides
        carouselSlides.forEach(slide => {
            slide.classList.remove('active');
        });

        // Remove active class from all dots
        dots.forEach(dot => {
            dot.classList.remove('active');
        });

        // Show the selected slide and activate its dot
        carouselSlides[index].classList.add('active');
        dots[index].classList.add('active');

        // Update current slide index
        currentSlide = index;
    }

    // Function to show the next slide
    function nextSlide() {
        if (carouselSlides.length === 0) return;

        let nextIndex = currentSlide + 1;
        if (nextIndex >= carouselSlides.length) {
            nextIndex = 0;
        }
        showSlide(nextIndex);
    }

    // Start automatic slideshow
    function startCarousel() {
        if (carouselSlides.length === 0) return;
        carouselInterval = setInterval(nextSlide, 5000);
    }

    // Stop automatic slideshow
    function stopCarousel() {
        clearInterval(carouselInterval);
    }

    // Add click event listeners to dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            stopCarousel();
            startCarousel();
        });
    });

    // Start the carousel if there are slides
    if (carouselSlides.length > 0) {
        startCarousel();
    }

    // Back to Top Button Functionality
    const backToTopButton = document.getElementById('back-to-top');

    // Show/hide back to top button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });

    // Scroll to top when button is clicked
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});
