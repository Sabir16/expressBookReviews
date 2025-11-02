const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;


const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    const doesExist = (username) => {

        let userswithsamename = users.filter((user) => {
            return user.username === username;
        });
        
        if (userswithsamename.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    if (username && password) {
        
        if (!doesExist(username)) {
            
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }

    return res.status(404).json({message: "Unable to register user."});

});

public_users.get('/' , async(req , res) => {
    try {

        await new Promise(resolve => setTimeout(resolve, 100));

        const booksFromAPI = books;

        if(typeof booksFromAPI !== 'object' || booksFromAPI === null) {
            throw new Error("Invalid data format from API ");
        }

        const booksArray = Object.keys(booksFromAPI).map(key => ({
            isbn : key ,
            ...booksFromAPI[key]
        }));

        res.status(200).json({
            message : "Books successfully fetched from API",
            count : booksArray.length,
            books : booksArray
        });

    } catch(error) {
        console.error("Error fetching books :" , error.message);
        res.status(500).json({
            message: "Failed to fetch books from source",
            error: error.response?.data || error.message
        });
    }
});


// Get the book list available in the shop
public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books,null,4));
});

public_users.get('/isbn/:isbn' , async (req , res ) => {
    try {
        const isbn = req.params.isbn;

        
        const booksData = await Promise.resolve(books);

        
        if (booksData[isbn]) {
            res.status(200).json({
                message: `Book with ISBN ${isbn} found`,
                book: {
                    isbn,
                    ...booksData[isbn]
                }
            });
        } else {
            res.status(404).json({
                message: "Book not found"
            });
        }

    } catch (error) {
        console.error("Error fetching book by ISBN:", error.message);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if(books[isbn]){
        res.json(books[isbn]);
    } else {
        res.status(404).json({ message: "Livre non trouvé" });
    }
}); 

public_users.get('/author/:author', async (req, res) => {
    try {
        const author = req.params.author;

        
        const booksData = await Promise.resolve(books);

        
        const booksList = Object.entries(booksData).map(([isbn, book]) => ({
            isbn,
            ...book
        }));

        
        const matchingBooks = booksList.filter(book => 
            book.author === author
        );

        
        if (matchingBooks.length > 0) {
            res.status(200).json({
                message: `Books by ${author} found`,
                count: matchingBooks.length,
                books: matchingBooks
            });
        } else {
            res.status(404).json({
                message: "No books found for this author"
            });
        }

    } catch (error) {
        console.error("Error fetching books by author:", error.message);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
});

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;

    const booksList = Object.values(books);

    const matchingbook = booksList.filter((book) => book.author === author);

    if(matchingbook.length > 0){
        res.json(matchingbook);
    }else{
        res.status(404).json({ message: "Livre non trouvé" });
    }
    
});

public_users.get('/title/:title', async (req, res) => {
    try {
        const title = req.params.title;

        
        const booksData = await Promise.resolve(books);

        
        const booksList = Object.entries(booksData).map(([isbn, book]) => ({
            isbn,
            ...book
        }));

        
        const matchingBooks = booksList.filter(book => 
            book.title === title
        );

        
        if (matchingBooks.length > 0) {
            res.status(200).json({
                message: `Books with title "${title}" found`,
                count: matchingBooks.length,
                books: matchingBooks
            });
        } else {
            res.status(404).json({
                message: "No books found with this title"
            });
        }

    } catch (error) {
        console.error("Error fetching books by title:", error.message);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    const booksList = Object.values(books);
    const matchingbook = booksList.filter((book) => book.title === title);
    if(matchingbook.length > 0 ) {
        res.json(matchingbook);
    } else {
        res.status(404).json({ message: "Livre non trouvé" });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if(books[isbn]) {
        res.json(books[isbn]);
    } else {
        res.status(404).json({ message: "Livre non trouvé" });
    }
});

module.exports.general = public_users;
