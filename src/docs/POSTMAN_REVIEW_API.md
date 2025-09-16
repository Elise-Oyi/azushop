# Review API - Postman Documentation

## Base URL
```
http://localhost:3000/api/reviews
```

## Headers (Global)
```json
{
  "Content-Type": "application/json"
}
```

---

## 1. Add Review
**POST** `/api/reviews`

### Request Body
```json
{
  "productId": "abc123",
  "userId": "user456",
  "rating": 5,
  "title": "Amazing product!",
  "comment": "This product exceeded my expectations. Great quality and fast delivery!"
}
```

### Field Descriptions
- `productId` (string, required): ID of the product being reviewed
- `userId` (string, required): ID of the user writing the review
- `rating` (number, required): Rating from 1-5 stars
- `title` (string, optional): Review title/headline
- `comment` (string, required): Review comment/description

### Success Response (201)
```json
{
  "success": true,
  "message": "Review added successfully",
  "data": {
    "reviewId": "rev789",
    "productId": "abc123",
    "userId": "user456",
    "rating": 5,
    "title": "Amazing product!",
    "comment": "This product exceeded my expectations. Great quality and fast delivery!",
    "isVerified": false,
    "helpfulCount": 0,
    "createdAt": "2025-01-16T10:30:00Z",
    "updatedAt": "2025-01-16T10:30:00Z"
  }
}
```

### Auto-Update Features
**Important**: When a review is added, the system automatically:
1. **Purchase Verification**: Checks if user has purchased the product and sets `isVerified` accordingly
2. **Rating Calculation**: Calculates new average rating for the product
3. **Product Update**: Updates the product's `ratings` and `reviewCount` fields
4. **Real-time Sync**: Ensures product ratings are always current

### Error Response (400)
```json
{
  "success": false,
  "message": "Missing required fields"
}
```

---

## 2. Get Reviews by Product ID
**GET** `/api/reviews/product/{productId}`

### Path Parameters
- `productId` (string): Product ID to get reviews for

### Example Request
```
GET /api/reviews/product/abc123
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Reviews retrieved successfully",
  "data": [
    {
      "id": "rev789",
      "reviewId": "rev789",
      "productId": "abc123",
      "userId": "user456",
      "rating": 5,
      "title": "Amazing product!",
      "comment": "This product exceeded my expectations. Great quality and fast delivery!",
      "isVerified": false,
      "helpfulCount": 0,
      "createdAt": "2025-01-16T10:30:00Z",
      "updatedAt": "2025-01-16T10:30:00Z"
    },
    {
      "id": "rev790",
      "reviewId": "rev790", 
      "productId": "abc123",
      "userId": "user789",
      "rating": 4,
      "title": "Good value",
      "comment": "Solid product for the price. Would recommend.",
      "isVerified": true,
      "helpfulCount": 3,
      "createdAt": "2025-01-15T14:20:00Z",
      "updatedAt": "2025-01-15T14:20:00Z"
    }
  ]
}
```

### Error Response (400)
```json
{
  "success": false,
  "message": "Product ID is required"
}
```

---

## 3. Get Review by ID
**GET** `/api/reviews/{id}`

### Path Parameters
- `id` (string): Review ID

### Example Request
```
GET /api/reviews/rev789
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Review retrieved successfully",
  "data": {
    "id": "rev789",
    "reviewId": "rev789",
    "productId": "abc123",
    "userId": "user456",
    "rating": 5,
    "title": "Amazing product!",
    "comment": "This product exceeded my expectations. Great quality and fast delivery!",
    "isVerified": false,
    "helpfulCount": 0,
    "createdAt": "2025-01-16T10:30:00Z",
    "updatedAt": "2025-01-16T10:30:00Z"
  }
}
```

### Error Response (404)
```json
{
  "success": false,
  "message": "Review not found"
}
```

---

## 4. Mark Review as Helpful
**POST** `/api/reviews/{id}/helpful`

### Path Parameters
- `id` (string): Review ID to mark as helpful

### Request Body
```json
{
  "userId": "user789"
}
```

### Field Descriptions
- `userId` (string, required): ID of the user marking the review as helpful

### Success Response (200)
```json
{
  "success": true,
  "message": "Review marked as helpful",
  "data": {
    "id": "rev789",
    "helpfulCount": 16
  }
}
```

### Error Response (404)
```json
{
  "success": false,
  "message": "Review not found"
}
```

### Error Response (400)
```json
{
  "success": false,
  "message": "User ID is required"
}
```

### Notes
- Requires authentication (protected route)
- Currently allows multiple votes from same user (TODO: implement duplicate prevention)
- Increments the `helpfulCount` by 1 each time

---

## Rating Calculation System

