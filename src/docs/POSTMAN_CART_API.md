# Cart API - Postman Documentation

## Base URL
```
http://localhost:3000/api/cart
```

## Headers (Global)
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_AUTH_TOKEN"
}
```

**Note**: All cart endpoints require authentication.

---

## 1. Get User Cart
**GET** `/api/cart/{userId}`

### Path Parameters
- `userId` (string): User ID to get cart for

### Example Request
```
GET /api/cart/user123
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Cart retrieved successfully",
  "data": {
    "id": "cart456",
    "userId": "user123",
    "items": [
      {
        "productId": "prod789",
        "quantity": 2,
        "price": 749.99,
        "total": 1499.98,
        "addedAt": "2025-01-16T10:00:00Z",
        "product": {
          "id": "prod789",
          "name": "Apple MacBook Pro 2019 | 16\"",
          "description": "Professional laptop with advanced features",
          "images": ["https://example.com/macbook.jpg"],
          "currentPrice": 749.99,
          "stock": 25,
          "isActive": true
        }
      }
    ],
    "totalAmount": 1499.98,
    "itemCount": 2,
    "updatedAt": "2025-01-16T10:30:00Z"
  }
}
```

### Auto-Creation Feature
If user doesn't have a cart, one will be automatically created with empty items.

---

## 2. Add Item to Cart
**POST** `/api/cart/add`

### Request Body
```json
{
  "userId": "user123",
  "productId": "prod789",
  "quantity": 2
}
```

### Field Descriptions
- `userId` (string, required): User ID
- `productId` (string, required): Product ID to add
- `quantity` (number, optional): Quantity to add (default: 1)

### Success Response (200)
```json
{
  "success": true,
  "message": "Item added to cart successfully",
  "data": {
    "id": "cart456",
    "userId": "user123",
    "items": [
      {
        "productId": "prod789",
        "quantity": 2,
        "price": 749.99,
        "total": 1499.98,
        "addedAt": "2025-01-16T10:00:00Z",
        "product": {
          "id": "prod789",
          "name": "Apple MacBook Pro 2019 | 16\"",
          "currentPrice": 749.99,
          "stock": 23
        }
      }
    ],
    "totalAmount": 1499.98,
    "itemCount": 2,
    "updatedAt": "2025-01-16T10:30:00Z"
  }
}
```

### Smart Features
- **Duplicate Handling**: If item already exists, quantities are merged
- **Stock Validation**: Checks product availability before adding
- **Price Preservation**: Stores price at time of adding to cart
- **Auto-Calculation**: Updates totals and item counts automatically

### Error Response (400)
```json
{
  "success": false,
  "message": "Insufficient stock"
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

## 3. Update Cart Item Quantity
**PUT** `/api/cart/update`

### Request Body
```json
{
  "userId": "user123",
  "productId": "prod789",
  "quantity": 3
}
```

### Field Descriptions
- `userId` (string, required): User ID
- `productId` (string, required): Product ID to update
- `quantity` (number, required): New quantity (0 or negative removes item)

### Success Response (200)
```json
{
  "success": true,
  "message": "Cart updated successfully",
  "data": {
    "id": "cart456",
    "userId": "user123",
    "items": [
      {
        "productId": "prod789",
        "quantity": 3,
        "price": 749.99,
        "total": 2249.97,
        "product": {
          "name": "Apple MacBook Pro 2019 | 16\"",
          "currentPrice": 749.99,
          "stock": 22
        }
      }
    ],
    "totalAmount": 2249.97,
    "itemCount": 3,
    "updatedAt": "2025-01-16T11:00:00Z"
  }
}
```

### Special Behaviors
- **Quantity = 0**: Removes item from cart
- **Stock Validation**: Checks availability before updating
- **Auto-Remove**: Items with quantity ≤ 0 are automatically removed

---

## 4. Remove Item from Cart
**DELETE** `/api/cart/{userId}/item/{productId}`

### Path Parameters
- `userId` (string): User ID
- `productId` (string): Product ID to remove

### Example Request
```
DELETE /api/cart/user123/item/prod789
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Item removed from cart successfully",
  "data": {
    "id": "cart456",
    "userId": "user123",
    "items": [],
    "totalAmount": 0,
    "itemCount": 0,
    "updatedAt": "2025-01-16T11:15:00Z"
  }
}
```

### Error Response (404)
```json
{
  "success": false,
  "message": "Item not found in cart"
}
```

---

## 5. Clear Entire Cart
**DELETE** `/api/cart/{userId}/clear`

### Path Parameters
- `userId` (string): User ID whose cart to clear

### Example Request
```
DELETE /api/cart/user123/clear
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Cart cleared successfully",
  "data": {
    "id": "cart456",
    "userId": "user123",
    "items": [],
    "totalAmount": 0,
    "itemCount": 0,
    "updatedAt": "2025-01-16T11:30:00Z"
  }
}
```

---

## Cart Data Model

### Cart Object
```typescript
{
  id: string,              // Cart ID
  userId: string,          // Owner user ID
  items: CartItem[],       // Array of cart items
  totalAmount: number,     // Total cart value
  itemCount: number,       // Total quantity of items
  updatedAt: Date          // Last modification time
}
```

### CartItem Object
```typescript
{
  productId: string,       // Product reference
  quantity: number,        // Quantity in cart
  price: number,          // Price when added to cart
  total: number,          // price * quantity (calculated)
  addedAt: Date,          // When added to cart
  product: {              // Populated product details
    id: string,
    name: string,
    description: string,
    images: string[],
    currentPrice: number,  // Current product price (may differ from cart price)
    stock: number,
    isActive: boolean
  }
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
  "message": "Cart not found"
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

#### For Get Cart (GET /api/cart/{userId})
```javascript
// Test successful retrieval
pm.test("Cart retrieved successfully", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property('items');
    pm.expect(jsonData.data.items).to.be.an('array');
});

