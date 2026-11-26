const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/workspaces", async (req, res) => {
    try{
        const result = await pool.query(
            "INSERT INTO workspace DEFAULT VALUES RETURNING *"
        );
        res.status(201).json(result.rows[0]);
    }catch(error){
        console.log("Error creating workspace:", error);
        res.status(500).json({error: "Failed to create workspace"});
    }
});

app.get("/api/products", async (req, res) => {
    try{

        const { workspaceId } = req.query;

        if(!workspaceId){
            return res.status(400).json({error: "Missing workspaceId query parameter"});
        }

        const result = await pool.query(
            "SELECT * FROM products WHERE workspace_id = $1 ORDER BY id ASC;",
            [workspaceId]
        );

        res.json(result.rows);

    } catch(error){
        console.log("Error fetching products:", error);
        res.status(500).json({error: "Failed to fetch products"});
    }
});

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
        const {product_name, category, price, stock, workspace_id: workspaceId} = req.body

        if (!workspaceId) {
            return res.status(400).json({
                error: "Missing workspaceId"
            });
        }

         if (!product_name?.trim() || !category?.trim() || price === undefined || price === null || price === "" || stock === undefined || stock === null || stock === ""){
            return res.status(400).json({
                error: "Missing required fields: product_name, category, price, stock, workspace_id"
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
            `INSERT INTO products (product_name, category, price, stock, workspace_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [product_name.trim(), category.trim(), productPrice, productStock, workspaceId]
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

app.post("/api/sales", async (req, res) => {
    try {
     const {id, dateTime, productName, orderPrice, quantity, subtotal , workspace_id: workspaceId} = req.body
        if (!workspaceId) {
            return res.status(400).json({
                error: "Missing workspaceId"
            });
        }

        if(
            id === undefined || !dateTime || !productName?.trim() || orderPrice === undefined || quantity === undefined || subtotal === undefined
        ){
            return res.status(400).json({
                error: "Missing required fields: id, dateTime, productName, orderPrice, quantity, subtotal"
            });
        }

        const saleId = Number(id);
        const salePrice = Number(orderPrice);
        const saleQuantity = Number(quantity);
        const saleSubtotal = Number(subtotal);
        const saleDate = new Date(dateTime);

        if (!Number.isSafeInteger(saleId) || saleId <= 0) {
            return res.status(400).json({
                error: "Sale ID must be a valid positive integer."
            });
        }

        if (!Number.isFinite(salePrice) || salePrice <= 0){
            return res.status(400).json({
                error: "Sale price must be a valid number greater than zero."
            });
        }

         if (!Number.isInteger(saleQuantity) || saleQuantity <= 0) {
            return res.status(400).json({
                error: "Quantity must be a positive whole number."
            });
        }

        if (!Number.isFinite(saleSubtotal) || saleSubtotal < 0) {
            return res.status(400).json({
                error: "Invalid subtotal."
            });
        }

        if (Number.isNaN(saleDate.getTime())) {
            return res.status(400).json({
                error: "Invalid sale date."
            });
        }

        const result = await pool.query(
            `INSERT INTO sales (id, workspace_id, date_time, product_name, order_price, quantity, subtotal) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,[
                saleId,
                workspaceId,
                saleDate,
                productName.trim(),
                salePrice,
                saleQuantity,
                saleSubtotal
            ]
        );

        res.status(200).json({
            message: "Sale added successfully",
            sale: result.rows[0]
        });

    }catch(error){
        console.log("Error adding sale:", error);
        res.status(500).json({error: "Failed to add sale"});
    }
});

app.get("/api/sales", async (req, res) => {
    try{
        const { workspaceId } = req.query;

        if(!workspaceId){
            return res.status(400).json({error: "Missing workspaceId query parameter"});
        }
        const result = await pool.query(
            `SELECT * FROM sales WHERE workspace_id = $1 ORDER BY date_time DESC`,
            [workspaceId]
        );
        res.json(result.rows);
    }catch(error){
        console.log("Error fetching sales:", error);

        res.status(500).json({error: "Failed to fetch sales"});
    }
});

