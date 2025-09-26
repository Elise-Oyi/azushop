# Order API - Postman Documentation

## Base URL
```
http://localhost:3000/api/orders
```

## Headers (Global)
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_AUTH_TOKEN"
}
```

**Note**: Most order endpoints require authentication. Only order tracking is public.

---

## 1. Create Order (Checkout)
**POST** `/api/orders/checkout`

### Request Body
```json
{
  "userId": "user123",
  "items": [
    {
      "productId": "prod789",
      "quantity": 1
    },
    {
      "productId": "prod456",
      "quantity": 2
    }
  ],
  "billingAddress": {
    "street": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "US"
  },
  "shippingAddress": {
    "street": "456 Oak Avenue",
    "city": "Brooklyn",
    "state": "NY", 
    "postalCode": "11201",
    "country": "US"
  },
  "paymentMethod": "paypal"
}
```

### Field Descriptions
- `userId` (string, required): User placing the order
- `items` (array, required): Array of items with productId and quantity only
  - `productId` (string, required): ID of the product to order
  - `quantity` (number, required): Quantity to order
- `billingAddress` (object, required): Billing address information
- `shippingAddress` (object, optional): Shipping address (defaults to billing)
- `paymentMethod` (string, required): Payment method - "paypal", "credit_card", or "bank_transfer"

### Success Response (200)
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "order123",
    "orderId": "ORD-1KX2M9-R7P5Q3",
    "total": 2549.97,
    "orderStatus": "pending",
    "paymentStatus": "pending"
  }
}
```

### Backend Processing
The system automatically handles:
1. **Product Lookup**: Fetches current product details from database
2. **Price Calculation**: Uses current product prices (prevents manipulation)
3. **Stock Validation**: Checks product availability and active status
4. **Subtotal Calculation**: Calculates based on current prices × quantities
5. **Shipping & Tax**: Applies country-based rates
6. **Total Calculation**: Subtotal + Shipping + Tax

### Auto-Actions
When order is created:
1. **Stock Reduction**: Product stock is decreased by ordered quantities
2. **Cart Clearing**: User's cart is emptied
3. **Order ID Generation**: Unique order ID is created
4. **Order Item Creation**: Full product details stored in order for historical record

### Error Response (400)
```json
{
  "success": false,
  "message": "Insufficient stock for Apple MacBook Pro 2019. Available: 5"
}
```

### Error Response (404)
```json
{
  "success": false,
  "message": "Product prod789 not found"
}
```

---

## 2. Get User Orders
**GET** `/api/orders/user/{userId}`

### Path Parameters
- `userId` (string): User ID to get orders for

### Query Parameters (Optional)
- `limit` (number): Maximum number of orders to return (default: 10)
- `status` (string): Filter by order status ("pending", "delivered", etc.)

### Example Request
```
GET /api/orders/user/user123?limit=5&status=delivered
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": [
    {
      "id": "order123",
      "orderId": "ORD-1KX2M9-R7P5Q3",
      "date": "2025-01-16T10:00:00Z",
      "total": 2549.97,
      "orderStatus": "delivered",
      "paymentStatus": "completed",
      "itemCount": 3,
      "firstItemImage": "https://example.com/macbook.jpg"
    },
    {
      "id": "order124", 
      "orderId": "ORD-2LY3N0-S8Q6R4",
      "date": "2025-01-15T14:30:00Z",
      "total": 899.99,
      "orderStatus": "shipped",
      "paymentStatus": "completed",
      "itemCount": 1,
      "firstItemImage": "https://example.com/iphone.jpg"
    }
  ]
}
```

### Order Status Values
- **pending**: Order placed, awaiting confirmation
- **confirmed**: Order confirmed, preparing for shipment
- **processing**: Order being prepared
- **shipped**: Order shipped, in transit
- **delivered**: Order delivered to customer
- **cancelled**: Order cancelled

---

## 3. Get Order Details
**GET** `/api/orders/{id}`

### Path Parameters
- `id` (string): Order ID (database ID, not orderId)

