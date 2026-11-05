const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/products", async (req, res) => {
    try{
        const result = await pool.query(
            "SELECT * FROM products ORDER BY id ASC"
        );
        res.json(result.rows);
    }catch(error){
        console.error("Error fetching products:", error);
        res.status(500).json({error: "Failed to fetch products"});
    }
})

app.get("/api/test-db", async (req, res) => {
    try{
        const result = await pool.query("SELECT NOW()");
        res.json({
            message: "Database connection successful",
            time: result.rows[0].now
        });
    }catch (error){
        console.error(error);
        res.status(500).json({error: "Database connection failed"});
    }
});
 
app.post("/api/products", async (req, res) => {
    try{
        const {product_name, category, price, stock} = req.body

         if (!product_name?.trim() || !category?.trim() || price === undefined || price === null || price === "" || stock === undefined || stock === null || stock === ""){
            return res.status(400).json({
                error: "Missing required fields: product_name, category, price, stock"
            });
        }
        const productPrice = Number(price);
        const productStock = Number(stock);

        if(!Number.isFinite(productPrice) || productPrice <= 0){
            return res.status(400).json({
                error: "Price must be a valid number greater than zero."
            });
        }
        if(!Number.isFinite(productStock) || productStock < 0){
            return res.status(400).json({
                error: "Stock must be a valid number greater than or equal to zero."
            });
        }
        const result = await pool.query(
            `INSERT INTO products (product_name, category, price, stock) VALUES ($1, $2, $3, $4) RETURNING *`,
            [product_name.trim(), category.trim(), productPrice, productStock]
        );
        res.status(201).json({
            message: "Product added successfully",
            product: result.rows[0]
        });
    }catch(error){
        console.log("Error adding product:", error);
        res.status(500).json({error: "Failed to add product"});
    }
});

app.put("/api/products/:id", async (req, res) => {
    try{
        const {id} = req.params;
        const {product_name, category, price, stock = 0} = req.body;
        
        if (!product_name?.trim() || !category?.trim() || price === undefined || price === null || price === "") {
            return res.status(400).json({
                error: "Missing required fields: product_name, category, price"
            });
        }
        const productPrice = Number(price);

        if(!Number.isFinite(productPrice) || productPrice <= 0){
            return res.status(400).json({
                error: "Price must be a valid number greater than zero."
            });
        }

        if (
            stock !== undefined &&
            (!Number.isInteger(Number(stock)) || Number(stock) < 0)
        ) {
            return res.status(400).json({
                error: "Stock must be a non-negative whole number."
            });
        }


        const result = await pool.query(
            `UPDATE products 
            SET product_name = $1,
            category = $2,
            price = $3,
            stock = CASE WHEN $4::boolean THEN $5 ELSE stock END,
            updated_at = CURRENT_TIMESTAMP
            WHERE id = $6
            RETURNING *`,
            [product_name.trim(), category.trim(), productPrice, stock !== undefined, 
                stock === undefined ? null : Number(stock) ,id]
        );
        
        if(result.rows.length === 0){
            return res.status(404).json({error: "Product not found"});
        }
        res.json({
            message: "Product updated successfully",
            product: result.rows[0]
        });
    }catch(error){
        console.log("Error updating product:", error);
        res.status(500).json({error: "Failed to update product"});
    }
});

app.delete("/api/products/:id", async (req, res) => {
    try{
        const {id} = req.params;

        const result = await pool.query(
            "DELETE FROM products WHERE id = $1 RETURNING *",
            [id]
        );
        if(result.rows.length === 0){
            return res.status(404).json({error: "Product not found"});
        }
        res.json({
            message: "Product deleted successfully",
            product: result.rows[0]
        });
    }catch(error){
        console.log("Error deleting product:", error);
        res.status(500).json({error: "Failed to delete product"});
    }
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