// Test cart structure
pm.test("Cart has required fields", function () {
    var jsonData = pm.response.json();
    var cart = jsonData.data;
    pm.expect(cart).to.have.property('userId');
    pm.expect(cart).to.have.property('totalAmount');
    pm.expect(cart).to.have.property('itemCount');
});
```

#### For Add to Cart (POST /api/cart/add)
```javascript
// Test successful addition
pm.test("Item added to cart", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.items.length).to.be.at.least(1);
});

// Test total calculation
pm.test("Total amount calculated correctly", function () {
    var jsonData = pm.response.json();
    var cart = jsonData.data;
    var calculatedTotal = cart.items.reduce((sum, item) => sum + item.total, 0);
    pm.expect(cart.totalAmount).to.equal(calculatedTotal);
});

// Test item count
pm.test("Item count matches quantities", function () {
    var jsonData = pm.response.json();
    var cart = jsonData.data;
    var calculatedCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    pm.expect(cart.itemCount).to.equal(calculatedCount);
});
```

#### For Update Cart (PUT /api/cart/update)
```javascript
// Test quantity update
pm.test("Quantity updated successfully", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    
    // Find the updated item
    var requestBody = JSON.parse(pm.request.body.raw);
    var updatedItem = jsonData.data.items.find(item => 
        item.productId === requestBody.productId
    );
    
    if (requestBody.quantity > 0) {
        pm.expect(updatedItem).to.not.be.undefined;
        pm.expect(updatedItem.quantity).to.equal(requestBody.quantity);
    }
});
```

---

## Sample Data for Testing

### Add to Cart Sample
```json
{
  "userId": "user123",
  "productId": "prod456",
  "quantity": 1
}
```

### Update Cart Sample
```json
{
  "userId": "user123", 
  "productId": "prod456",
  "quantity": 3
}
```

### Remove Item Sample
```
DELETE /api/cart/user123/item/prod456
```

---

## Integration Workflows

### Complete Shopping Flow
1. **Get Cart**: `GET /api/cart/user123`
2. **Add Items**: `POST /api/cart/add` (multiple products)
3. **Update Quantities**: `PUT /api/cart/update` (adjust quantities)
4. **Remove Items**: `DELETE /api/cart/user123/item/prod456`
5. **Proceed to Checkout**: Use cart data for order creation
6. **Clear Cart**: `DELETE /api/cart/user123/clear` (after successful order)

### Frontend Integration Tips
- **Cart Badge**: Use `itemCount` for cart icon badge
- **Cart Total**: Display `totalAmount` for checkout
- **Stock Checks**: Compare `product.stock` with `quantity`
- **Price Changes**: Show difference between `price` and `currentPrice`
- **Auto-refresh**: Call get cart after any cart modifications

---

## Business Logic Notes

### Price Preservation
- Cart items store the price at the time they were added
- Current product price may differ from cart price
- This prevents cart totals from changing due to price updates
- Display both prices to show savings/increases

### Stock Management
- System validates stock before adding/updating items
- Items can be added up to available stock quantity
- Stock is not reserved until order is placed
- Frontend should handle stock changes gracefully

### Cart Persistence
- Carts are persistent across user sessions
- Items remain in cart until explicitly removed
- Auto-creation ensures users always have a cart
- Consider implementing cart expiration for old items