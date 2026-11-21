
# 🛒 Karo Shopping – Shop Inventory & Billing Management System

Karo Shopping is a full-stack inventory and billing management application designed to help small shopkeepers and supermarket owners manage their daily shop activities easily.

The application helps shopkeepers maintain product records, track available stock, identify stock mismatches, update inventory, and generate customer bills.

## 📌 Problem Statement

Managing a shop with hundreds of different products can become difficult when stock and sales are maintained manually.

Some common problems faced by shopkeepers include:

- Difficulty keeping track of available products and quantities.
- Incorrect stock records due to manual calculations.
- Difficulty identifying products that are missing or misplaced.
- No easy way to track stock after every customer purchase.
- Time-consuming manual billing and inventory management.

For example, the application may show that 10 packets of a product are available, but the shopkeeper may physically find only 8 packets. This creates a stock mismatch that needs to be investigated.

Karo Shopping helps shopkeepers compare recorded stock with physically available stock, identify differences, update quantities, and maintain better inventory records.

**Note:** The application helps identify stock differences based on physical verification. It does not automatically detect theft or physically track products.

## ✨ Features

### 1. Admin Login
- Secure admin login using username and password.
- Protected application routes.
- JWT-based authentication.

### 2. Dashboard
- View all available products.
- View product prices and quantities.
- Search products by name.
- View total products and available stock.
- Identify low-stock products.

### 3. Product Management
- Add new products.
- Enter product name, price, and initial quantity.
- Store product details in PostgreSQL.
- Organize products using categories.

### 4. Stock Management
- View current stock quantities.
- Add newly received stock.
- Increase quantities using buttons or manual input.
- Identify low-stock products.
- Maintain stock movement records.

### 5. Billing System
- Search and select products for billing.
- Add multiple products to a single bill.
- Increase or decrease product quantities.
- Automatically calculate subtotal and discount.
- Generate customer bills.
- Automatically deduct purchased quantities from inventory.
- Store bill details in the database.
- Print generated bills.

### 6. Database Management
- Store product and category information.
- Maintain stock movement history.
- Store purchase orders and purchase order items.
- Maintain billing records.

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Database Connection | Node PostgreSQL (pg) |
| Authentication | JSON Web Token (JWT) |
| API Communication | Axios, REST APIs |
| Development Tools | VS Code, Git, GitHub, Docker |

## 📁 Project Structure

```text
FIre_Ai/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── database/
│   │   └── schema.sql
│   │
│   ├── scripts/
│   │   ├── init-db.js
│   │   └── seed.js
│   │
│   ├── index.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   └── .env
│
├── screenshots/
│   ├── login.png
│   ├── dashboard.png
│   ├── add-product.png
│   ├── stock-management.png
│   └── billing.png
│
├── .gitignore
└── README.md
```

*Adjust the structure above if your actual project uses different filenames.*

## ⚙️ Prerequisites

Before running the application, install:

1. Node.js (Version 20 or above).
2. npm (Comes with Node.js).
3. PostgreSQL.
4. Docker Desktop (Recommended for running PostgreSQL).
5. Git.
6. VS Code (Recommended).

## 🚀 Getting Started

Follow these instructions to run Karo Shopping on your local machine.

### Step 1: Clone the Repository

```bash
git clone https://github.com/krishnavermaKV/Karo-shopping.git
```

Navigate to the project directory:

```bash
cd Karo-shopping
```

### Step 2: Start PostgreSQL

If you are using Docker:

```bash
docker start shop-postgres
```

If you are setting up PostgreSQL for the first time, create a container:

```bash
docker run --name shop-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=karo_shopping \
  -p 5432:5432 \
  -d postgres:16
```

Replace `your_password` with your own database password.

### Step 3: Configure Backend Environment Variables

Navigate to the backend directory:

```bash
cd backend
```

Create a file named `.env` inside the backend folder.

Add the following configuration:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=karo_shopping
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=replace_with_a_long_random_secret
```

**Important:** These are example variable names. Check `backend/config/db.js` and your authentication code to ensure they match the variables actually used by your application.

Never upload your actual `.env` file or database credentials to GitHub.

### Step 4: Install Backend Dependencies

Run:

```bash
npm install
```

Initialize the database:

```bash
npm run db:init
```

Insert sample supermarket products:

```bash
node scripts/seed.js
```

The seed script adds approximately 50 sample products across different categories, including:

- Groceries
- Dairy Products
- Beverages
- Snacks
- Personal Care
- Household Products
- Bakery
- Frozen Foods
- Baby Care

Create the admin account:

```bash
npm run admin:create
```

If these scripts are not defined in your `package.json`, use the corresponding JavaScript files directly.

### Step 5: Start the Backend Server

Run:

```bash
npm run dev
```

The backend should start on:

```text
http://localhost:5000
```

API base URL:

```text
http://localhost:5000/api
```

### Step 6: Configure Frontend Environment Variables

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Create a `.env` file inside the frontend folder.

Add:

```env
VITE_API_URL=http://localhost:5000/api
```

This URL connects the React frontend to the Express backend.

### Step 7: Install Frontend Dependencies

Run:

```bash
npm install
```

### Step 8: Start the Frontend

Run:

```bash
npm run dev
```

Vite will provide a local development URL, usually:

```text
http://localhost:5173
```

Open this URL in your browser to access Karo Shopping.

## 🖥️ Application Screenshots

### 1. Login Page

![Login Page](screenshots/login.png)

### 2. Dashboard

![Dashboard](screenshots/dashboard.png)

### 3. Add New Product

![Add Product](screenshots/add-product.png)

### 4. Stock Management

![Stock Management](screenshots/stock-management.png)

### 5. Billing Page

![Billing Page](screenshots/billing.png)

*Add your actual application screenshots to the screenshots folder using the filenames shown above.*

## 🔄 Application Workflow

```text
             Admin Login
                  |
                  v
              Dashboard
                  |
       +----------+----------+
       |          |          |
       v          v          v
  Add Product  Manage     Billing
               Stock        |
       |          |          |
       v          v          v
  Save Product  Update    Select Products
  Information   Quantity      |
       |          |          v
       +----------+     Generate Bill
                              |
                              v
                       Deduct Stock
                              |
                              v
                       Update Database
```

## 🗄️ Database Tables

The application uses PostgreSQL with the following main tables:

| Table | Purpose |
|---|---|
| admins | Stores administrator accounts |
| categories | Stores product categories |
| products | Stores product details and stock quantities |
| purchase_orders | Stores supplier purchase orders |
| purchase_order_items | Stores items in purchase orders |
| stock_movements | Maintains stock change history |
| bills | Stores generated bills |
| bill_items | Stores individual products in each bill |

## 🔐 Security

- Admin authentication using JWT.
- Protected backend routes for administrative operations.
- Environment variables for sensitive configuration.
- Database credentials are not stored in frontend code.

## 🔮 Future Improvements

- Barcode scanning for faster product identification.
- Supplier management and purchase tracking.
- Automatic low-stock notifications.
- Stock mismatch reports.
- Sales analytics and daily/monthly reports.
- Multiple shopkeeper accounts with different permissions.
- Cloud deployment and online access.
- Integration with an online payment gateway.

## 👨‍💻 Author

**Purushottam Verma**

B.Tech – Computer Science and Engineering

National Institute of Technology, Agartala

GitHub: [krishnavermaKV](https://github.com/krishnavermaKV)

----