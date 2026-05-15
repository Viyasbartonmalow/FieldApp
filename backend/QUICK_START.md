# Backend Quick Start Guide

## Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

---

## Installation & Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
```bash
# Copy example to .env
cp .env.example .env

# Edit .env and set your database credentials
nano .env
```

**Required Configuration:**
```env
# Server
NODE_ENV=development
PORT=5000

# Database - Configure for your PostgreSQL instance
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fieldapp
DB_USER=postgres
DB_PASSWORD=yourpassword

# JWT - Change in production!
JWT_SECRET=your-super-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key
```

### 3. Database Setup
```bash
# Create PostgreSQL database
createdb fieldapp -U postgres

# Run migrations (creates all tables)
npm run db:migrate

# Optional: Seed test data
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

Server will start on `http://localhost:5000`

Health check: `http://localhost:5000/health`

---

## Available Commands

```bash
# Development
npm run dev              # Start with hot-reload

# Building
npm run build            # Compile TypeScript
npm run start            # Run compiled code

# Database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed test data

# Testing
npm run test             # Run tests once
npm run test:watch       # Run tests in watch mode
npm run test:cov         # Run with coverage

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Check TypeScript types
npm run format           # Format code with Prettier
```

---

## API Endpoints

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "eyJhb...",
      "refreshToken": "eyJhb...",
      "expiresIn": 3600
    }
  }
}
```

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Foreman",
  "roleId": "550e8400-e29b-41d4-a716-446655440000",
  "companyId": "550e8400-e29b-41d4-a716-446655440001"
}

Response: 201 Created
{
  "success": true,
  "data": { "user": { ... } }
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhb..."
}

Response: 200 OK
{
  "success": true,
  "data": {
    "accessToken": "eyJhb...",
    "expiresIn": 3600
  }
}
```

#### Verify Token
```http
GET /auth/verify
Authorization: Bearer eyJhb...

Response: 200 OK
{
  "success": true,
  "data": {
    "userId": "550e8400-...",
    "email": "user@example.com",
    "role": "Foreman"
  }
}
```

### User Endpoints

#### Get Current User
```http
GET /users/me
Authorization: Bearer eyJhb...

Response: 200 OK
{
  "success": true,
  "data": { "user": { ... } }
}
```

#### Update Profile
```http
PUT /users/me
Authorization: Bearer eyJhb...
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1-555-1234",
  "languagePreference": "EN"
}

Response: 200 OK
{
  "success": true,
  "data": { "user": { ... } }
}
```

#### List Company Users
```http
GET /users?companyId=550e8400-e29b-41d4-a716-446655440001&limit=50&offset=0
Authorization: Bearer eyJhb...

Response: 200 OK
{
  "success": true,
  "data": [ { "user": {...} }, ... ],
  "pagination": {
    "total": 25,
    "limit": 50,
    "offset": 0
  }
}
```

### PTP Endpoints

#### Create PTP
```http
POST /ptps
Authorization: Bearer eyJhb...
Content-Type: application/json

{
  "projectId": "550e8400-e29b-41d4-a716-446655440002",
  "foremanId": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Daily PTP - April 17",
  "description": "Daily pre-task planning",
  "ptpDate": "2026-04-17T00:00:00Z",
  "shiftStartTime": "08:00",
  "shiftEndTime": "17:00",
  "weatherConditions": "Clear",
  "siteConditions": "Good"
}

Response: 201 Created
{
  "success": true,
  "data": { "ptp": { ... } }
}
```

#### List PTPs
```http
GET /ptps?projectId=550e8400-e29b-41d4-a716-446655440002&status=Draft
Authorization: Bearer eyJhb...

Response: 200 OK
{
  "success": true,
  "data": [ { "ptp": {...} }, ... ],
  "pagination": { ... }
}
```

#### Get PTP Details
```http
GET /ptps/550e8400-e29b-41d4-a716-446655440003
Authorization: Bearer eyJhb...

Response: 200 OK
{
  "success": true,
  "data": {
    "ptp": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "title": "Daily PTP",
      "status": "Draft",
      "details": {
        "activities": [...],
        "permits": [...],
        "crew": [...]
      }
    }
  }
}
```

