
import pool from "../config/db.js";

const categories = [
  "Groceries",
  "Dairy Products",
  "Beverages",
  "Snacks",
  "Personal Care",
  "Household",
  "Bakery",
  "Frozen Foods",
  "Staples",
  "Baby Care"
];

const products = [
  // Groceries
  { name: "Tata Salt 1kg", price: 28, quantity: 120, category: "Groceries" },
  { name: "Aashirvaad Atta 5kg", price: 280, quantity: 45, category: "Groceries" },
  { name: "Fortune Sunflower Oil 1L", price: 145, quantity: 65, category: "Groceries" },
  { name: "Tata Tea Gold 500g", price: 260, quantity: 35, category: "Groceries" },
  { name: "Red Label Tea 250g", price: 145, quantity: 50, category: "Groceries" },
  { name: "India Gate Basmati Rice 1kg", price: 120, quantity: 55, category: "Staples" },
  { name: "Toor Dal 1kg", price: 155, quantity: 40, category: "Staples" },
  { name: "Moong Dal 1kg", price: 130, quantity: 38, category: "Staples" },
  { name: "Sugar 1kg", price: 45, quantity: 90, category: "Staples" },
  { name: "Besan 1kg", price: 95, quantity: 30, category: "Staples" },

  // Dairy Products
  { name: "Amul Gold Milk 1L", price: 68, quantity: 40, category: "Dairy Products" },
  { name: "Amul Butter 100g", price: 60, quantity: 55, category: "Dairy Products" },
  { name: "Amul Cheese Slices 200g", price: 140, quantity: 25, category: "Dairy Products" },
  { name: "Amul Paneer 200g", price: 95, quantity: 20, category: "Dairy Products" },
  { name: "Mother Dairy Curd 400g", price: 45, quantity: 32, category: "Dairy Products" },

  // Beverages
  { name: "Coca Cola 750ml", price: 40, quantity: 70, category: "Beverages" },
  { name: "Sprite 750ml", price: 40, quantity: 60, category: "Beverages" },
  { name: "Real Mixed Fruit Juice 1L", price: 110, quantity: 28, category: "Beverages" },
  { name: "Tropicana Orange Juice 1L", price: 115, quantity: 22, category: "Beverages" },
  { name: "Bisleri Water 1L", price: 20, quantity: 150, category: "Beverages" },

  // Snacks
  { name: "Parle-G Biscuit 250g", price: 25, quantity: 100, category: "Snacks" },
  { name: "Good Day Butter Cookies", price: 35, quantity: 65, category: "Snacks" },
  { name: "Maggi Noodles 70g", price: 14, quantity: 130, category: "Snacks" },
  { name: "Kurkure Masala Munch", price: 20, quantity: 85, category: "Snacks" },
  { name: "Lays Classic Salted", price: 20, quantity: 90, category: "Snacks" },
  { name: "Haldiram Aloo Bhujia 200g", price: 65, quantity: 35, category: "Snacks" },
  { name: "Hide and Seek Biscuit", price: 35, quantity: 45, category: "Snacks" },
  { name: "Cadbury Dairy Milk 50g", price: 50, quantity: 60, category: "Snacks" },

  // Personal Care
  { name: "Dove Soap 100g", price: 60, quantity: 50, category: "Personal Care" },
  { name: "Lux Soap 100g", price: 35, quantity: 75, category: "Personal Care" },
  { name: "Head and Shoulders Shampoo 180ml", price: 190, quantity: 25, category: "Personal Care" },
  { name: "Clinic Plus Shampoo 175ml", price: 110, quantity: 35, category: "Personal Care" },
  { name: "Colgate Strong Teeth 200g", price: 115, quantity: 40, category: "Personal Care" },
  { name: "Closeup Toothpaste 150g", price: 105, quantity: 30, category: "Personal Care" },
  { name: "Nivea Body Lotion 200ml", price: 230, quantity: 18, category: "Personal Care" },

  // Household
  { name: "Vim Dishwash Bar", price: 25, quantity: 70, category: "Household" },
  { name: "Surf Excel Detergent 1kg", price: 140, quantity: 45, category: "Household" },
  { name: "Harpic Toilet Cleaner 500ml", price: 105, quantity: 30, category: "Household" },
  { name: "Lizol Floor Cleaner 500ml", price: 110, quantity: 28, category: "Household" },
  { name: "Good Knight Refill", price: 75, quantity: 40, category: "Household" },

  // Bakery
  { name: "Britannia White Bread", price: 40, quantity: 18, category: "Bakery" },
  { name: "Britannia Brown Bread", price: 50, quantity: 15, category: "Bakery" },
  { name: "Britannia Rusk 300g", price: 65, quantity: 25, category: "Bakery" },

  // Frozen Foods
  { name: "McCain French Fries 400g", price: 140, quantity: 12, category: "Frozen Foods" },
  { name: "Amul Vanilla Ice Cream 1L", price: 220, quantity: 10, category: "Frozen Foods" },

  // Baby Care
  { name: "Pampers Diapers Small Pack", price: 120, quantity: 20, category: "Baby Care" },
  { name: "Johnson Baby Powder 200g", price: 145, quantity: 16, category: "Baby Care" },
  { name: "Johnson Baby Shampoo 100ml", price: 95, quantity: 14, category: "Baby Care" }
];

async function seedDatabase() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Create categories and get their IDs
    const categoryIds = {};

    for (const category of categories) {
      const result = await client.query(
        `INSERT INTO categories (name)
         VALUES ($1)
         ON CONFLICT (name)
         DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [category]
      );

      categoryIds[category] = result.rows[0].id;
    }

    // 2. Insert products without creating duplicates
    let insertedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      const result = await client.query(
        `INSERT INTO products
          (name, price, quantity, category_id)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [
          product.name,
          product.price,
          product.quantity,
          categoryIds[product.category]
        ]
      );

      if (result.rows.length > 0) {
        insertedCount++;

        // 3. Record initial stock movement
        await client.query(
          `INSERT INTO stock_movements
            (product_id, change_quantity, movement_type, notes)
           VALUES ($1, $2, $3, $4)`,
          [
            result.rows[0].id,
            product.quantity,
            "adjustment",
            "Initial stock added through seed script"
          ]
        );
      } else {
        skippedCount++;
      }
    }

    await client.query("COMMIT");

    console.log("\n==================================");
    console.log(" KARO SHOPPING DATABASE SEEDED");
    console.log("==================================");
    console.log(`Categories available: ${categories.length}`);
    console.log(`Products inserted: ${insertedCount}`);
    console.log(`Products skipped: ${skippedCount}`);
    console.log(`Total sample products: ${products.length}`);
    console.log("==================================\n");

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Database seeding failed:", error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase();