### How Product Ratings Work
1. **Automatic Updates**: When any review is added, the product's rating is recalculated
2. **Average Calculation**: `totalRating / numberOfReviews`
3. **Precision**: Ratings are rounded to 1 decimal place (e.g., 4.3)
4. **Review Count**: Total number of reviews is also updated

### Example Rating Update Flow
```
Before: Product has 2 reviews (4★, 5★) → Rating: 4.5, Count: 2
Add: New review (3★)
After: Product has 3 reviews (4★, 5★, 3★) → Rating: 4.0, Count: 3
```

---

## Review Model Structure

### Review Fields
- `reviewId`: Unique identifier (UUID)
- `productId`: Associated product ID
- `userId`: ID of user who wrote review
- `rating`: 1-5 star rating (integer)
- `title`: Optional review headline
- `comment`: Review text content
- `isVerified`: Whether reviewer purchased the product (auto-set)
- `helpfulCount`: Number of "helpful" votes (starts at 0)
- `createdAt`: When review was created
- `updatedAt`: When review was last modified

### Purchase Verification System
- **isVerified = true**: User has purchased and received the product
- **isVerified = false**: User hasn't purchased or purchase can't be verified
- **Auto-detection**: System automatically checks order history when review is submitted
- **Future Enhancement**: Currently returns `false` until Order model is implemented

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
  "message": "Review not found"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Failed to add review"
}
```

---

## Postman Collection Setup

### Environment Variables
Add to your existing Postman environment:
```
base_url: http://localhost:3000
product_id: abc123
user_id: user456
```

### Test Scripts Example

#### For Add Review (POST /api/reviews)
```javascript
// Test successful creation
pm.test("Review created successfully", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property('reviewId');
    
    // Save review ID for other tests
    pm.environment.set('review_id', jsonData.data.reviewId);
});

// Test rating range
pm.test("Rating is between 1 and 5", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.rating).to.be.at.least(1);
    pm.expect(jsonData.data.rating).to.be.at.most(5);
});

// Test auto-verification
pm.test("Review has isVerified field", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('isVerified');
    pm.expect(jsonData.data.isVerified).to.be.a('boolean');
});
```

#### For Get Reviews (GET /api/reviews/product/{productId})
```javascript
// Test response structure
pm.test("Reviews array returned", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.be.an('array');
});

// Test review structure
pm.test("Each review has required fields", function () {
    var jsonData = pm.response.json();
    if (jsonData.data.length > 0) {
        var review = jsonData.data[0];
        pm.expect(review).to.have.property('reviewId');
        pm.expect(review).to.have.property('productId');
        pm.expect(review).to.have.property('rating');
        pm.expect(review).to.have.property('comment');
    }
});
```

#### For Mark Helpful (POST /api/reviews/{id}/helpful)
```javascript
// Test helpful marking
pm.test("Review marked as helpful", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property('helpfulCount');
});

// Test helpfulCount increment
pm.test("HelpfulCount incremented", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.helpfulCount).to.be.a('number');
    pm.expect(jsonData.data.helpfulCount).to.be.at.least(1);
});
```

---

## Sample Data for Testing

### Sample Review 1 (Positive)
```json
{
  "productId": "abc123",
  "userId": "user456",
  "rating": 5,
  "title": "Excellent quality!",
  "comment": "Exceeded my expectations. Fast delivery and great customer service."
}
```

### Sample Review 2 (Mixed)
```json
{
  "productId": "abc123", 
  "userId": "user789",
  "rating": 3,
  "title": "Decent product",
  "comment": "Product is okay but could be better. Price is reasonable though."
}
```

### Sample Review 3 (Negative)
```json
{
  "productId": "abc123",
  "userId": "user012",
  "rating": 2,
  "title": "Not as described",
  "comment": "Product didn't match the description. Had to return it."
}
```

### Sample Helpful Vote
```json
{
  "userId": "user123"
}
```

---

## API Endpoints Summary

### Review Endpoints
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/reviews` | ❌ | Add new review |
| GET | `/api/reviews/product/:productId` | ❌ | Get reviews by product |
| GET | `/api/reviews/:id` | ❌ | Get single review |
| POST | `/api/reviews/:id/helpful` | ✅ | Mark review as helpful |

### Related Product Endpoint
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/products/:id/related` | ❌ | Get related products |

---

## Integration with Product API

### Checking Updated Product Ratings
After adding reviews, you can verify the product's rating was updated:

```
GET /api/products/abc123
```

Look for updated `ratings` and `reviewCount` fields in the response:
```json
{
  "data": {
    "id": "abc123",
    "name": "iPhone 15 Pro",
    "ratings": 4.2,
    "reviewCount": 15,
    ...
  }
}
```