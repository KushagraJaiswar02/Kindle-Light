# 🕯️ CandlesWithKinzee E-commerce Platform

## 🌟 Project Overview

This project involves creating a modern, responsive, and secure e-commerce platform dedicated to **"CandlesWithKinzee"**. It is a specialized, **single-vendor online store** designed for a specific artisan to sell their handcrafted candles. The goal is to migrate the business from an Instagram-only presence to a professional, scalable website, providing a smooth, aesthetic shopping experience.

The design emphasizes a **minimalist and elegant candle-themed aesthetic** with a consistent warm color palette.

## 🎯 Objectives

*   Build a **fast, mobile-friendly** e-commerce website.
*   Provide a smooth shopping experience with an **aesthetic UI**.
*   Integrate **secure authentication**.
*   Enable comprehensive product management with images, categories, and stock control.
*   Provide a **review system** and customer engagement tools.
*   Ensure **scalability and security** from day one.

---

## 💻 Tech Stack & Architecture

The application follows a **MERN (MongoDB, Express, React, Node.js) architecture** with a clear separation of frontend and backend concerns.

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **React + Vite**, Tailwind CSS, Framer Motion, Swiper.js | Handles UI, state, and smooth transitions. |
| **State Management** | Context API | Efficiently manages global state. |
| **Backend** | **Node.js, Express.js, MongoDB** | Handles API routing, business logic, and data storage. |
| **Authentication** | JSON Web Tokens (JWT) | Secure user authentication and authorization. |
| **Image Storage** | Local Storage / Multer | Handling product image uploads. |

---

## ✨ Features

*   **Responsive Navigation:** Elegant, mobile-friendly navbar with the "CandlesWithKinzee" branding.
*   **Authentication Flow:** User login (JWT-based) and secure account creation.
*   **Product Management:**
    *   **Home Page:** Hero section and product categories.
    *   **Product Listing (`/shop`):** Grid layout with filters and sorting.
    *   **Product Detail (`/product/:id`):** Detailed views, pricing, and reviews.
*   **Shopping Experience:**
    *   **Cart System:** Manage items and quantities.
    *   **User Profile:** Manage orders and personal details.
*   **Admin Dashboard:** Dedicated area for product and order management.

---

## 🚀 Getting Started

To run the project locally, you will need **Node.js** and **MongoDB** installed (or a MongoDB Atlas connection string).

### 1. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

**Environment Variables:**
Create a `.env` file in the `backend` folder with the following configuration:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

**Seed Database (Optional):**
To populate the database with sample users and products:

```bash
node seeder.js
```

**Start the Server:**

```bash
node index.js
# The server will start on http://localhost:5001
```

### 2. Frontend Setup

Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install
```

**Start the Frontend:**

```bash
npm run dev
# The app will likely run on http://localhost:5173
```

### 3. Usage

1.  Ensure backend is running (Port 5001).
2.  Ensure frontend is running (Port 5173).
3.  Open your browser to the frontend URL.
4.  **Admin Access:** The default seeder creates an admin user (check `backend/data/users.js` for credentials/logic, usually `admin@example.com` / `123456`).

---

## 🔒 Security Measures

*   **Secure Authentication:** JWT-based stateless authentication.
*   **Password Hashing:** Bcrypt for secure password storage.
*   **Protected Routes:** Middleware to restrict access to authorized users/admins.
*   **Data Validation:** Backend validation for critical inputs.

---

## 🤝 Contribution

Feel free to fork this repository and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.