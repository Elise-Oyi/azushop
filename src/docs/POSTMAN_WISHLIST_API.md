# Wishlist API - Postman Documentation

## Base URL
```
http://localhost:3000/api/wishlist
```

## Headers (Global)
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_AUTH_TOKEN"
}
```

**Note**: All wishlist endpoints require authentication.

---

## 1. Get User Wishlist
**GET** `/api/wishlist/{userId}`

### Path Parameters
- `userId` (string): User ID to get wishlist for

### Example Request
```
GET /api/wishlist/user123
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Wishlist retrieved successfully",
  "data": {
    "id": "wishlist456",
    "userId": "user123",
    "productIds": ["prod789", "prod101"],
    "products": [
      {
        "id": "prod789",
        "name": "Apple MacBook Pro 2019 | 16\"",
        "description": "Professional laptop with advanced features",
        "price": 749.99,
        "images": ["https://example.com/macbook.jpg"],
        "category": "Electronics",
        "ratings": 4.8,
        "reviewCount": 125,
        "stock": 25,
        "isActive": true,
        "setTrending": false,
        "createdAt": "2025-01-15T10:00:00Z",
        "updatedAt": "2025-01-16T08:00:00Z"
      },
      {
        "id": "prod101",
        "name": "Sony WH-1000XM4 Headphones",
        "description": "Premium noise-canceling headphones",
        "price": 299.99,
        "images": ["https://example.com/headphones.jpg"],
        "category": "Audio",
        "ratings": 4.6,
        "reviewCount": 89,
        "stock": 15,
        "isActive": true,
        "setTrending": true,
        "createdAt": "2025-01-14T12:00:00Z",
        "updatedAt": "2025-01-16T09:00:00Z"
      }
    ],
    "itemCount": 2,
    "updatedAt": "2025-01-16T10:30:00Z"
  }
}
```

### Auto-Creation Feature
If user doesn't have a wishlist, one will be automatically created with empty product list.

---

## 2. Add Product to Wishlist
**POST** `/api/wishlist/add`

### Request Body
```json
{
  "userId": "user123",
  "productId": "prod789"
}
```

### Field Descriptions
- `userId` (string, required): User ID
- `productId` (string, required): Product ID to add to wishlist

### Success Response (200)
```json
{
  "success": true,
  "message": "Product added to wishlist successfully",
  "data": {
    "id": "wishlist456",
    "userId": "user123",
    "productIds": ["prod789"],
    "products": [
      {
        "id": "prod789",
        "name": "Apple MacBook Pro 2019 | 16\"",
        "description": "Professional laptop with advanced features",
        "price": 749.99,
        "images": ["https://example.com/macbook.jpg"],
        "category": "Electronics",
        "ratings": 4.8,
        "reviewCount": 125,
        "stock": 25,
        "isActive": true,
        "setTrending": false,
        "createdAt": "2025-01-15T10:00:00Z",
        "updatedAt": "2025-01-16T08:00:00Z"
      }
    ],
    "itemCount": 1,
    "updatedAt": "2025-01-16T10:30:00Z"
  }
}
```

### Smart Features
- **Duplicate Prevention**: If product already exists in wishlist, returns error
- **Product Validation**: Checks if product exists before adding
- **Auto-Creation**: Creates wishlist automatically if user doesn't have one

### Error Response (400)
```json
{
  "success": false,
  "message": "Product already in wishlist"
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

## 3. Remove Product from Wishlist
**DELETE** `/api/wishlist/{userId}/item/{productId}`

### Path Parameters
- `userId` (string): User ID
- `productId` (string): Product ID to remove from wishlist

### Example Request
```
DELETE /api/wishlist/user123/item/prod789
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Product removed from wishlist successfully",
  "data": {
    "id": "wishlist456",
    "userId": "user123",
    "productIds": ["prod101"],
    "products": [
      {
        "id": "prod101",
        "name": "Sony WH-1000XM4 Headphones",
        "description": "Premium noise-canceling headphones",
        "price": 299.99,
        "images": ["https://example.com/headphones.jpg"],
        "category": "Audio",
        "ratings": 4.6,
        "reviewCount": 89,
        "stock": 15,
        "isActive": true,
        "setTrending": true,
        "createdAt": "2025-01-14T12:00:00Z",
        "updatedAt": "2025-01-16T09:00:00Z"
      }
    ],
    "itemCount": 1,
    "updatedAt": "2025-01-16T11:15:00Z"
  }
}
```

### Error Response (404)
```json
{
  "success": false,
  "message": "Product not found in wishlist"
}
```

### Error Response (404)
```json
{
  "success": false,
  "message": "Wishlist not found"
}
```

---

## 4. Clear Entire Wishlist
**DELETE** `/api/wishlist/{userId}/clear`

### Path Parameters
- `userId` (string): User ID whose wishlist to clear

### Example Request
```
DELETE /api/wishlist/user123/clear
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Wishlist cleared successfully",
  "data": {
    "id": "wishlist456",
    "userId": "user123",
    "productIds": [],
    "products": [],
    "itemCount": 0,
    "updatedAt": "2025-01-16T11:30:00Z"
  }
}
```

### Error Response (404)
```json
{
  "success": false,
  "message": "Wishlist not found"
}
```

---

## 5. Check Product Wishlist Status
**GET** `/api/wishlist/{userId}/status/{productId}`

### Path Parameters
- `userId` (string): User ID
- `productId` (string): Product ID to check wishlist status for

### Example Request
```
GET /api/wishlist/user123/status/prod789
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Wishlist status checked",
  "data": {
    "productId": "prod789",
    "isInWishlist": true
  }
}
```

### Use Cases
- **UI State Management**: Toggle heart/wishlist icons based on status
- **Product Page**: Show correct wishlist button state
- **Conditional Actions**: Enable/disable wishlist operations

---

## Wishlist Data Model

### Wishlist Object
```typescript
{
  id: string,              // Wishlist ID
  userId: string,          // Owner user ID
  productIds: string[],    // Array of product IDs
  products: Product[],     // Populated product details (response only)
  itemCount: number,       // Total number of products (response only)
  updatedAt: Date          // Last modification time
}
```

### Product Object (in wishlist response)
```typescript
{
  id: string,              // Product ID
  name: string,            // Product name
  description: string,     // Product description
  price: number,          // Current product price
  images: string[],       // Product image URLs
  category: string,       // Product category
  ratings: number,        // Average ratings (0-5)
  reviewCount: number,    // Number of reviews
  stock: number,          // Available stock
  isActive: boolean,      // Product availability status
  setTrending: boolean,   // Trending product flag
  createdAt: Date,        // Product creation date
  updatedAt: Date         // Product last update
}
```

---

## Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "message": "User ID and Product ID are required"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Wishlist not found"
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
```
base_url: http://localhost:3000
user_id: user123
product_id: prod789
auth_token: YOUR_JWT_TOKEN
```

### Pre-request Scripts (Global)
```javascript
// Set authorization header
pm.request.headers.add({
    key: 'Authorization',
    value: 'Bearer ' + pm.environment.get('auth_token')
});
```

### Test Scripts Examples

#### For Get Wishlist (GET /api/wishlist/{userId})
```javascript
// Test successful retrieval
pm.test("Wishlist retrieved successfully", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property('products');
    pm.expect(jsonData.data.products).to.be.an('array');
});

// Test wishlist structure
pm.test("Wishlist has required fields", function () {
    var jsonData = pm.response.json();
    var wishlist = jsonData.data;
    pm.expect(wishlist).to.have.property('userId');
    pm.expect(wishlist).to.have.property('productIds');
    pm.expect(wishlist).to.have.property('itemCount');
    pm.expect(wishlist.itemCount).to.equal(wishlist.products.length);
});
```

#### For Add to Wishlist (POST /api/wishlist/add)
```javascript
// Test successful addition
pm.test("Product added to wishlist", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.products.length).to.be.at.least(1);
});

// Test product inclusion
pm.test("Added product is in wishlist", function () {
    var jsonData = pm.response.json();
    var requestBody = JSON.parse(pm.request.body.raw);
    var addedProduct = jsonData.data.productIds.includes(requestBody.productId);
    pm.expect(addedProduct).to.be.true;
});

// Test item count accuracy
pm.test("Item count matches product array length", function () {
    var jsonData = pm.response.json();
    var wishlist = jsonData.data;
    pm.expect(wishlist.itemCount).to.equal(wishlist.products.length);
    pm.expect(wishlist.itemCount).to.equal(wishlist.productIds.length);
});
```

#### For Remove from Wishlist (DELETE /api/wishlist/{userId}/item/{productId})
```javascript
// Test successful removal
pm.test("Product removed from wishlist", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
});

// Test product exclusion
pm.test("Removed product not in wishlist", function () {
    var jsonData = pm.response.json();
    var productId = pm.request.url.path[pm.request.url.path.length - 1];
    var productExists = jsonData.data.productIds.includes(productId);
    pm.expect(productExists).to.be.false;
});
```

#### For Check Wishlist Status (GET /api/wishlist/{userId}/status/{productId})
```javascript
// Test status check response
pm.test("Status check successful", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property('productId');
    pm.expect(jsonData.data).to.have.property('isInWishlist');
    pm.expect(jsonData.data.isInWishlist).to.be.a('boolean');
});
```

---

## Sample Data for Testing

### Add to Wishlist Sample
```json
{
  "userId": "user123",
  "productId": "prod456"
}
```

### Remove from Wishlist Sample
```
DELETE /api/wishlist/user123/item/prod456
```

### Check Status Sample
```
GET /api/wishlist/user123/status/prod456
```

---

## Integration Workflows

### Complete Wishlist Management Flow
1. **Get Wishlist**: `GET /api/wishlist/user123`
2. **Add Products**: `POST /api/wishlist/add` (multiple products)
3. **Check Status**: `GET /api/wishlist/user123/status/prod456` (for UI updates)
4. **Remove Products**: `DELETE /api/wishlist/user123/item/prod456`
5. **Clear Wishlist**: `DELETE /api/wishlist/user123/clear` (if needed)

### Frontend Integration Tips
- **Wishlist Badge**: Use `itemCount` for wishlist icon badge
- **Heart Icons**: Use `isInWishlist` status for toggle states
- **Product Lists**: Show wishlist button state based on status check
- **Auto-refresh**: Call get wishlist after any modifications
- **Performance**: Cache status checks to reduce API calls

### E-commerce Integration
- **Product Pages**: Show wishlist status and toggle functionality
- **Wishlist Page**: Display full wishlist with remove options
- **Navigation**: Show wishlist count in header/menu
- **Cross-selling**: Use wishlist data for recommendations
- **Cart Integration**: Easy "move to cart" from wishlist

---

## Business Logic Notes

### Product Availability
- Deleted/inactive products are filtered out from wishlist responses
- `isActive` flag indicates product availability
- Stock information is included for purchase decisions
- Price changes are reflected in real-time

### Data Consistency
- Product details are populated on each request for fresh data
- Wishlist maintains product ID references for consistency
- Auto-cleanup removes references to deleted products
- Item count always matches actual product array length

### Performance Considerations
- Product population happens server-side to reduce client requests
- Status checks are lightweight for frequent UI updates
- Wishlist creation is lazy (created when first needed)
- Bulk operations should be batched when possible

### User Experience
- Immediate feedback on all wishlist operations
- Duplicate prevention with clear error messages
- Graceful handling of deleted/unavailable products
- Persistent wishlist across user sessions