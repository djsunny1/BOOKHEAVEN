const fs = require('fs');

// Read the books.json file
const booksData = fs.readFileSync('./backend/database/books.json', 'utf8');
const books = JSON.parse(booksData);

// Update each book to have only one category
const updatedBooks = books.map(book => {
    // If categories is already a string, keep it as is
    if (typeof book.categories === 'string') {
        return book;
    }
    
    // If categories is an array, take the first category
    if (Array.isArray(book.categories)) {
        return {
            ...book,
            categories: book.categories[0]
        };
    }
    
    // If categories is undefined or something else, set it to "General"
    return {
        ...book,
        categories: "General"
    };
});

// Write the updated books back to the file
fs.writeFileSync('./backend/database/books.json', JSON.stringify(updatedBooks, null, 2));

console.log('Books updated successfully!');
