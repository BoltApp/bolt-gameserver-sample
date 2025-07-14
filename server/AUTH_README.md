# JWT Authentication Setup

This project now requires JWT authentication for all routes except the webhook endpoint. Here's how to use it:

## Environment Variables

Add the following to your `.env.local` file:

```env
JWT_SECRET=your-super-secret-jwt-key-here
```

## Authentication Endpoints

### Register a new user

```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "username": "testuser",
    "gems": 0
  }
}
```

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

Response:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "username": "testuser",
    "gems": 0
  }
}
```

## Protected Routes

All routes now require authentication except `/api/bolt/webhook`. Include the JWT token in the Authorization header:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Examples

#### Get user profile

```bash
GET /api/user/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get products

```bash
GET /api/bolt/products
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Restore purchases

```bash
POST /api/bolt/restore-purchases
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Validate transaction

```bash
POST /api/bolt/validate-transaction
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "reference": "transaction-reference"
}
```

## Token Expiration

Tokens expire after 24 hours. When a token expires, the client will receive a 403 response and should redirect the user to login again.

## Security Notes

- The webhook endpoint (`/api/bolt/webhook`) remains public as webhooks typically use other authentication methods
- Always use HTTPS in production
- Store JWT tokens securely on the client side
- Consider implementing refresh tokens for better security
- Use a strong, unique JWT secret in production
