# Subscription Tracker API

A comprehensive RESTful API for managing user subscriptions with automated email reminders. This system allows users to track their subscriptions, receive timely renewal notifications, and manage their subscription lifecycle.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Database Models](#database-models)
- [Security Features](#security-features)
- [Workflow System](#workflow-system)
- [Email System](#email-system)
- [Error Handling](#error-handling)
- [Development Notes](#development-notes)

---

## 🎯 Overview

The Subscription Tracker API is a Node.js/Express backend service that provides:

- **User Authentication**: Secure sign-up, sign-in, and sign-out with JWT tokens
- **Subscription Management**: Create, read, and manage user subscriptions
- **Automated Reminders**: Email notifications sent at 7, 5, 2, and 1 days before renewal
- **Security**: Rate limiting, bot detection, and attack protection via Arcjet
- **Workflow Automation**: Long-running scheduled tasks using Upstash Workflow

---

## ✨ Features

### Implemented Features

✅ User registration and authentication (JWT-based)  
✅ Password hashing with bcrypt  
✅ Subscription creation with automatic renewal date calculation  
✅ Get user subscriptions  
✅ Automated email reminder system (7, 5, 2, 1 days before renewal)  
✅ Security middleware (rate limiting, bot detection, attack protection)  
✅ Global error handling  
✅ Database models with validation  
✅ Transaction support for user creation

### Planned/Placeholder Features

🚧 User CRUD operations (update, delete)  
🚧 Subscription CRUD operations (update, delete, get by ID)  
🚧 Get all subscriptions  
🚧 Cancel subscription endpoint  
🚧 Get upcoming renewals  
🚧 Workflow status endpoint  
🚧 Token blacklist for sign-out

---

## 🛠 Technology Stack

### Core

- **Node.js** - Runtime environment
- **Express.js 5.1.0** - Web framework
- **MongoDB** - Database
- **Mongoose 8.18.3** - ODM (Object Data Modeling)

### Authentication & Security

- **jsonwebtoken 9.0.2** - JWT token generation and verification
- **bcryptjs 3.0.2** - Password hashing
- **@arcjet/node 1.0.0-beta.12** - Security protection (rate limiting, bot detection, attack shield)

### Workflow & Scheduling

- **@upstash/workflow 0.2.21** - Long-running workflow orchestration

### Email

- **nodemailer 7.0.10** - Email sending via Gmail SMTP

### Utilities

- **dayjs 1.11.18** - Date manipulation and formatting
- **dotenv 17.2.2** - Environment variable management
- **cors 2.8.5** - Cross-Origin Resource Sharing

### Development

- **nodemon 3.1.10** - Development server with auto-reload
- **eslint 9.36.0** - Code linting

---

## 📁 Project Structure

```
backend/
├── app.js                      # Main application entry point
├── package.json                # Dependencies and scripts
├── .gitignore                  # Git ignore rules
├── eslint.config.mjs          # ESLint configuration
│
├── config/                     # Configuration files
│   ├── env.js                 # Environment variables loader
│   ├── arcjet.js              # Arcjet security configuration
│   ├── upstash.js             # Upstash workflow client setup
│   └── nodemailer.js           # Email transporter configuration
│
├── controllers/                # Business logic handlers
│   ├── auth.controller.js     # Authentication logic (sign up, sign in, sign out)
│   ├── user.controller.js     # User management logic
│   ├── subscription.controller.js  # Subscription CRUD operations
│   └── workflow.controller.js # Workflow trigger handlers
│
├── routes/                     # API route definitions
│   ├── auth.routes.js         # Authentication endpoints
│   ├── user.routes.js         # User endpoints
│   ├── subscription.routes.js # Subscription endpoints
│   └── workflow.routes.js     # Workflow endpoints
│
├── models/                     # Mongoose schemas
│   ├── user.model.js          # User schema definition
│   └── subscription.model.js  # Subscription schema definition
│
├── middleware/                 # Express middleware
│   ├── auth.middleware.js     # JWT authentication middleware
│   ├── error.middleware.js    # Global error handler
│   └── arcjet.middleware.js   # Security protection middleware
│
├── database/                   # Database connection
│   └── mongodb.js             # MongoDB connection setup
│
└── utils/                      # Utility functions
    ├── send-email.js          # Email sending utility
    └── email-template.js      # Email template generator
```

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB database (local or cloud)
- Gmail account with app password (for email sending)
- Arcjet account (for security features)
- Upstash account (for workflow orchestration)

### Installation Steps

1. **Clone the repository and navigate to backend**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create environment file**

   Create `.env.development.local` (or `.env.production.local` for production):

   ```env
   PORT=3000
   NODE_ENV=development
   DB_URI=mongodb://localhost:27017/subscription-tracker
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   ARCJET_ENV=development
   ARCJET_KEY=your-arcjet-key
   QSTASH_URL=https://qstash.upstash.io/v2
   QSTASH_TOKEN=your-qstash-token
   SERVER_URL=http://localhost:3000
   EMAIL_PASSWORD=your-gmail-app-password
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The server will start on the port specified in your environment variables (default: 3000).

---

## 🔐 Environment Variables

| Variable         | Description                   | Required | Example                                          |
| ---------------- | ----------------------------- | -------- | ------------------------------------------------ |
| `PORT`           | Server port number            | Yes      | `3000`                                           |
| `NODE_ENV`       | Environment mode              | Yes      | `development` or `production`                    |
| `DB_URI`         | MongoDB connection string     | Yes      | `mongodb://localhost:27017/subscription-tracker` |
| `JWT_SECRET`     | Secret key for JWT signing    | Yes      | `your-secret-key`                                |
| `JWT_EXPIRES_IN` | JWT token expiration time     | Yes      | `7d`, `24h`, `1h`                                |
| `ARCJET_ENV`     | Arcjet environment            | Yes      | `development` or `production`                    |
| `ARCJET_KEY`     | Arcjet API key                | Yes      | `arc_xxxxx`                                      |
| `QSTASH_URL`     | Upstash QStash base URL       | Yes      | `https://qstash.upstash.io/v2`                   |
| `QSTASH_TOKEN`   | Upstash QStash token          | Yes      | `qst_xxxxx`                                      |
| `SERVER_URL`     | Server base URL for callbacks | Yes      | `http://localhost:3000`                          |
| `EMAIL_PASSWORD` | Gmail app password            | Yes      | `xxxx xxxx xxxx xxxx`                            |

**Note:** Environment files are loaded from `.env.{NODE_ENV}.local` (e.g., `.env.development.local`)

---

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api/v1
```

### Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

### 🔑 Authentication Endpoints

#### Sign Up

```http
POST /api/v1/auth/sign-up
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### Sign In

```http
POST /api/v1/auth/sign-in
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "User signed in successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

#### Sign Out

```http
POST /api/v1/auth/sign-out
```

**Response (200):**

```json
{
  "success": true,
  "message": "User signed out successfully"
}
```

---

### 👤 User Endpoints

#### Get All Users

```http
GET /api/v1/users
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    }
  ]
}
```

#### Get User by ID

```http
GET /api/v1/users/:id
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 📦 Subscription Endpoints

#### Create Subscription

```http
POST /api/v1/subscriptions
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Netflix Premium",
  "price": 15.99,
  "frequency": "monthly",
  "category": "entertainment",
  "paymentMethod": "Credit Card ending in 1234",
  "startDate": "2024-01-01"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Netflix Premium",
    "price": 15.99,
    "frequency": "monthly",
    "category": "entertainment",
    "paymentMethod": "Credit Card ending in 1234",
    "status": "active",
    "startDate": "2024-01-01T00:00:00.000Z",
    "renewalDate": "2024-01-31T00:00:00.000Z",
    "user": "507f1f77bcf86cd799439011",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "workflowRunId": "run_xxxxx"
}
```

**Note:** This automatically triggers a workflow that schedules email reminders.

#### Get User Subscriptions

```http
GET /api/v1/subscriptions/user/:id
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Netflix Premium",
      "price": 15.99,
      "frequency": "monthly",
      "category": "entertainment",
      "status": "active",
      "renewalDate": "2024-01-31T00:00:00.000Z"
    }
  ]
}
```

---

### ⚙️ Workflow Endpoints

#### Trigger Reminder Workflow

```http
POST /api/v1/workflows/subscription/reminder
Content-Type: application/json

{
  "subscriptionId": "507f1f77bcf86cd799439012"
}
```

**Note:** This endpoint is typically called automatically by Upstash when a workflow is triggered. It schedules email reminders at 7, 5, 2, and 1 days before the renewal date.

---

## 🗄 Database Models

### User Model

```javascript
{
  name: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 50,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, "Please fill a valid email address"]
  },
  password: {
    type: String,
    required: true,
    minLength: 6
  },
  timestamps: true  // createdAt, updatedAt
}
```

### Subscription Model

```javascript
{
  name: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 100,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  frequency: {
    type: String,
    enum: ["daily", "weekly", "monthly", "yearly"]
  },
  category: {
    type: String,
    enum: ["sports", "news", "entertainment", "lifestyle",
           "technology", "politics", "finance", "other"],
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ["active", "cancelled", "expired"],
    default: "active"
  },
  startDate: {
    type: Date,
    required: true,
    validate: {
      validator: (value) => value <= new Date(),
      message: "Start date cannot be in the future"
    }
  },
  renewalDate: {
    type: Date,
    validate: {
      validator: function (value) {
        return value > this.startDate
      },
      message: "Renewal date must be after start date"
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  timestamps: true  // createdAt, updatedAt
}
```

**Pre-save Hooks:**

- **Auto-calculation**: If `renewalDate` is not provided, it's automatically calculated based on `frequency`:
  - `daily`: +1 day
  - `weekly`: +7 days
  - `monthly`: +30 days
  - `yearly`: +365 days
- **Auto-expiration**: If `renewalDate` has passed, status is automatically set to "expired"

---

## 🔒 Security Features

### Arcjet Protection

The system uses Arcjet for comprehensive security:

1. **Shield Protection**

   - Protects against common attacks (SQL injection, XSS, etc.)
   - Mode: `LIVE` in production

2. **Bot Detection**

   - Blocks automated bot requests
   - Allows search engines and localhost in development
   - Mode: `DRY_RUN` in development, `LIVE` in production

3. **Rate Limiting**
   - **Algorithm**: Token bucket
   - **Capacity**: 10 requests
   - **Refill Rate**: 5 tokens per 10 seconds
   - **Tracking**: By IP address

### Authentication Security

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Protected Routes**: Bearer token required for sensitive endpoints
- **Transaction Support**: User creation uses MongoDB transactions for data integrity

---

## 🔄 Workflow System

### How It Works

1. **Subscription Creation**: When a subscription is created, a workflow is automatically triggered via Upstash
2. **Workflow Execution**: The workflow receives the subscription ID and:
   - Fetches the subscription from the database
   - Validates it's active
   - Checks if renewal date hasn't passed
   - Schedules reminders at 7, 5, 2, and 1 days before renewal
3. **Email Sending**: On each scheduled date, an email reminder is sent to the user

### Reminder Schedule

- **7 days before**: First reminder
- **5 days before**: Second reminder
- **2 days before**: Third reminder
- **1 day before**: Final reminder

### Workflow Features

- **Long-running**: Uses Upstash Workflow for reliable scheduled execution
- **Conditional**: Only sends reminders for active subscriptions
- **Auto-stop**: Stops if subscription becomes inactive or renewal date passes
- **Resilient**: Handles failures and retries automatically

---

## 📧 Email System

### Email Configuration

- **Provider**: Gmail SMTP
- **Sender**: `mannynnodim@gmail.com`
- **Transport**: Nodemailer

### Email Templates

The system includes 4 reminder templates:

1. **7 days before reminder**

   - Subject: `📅 Reminder: Your {subscriptionName} Subscription Renews in 7 Days!`

2. **5 days before reminder**

   - Subject: `⏳ {subscriptionName} Renews in 5 Days – Stay Subscribed!`

3. **2 days before reminder**

   - Subject: `🚀 2 Days Left! {subscriptionName} Subscription Renewal`

4. **1 day before reminder**
   - Subject: `⚡ Final Reminder: {subscriptionName} Renews Tomorrow!`

### Email Content

Each email includes:

- Personalized greeting with user name
- Subscription details (name, price, frequency)
- Renewal date with days remaining
- Payment method information
- Links to account settings and support
- Professional HTML formatting with branding

---

## ⚠️ Error Handling

### Global Error Middleware

The system includes comprehensive error handling:

1. **Mongoose CastError** → 404 (Resource not found)
2. **Mongoose Duplicate Key (11000)** → 400 (Duplicate field value)
3. **Mongoose ValidationError** → 400 (Validation failed with details)
4. **Custom Errors** → Uses error status code or defaults to 500

### Error Response Format

```json
{
  "success": false,
  "error": "Error message here"
}
```

### Common Error Codes

- `400` - Bad Request (validation errors, duplicate entries)
- `401` - Unauthorized (missing/invalid token, wrong credentials)
- `403` - Forbidden (Arcjet blocked request)
- `404` - Not Found (resource doesn't exist)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## 💡 Development Notes

### Code Style

- Uses **ES6 modules** (`import/export`)
- **ESLint** configured for code quality
- Consistent error handling pattern

### Important Implementation Details

1. **Transactions**: User sign-up uses MongoDB transactions for atomicity
2. **Password Exclusion**: User queries exclude password field for security
3. **Auto-calculation**: Subscription renewal dates are calculated automatically
4. **Status Management**: Subscription status updates automatically based on dates
5. **Workflow Triggering**: Subscriptions automatically trigger reminder workflows

### Debugging

- Debug logging included in sign-up controller
- Error logging to console for development
- Arcjet runs in `DRY_RUN` mode in development

### Known Limitations

- Cookie parser is commented out (not currently used)
- Token blacklist not implemented for sign-out
- Several CRUD endpoints are placeholders

---

## 🧪 Testing the API

### Using cURL

**Sign Up:**

```bash
curl -X POST http://localhost:3000/api/v1/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

**Sign In:**

```bash
curl -X POST http://localhost:3000/api/v1/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

**Create Subscription (replace TOKEN):**

```bash
curl -X POST http://localhost:3000/api/v1/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Netflix Premium",
    "price": 15.99,
    "frequency": "monthly",
    "category": "entertainment",
    "paymentMethod": "Credit Card",
    "startDate": "2024-01-01"
  }'
```

---

## 📝 License

ISC

---

## 👤 Author

Subscription Tracker API - Backend System

---

## 🔮 Future Enhancements

- [ ] Complete CRUD operations for users and subscriptions
- [ ] Token blacklist for secure sign-out
- [ ] Subscription cancellation endpoint
- [ ] Upcoming renewals dashboard endpoint
- [ ] Workflow status tracking
- [ ] Email preferences (opt-in/opt-out)
- [ ] Subscription analytics
- [ ] Multi-currency support
- [ ] Subscription sharing features
- [ ] Mobile app API support

---

**Last Updated**: 2024