### Example Request
```
GET /api/orders/order123
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Order retrieved successfully",
  "data": {
    "id": "order123",
    "orderId": "ORD-1KX2M9-R7P5Q3", 
    "userId": "user123",
    "items": [
      {
        "productId": "prod789",
        "name": "Apple MacBook Pro 2019 | 16\"",
        "description": "RAM 16.0 GB | Memory 512 GB",
        "price": 749.99,
        "quantity": 1,
        "total": 749.99,
        "images": ["https://example.com/macbook.jpg"]
      }
    ],
    "subtotal": 2349.97,
    "shipping": 0.00,
    "tax": 200.00,
    "total": 2549.97,
    "billingAddress": {
      "street": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "US"
    },
    "shippingAddress": {
      "street": "456 Oak Avenue",
      "city": "Brooklyn",
      "state": "NY",
      "postalCode": "11201", 
      "country": "US"
    },
    "paymentMethod": "paypal",
    "paymentStatus": "completed",
    "orderStatus": "delivered",
    "trackingNumber": "1Z999AA1234567890",
    "createdAt": "2025-01-16T10:00:00Z",
    "updatedAt": "2025-01-18T15:30:00Z",
    "deliveredAt": "2025-01-18T15:30:00Z"
  }
}
```

---

## 4. Update Order Status (Admin Only)
**PUT** `/api/orders/{id}/status`

### Path Parameters
- `id` (string): Order ID

### Request Body
```json
{
  "orderStatus": "shipped",
  "paymentStatus": "completed",
  "trackingNumber": "1Z999AA1234567890"
}
```

### Field Descriptions
- `orderStatus` (string, optional): New order status
- `paymentStatus` (string, optional): New payment status
- `trackingNumber` (string, optional): Shipping tracking number

### Success Response (200)
```json
{
  "success": true,
  "message": "Order updated successfully",
  "data": {
    "id": "order123",
    "orderStatus": "shipped",
    "paymentStatus": "completed",
    "trackingNumber": "1Z999AA1234567890",
    "updatedAt": "2025-01-16T12:00:00Z"
  }
}
```

### Auto-Actions
- **Delivered Status**: Sets `deliveredAt` timestamp automatically
- **Status Validation**: Prevents invalid status transitions

---

## 5. Cancel Order
**PUT** `/api/orders/{id}/cancel`

### Path Parameters
- `id` (string): Order ID

### Request Body
```json
{
  "reason": "Customer requested cancellation"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Order cancelled successfully", 
  "data": {
    "id": "order123",
    "orderStatus": "cancelled",
    "paymentStatus": "refunded",
    "updatedAt": "2025-01-16T11:00:00Z"
  }
}
```

### Auto-Actions
When order is cancelled:
1. **Stock Restoration**: Product stock is increased by cancelled quantities
2. **Payment Status**: Set to "refunded" if payment was completed
3. **Status Validation**: Cannot cancel shipped/delivered orders

### Error Response (400)
```json
{
  "success": false,
  "message": "Cannot cancel order with status: shipped"
}
```

---

## 6. Track Order (Public)
**GET** `/api/orders/track/{orderId}`

### Path Parameters
- `orderId` (string): Public order ID (e.g., "ORD-1KX2M9-R7P5Q3")

### Example Request
```
GET /api/orders/track/ORD-1KX2M9-R7P5Q3
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Order tracking info retrieved",
  "data": {
    "orderId": "ORD-1KX2M9-R7P5Q3",
    "orderStatus": "shipped",
    "trackingNumber": "1Z999AA1234567890",
    "createdAt": "2025-01-16T10:00:00Z",
    "deliveredAt": null,
    "shippingAddress": {
      "city": "Brooklyn",
      "country": "US"
    }
  }
}
```

### Public Access
- **No Authentication Required**: Anyone with order ID can track
- **Limited Information**: Only shows tracking-relevant data
- **Privacy Protection**: Full address details are masked

---

## Order Data Models