app.get("/api/balances", async (req, res) => {
    try {
        const { workspaceId } = req.query;

        if (!workspaceId) {
            return res.status(400).json({
                error: "Missing workspaceId"
            });
        }

        const result = await pool.query(
            `SELECT
                cb.id,
                cb.workspace_id,
                cb.customer_name,
                cb.product_name,
                cb.date_time,
                cb.original_amount,
                cb.remaining_balance,
                COALESCE(
                    (
                        SELECT json_agg(
                            json_build_object(
                                'amount', bp.amount,
                                'dateTime', bp.date_time
                            )
                            ORDER BY bp.date_time ASC
                        )
                        FROM balance_payments bp
                        WHERE bp.balance_id = cb.id
                    ),
                    '[]'::json
                ) AS payments
            FROM customer_balances cb
            WHERE cb.workspace_id = $1
            ORDER BY cb.date_time DESC`,
            [workspaceId]
        );

        res.json(result.rows);

    } catch (error) {
        console.log("Error fetching customer balances:", error);

        res.status(500).json({
            error: "Failed to fetch customer balances"
        });
    }
});

app.post("/api/balances", async (req, res) => {
    try{
        const{
            id,
            customerName,
            productName,
            dateTime,
            originalAmount,
            workspace_id: workspaceId
        } = req.body;
        if(!workspaceId){
            return res.status(400).json({
                error: "Missing workspaceId"
            });
        }
        const balanceId = Number(id);
        const amount = Number(originalAmount);
        const balanceDate = new Date(dateTime);
        if (
            !Number.isSafeInteger(balanceId) ||
            balanceId <= 0 ||
            !customerName?.trim() ||
            !productName?.trim() ||
            !Number.isFinite(amount) ||
            amount <= 0 ||
            Number.isNaN(balanceDate.getTime())
        ){
            return res.status(400).json({
                error: "Invalid input data for creating customer balance."
            });
        }
        const result = await pool.query(
            `INSERT INTO customer_balances (id, workspace_id, customer_name, product_name, date_time, original_amount, remaining_balance) VALUES ($1, $2, $3, $4, $5, $6, $6) RETURNING *`, [balanceId, workspaceId, customerName.trim(), productName.trim(), balanceDate, amount]
        )
        res.json(result.rows[0]);
    } catch (error) {
        console.log("Error creating customer balance:", error);
        res.status(500).json({
            error: "Failed to create customer balance"
        });
    }
});

