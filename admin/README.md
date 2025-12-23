# Aurie Admin Dashboard

A separate admin application for managing orders and updating their status.

## Features

✅ Admin Login (demo credentials)
✅ View all orders placed by users
✅ Filter and search orders
✅ Update order status (Order Placed → Confirmed → Packed → Shipped → Delivered)
✅ View customer details and payment information
✅ Real-time order statistics

## Setup

### Installation

```bash
cd admin
npm install
```

### Start Admin Dashboard

```bash
npm run dev
```

The admin dashboard will run on `http://localhost:5175`

## Login Credentials (Demo)

**Email:** admin@aurie.com  
**Password:** admin123

## Project Structure

```
admin/
├── src/
│   ├── api/
│   │   ├── axios.js          # Axios instance with token
│   │   └── admin.js           # API endpoints
│   ├── components/
│   │   ├── Header.jsx         # Navigation header
│   │   ├── LoginPage.jsx      # Login page
│   │   └── OrderCard.jsx      # Order card component
│   ├── pages/
│   │   └── OrdersPage.jsx     # Main orders dashboard
│   ├── App.jsx                # Main app component
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## API Endpoints (Backend)

All endpoints are prefixed with `/api/admin/`

### Authentication
- `POST /login` - Admin login

### Orders
- `GET /all` - Get all orders
- `GET /:orderId` - Get order by ID
- `POST /:orderId/update-status` - Update order status
- `GET /stats/summary` - Get order statistics

## Order Status Flow

```
Order Placed → Confirmed → Packed → Shipped → Out for Delivery → Delivered
```

## Environment Variables

Backend `.env` should include:
```
ADMIN_EMAIL=admin@aurie.com
ADMIN_PASSWORD=admin123
```

(Change these in production!)

## Technologies Used

- React 19
- Vite
- Tailwind CSS
- Axios
- Node.js Express (Backend)