### Order Object
```typescript
{
  id: string,                    // Database ID
  orderId: string,              // Public order ID (ORD-XXX-XXX)
  userId: string,               // Customer ID
  items: OrderItem[],           // Ordered products
  
  // Pricing breakdown
  subtotal: number,             // Sum of item totals
  shipping: number,             // Shipping cost
  tax: number,                  // Tax amount
  total: number,                // Final total
  
  // Addresses
  billingAddress: Address,      // Billing address
  shippingAddress: Address,     // Shipping address
  
  // Payment info
  paymentMethod: string,        // "paypal" | "credit_card" | "bank_transfer"
  paymentStatus: string,        // "pending" | "completed" | "failed" | "refunded"
  
  // Order tracking
  orderStatus: string,          // "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
  trackingNumber?: string,      // Shipping tracking number
  
  // Timestamps
  createdAt: Date,             // Order creation time
  updatedAt: Date,             // Last modification time
  deliveredAt?: Date           // Delivery timestamp
}
```

### OrderItem Object
```typescript
{
  productId: string,           // Product reference
  name: string,                // Product name at time of order
  description?: string,        // Product description
  price: number,              // Unit price at time of order
  quantity: number,           // Quantity ordered
  total: number,              // price * quantity
  images?: string[]           // Product images
}
```

---

## Pricing & Calculations

### Shipping Calculator
- **Free Shipping**: Orders over $100
- **Country Rates**: US: $10, UK: $12, Canada: $15, Default: $20

### Tax Calculator
- **US**: 8%
- **UK**: 20%
- **Canada**: 13%
- **Germany/France**: 19%/20%
- **Default**: 5%

### Order ID Format
- Pattern: `ORD-{TIMESTAMP}-{RANDOM}`
- Example: `ORD-1KX2M9-R7P5Q3`
- Always uppercase, URL-safe

---

## Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Missing required checkout information"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "Admin access required"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Order not found"
}
```

---

## Postman Collection Setup

### Environment Variables
```
base_url: http://localhost:3000
user_id: user123
order_id: order123
order_public_id: ORD-1KX2M9-R7P5Q3
auth_token: YOUR_JWT_TOKEN
admin_token: YOUR_ADMIN_JWT_TOKEN
```

### Pre-request Scripts (Global)
```javascript
// Set authorization header for protected routes
if (pm.request.url.toString().includes('/checkout') || 
    pm.request.url.toString().includes('/user/') ||
    pm.request.url.toString().includes('/status')) {
    pm.request.headers.add({
        key: 'Authorization',
        value: 'Bearer ' + pm.environment.get('auth_token')
    });
}

// Set admin token for admin routes
if (pm.request.url.toString().includes('/status')) {
    pm.request.headers.add({
        key: 'Authorization', 
        value: 'Bearer ' + pm.environment.get('admin_token')
    });
}
```

### Test Scripts Examples

#### For Checkout (POST /api/orders/checkout)
```javascript
// Test successful order creation
pm.test("Order created successfully", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property('orderId');
    
    // Save order details for other tests
    pm.environment.set('created_order_id', jsonData.data.id);
    pm.environment.set('created_order_public_id', jsonData.data.orderId);
});

// Test order ID format
pm.test("Order ID has correct format", function () {
    var jsonData = pm.response.json();
    var orderIdPattern = /^ORD-[A-Z0-9]+-[A-Z0-9]+$/;
    pm.expect(jsonData.data.orderId).to.match(orderIdPattern);
});

// Test total calculation
pm.test("Total calculated correctly", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.total).to.be.a('number');
    pm.expect(jsonData.data.total).to.be.above(0);
});
```

#### For Get User Orders (GET /api/orders/user/{userId})
```javascript
// Test orders retrieval
pm.test("Orders retrieved successfully", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.be.an('array');
});

// Test order structure
pm.test("Each order has required fields", function () {
    var jsonData = pm.response.json();
    if (jsonData.data.length > 0) {
        var order = jsonData.data[0];
        pm.expect(order).to.have.property('orderId');
        pm.expect(order).to.have.property('orderStatus');
        pm.expect(order).to.have.property('total');
        pm.expect(order).to.have.property('date');
    }
});

// Test date sorting (newest first)
pm.test("Orders sorted by date (newest first)", function () {
    var jsonData = pm.response.json();
    if (jsonData.data.length > 1) {
        var firstDate = new Date(jsonData.data[0].date);
        var secondDate = new Date(jsonData.data[1].date);
        pm.expect(firstDate.getTime()).to.be.at.least(secondDate.getTime());
    }
});
```

#### For Track Order (GET /api/orders/track/{orderId})
```javascript
// Test public tracking access
pm.test("Order tracking accessible without auth", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property('orderStatus');
});

