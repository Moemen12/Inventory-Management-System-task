# Inventory Management System

A comprehensive inventory management solution built with Laravel 12 backend and React 19 with TypeScript frontend.

## 📋 Overview

This application provides a robust solution for managing inventory, tracking products, and handling inventory-related operations efficiently.

## 🛠️ Tech Stack

- **Backend**: Laravel 12
- **Frontend**: React 19 with TypeScript
- **Authentication**: JWT-based authentication

## 🚀 Getting Started

### Prerequisites

- PHP 8.1 or higher
- Composer
- Node.js and npm
- MySQL/PostgreSQL

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Inventory-Management-System.git
   cd Inventory-Management-System
   ```

2. **Set up Laravel backend**
   ```bash
   cd backend
   composer install
   cp .env.example .env
   php artisan key:generate
   ```

3. **Configure the environment file**
   
   Make sure to update your `.env` file with database credentials and add:
   ```
   JWT_SECRET=your_jwt_secret_here
   ```

4. **Run migrations**
   ```bash
   php artisan migrate
   php artisan db:seed # if you have seeders
   ```

5. **Set up React frontend**
   ```bash
   cd ../frontend
   npm install
   ```

## 🏃‍♂️ Running the Application

### Backend

Start the Laravel development server:
```bash
php artisan serve
```
The API will be available at http://127.0.0.1:8000

### Frontend

Start the React development server:
```bash
npm run dev -- --host 127.0.0.1
```
The application will be available at http://127.0.0.1:5173

> **⚠️ Important**: Make sure to run the React app specifically on http://127.0.0.1:5173 to avoid CORS issues.

## 📚 API Documentation

API documentation is available via Swagger UI at:
```
http://127.0.0.1:8000/api/documentation
```

Visit this URL after starting the Laravel server to explore all available endpoints.

## 🗄️ Database Design

You can view the database schema design at:
[DrawSQL - Inventory Management System](https://drawsql.app/teams/invidual/diagrams/inventory-management-system)

## 🔒 Authentication

This project uses JWT (JSON Web Tokens) for authentication. Make sure your JWT_SECRET is properly set in the .env file.

## 🧪 Testing

### Backend Tests
```bash
php artisan test
```

### Frontend Tests
```bash
npm test
```

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
