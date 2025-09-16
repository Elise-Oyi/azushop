# Product API - Postman Documentation

## Base URL
```
http://localhost:3000/api/products
```

## Headers (Global)
```json
{
  "Content-Type": "application/json"
}
```

---

## 1. Create Product
**POST** `/api/products`

### Request Body
```json
{
  "name": "iPhone 15 Pro",
  "description": "Latest iPhone with advanced camera system",
  "price": 999.99,
  "stock": 50,
  "category": "Electronics",
  "images": [
    "https://example.com/iphone1.jpg",
    "https://example.com/iphone2.jpg"
  ],
  "setTrending": true,
  "isActive": true
}
```

### Success Response (201)
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "abc123",
    "name": "iPhone 15 Pro",
    "description": "Latest iPhone with advanced camera system",
    "price": 999.99,
    "stock": 50,
    "category": "Electronics",
    "images": ["https://example.com/iphone1.jpg"],
    "setTrending": true,
    "ratings": 0,
    "reviewCount": 0,
    "isActive": true,
    "createdAt": "2025-01-16T10:00:00Z",
    "updatedAt": "2025-01-16T10:00:00Z"
  }
}
```

### Error Response (400)
```json
{
  "success": false,
  "message": "Missing required fields"
}
```

---

## 2. Get All Products
**GET** `/api/products`

### Query Parameters (Optional)
- `limit` (number): Limit results (e.g., `?limit=10`)
- `pageToken` (string): Pagination token (e.g., `?pageToken=abc123`)
- `includeTotal` (boolean): Include total count (e.g., `?includeTotal=true`)

### Example Request
```
GET /api/products?limit=5&includeTotal=true
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "items": [
      {
        "id": "abc123",
        "name": "iPhone 15 Pro",
        "price": 999.99,
        "category": "Electronics",
        "stock": 50,
        "isActive": true,
        "createdAt": "2025-01-16T10:00:00Z"
      }
    ],
    "total": 25,
    "nextPageToken": "def456"
  }
}
```

---

## 3. Get Product by ID
**GET** `/api/products/{id}`

### Path Parameters
- `id` (string): Product ID

### Example Request
```
GET /api/products/abc123
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "id": "abc123",
    "name": "iPhone 15 Pro",
    "description": "Latest iPhone with advanced camera system",
    "price": 999.99,
    "stock": 50,
    "category": "Electronics",
    "images": ["https://example.com/iphone1.jpg"],
    "setTrending": true,
    "ratings": 4.5,
    "reviewCount": 125,
    "isActive": true,
    "createdAt": "2025-01-16T10:00:00Z",
    "updatedAt": "2025-01-16T10:00:00Z"
  }
}
```

### Error Response (404)
```json
{
  "success": false,
  "message": "Product not found"
}
```

---

## 4. Update Product
**PUT** `/api/products/{id}`

### Path Parameters
- `id` (string): Product ID

### Request Body (Partial Update)
```json
{
  "price": 899.99,
  "stock": 75,
  "setTrending": false
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": "abc123",
    "price": 899.99,
    "stock": 75,
    "setTrending": false
  }
}
```

### Error Response (404)
```json
{
  "success": false,
  "message": "Product not found"
}
```

---

## 5. Delete Product
**DELETE** `/api/products/{id}`

### Path Parameters
- `id` (string): Product ID

### Example Request
```
DELETE /api/products/abc123
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

### Error Response (404)
```json
{
  "success": false,
  "message": "Product not found"
}
```

---

## 6. Get Related Products
**GET** `/api/products/{id}/related`

### Path Parameters
- `id` (string): Product ID to get related products for

### Query Parameters (Optional)
- `limit` (number): Number of related products to return (default: 4)

### Example Request
```
GET /api/products/abc123/related?limit=6
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Related products retrieved successfully",
  "data": [
    {
      "id": "def456",
      "name": "iPhone 15",
      "description": "Standard iPhone model",
      "price": 799.99,
      "stock": 30,
      "category": "Electronics",
      "images": ["https://example.com/iphone15.jpg"],
      "setTrending": false,
      "ratings": 4.2,
      "reviewCount": 89,
      "isActive": true,
      "createdAt": "2025-01-15T09:00:00Z",
      "updatedAt": "2025-01-15T09:00:00Z"
    },
    {
      "id": "ghi789",
      "name": "Samsung Galaxy S24",
      "description": "Latest Samsung flagship",
      "price": 899.99,
      "stock": 45,
      "category": "Electronics",
      "images": ["https://example.com/galaxy.jpg"],
      "setTrending": true,
      "ratings": 4.4,
      "reviewCount": 156,
      "isActive": true,
      "createdAt": "2025-01-14T08:00:00Z",
      "updatedAt": "2025-01-14T08:00:00Z"
    }
  ]
}
```

### Algorithm Logic
The related products are selected using this priority:
1. **Same Category**: Products from the same category as the current product
2. **Trending Products**: If not enough same-category products, add trending products
3. **Any Active Products**: If still needed, add any active products
4. **Exclusions**: Current product is always excluded, duplicates are filtered out

### Error Response (404)
```json
{
  "success": false,
  "message": "Product not found"
}
```

---

## Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Missing required fields"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Product not found"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Something went wrong"
}
```

---

## Postman Collection Setup

### Environment Variables
Create a Postman environment with:
```
base_url: http://localhost:3000
```

### Pre-request Scripts (Optional)
For authentication (when middleware is added):
```javascript
// Set authorization header
pm.request.headers.add({
    key: 'Authorization',
    value: 'Bearer ' + pm.environment.get('auth_token')
});
```

### Test Scripts Example
Add to each request:
```javascript
// Test status code
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Test response structure
pm.test("Response has success field", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
});
```

---

## Sample Data for Testing

### Electronics Product
```json
{
  "name": "MacBook Pro M3",
  "description": "Professional laptop with M3 chip",
  "price": 1999.99,
  "stock": 25,
  "category": "Electronics",
  "images": ["https://example.com/macbook.jpg"],
  "setTrending": true,
  "isActive": true
}
```

### Clothing Product
```json
{
  "name": "Nike Air Max",
  "description": "Comfortable running shoes",
  "price": 129.99,
  "stock": 100,
  "category": "Footwear",
  "images": ["https://example.com/nike.jpg"],
  "setTrending": false,
  "isActive": true
}
```