// Test limited information exposure
pm.test("Tracking shows limited info only", function () {
    var jsonData = pm.response.json();
    var trackingData = jsonData.data;
    
    // Should have tracking info
    pm.expect(trackingData).to.have.property('orderId');
    pm.expect(trackingData).to.have.property('orderStatus');
    
    // Should NOT have sensitive info
    pm.expect(trackingData).to.not.have.property('userId');
    pm.expect(trackingData).to.not.have.property('paymentMethod');
    pm.expect(trackingData).to.not.have.property('items');
});
```

#### For Order Status Update (PUT /api/orders/{id}/status)
```javascript
// Test admin status update
pm.test("Order status updated successfully", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    
    var requestBody = JSON.parse(pm.request.body.raw);
    if (requestBody.orderStatus) {
        pm.expect(jsonData.data.orderStatus).to.equal(requestBody.orderStatus);
    }
});

// Test delivered timestamp
pm.test("Delivered status sets timestamp", function () {
    var requestBody = JSON.parse(pm.request.body.raw);
    if (requestBody.orderStatus === 'delivered') {
        pm.response.to.have.status(200);
        var jsonData = pm.response.json();
        pm.expect(jsonData.data).to.have.property('deliveredAt');
    }
});
```

---

## Sample Data for Testing

### Checkout Sample (Single Item)
```json
{
  "userId": "user123",
  "items": [
    {
      "productId": "prod789",
      "quantity": 1
    }
  ],
  "billingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "postalCode": "10001",
    "country": "US"
  },
  "paymentMethod": "paypal"
}
```

### Checkout Sample (Multiple Items)
```json
{
  "userId": "user123",
  "items": [
    {
      "productId": "prod789",
      "quantity": 1
    },
    {
      "productId": "prod456",
      "quantity": 2
    }
  ],
  "billingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "postalCode": "10001",
    "country": "US"
  },
  "shippingAddress": {
    "street": "456 Oak Ave",
    "city": "Brooklyn", 
    "postalCode": "11201",
    "country": "US"
  },
  "paymentMethod": "credit_card"
}
```

### Status Update Sample
```json
{
  "orderStatus": "shipped",
  "trackingNumber": "1Z999AA1234567890"
}
```

### Cancel Order Sample
```json
{
  "reason": "Customer changed mind"
}
```

---

## Integration Workflows

### Complete Order Flow
1. **Get Cart**: `GET /api/cart/user123`
2. **Validate Items**: Check stock and prices
3. **Checkout**: `POST /api/orders/checkout` (cart data → order)
4. **Track Progress**: `GET /api/orders/track/ORD-XXX`
5. **View Details**: `GET /api/orders/order123`

### Admin Order Management
1. **View Orders**: `GET /api/orders/user/user123`
2. **Update Status**: `PUT /api/orders/order123/status`
3. **Add Tracking**: Include tracking number in status update
4. **Handle Cancellations**: `PUT /api/orders/order123/cancel`

### Customer Self-Service
1. **Order History**: `GET /api/orders/user/user123`
2. **Order Details**: `GET /api/orders/order123`
3. **Track Order**: `GET /api/orders/track/ORD-XXX` (no auth required)
4. **Cancel Order**: `PUT /api/orders/order123/cancel` (if eligible)

---

## Business Rules

### Order Creation
- **Stock Validation**: All items must be in stock
- **Product Validation**: Products must be active
- **Address Validation**: Billing address is required
- **Auto-Calculations**: Shipping, tax, and totals computed automatically

### Order Status Transitions
- **Valid Flow**: pending → confirmed → processing → shipped → delivered
- **Cancellation**: Any status except shipped/delivered can be cancelled
- **Payment**: Independent of order status, can be updated separately

### Stock Management
- **Order Creation**: Stock reduced immediately
- **Order Cancellation**: Stock restored immediately
- **No Reservation**: Stock not held during checkout process

### Pricing Preservation
- **Order Snapshot**: Item prices frozen at order time
- **Shipping Calculation**: Based on subtotal and destination
- **Tax Calculation**: Based on billing address country
- **Currency**: All amounts in USD with 2 decimal precision