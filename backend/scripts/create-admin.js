
require("dotenv").config();

const bcrypt = require("bcryptjs");
const pool = require("../config/db");

async function createAdmin() {
    try {
        const username = process.env.ADMIN_USERNAME;
        const password = process.env.ADMIN_PASSWORD;

        if (!username || !password) {
            throw new Error(
                "ADMIN_USERNAME and ADMIN_PASSWORD are required in .env"
            );
        }

        if (password.length < 10) {
            throw new Error("Admin password must have at least 10 characters");
        }

        const existing = await pool.query(
            "SELECT id FROM admins WHERE username = $1",
            [username]
        );

        if (existing.rows.length > 0) {
            console.log("Admin already exists.");
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await pool.query(
            `INSERT INTO admins (username, password_hash, role)
             VALUES ($1, $2, 'admin')`,
            [username, hashedPassword]
        );

        console.log("Admin created successfully!");

    } catch (error) {
        console.error("Admin creation failed:", error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

createAdmin();
