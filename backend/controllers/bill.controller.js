
const pool = require("../config/db");
const crypto = require("crypto");

// ========================================
// GENERATE BILL
// ========================================

exports.createBill = async (req, res) => {
    const client = await pool.connect();

    try {
        const {
            customer_name,
            items,
            discount = 0
        } = req.body;

        if (
            !Array.isArray(items) ||
            items.length === 0 ||
            items.length > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Select at least one product"
            });
        }

        if (
            !Number.isFinite(discount) ||
            discount < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid discount"
            });
        }

        if (
            customer_name !== undefined &&
            (
                typeof customer_name !== "string" ||
                customer_name.length > 150
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid customer name"
            });
        }

        // Validate and combine duplicate product IDs
        const itemMap = new Map();

        for (const item of items) {
            const productId = Number(item.product_id);
            const quantity = item.quantity;

            if (
                !Number.isInteger(productId) ||
                productId <= 0 ||
                !Number.isInteger(quantity) ||
                quantity <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product ID or quantity"
                });
            }

            itemMap.set(
                productId,
                (itemMap.get(productId) || 0) + quantity
            );
        }

        const productIds = [...itemMap.keys()];

        await client.query("BEGIN");

        // Lock products to prevent simultaneous overselling
        const productsResult = await client.query(
            `SELECT id, name, price, quantity
             FROM products
             WHERE id = ANY($1::int[])
             ORDER BY id
             FOR UPDATE`,
            [productIds]
        );

        const products = productsResult.rows;

        if (products.length !== productIds.length) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "One or more products were not found"
            });
        }

        // Check stock availability
        for (const product of products) {
            const requestedQuantity = itemMap.get(product.id);

            if (product.quantity < requestedQuantity) {
                await client.query("ROLLBACK");

                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`,
                    available: product.quantity,
                    requested: requestedQuantity
                });
            }
        }

        // Calculate using paise (integer arithmetic)
        let subtotalPaise = 0;

        const billItems = products.map(product => {
            const quantity = itemMap.get(product.id);

            const pricePaise = Math.round(
                Number(product.price) * 100
            );

            const lineTotalPaise = pricePaise * quantity;

            subtotalPaise += lineTotalPaise;

            return {
                product_id: product.id,
                product_name: product.name,
                quantity,
                unit_price: product.price,
                line_total: (lineTotalPaise / 100).toFixed(2)
            };
        });

        const discountPaise = Math.round(discount * 100);

        if (discountPaise > subtotalPaise) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                success: false,
                message: "Discount cannot exceed subtotal"
            });
        }

        const totalPaise = subtotalPaise - discountPaise;

        const subtotal = (subtotalPaise / 100).toFixed(2);
        const finalDiscount = (discountPaise / 100).toFixed(2);
        const totalAmount = (totalPaise / 100).toFixed(2);

        const billNumber =
            `BILL-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;

        // Create bill
        const billResult = await client.query(
            `INSERT INTO bills
             (
                bill_number,
                customer_name,
                subtotal,
                discount,
                total_amount,
                created_by
             )
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [
                billNumber,
                customer_name?.trim() || null,
                subtotal,
                finalDiscount,
                totalAmount,
                req.admin.id
            ]
        );

        const bill = billResult.rows[0];

        // Save bill items and update stock
        for (const item of billItems) {

            await client.query(
                `INSERT INTO bill_items
                 (
                    bill_id,
                    product_id,
                    product_name,
                    quantity,
                    unit_price,
                    line_total
                 )
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    bill.id,
                    item.product_id,
                    item.product_name,
                    item.quantity,
                    item.unit_price,
                    item.line_total
                ]
            );

            await client.query(
                `UPDATE products
                 SET quantity = quantity - $1,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $2`,
                [item.quantity, item.product_id]
            );

            await client.query(
                `INSERT INTO stock_movements
                 (
                    product_id,
                    change_quantity,
                    movement_type,
                    reference_id,
                    notes
                 )
                 VALUES ($1, $2, 'sale', $3, $4)`,
                [
                    item.product_id,
                    -item.quantity,
                    bill.id,
                    `Sale through bill ${bill.bill_number}`
                ]
            );
        }

        await client.query("COMMIT");

        res.status(201).json({
            success: true,
            message: "Bill generated successfully",

            bill: {
                ...bill,
                items: billItems
            }
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Bill generation error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to generate bill"
        });

    } finally {
        client.release();
    }
};


// ========================================
// GET ALL BILLS
// ========================================

exports.getAllBills = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                b.*,
                a.username AS admin_name,
                COUNT(bi.id)::int AS total_products
             FROM bills b
             LEFT JOIN admins a ON a.id = b.created_by
             LEFT JOIN bill_items bi ON bi.bill_id = b.id
             GROUP BY b.id, a.username
             ORDER BY b.created_at DESC`
        );

        res.json({
            success: true,
            total: result.rows.length,
            bills: result.rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch bills"
        });
    }
};


// ========================================
// GET BILL DETAILS
// ========================================

exports.getBillById = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid bill ID"
            });
        }

        const billResult = await pool.query(
            `SELECT b.*, a.username AS admin_name
             FROM bills b
             LEFT JOIN admins a ON a.id = b.created_by
             WHERE b.id = $1`,
            [id]
        );

        if (billResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Bill not found"
            });
        }

        const itemsResult = await pool.query(
            `SELECT *
             FROM bill_items
             WHERE bill_id = $1
             ORDER BY id`,
            [id]
        );

        res.json({
            success: true,
            bill: {
                ...billResult.rows[0],
                items: itemsResult.rows
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch bill"
        });
    }
};
