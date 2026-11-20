
-- =========================================
-- SHOP INVENTORY MANAGEMENT DATABASE
-- =========================================

-- 1. Categories
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    category_id INTEGER REFERENCES categories(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Purchase Orders
CREATE TABLE IF NOT EXISTS purchase_orders (
    id SERIAL PRIMARY KEY,
    supplier_name VARCHAR(150),
    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'partially_received',
                'received',
                'cancelled'
            )
        ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Purchase Order Items
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL
        REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL
        REFERENCES products(id),
    ordered_quantity INTEGER NOT NULL
        CHECK (ordered_quantity > 0),
    received_quantity INTEGER NOT NULL DEFAULT 0
        CHECK (
            received_quantity >= 0
            AND received_quantity <= ordered_quantity
        ),
    unit_price NUMERIC(10, 2) NOT NULL
        CHECK (unit_price >= 0)
);

-- 5. Stock Movements
CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL
        REFERENCES products(id),
    change_quantity INTEGER NOT NULL
        CHECK (change_quantity <> 0),
    movement_type VARCHAR(30) NOT NULL
        CHECK (
            movement_type IN (
                'purchase',
                'sale',
                'adjustment'
            )
        ),
    reference_id INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- INDEXES
-- =========================================

CREATE INDEX IF NOT EXISTS idx_products_name
ON products(name);

CREATE INDEX IF NOT EXISTS idx_products_category
ON products(category_id);

CREATE INDEX IF NOT EXISTS idx_purchase_order_status
ON purchase_orders(status);

CREATE INDEX IF NOT EXISTS idx_order_items_order
ON purchase_order_items(order_id);

CREATE INDEX IF NOT EXISTS idx_stock_product
ON stock_movements(product_id);

CREATE INDEX IF NOT EXISTS idx_stock_created
ON stock_movements(created_at);


-- =========================================
-- ADMIN TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- BILLS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS bills (
    id SERIAL PRIMARY KEY,
    bill_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(150),
    subtotal NUMERIC(12, 2) NOT NULL,
    discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL,
    created_by INTEGER REFERENCES admins(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- BILL ITEMS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS bill_items (
    id SERIAL PRIMARY KEY,
    bill_id INTEGER NOT NULL
        REFERENCES bills(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL
        REFERENCES products(id),
    product_name VARCHAR(150) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL,
    line_total NUMERIC(12, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bills_created_at
ON bills(created_at);

CREATE INDEX IF NOT EXISTS idx_bill_items_bill
ON bill_items(bill_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_name_unique
ON products (LOWER(name));