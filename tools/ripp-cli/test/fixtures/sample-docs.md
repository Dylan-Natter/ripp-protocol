# Sample API Documentation

## User Management API

### Create User
**POST /api/users**

Creates a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2025-01-01T00:00:00Z"
}
```

### Get User
**GET /api/users/:id**

Retrieves a user by ID.

**Response:**
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "name": "John Doe"
}
```

### Update User
**PUT /api/users/:id**

Updates user information.

### Delete User
**DELETE /api/users/:id**

Deletes a user account.
