const express = require('express');
const router = express.Router();

let books = [
    { 
        id: 1, 
        title: '1984', 
        author: 'George Orwell', 
        year: 1949,
        isbn: '978-0-452-28423-4',
        genre: 'Dystopian Fiction',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    { 
        id: 2, 
        title: 'To Kill a Mockingbird', 
        author: 'Harper Lee', 
        year: 1960,
        isbn: '978-0-06-112008-4',
        genre: 'Southern Gothic',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    { 
        id: 3, 
        title: 'The Great Gatsby', 
        author: 'F. Scott Fitzgerald', 
        year: 1925,
        isbn: '978-0-7432-7356-5',
        genre: 'American Literature',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

const generateNewId = () => {
    return books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;
};

const validateBookInput = (req, res, next) => {
    const { title, author, year, isbn, genre } = req.body;
    const errors = [];

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        errors.push('Title is required and must be a non-empty string');
    }

    if (!author || typeof author !== 'string' || author.trim().length === 0) {
        errors.push('Author is required and must be a non-empty string');
    }

    if (year !== undefined) {
        const currentYear = new Date().getFullYear();
        if (!Number.isInteger(year) || year < 1000 || year > currentYear) {
            errors.push(`Year must be a valid year between 1000 and ${currentYear}`);
        }
    }

    if (isbn !== undefined && isbn !== null) {
        const isbnRegex = /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/;
        if (typeof isbn !== 'string' || !isbnRegex.test(isbn.replace(/[- ]/g, ''))) {
            errors.push('ISBN must be in valid format');
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'Invalid input data',
            details: errors,
            timestamp: new Date().toISOString()
        });
    }

    next();
};

router.get('/', (req, res) => {
    try {
        let filteredBooks = [...books];
        
        if (req.query.author) {
            filteredBooks = filteredBooks.filter(book => 
                book.author.toLowerCase().includes(req.query.author.toLowerCase())
            );
        }
        
        if (req.query.genre) {
            filteredBooks = filteredBooks.filter(book => 
                book.genre && book.genre.toLowerCase().includes(req.query.genre.toLowerCase())
            );
        }
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        
        const paginatedBooks = filteredBooks.slice(startIndex, endIndex);
        
        res.json({
            data: paginatedBooks,
            pagination: {
                current_page: page,
                per_page: limit,
                total: filteredBooks.length,
                total_pages: Math.ceil(filteredBooks.length / limit)
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
});

router.get('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Book ID must be a valid number',
                timestamp: new Date().toISOString()
            });
        }
        
        const book = books.find(b => b.id === id);
        
        if (!book) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Book with ID ${id} not found`,
                timestamp: new Date().toISOString()
            });
        }
        
        res.json({
            data: book,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
});

router.post('/', validateBookInput, (req, res) => {
    try {
        const { title, author, year, isbn, genre } = req.body;
        
        if (isbn && books.some(book => book.isbn === isbn)) {
            return res.status(409).json({
                error: 'Conflict',
                message: 'A book with this ISBN already exists',
                timestamp: new Date().toISOString()
            });
        }
        
        const newBook = {
            id: generateNewId(),
            title: title.trim(),
            author: author.trim(),
            year: year || null,
            isbn: isbn || null,
            genre: genre || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        books.push(newBook);
        
        res.status(201).json({
            message: 'Book created successfully',
            data: newBook,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
});

router.put('/:id', validateBookInput, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Book ID must be a valid number',
                timestamp: new Date().toISOString()
            });
        }
        
        const bookIndex = books.findIndex(b => b.id === id);
        
        if (bookIndex === -1) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Book with ID ${id} not found`,
                timestamp: new Date().toISOString()
            });
        }
        
        const { title, author, year, isbn, genre } = req.body;
        
        if (isbn && books.some(book => book.isbn === isbn && book.id !== id)) {
            return res.status(409).json({
                error: 'Conflict',
                message: 'A book with this ISBN already exists',
                timestamp: new Date().toISOString()
            });
        }
        
        books[bookIndex] = {
            ...books[bookIndex],
            title: title.trim(),
            author: author.trim(),
            year: year || books[bookIndex].year,
            isbn: isbn || books[bookIndex].isbn,
            genre: genre || books[bookIndex].genre,
            updatedAt: new Date().toISOString()
        };
        
        res.json({
            message: 'Book updated successfully',
            data: books[bookIndex],
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
});

router.patch('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Book ID must be a valid number',
                timestamp: new Date().toISOString()
            });
        }
        
        const bookIndex = books.findIndex(b => b.id === id);
        
        if (bookIndex === -1) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Book with ID ${id} not found`,
                timestamp: new Date().toISOString()
            });
        }
        
        const { title, author, year, isbn, genre } = req.body;
        const updates = {};
        
        if (title !== undefined) {
            if (typeof title !== 'string' || title.trim().length === 0) {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: 'Title must be a non-empty string',
                    timestamp: new Date().toISOString()
                });
            }
            updates.title = title.trim();
        }
        
        if (author !== undefined) {
            if (typeof author !== 'string' || author.trim().length === 0) {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: 'Author must be a non-empty string',
                    timestamp: new Date().toISOString()
                });
            }
            updates.author = author.trim();
        }
        
        if (year !== undefined) {
            const currentYear = new Date().getFullYear();
            if (!Number.isInteger(year) || year < 1000 || year > currentYear) {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: `Year must be a valid year between 1000 and ${currentYear}`,
                    timestamp: new Date().toISOString()
                });
            }
            updates.year = year;
        }
        
        if (isbn !== undefined) {
            if (isbn && books.some(book => book.isbn === isbn && book.id !== id)) {
                return res.status(409).json({
                    error: 'Conflict',
                    message: 'A book with this ISBN already exists',
                    timestamp: new Date().toISOString()
                });
            }
            updates.isbn = isbn;
        }
        
        if (genre !== undefined) {
            updates.genre = genre;
        }
        
        books[bookIndex] = {
            ...books[bookIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        res.json({
            message: 'Book updated successfully',
            data: books[bookIndex],
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Book ID must be a valid number',
                timestamp: new Date().toISOString()
            });
        }
        
        const bookIndex = books.findIndex(b => b.id === id);
        
        if (bookIndex === -1) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Book with ID ${id} not found`,
                timestamp: new Date().toISOString()
            });
        }
        
        const deletedBook = books.splice(bookIndex, 1)[0];
        
        res.json({
            message: 'Book deleted successfully',
            data: deletedBook,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
});

router.delete('/', (req, res) => {
    try {
        const deletedCount = books.length;
        books.length = 0; // Clear array
        
        res.json({
            message: `Successfully deleted ${deletedCount} books`,
            count: deletedCount,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;