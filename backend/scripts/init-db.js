
const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

async function initializeDatabase() {
    const client = await pool.connect();

    try {
        console.log("Starting database initialization...");

        const schemaPath = path.join(
            __dirname,
            "../database/schema.sql"
        );

        const schema = fs.readFileSync(schemaPath, "utf8");

        await client.query("BEGIN");

        await client.query(schema);

        await client.query("COMMIT");

        console.log("Database initialized successfully!");
        console.log("All tables and indexes are ready.");

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Database initialization failed:");
        console.error(error.message);

        process.exitCode = 1;

    } finally {
        client.release();
        await pool.end();
    }
}

initializeDatabase();
