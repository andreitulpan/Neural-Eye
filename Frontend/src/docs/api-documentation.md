
# NeuralEye API Documentation

Base URL: `https://neuraleye.thezion.one`

## Authentication Endpoints

### 1. User Login
- **Endpoint:** `/api/auth/login`
- **Method:** `POST`
- **Requires Bearer Token:** No (Public endpoint)
- **Description:** Authenticate user and receive access token

**Request Payload:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "id": "int",
  "name": "string",
  "email": "string",
  "token": "string"
}
```

---

### 2. User Registration
- **Endpoint:** `/api/auth/register`
- **Method:** `POST`
- **Requires Bearer Token:** No (Public endpoint)
- **Description:** Register a new user account

**Request Payload:**
```json
{
  "fullname": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "string"
}
```

---


## Image Processing Endpoints

### 3. Save Image with OCR
- **Endpoint:** `/api/stream/saveimage`
- **Method:** `POST`
- **Requires Bearer Token:** Yes
- **Description:** Save image data and extract text using OCR

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Payload:**
```json
{
  "imageData": "string", // Base64 encoded image data
  "userId": "string"     // User ID
}
```

**Response:**
```json
{
  "success": "boolean",
  "text": "string",      // Extracted text from OCR
  "message": "string"
}
```

---

### 4. Get User Images
- **Endpoint:** `/api/stream/getimages/{userId}`
- **Method:** `GET`
- **Requires Bearer Token:** Yes
- **Description:** Retrieve all images and extracted text for a specific user

**Request Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `userId` (string) - The ID of the user whose images to retrieve

**Response:**
```json
[
  {
    "id": "int",
    "imageData": "Uint8Array | ArrayBuffer | int[] | string", // Binary image data
    "extractedText": "string",
    "user_id": "string"
  }
]
```

---

## Authentication Flow

1. **Registration/Login:** Use endpoints 1 or 2 to authenticate
2. **Token Storage:** Store the received token in localStorage
3. **Authenticated Requests:** Include the token in the Authorization header for endpoints 3 and 4

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials or missing token)
- `404` - Not Found
- `500` - Internal Server Error

Error responses typically include:
```json
{
  "message": "string" // Error description
}
```

## Notes

- All authenticated endpoints require a valid Bearer token in the Authorization header
- Image data is typically sent as base64 encoded strings for saving
- Retrieved image data may come in various binary formats (Uint8Array, ArrayBuffer, etc.)
- The API uses CORS, so cross-origin requests are supported
- All requests and responses use JSON format unless specified otherwise
