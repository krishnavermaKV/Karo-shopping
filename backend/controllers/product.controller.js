
const pool = require("../config/db");

// ========================================
// ADD NEW PRODUCT
// ========================================

exports.addProduct = async (req, res) => {
    const client = await pool.connect();

    try {
        const { name, price, quantity, category_id } = req.body;

        if (
            typeof name !== "string" ||
            !name.trim() ||
            !Number.isFinite(price) ||
            price < 0 ||
            !Number.isInteger(quantity) ||
            quantity < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid name, price and quantity are required"
            });
        }

        await client.query("BEGIN");

        const existing = await client.query(
            `SELECT id FROM products
             WHERE LOWER(name) = LOWER($1)`,
            [name.trim()]
        );

        if (existing.rows.length > 0) {
            await client.query("ROLLBACK");

            return res.status(409).json({
                success: false,
                message: "Product already exists. Use stock update API."
            });
        }

        const result = await client.query(
            `INSERT INTO products
             (name, price, quantity, category_id)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [
                name.trim(),
                price,
                quantity,
                category_id || null
            ]
        );

        const product = result.rows[0];

        if (quantity > 0) {
            await client.query(
                `INSERT INTO stock_movements
                 (product_id, change_quantity, movement_type, notes)
                 VALUES ($1, $2, 'adjustment', $3)`,
                [
                    product.id,
                    quantity,
                    "Initial stock"
                ]
            );
        }

        await client.query("COMMIT");

        res.status(201).json({
            success: true,
            message: "Product added successfully",
            product
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Add product error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to add product"
        });

    } finally {
        client.release();
    }
};


// ========================================
// INCREASE PRODUCT STOCK
// ========================================

exports.increaseStock = async (req, res) => {
    const client = await pool.connect();

    try {
        const productId = Number(req.params.id);
        const { quantity, notes } = req.body;

        if (
            !Number.isInteger(productId) ||
            productId <= 0 ||
            !Number.isInteger(quantity) ||
            quantity <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid product ID and positive quantity required"
            });
        }

        await client.query("BEGIN");

        const result = await client.query(
            `UPDATE products
             SET quantity = quantity + $1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING *`,
            [quantity, productId]
        );

        if (result.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const product = result.rows[0];

        await client.query(
            `INSERT INTO stock_movements
             (product_id, change_quantity, movement_type, notes)
             VALUES ($1, $2, 'purchase', $3)`,
            [
                productId,
                quantity,
                notes || "New stock received"
            ]
        );

        await client.query("COMMIT");

        res.json({
            success: true,
            message: "Stock increased successfully",
            added_quantity: quantity,
            product
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Stock update error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update stock"
        });

    } finally {
        client.release();
    }
};


// ========================================
// GET ALL PRODUCTS WITH FILTERS
// ========================================

exports.getProducts = async (req, res) => {
    try {
        const {
            search,
            category,
            minPrice,
            maxPrice,
            lowStock,
            page = 1,
            limit = 20
        } = req.query;

        const currentPage = Number(page);
        const pageSize = Number(limit);

        if (
            !Number.isInteger(currentPage) ||
            currentPage < 1 ||
            !Number.isInteger(pageSize) ||
            pageSize < 1 ||
            pageSize > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid pagination values"
            });
        }

        const conditions = [];
        const values = [];

        const addCondition = (condition, value) => {
            values.push(value);
            conditions.push(
                condition.replace("?", `$${values.length}`)
            );
        };

        if (search) {
            addCondition(
                "name ILIKE ?",
                `%${search.trim()}%`
            );
        }

        if (category) {
            const categoryId = Number(category);

            if (!Number.isInteger(categoryId) || categoryId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID"
                });
            }

            addCondition("category_id = ?", categoryId);
        }

        if (minPrice !== undefined) {
            const min = Number(minPrice);

            if (!Number.isFinite(min) || min < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid minimum price"
                });
            }

            addCondition("price >= ?", min);
        }

        if (maxPrice !== undefined) {
            const max = Number(maxPrice);

            if (!Number.isFinite(max) || max < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid maximum price"
                });
            }

            addCondition("price <= ?", max);
        }

        if (
            minPrice !== undefined &&
            maxPrice !== undefined &&
            Number(minPrice) > Number(maxPrice)
        ) {
            return res.status(400).json({
                success: false,
                message: "minPrice cannot exceed maxPrice"
            });
        }

        if (lowStock === "true") {
            conditions.push("quantity <= 10");
        }

        const whereClause = conditions.length
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

        const countResult = await pool.query(
            `SELECT COUNT(*)::int AS total
             FROM products ${whereClause}`,
            values
        );

        const total = countResult.rows[0].total;

        const offset = (currentPage - 1) * pageSize;

        const result = await pool.query(
            `SELECT p.*, c.name AS category_name
             FROM products p
             LEFT JOIN categories c ON c.id = p.category_id
             ${whereClause}
             ORDER BY p.name ASC
             LIMIT $${values.length + 1}
             OFFSET $${values.length + 2}`,
            [...values, pageSize, offset]
        );

        res.json({
            success: true,
            total,
            page: currentPage,
            limit: pageSize,
            totalPages: Math.ceil(total / pageSize),
            products: result.rows
        });

    } catch (error) {
        console.error("Get products error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch products"
        });
    }
};


// ========================================
// GET PRODUCT BY ID
// ========================================

exports.getProductById = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const result = await pool.query(
            `SELECT p.*, c.name AS category_name
             FROM products p
             LEFT JOIN categories c ON c.id = p.category_id
             WHERE p.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.json({
            success: true,
            product: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch product"
        });
    }
};


// ========================================
// UPDATE PRODUCT DETAILS
// ========================================

exports.updateProduct = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, price, category_id } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        if (
            name === undefined &&
            price === undefined &&
            category_id === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Provide at least one field to update"
            });
        }

        if (
            name !== undefined &&
            (typeof name !== "string" || !name.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product name"
            });
        }

        if (
            price !== undefined &&
            (!Number.isFinite(price) || price < 0)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid price"
            });
        }

        const fields = [];
        const values = [];

        if (name !== undefined) {
            values.push(name.trim());
            fields.push(`name = $${values.length}`);
        }

        if (price !== undefined) {
            values.push(price);
            fields.push(`price = $${values.length}`);
        }

        if (category_id !== undefined) {
            values.push(category_id);
            fields.push(`category_id = $${values.length}`);
        }

        fields.push("updated_at = CURRENT_TIMESTAMP");
        values.push(id);

        const result = await pool.query(
            `UPDATE products
             SET ${fields.join(", ")}
             WHERE id = $${values.length}
             RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.json({
            success: true,
            message: "Product updated successfully",
            product: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update product"
        });
    }
};


// ========================================
// GET STOCK HISTORY
// ========================================

exports.getStockHistory = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const result = await pool.query(
            `SELECT * FROM stock_movements
             WHERE product_id = $1
             ORDER BY created_at DESC`,
            [id]
        );

        res.json({
            success: true,
            history: result.rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch stock history"
        });
    }
};