app.post("/api/balances/:id/payments", async (req, res) => {
    const client = await pool.connect();

    try{
        const {id} = req.params;
        const {
            amount,
            dateTime,
            workspace_id: workspaceId
        } = req.body;

        const paymentAmount = Number(amount);
        const paymentDate = new Date(dateTime);

        if(!workspaceId){
            return res.status(400).json({
                error: "Missing workspaceId"
            });
        }
        if(
            !Number.isFinite(paymentAmount) || paymentAmount <= 0 ||
            Number.isNaN(paymentDate.getTime())
        ){
            return res.status(400).json({
                error: "Invalid payment amount or date."
            });
        }
        await client.query("BEGIN");

        const balanceResult = await client.query(
            `SELECT remaining_balance
            FROM customer_balances
            WHERE id = $1 AND workspace_id = $2 FOR UPDATE`,
            [id, workspaceId]
        );
        if(balanceResult.rows.length === 0){
            await client.query("ROLLBACK");

            return res.status(404).json({
                error: "Customer balance not found"
            });
        }
        const remainingBalance = Number(balanceResult.rows[0].remaining_balance);

        if(paymentAmount > remainingBalance){
            await client.query("ROLLBACK");

            return res.status(400).json({
                error: "Payment amount exceeds remaining balance."
            });
        }
        const updatedBalance = Math.max(0, Math.round((remainingBalance - paymentAmount) * 100) / 100);

        const paymentResult = await client.query(
            `INSERT INTO balance_payments
            (balance_id, amount, date_time)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [id, paymentAmount, paymentDate]
        );


            await client.query(
            `UPDATE customer_balances
            SET remaining_balance = $1
            WHERE id = $2 AND workspace_id = $3`,
            [updatedBalance, id, workspaceId]
        );

        await client.query("COMMIT");

        res.status(201).json({
            message: "Payment recorded successfully.",
            payment: paymentResult.rows[0],
            remainingBalance: updatedBalance
        });
    }catch(error){
        await client.query ("ROLLBACK");

        console.log("Error recording payment:", error);
        res.status(500).json({
            error: "Failed to record payment"
        });
    }finally{
        client.release();
    }
});


app.delete("/api/balances/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { workspaceId } = req.query;

        if (!workspaceId) {
            return res.status(400).json({
                error: "Missing workspaceId"
            });
        }

        const result = await pool.query(
            `DELETE FROM customer_balances
            WHERE id = $1 AND workspace_id = $2
            RETURNING *`,
            [id, workspaceId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Customer balance not found."
            });
        }

        res.json({
            message: "Customer balance deleted successfully.",
            balance: result.rows[0]
        });

    } catch (error) {
        console.log("Error deleting customer balance:", error);

        res.status(500).json({
            error: "Failed to delete customer balance."
        });
    }
});

app.put("/api/sales/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const {
            dateTime,
            productName,
            orderPrice,
            quantity,
            subtotal,
            workspace_id: workspaceId
        } = req.body;

        if (!workspaceId) {
            return res.status(400).json({
                error: "Missing workspaceId"
            });
        }

        if (
            !dateTime ||
            !productName?.trim() ||
            orderPrice === undefined ||
            quantity === undefined ||
            subtotal === undefined
        ) {
            return res.status(400).json({
                error: "Missing required sales fields."
            });
        }

        const salePrice = Number(orderPrice);
        const saleQuantity = Number(quantity);
        const saleSubtotal = Number(subtotal);
        const saleDate = new Date(dateTime);

        if (!Number.isFinite(salePrice) || salePrice < 0) {
            return res.status(400).json({ error: "Invalid order price." });
        }

        if (!Number.isInteger(saleQuantity) || saleQuantity <= 0) {
            return res.status(400).json({ error: "Invalid quantity." });
        }

        if (!Number.isFinite(saleSubtotal) || saleSubtotal < 0) {
            return res.status(400).json({ error: "Invalid subtotal." });
        }

        if (Number.isNaN(saleDate.getTime())) {
            return res.status(400).json({ error: "Invalid sale date." });
        }

        const result = await pool.query(
            `UPDATE sales
            SET date_time = $1,
                product_name = $2,
                order_price = $3,
                quantity = $4,
                subtotal = $5
            WHERE id = $6 AND workspace_id = $7
            RETURNING *`,
            [
                saleDate,
                productName.trim(),
                salePrice,
                saleQuantity,
                saleSubtotal,
                id,
                workspaceId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Sale not found"
            });
        }

        res.json({
            message: "Sale updated successfully",
            sale: result.rows[0]
        });

    } catch (error) {
        console.log("Error updating sale:", error);
        res.status(500).json({
            error: "Failed to update sale"
        });
    }
});

app.delete("/api/sales/:id", async (req, res) => {
    try{
        const { id } = req.params;
        const { workspaceId } = req.query;

        if(!workspaceId){
            return res.status(400).json({
                error: "Missing workspaceId query parameter"
            });
        }
        const result = await pool.query(
            `DELETE FROM sales WHERE id = $1 AND workspace_id = $2 RETURNING *`,
            [id, workspaceId]
        );
        if(result.rows.length === 0){
            return res.status(404).json({
                error: "Sale not found"
            });
        }
        res.json({
            message: "Sale deleted successfully",
            sale: result.rows[0]
        });
    }catch(error){
        console.log("Error deleting sale:", error);
        res.status(500).json({
            error: "Failed to delete sale"
        });
    }
})

app.put("/api/products/:id", async (req, res) => {
    try{
        const {id} = req.params;
        const {product_name, category, price, stock, workspace_id: workspaceId} = req.body;

        if (!workspaceId) {
            return res.status(400).json({
                error: "Missing workspaceId"
            });
        }

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
            WHERE id = $6 AND workspace_id = $7
            RETURNING *`,
            [product_name.trim(), category.trim(), productPrice, stock !== undefined,
                stock === undefined ? null : Number(stock) ,id, workspaceId]
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
        const {workspaceId} = req.query;

        if (!workspaceId) {
            return res.status(400).json({
                error: "Missing workspaceId"
            });
        }

        const result = await pool.query(
            "DELETE FROM products WHERE id = $1 AND workspace_id = $2 RETURNING *",
            [id, workspaceId]
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

