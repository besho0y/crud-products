const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json()); // Parse JSON request bodies

// MySQL Database connection setup
const db = mysql.createConnection({
    host: "localhost",  // Database host (default is localhost for local MySQL)
    user: "root",       // MySQL username
    password: "",       // MySQL password
    database: "products" // Database name (ensure this exists)
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
        process.exit(1); // Exit the server if database connection fails
    }
    console.log("Connected to the database");
});

// One-time database setup: Create table if it doesn't exist
const setupDatabase = () => {
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS product (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            taxes DECIMAL(10, 2) NOT NULL,
            ads DECIMAL(10, 2) NOT NULL,
            discount DECIMAL(10, 2) NOT NULL,
            total DECIMAL(10, 2) NOT NULL,
            category VARCHAR(100) NOT NULL
        )
    `;
    
    // Create the table if it does not exist
    db.query(createTableSQL, (err) => {
        if (err) {
            console.error("Failed to create or verify table:", err.message);
        } else {
            console.log("Table created successfully or already exists.");
        }
    });

    // Ensure `AUTO_INCREMENT` is set for `id`
    const modifyIdColumnSQL = `
        ALTER TABLE product MODIFY id INT NOT NULL AUTO_INCREMENT;
    `;
    db.query(modifyIdColumnSQL, (err) => {
        if (err) {
            console.error("Failed to modify `id` column for AUTO_INCREMENT:", err.message);
        } else {
            console.log("`id` column modified to AUTO_INCREMENT successfully.");
        }
    });

    // Reset `AUTO_INCREMENT` counter to avoid duplicate errors
    const resetAutoIncrementSQL = `
        ALTER TABLE product AUTO_INCREMENT = 1;
    `;
    db.query(resetAutoIncrementSQL, (err) => {
        if (err) {
            console.error("Failed to reset AUTO_INCREMENT counter:", err.message);
        } else {
            console.log("AUTO_INCREMENT counter reset successfully.");
        }
    });

    // Optional: Remove any invalid `id` rows (e.g., `id = 0`)
    const cleanInvalidRowsSQL = `
        DELETE FROM product WHERE id = 0;
    `;
    db.query(cleanInvalidRowsSQL, (err) => {
        if (err) {
            console.error("Failed to remove rows with invalid `id`:", err.message);
        } else {
            console.log("Rows with invalid `id` removed successfully.");
        }
    });
};


// Run the database setup
setupDatabase();

// Test route
app.get("/", (req, res) => {
    res.json({ message: "Backend is running" });
});

// Fetch all products
app.get("/product", (req, res) => {
    const sql = "SELECT * FROM product";
    db.query(sql, (err, data) => {
        if (err) {
            console.error("SQL Error:", err.message);
            return res.status(500).json({ error: "Failed to fetch products" });
        }
        res.json(data);
    });
});

// Create a new product
app.post("/product", (req, res) => {
    const { title, price, taxes, ads, discount, total, category } = req.body;
    const sql = `INSERT INTO product (title, price, taxes, ads, discount, total, category) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [title, price, taxes, ads, discount, total, category], (err, result) => {
        if (err) {
            console.error("SQL Error:", err.message);
            return res.status(500).json({ error: "Failed to save product" });
        }
        res.status(201).json({ message: "Product saved successfully", result });
    });
});

// Update a product
app.put("/product/:id", (req, res) => {
    const { id } = req.params;
    const { title, price, taxes, ads, discount, total, category } = req.body;
    const sql = `
        UPDATE product 
        SET title = ?, price = ?, taxes = ?, ads = ?, discount = ?, total = ?, category = ? 
        WHERE id = ?
    `;
    db.query(sql, [title, price, taxes, ads, discount, total, category, id], (err, result) => {
        if (err) {
            console.error("SQL Error:", err.message);
            return res.status(500).json({ error: "Failed to update product" });
        }
        res.json({ message: "Product updated successfully", result });
    });
});

// Delete a product
app.delete("/product/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM product WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("SQL Error:", err.message);
            return res.status(500).json({ error: "Failed to delete product" });
        }
        res.json({ message: "Product deleted successfully", result });
    });
});

// Start the server
const PORT = 8082;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
