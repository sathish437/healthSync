# 🩺 HealthSync Indigo

**HealthSync Indigo** is a premium, full-stack healthcare management system designed with a focus on human-centric design, clinical efficiency, and modern aesthetics. It provides a seamless interface for patients to book appointments and for doctors/admins to manage clinical workflows.

![HealthSync Indigo Preview](https://via.placeholder.com/1200x600/4C3AFF/FFFFFF?text=HealthSync+Indigo+Premium+Healthcare)

---

## ✨ Project Aesthetics
HealthSync Indigo breaks the mold of sterile medical interfaces by embracing a **"Moody Luxury"** design language:
- **Primary Palette**: Deep Indigo (`#4C3AFF`) paired with Soft Lavender (`#A78BFA`).
- **Accent Elements**: Fresh Mint (`#34D399`) for success actions and clinical health status.
- **Glassmorphism**: Subtle transluscent backgrounds with blurred backdrops for a modern, airy feel.
- **Dynamic Feedback**: Powered by **Framer Motion**, every interaction features micro-animations and smooth layout transitions.

---

## 🚀 Core Features

### 👤 Unified Identity System
- **Secure Authentication**: JWT-based login and registration system with Bcrypt password hashing.
- **Role-Based Access Control (RBAC)**: Distinct experiences for **Patients**, **Doctors**, and **Administrators**.

### 🗓️ Smart Appointment Booking
- **Real-time Availability**: Patients can view doctor specializations and book available time slots.
- **Clinical Context**: Integrated field for booking reasons and hospital selection.
- **History Tracking**: Full visibility for patients into their past and upcoming appointments.

### 📊 Clinical Dashboards
- **Doctor's Queue**: A specialized view for medical professionals to manage their daily patient list and status transitions.
- **Admin Command Center**: High-level overview of hospital resources, doctor listings, and system-wide appointments.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Framer Motion, Lucide React, Vanilla CSS |
| **Backend** | Node.js, Express, MySQL 8.x |
| **Security** | JSON Web Tokens (JWT), Bcrypt.js, CORS |
| **DevOps** | Batch Automation Scripts, Environment-ready configuration |

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- **Node.js**: v16.x or higher
- **MySQL**: 8.0+ running on your local machine

### 2. Environment Configuration
Create a `.env` file in the `backend/` directory with the following variables:
```env
PORT=5000
JWT_SECRET=your_secure_random_key_here
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=healthcare
```

### 3. Quick Installation
The project includes a streamlined setup script for Windows users:
```bash
# Run the setup script to install all dependencies
./setup.bat
```

---

## 🛰️ Running the Application

To launch both the backend and frontend simultaneously with automatic database health checks:
```bash
./run_app.bat
```
This script will:
1. Initialize/Repair the MySQL database.
2. Seed initial doctor and hospital data if missing.
3. Start the Express server on port 5000.
4. Launch the Vite development server for the React frontend.

---

## 🗺️ Project Structure

```text
HealthcareManagement/
├── backend/            # Express Server & DB Logic
│   ├── routes/         # API Endpoints (Auth, Doctors, Appointments)
│   ├── db.js           # MySQL Connection Pool
│   ├── server.js       # Entry Point & Auto-Migrations
│   └── database.sql    # Schema & Seed Data
├── frontend/           # React Client
│   ├── src/
│   │   ├── pages/      # Views (Login, Booking, Dashboards)
│   │   ├── App.jsx     # Routing & Global Layout
│   │   └── index.css   # Indigo Design System
│   └── vite.config.js  # Build Configuration
└── setup.bat           # Automation Script
```

---

## 🛡️ Database Architecture
The system uses a relational schema optimized for medical scheduling:
- **`users`**: Central identity table with role partitioning.
- **`doctors`**: Clinical profiles linked to user accounts.
- **`slots`**: Scheduling units for specific time intervals.
- **`appointments`**: The core transaction linking patients, doctors, and slots.
- **`hospitals`**: Institutional entities where treatments occur.

---

## 📝 License
Proprietary implementation for Healthcare Management Portfolios. Developed with 💜 by Antigravity.