#### Update PTP
```http
PUT /ptps/550e8400-e29b-41d4-a716-446655440003
Authorization: Bearer eyJhb...
Content-Type: application/json

{
  "title": "Updated Title",
  "weatherConditions": "Partly Cloudy"
}

Response: 200 OK
{
  "success": true,
  "data": { "ptp": { ... } }
}
```

#### Submit PTP for Review
```http
POST /ptps/550e8400-e29b-41d4-a716-446655440003/submit
Authorization: Bearer eyJhb...

Response: 200 OK
{
  "success": true,
  "data": { "ptp": { "status": "Submitted", ... } }
}
```

#### Approve PTP
```http
POST /ptps/550e8400-e29b-41d4-a716-446655440003/approve
Authorization: Bearer eyJhb...
Content-Type: application/json

{
  "comments": "Approved - all safety measures in place"
}

Response: 200 OK
{
  "success": true,
  "data": { "ptp": { "status": "Approved", ... } }
}
```

#### Reject PTP
```http
POST /ptps/550e8400-e29b-41d4-a716-446655440003/reject
Authorization: Bearer eyJhb...
Content-Type: application/json

{
  "reason": "Need more detail on control measures"
}

Response: 200 OK
{
  "success": true,
  "data": { "ptp": { "status": "Rejected", ... } }
}
```

#### Get PTP Statistics
```http
GET /ptps/550e8400-e29b-41d4-a716-446655440002/stats
Authorization: Bearer eyJhb...

Response: 200 OK
{
  "success": true,
  "data": {
    "total": 15,
    "draft": 3,
    "submitted": 5,
    "approved": 7,
    "rejected": 0
  }
}
```

---

## Error Responses

All errors follow a standard format:

```json
{
  "success": false,
  "status": 400,
  "message": "Error description",
  "errors": {
    "fieldName": ["Field-specific error message"]
  }
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Validation error
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `409` - Conflict (e.g., duplicate email)
- `500` - Server error

---

## Testing with cURL

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Verify Token
```bash
TOKEN="eyJhb..." # From login response
curl -X GET http://localhost:5000/api/v1/auth/verify \
  -H "Authorization: Bearer $TOKEN"
```

### Get Current User
```bash
curl -X GET http://localhost:5000/api/v1/users/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## Development Workflow

### 1. Make changes to TypeScript files
```bash
npm run dev  # Auto-recompiles on save
```

### 2. Check types
```bash
npm run type-check
```

### 3. Format code
```bash
npm run format
```

### 4. Run tests
```bash
npm run test
```

### 5. Check logs
Logs are output to console in development and to files in production:
- `logs/error.log` - Error logs
- `logs/combined.log` - All logs

---

## Troubleshooting

### Database Connection Failed
```
✗ Check PostgreSQL is running
✗ Verify DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
✗ Ensure database exists: createdb fieldapp
```

### Port Already in Use
```bash
# Change PORT in .env or run on different port
PORT=5001 npm run dev
```

### JWT Errors
```
"Invalid or expired token"
→ Token may have expired (1 hour default)
→ Use refresh token to get new access token
```

### Validation Errors
```
Ensure all required fields are provided and valid
→ Email must be valid format
→ Password must be 8+ characters
→ UUIDs must be valid format
```

---

## Production Deployment

### 1. Update .env
```env
NODE_ENV=production
JWT_SECRET=<generate-new-secret>
JWT_REFRESH_SECRET=<generate-new-secret>
# Add secure database URL
```

### 2. Build
```bash
npm run build
npm run db:migrate  # On production DB
```

### 3. Start Server
```bash
npm start
```

### 4. Monitor Logs
```bash
tail -f logs/combined.log
```

---

## Support & Documentation

- Backend Implementation: See [BACKEND_IMPLEMENTATION.md](../BACKEND_IMPLEMENTATION.md)
- Implementation Status: See [IMPLEMENTATION_STATUS.md](../IMPLEMENTATION_STATUS.md)
- REST API Design: See [PHASE_3_REST_API_DESIGN.md](../PHASE_3_REST_API_DESIGN.md)

---

Generated: April 17, 2026
